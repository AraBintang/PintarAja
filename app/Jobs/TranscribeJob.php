<?php

namespace App\Jobs;

use App\Models\Transcribe;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Http;

class TranscribeJob implements ShouldQueue
{
    use Queueable;

    protected $transcribeId;
    protected $source;
    protected $filePath;
    protected $youtubeUrl;

    /**
     * Create a new job instance.
     */
    public function __construct($transcribeId, $source, $filePath = null, $youtubeUrl = null)
    {
        $this->transcribeId = $transcribeId;
        $this->source = $source;
        $this->filePath = $filePath;
        $this->youtubeUrl = $youtubeUrl;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $transcribe = Transcribe::find($this->transcribeId);

        if (!$transcribe) {
            return;
        }

        try {
            // Update status to processing
            $transcribe->update([
                'M_TranscribeStatus' => 'processing',
                'M_TranscribeStartedAt' => now()
            ]);

            $transcript = null;
            $audioPath = null;

            if ($this->source === 'youtube') {
                $transcript = $this->transcribeYoutubeWithGemini($this->youtubeUrl);
            } elseif ($this->source === 'upload' || $this->source === 'record') {
                // Convert file to mp3 (this happens async in the job, not in the controller)
                $audioPath = $this->convertToAudio($this->filePath);
                
                if (!$audioPath) {
                    throw new \Exception('Failed to convert audio file');
                }
                
                $transcript = $this->transcribeAudio($audioPath);
            }

            // Update with completed transcript
            $transcribe->update([
                'M_TranscribeData' => $transcript,
                'M_TranscribeStatus' => 'completed',
                'M_TranscribeCompletedAt' => now()
            ]);

            // Cleanup files
            if ($audioPath && file_exists($audioPath)) {
                unlink($audioPath);
            }
            if ($this->filePath && file_exists($this->filePath)) {
                unlink($this->filePath);
            }
        } catch (\Exception $e) {
            // Update status to failed with error message
            $transcribe->update([
                'M_TranscribeStatus' => 'failed',
                'M_TranscribeCompletedAt' => now(),
                'M_TranscribeErrorMessage' => $e->getMessage()
            ]);

            // Cleanup files on failure
            if ($this->filePath && file_exists($this->filePath)) {
                unlink($this->filePath);
            }
        }
    }

    /**
     * Split audio file into chunks if too large
     */
    private function splitAudio($audioPath)
    {
        $chunkDir = storage_path('app/audio_chunks/' . uniqid());

        if (!file_exists($chunkDir)) {
            mkdir($chunkDir, 0777, true);
        }

        $command = "ffmpeg -i " . escapeshellarg($audioPath) .
            " -f segment -segment_time 600 -c copy " .
            escapeshellarg($chunkDir . "/chunk_%03d.mp3") .
            " 2>&1";

        exec($command);

        return glob($chunkDir . "/*.mp3");
    }

    /**
     * Transcribe audio file with Gemini API
     */
    private function transcribeWithGemini($audioPath)
    {
        $apiKey = config('services.gemini.key');

        $audioData = base64_encode(file_get_contents($audioPath));

        $ext = pathinfo($audioPath, PATHINFO_EXTENSION);

        $mimeTypes = [
            'mp3' => 'audio/mpeg',
            'wav' => 'audio/wav',
            'webm' => 'audio/webm',
            'm4a' => 'audio/mp4'
        ];

        $mimeType = $mimeTypes[$ext] ?? 'audio/mpeg';

        $payload = [
            "contents" => [[
                "parts" => [
                    [
                        "inlineData" => [
                            "mimeType" => $mimeType,
                            "data" => $audioData
                        ]
                    ],
                    [
                        "text" => "Please transcribe this audio with timestamps."
                    ]
                ]
            ]]
        ];

        $response = Http::timeout(300)
            ->retry(2, 5000)
            ->post(
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={$apiKey}",
                $payload
            );

        if (!$response->successful()) {
            throw new \Exception("Gemini API failed: " . $response->body());
        }

        $result = $response->json();

        return $result['candidates'][0]['content']['parts'][0]['text'] ?? '';
    }

    /**
     * Transcribe YouTube with Gemini API
     */
    private function transcribeYoutubeWithGemini($youtubeUrl)
    {
        $apiKey = config('services.gemini.key');

        $payload = [
            "contents" => [[
                "parts" => [
                    [
                        "file_data" => [
                            "file_uri" => $youtubeUrl
                        ]
                    ],
                    [
                        "text" => "Please transcribe this audio with timestamps."
                    ]
                ]
            ]]
        ];

        $response = Http::timeout(300)
            ->retry(2, 5000)
            ->post(
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={$apiKey}",
                $payload
            );

        if (!$response->successful()) {
            throw new \Exception("Gemini YouTube transcribe failed: " . $response->body());
        }

        $result = $response->json();

        return $result['candidates'][0]['content']['parts'][0]['text'] ?? '';
    }

    /**
     * Convert file to mp3 audio (upload or record)
     */
    private function convertToAudio($filePath)
    {
        if (!file_exists($filePath)) {
            return null;
        }

        $audioPath = storage_path('app/audio/' . uniqid() . '.mp3');
        $command = "ffmpeg -i " .
            escapeshellarg($filePath) .
            " -vn -acodec libmp3lame " .
            escapeshellarg($audioPath) .
            " 2>&1";

        exec($command, $output, $status);

        if ($status !== 0) {
            return null;
        }

        return $audioPath;
    }

    /**
     * Transcribe audio file (handles chunking if needed)
     */
    private function transcribeAudio($audioPath)
    {
        $maxSize = 20 * 1024 * 1024;

        if (filesize($audioPath) <= $maxSize) {
            return $this->transcribeWithGemini($audioPath);
        }

        // Split large files into chunks
        $chunks = $this->splitAudio($audioPath);
        $transcriptParts = [];

        foreach ($chunks as $chunk) {
            $text = $this->transcribeWithGemini($chunk);
            $transcriptParts[] = $text;
            unlink($chunk);
        }

        // Cleanup chunk directory
        $chunkDir = dirname($chunks[0] ?? '');
        if ($chunkDir && file_exists($chunkDir)) {
            rmdir($chunkDir);
        }

        return implode("\n\n", $transcriptParts);
    }
}

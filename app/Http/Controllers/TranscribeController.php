<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Transcribe;
use Gemini\Laravel\Facades\Gemini;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class TranscribeController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $search = $request->input('search');
        $perPage = (int) $request->input('per_page', 15);
        $page = max(1, (int) $request->input('page', 1));
    
        $query = Transcribe::select([
                'M_TranscribeID as id',
                'M_TranscribeName as name',
                'M_TranscribeData as data',
                'M_TranscribeSource as source',
            ])
            ->where('M_TranscribeM_UserID', $user->M_UserID)
            ->when($search, fn($q) =>
                $q->where('M_TranscribeName', 'like', "%{$search}%")
            )
            ->orderByDesc('M_TranscribeID');
    
        $paginated = $query->paginate($perPage, ['*'], 'page', $page);
    
        return response()->json([
            'data' => $paginated->items(),
            'pagination' => [
                'current_page' => $paginated->currentPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
                'last_page' => $paginated->lastPage(),
            ],
        ]);
    }

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

    public function transcribe(Request $request)
    {
        $request->validate([
            'source' => 'required',
            'video_url' => 'nullable|url',
            'file' => 'nullable|file|max:102400',
        ]);

        $user = $request->user();

        if ($user->M_UserPlan === 1) {
            return response()->json(['error' => 'Your current plan does not include access to this feature. Please upgrade to continue.'], 403);
        }

        $source = $request->input('source');
        $audioPath = null;
        $transcript = null;

        if ($source === 'youtube') {
            $youtubeUrl = $request->video_url;

            try {
                $transcript = $this->transcribeYoutubeWithGemini($youtubeUrl);
            } catch (\Exception $e) {
                return response()->json([
                    'error' => 'Failed to transcribe YouTube video',
                    'log' => $e->getMessage()
                ], 500);
            }
        }

        if ($source === 'upload') {
            $file = $request->file('file');

            $filename = uniqid() . '.' . $file->getClientOriginalExtension();
            $file->move(storage_path('app/private/uploads'), $filename);
            $fullPath = storage_path('app/private/uploads/' . $filename);

            if (!file_exists($fullPath)) {
                return response()->json([
                    'error' => 'Uploaded file not found',
                    'path' => $fullPath
                ], 500);
            }

            $audioPath = storage_path('app/audio/' . uniqid() . '.mp3');

            $command = "ffmpeg -i " .
                escapeshellarg($fullPath) .
                " -vn -acodec libmp3lame " .
                escapeshellarg($audioPath) .
                " 2>&1";

            exec($command, $output, $status);

            if ($status !== 0) {
                return response()->json([
                    'error' => 'Failed to extract audio',
                    'log' => $output
                ], 500);
            }
        }

        if ($source === 'record') {
            $file = $request->file('file');

            $filename = uniqid() . ".webm";
            $file->move(storage_path('app/private/record'), $filename);
            $fullPath = storage_path('app/private/record/' . $filename);
            $audioPath = storage_path("app/audio/" . uniqid() . ".mp3");

            $command = "ffmpeg -i " .
                escapeshellarg($fullPath) .
                " -vn -acodec mp3 " .
                escapeshellarg($audioPath) .
                " 2>&1";

            exec($command, $output, $status);

            if ($status !== 0) {
                return response()->json([
                    'error' => 'Failed to process record audio',
                    'log' => $output
                ], 500);
            }
        }

        if ($audioPath) {
            $maxSize = 20 * 1024 * 1024;

            if (filesize($audioPath) <= $maxSize) {
                $transcript = $this->transcribeWithGemini($audioPath);
            } else {
                $chunks = $this->splitAudio($audioPath);

                $transcriptParts = [];

                foreach ($chunks as $chunk) {
                    $text = $this->transcribeWithGemini($chunk);
                    $transcriptParts[] = $text;
                    unlink($chunk);
                }

                $transcript = implode("\n\n", $transcriptParts);
            }

            if ($audioPath && file_exists($audioPath)) {
                unlink($audioPath);
            }

            if (isset($fullPath) && file_exists($fullPath)) {
                unlink($fullPath);
            }
        }

        $transcribeId = Transcribe::create([
            'M_TranscribeM_UserID' => $user->M_UserID,
            'M_TranscribeName' => ucfirst($source) . ' transcribe ' . now()->format('Y-m-d H:i'),
            'M_TranscribeData' => $transcript,
            'M_TranscribeSource' => $source
        ]);

        return response()->json([
            'success' => true,
            'data' => $transcript,
            'id' => $transcribeId->M_TranscribeID,
            'name' => $transcribeId->M_TranscribeName,
            'source' => $transcribeId->M_TranscribeSource
        ]);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255'
        ]);

        $transcribe = Transcribe::where('M_TranscribeID', $id)->first();

        if (!$transcribe) {
            return response()->json([
                'message' => 'Data not found.'
            ], 404);
        }

        $transcribe->update([
            'M_TranscribeName' => $validated['name']
        ]);

        return response()->json([
            'message' => 'Updated successfully.'
        ]);
    }

    public function destroy($id)
    {
        $transcribe = Transcribe::findOrFail($id);

        if (!$transcribe) {
            return response()->json([
                'message' => 'Data not found.'
            ], 404);
        }

        $transcribe->delete();

        return response()->json([
            'message' => 'Deleted successfully',
            'id' => $id
        ]);
    }
}

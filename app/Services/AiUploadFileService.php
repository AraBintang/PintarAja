<?php

namespace App\Services;

use App\Models\Chat;
use Illuminate\Support\Facades\Http;

class AiUploadFileService
{
    public function handleOpenAiFileStream($provider, string $message, array $fileData, int $convId)
    {
        return response()->stream(function () use ($provider, $message, $fileData, $convId) {
            $apiKey = $provider->M_SettingKey;
            $uploadedFileIds = [];
            $vectorStoreId = null;
 
            try {
                $docFiles = array_filter($fileData, fn($f) => !$f['isImage']);
                $imageFiles = array_filter($fileData, fn($f) => $f['isImage']);
 
                $inputContent = [];
                foreach ($imageFiles as $img) {
                    $inputContent[] = [
                        'type' => 'input_image',
                        'image_url' => "data:{$img['type']};base64,{$img['base64']}",
                    ];
                }
                $inputContent[] = ['type' => 'input_text', 'text' => $message];
 
                $hasDocFiles = !empty($docFiles);
 
                if ($hasDocFiles) {
                    foreach ($docFiles as $f) {
                        $raw     = base64_decode($f['base64']);
                        $tmpPath = sys_get_temp_dir() . '/' . uniqid('oai_') . '_' . $f['name'];
                        file_put_contents($tmpPath, $raw);
 
                        $res = Http::withToken($apiKey)
                            ->attach('file', file_get_contents($tmpPath), $f['name'], ['Content-Type' => $f['type']])
                            ->post('https://api.openai.com/v1/files', ['purpose' => 'assistants']);
 
                        @unlink($tmpPath);
 
                        if (!$res->successful()) {
                            throw new \RuntimeException('Upload file gagal: ' . $res->body());
                        }
 
                        $fileId = $res->json('id');
 
                        for ($i = 0; $i < 15; $i++) {
                            $fileStatus = Http::withToken($apiKey)
                                ->get("https://api.openai.com/v1/files/{$fileId}");
                            if ($fileStatus->json('status') === 'processed') break;
                            sleep(1);
                        }
 
                        $uploadedFileIds[] = $fileId;
                    }
 
                    $vs = Http::withToken($apiKey)
                        ->post('https://api.openai.com/v1/vector_stores', [
                            'name' => 'chat_' . $convId . '_' . time(),
                            'file_ids' => $uploadedFileIds,
                        ]);
 
                    if (!$vs->successful()) {
                        throw new \RuntimeException('Gagal membuat vector store: ' . $vs->body());
                    }
 
                    $vectorStoreId = $vs->json('id');
 
                    for ($i = 0; $i < 30; $i++) {
                        $statusRes  = Http::withToken($apiKey)
                            ->get("https://api.openai.com/v1/vector_stores/{$vectorStoreId}");
                        $vsStatus = $statusRes->json('status');
                        $counts = $statusRes->json('file_counts');
                        $total = $counts['total'] ?? 0;
                        $completed = $counts['completed'] ?? 0;
                        $inProgress = $counts['in_progress'] ?? 0;
 
                        if ($vsStatus === 'completed' && $total > 0 && $inProgress === 0 && $completed === $total) {
                            break;
                        }
 
                        sleep(1);
                    }
                }
 
                $payload = [
                    'model' => $provider->M_SettingModel ?? 'gpt-4o',
                    'stream' => true,
                    'input' => [
                        ['role' => 'user', 'content' => $inputContent],
                    ],
                ];
 
                if ($hasDocFiles) {
                    $payload['tools'] = [[
                        'type' => 'file_search',
                        'vector_store_ids' => [$vectorStoreId],
                    ]];
                }
 
                $response = Http::withToken($apiKey)
                    ->withOptions(['stream' => true])
                    ->post('https://api.openai.com/v1/responses', $payload);
 
                $body = $response->getBody();
                $fullContent = '';
                $annotations = [];
                $doneTexts = [];
                $buffer = '';
 
                while (!$body->eof()) {
                    $buffer .= $body->read(1024);
 
                    while (($pos = strpos($buffer, "\n")) !== false) {
                        $line = trim(substr($buffer, 0, $pos));
                        $buffer = substr($buffer, $pos + 1);
 
                        if (!str_starts_with($line, 'data: ') || $line === 'data: [DONE]') continue;
 
                        try {
                            $json = json_decode(substr($line, 6), true);
                            $type = $json['type'] ?? '';
 
                            if ($type === 'response.output_text.delta') {
                                $delta = $json['delta'] ?? '';
                                if ($delta) {
                                    $fullContent .= $delta;
                                    echo "data: " . json_encode(['delta' => $delta]) . "\n\n";
                                    ob_flush();
                                    flush();
                                }
                            }
 
                            if ($type === 'response.output_text.done') {
                                $doneTexts[] = $json['text'] ?? '';
                            }
 
                            if ($type === 'response.output_item.done') {
                                foreach ($json['item']['content'] ?? [] as $content) {
                                    foreach ($content['annotations'] ?? [] as $ann) {
                                        if (($ann['type'] ?? '') === 'file_citation') {
                                            $annotations[] = [
                                                'file_id' => $ann['file_id'],
                                                'filename' => $ann['filename'],
                                                'index' => $ann['index'],
                                            ];
                                        }
                                    }
                                }
                            }
                        } catch (\Throwable $_) {}
                    }
                }
 
                if (empty(trim($fullContent)) && !empty($doneTexts)) {
                    $fullContent = implode('', $doneTexts);
                }
 
                $annotations = array_values(
                    array_reduce($annotations, function ($carry, $ann) {
                        $carry[$ann['file_id']] = $ann;
                        return $carry;
                    }, [])
                );
 
                Chat::create([
                    'T_ChatT_ConversationID' => $convId,
                    'T_ChatCode' => $provider->M_SettingCode,
                    'T_ChatRole' => 'assistant',
                    'T_ChatContent' => $fullContent,
                    'T_ChatAnnotations' => json_encode($annotations),
                ]);
 
                echo "data: " . json_encode(['done' => true, 'annotations' => $annotations]) . "\n\n";
                ob_flush();
                flush();
 
            } finally {
                foreach ($uploadedFileIds as $fileId) {
                    try {
                        Http::withToken($apiKey)->delete("https://api.openai.com/v1/files/{$fileId}");
                    } catch (\Throwable $_) {}
                }
 
                if ($vectorStoreId) {
                    try {
                        Http::withToken($apiKey)->delete("https://api.openai.com/v1/vector_stores/{$vectorStoreId}");
                    } catch (\Throwable $_) {}
                }
            }
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'Connection' => 'keep-alive',
            'X-Accel-Buffering' => 'no',
        ]);
    }

    public function handleGeminiFile($provider, string $message, array $fileData, int $convId)
    {
        $parts = [];

        foreach ($fileData as $f) {
            $parts[] = [
                'inline_data' => [
                    'mime_type' => $f['type'],
                    'data'  => $f['base64'],
                ],
            ];
        }

        $parts[] = ['text' => $message];

        $model = $provider->M_SettingModel ?? 'gemini-2.0-flash';
        $response = Http::post(
            "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$provider->M_SettingKey}",
            ['contents' => [['role' => 'user', 'parts' => $parts]]]
        );

        if (!$response->successful()) {
            return response()->json([
                'message' => $response->json('error.message') ?? 'Gemini API error',
            ], 502);
        }

        $assistantReply = $response->json('candidates.0.content.parts.0.text') ?? '';

        Chat::create([
            'T_ChatT_ConversationID' => $convId,
            'T_ChatCode' => $provider->M_SettingCode,
            'T_ChatRole' => 'assistant',
            'T_ChatContent' => $assistantReply,
        ]);

        return response()->json(['reply' => $assistantReply]);
    }

    public function handleClaudeFile($provider, string $message, array $fileData, int $convId)
    {
        $content = [];

        foreach ($fileData as $f) {
            if ($f['isImage']) {
                $content[] = [
                    'type' => 'image',
                    'source' => [
                        'type' => 'base64',
                        'media_type' => $f['type'],
                        'data' => $f['base64'],
                    ],
                ];
            } else {
                // Claude supports application/pdf, text/plain, text/csv, text/html
                $mediaType = $f['type'];
                $validDocTypes = ['application/pdf', 'text/plain', 'text/csv', 'text/html'];
                
                if ($mediaType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                    // Ekstrak teks secara manual dari docx (karena Claude belum native support docx base64 document)
                    $tmp = sys_get_temp_dir() . '/' . uniqid() . '.docx';
                    file_put_contents($tmp, base64_decode($f['base64']));
                    $zip = new \ZipArchive;
                    $extractedText = '';
                    if ($zip->open($tmp) === TRUE) {
                        $xml = $zip->getFromName('word/document.xml');
                        $zip->close();
                        if ($xml) {
                            $extractedText = strip_tags(str_replace(['<w:p', '</w:p>'], ["\n<w:p", "\n"], $xml));
                        }
                    }
                    @unlink($tmp);
                    
                    $content[] = [
                        'type' => 'document',
                        'source' => [
                            'type' => 'base64',
                            'media_type' => 'text/plain',
                            'data' => base64_encode(trim($extractedText)),
                        ],
                    ];
                } else {
                    if (!in_array($mediaType, $validDocTypes)) {
                        $mediaType = 'application/pdf'; // Try forcing as pdf if unknown
                    }

                    $content[] = [
                        'type' => 'document',
                        'source' => [
                            'type' => 'base64',
                            'media_type' => $mediaType,
                            'data' => $f['base64'],
                        ],
                    ];
                }
            }
        }
        
        $content[] = ['type' => 'text', 'text' => $message];

        $model = $provider->M_SettingModel ?? 'claude-3-5-sonnet-20241022';
        $response = \Illuminate\Support\Facades\Http::withHeaders([
            'x-api-key' => $provider->M_SettingKey,
            'anthropic-version' => '2023-06-01',
            'content-type' => 'application/json',
            'anthropic-beta' => 'pdfs-2024-09-25',
        ])->post('https://api.anthropic.com/v1/messages', [
            'model' => $model,
            'messages' => [['role' => 'user', 'content' => $content]],
            'max_tokens' => 8192,
        ]);

        if (!$response->successful()) {
            \Illuminate\Support\Facades\Log::error('Claude API file upload error: ' . $response->body());
            return response()->json([
                'message' => 'Claude API error: ' . $response->body(),
            ], 502);
        }

        $assistantReply = $response->json('content.0.text') ?? '';

        Chat::create([
            'T_ChatT_ConversationID' => $convId,
            'T_ChatCode' => $provider->M_SettingCode,
            'T_ChatRole' => 'assistant',
            'T_ChatContent' => $assistantReply,
        ]);

        return response()->json(['reply' => $assistantReply]);
    }
}
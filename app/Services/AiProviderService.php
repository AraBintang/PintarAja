<?php

namespace App\Services;

use App\Models\Chat;
use App\Models\Conver;
use GuzzleHttp\Client;
use Illuminate\Support\Str;

class AiProviderService
{
    public function streamOpenAI($apiKey, $model = null, $userMessage, $format = true, $converId = null, $provider = null)
    {
        $client = \OpenAI::client($apiKey);

        return response()->stream(function () use ($client, $model, $userMessage, $format, $converId, $provider) {
            $messages = $format === false
                ? $this->normalizeMessagesForOpenAI($userMessage)
                : [['role' => 'user', 'content' => $userMessage]];

            $stream = $client->chat()->createStreamed([
                'model' => $model ?? 'gpt-4o-mini',
                'messages' => $messages,
            ]);

            $output = '';
            foreach ($stream as $response) {
                $chunk = $response['choices'][0]['delta']['content'] ?? null;
                if ($chunk !== null && $chunk !== '') {
                    $out = $format ? $this->formatMessage($chunk) : $chunk;
                    $output .= $out;
                    echo $out;
                    ob_flush();
                    flush();
                }
            }

            if ($format == false && $converId) {
                $this->inputAssistantChatByConversationId($converId, $provider, $output);
            }
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'Connection' => 'keep-alive',
        ]);
    }

    public function streamGemini($apiKey, $model = null, $userMessage, $format = true, $converId = null, $provider = null)
    {
        return response()->stream(function () use ($apiKey, $model, $userMessage, $format, $converId, $provider) {
            $client = new Client();

            $messages = $format === false
                ? $this->normalizeMessagesForOpenAI($userMessage)
                : [['role' => 'user', 'content' => $userMessage . '. langsung tanpa basa basi diawal']];

            $response = $client->post('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', [
                'headers' => [
                    'Authorization' => "Bearer $apiKey",
                    'Content-Type' => 'application/json',
                    'Accept' => 'text/event-stream',
                ],
                'json' => [
                    'model' => $model ?? 'gemini-2.5-flash',
                    'messages' => $messages,
                    'stream' => true,
                ],
                'stream' => true,
            ]);

            $body = $response->getBody();
            $output = '';

            while (!$body->eof()) {
                $line = $this->readLine($body);
                $line = trim($line);

                if (!Str::startsWith($line, 'data: ')) continue;
                $jsonLine = trim(Str::replaceFirst('data: ', '', $line));
                if ($jsonLine === '[DONE]') break;

                $data  = json_decode($jsonLine, true);
                $chunk = $data['choices'][0]['delta']['content'] ?? null;
                if ($chunk !== null && $chunk !== '') {
                    $out = $format ? $this->formatMessage($chunk) : $chunk;
                    $output .= $out;
                    echo $out;
                    ob_flush();
                    flush();
                }
            }

            if ($format == false && $converId) {
                $this->inputAssistantChatByConversationId($converId, $provider, $output);
            }
        }, 200, [
            'Content-Type'  => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'Connection'    => 'keep-alive',
        ]);
    }

    public function streamClaude($apiKey, $model = null, $userMessage, $format = true, $converId = null, $provider = null)
    {
        return response()->stream(function () use ($apiKey, $model, $userMessage, $format, $converId, $provider) {
            $client = new Client(['timeout' => 0]);

            $systemPrompt = null;
            $messages = [];

            if ($format === false) {
                foreach ($userMessage as $msg) {
                    if (($msg['role'] ?? '') === 'system') {
                        $systemPrompt = $systemPrompt ?? $msg['content'];
                        continue;
                    }
                    $messages[] = [
                        'role' => $msg['role'],
                        'content' => $this->normalizeClaudeContent($msg['content']),
                    ];
                }
            } else {
                $messages[] = [
                    'role' => 'user',
                    'content' => [['type' => 'text', 'text' => $userMessage]],
                ];
            }

            try {
                $response = $client->post('https://api.anthropic.com/v1/messages', [
                    'headers' => [
                        'x-api-key' => $apiKey,
                        'anthropic-version' => '2023-06-01',
                        'content-type' => 'application/json',
                        'accept' => 'text/event-stream',
                    ],
                    'json' => array_filter([
                        'model' => $model ?? 'claude-sonnet-4-5',
                        'messages' => $messages,
                        'stream' => true,
                        'max_tokens' => 8192,
                    ]),
                    'stream' => true,
                ]);
            } catch (\GuzzleHttp\Exception\ClientException $e) {
                $errorBody = $e->getResponse()->getBody()->getContents();
                \Log::error('Anthropic API error: ' . $errorBody);
                throw $e;
            }

            $body = $response->getBody();
            $buffer = '';
            $output = '';

            while (!$body->eof()) {
                $buffer .= $body->read(1024);

                while (($pos = strpos($buffer, "\n")) !== false) {
                    $line   = trim(substr($buffer, 0, $pos));
                    $buffer = substr($buffer, $pos + 1);

                    if (!str_starts_with($line, 'data:')) continue;

                    $data = json_decode(trim(substr($line, 5)), true);

                    if (isset($data['delta']['text'])) {
                        $chunk   = $data['delta']['text'];
                        $output .= $chunk;
                        echo $chunk;
                        ob_flush();
                        flush();
                    }

                    if (($data['type'] ?? '') === 'message_stop') {
                        break 2;
                    }
                }
            }

            if ($format === false && $converId) {
                $this->inputAssistantChatByConversationId($converId, $provider, $output);
            }
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'Connection' => 'keep-alive',
        ]);
    }

    public function streamGrok($apiKey, $model = null, $userMessage, $format = true, $converId = null, $provider = null)
    {
        return response()->stream(function () use ($apiKey, $model, $userMessage, $format, $converId, $provider) {
            $client = new Client();

            $messages = $format === false
                ? $this->normalizeMessagesForOpenAI($userMessage)
                : [['role' => 'user', 'content' => $userMessage]];

            $response = $client->post('https://api.x.ai/v1/chat/completions', [
                'headers' => [
                    'Authorization' => "Bearer $apiKey",
                    'Content-Type' => 'application/json',
                    'Accept' => 'text/event-stream',
                ],
                'json'   => [
                    'model' => $model ?? 'grok-2',
                    'messages' => $messages,
                    'stream' => true,
                ],
                'stream' => true,
            ]);

            $body = $response->getBody();
            $output = '';

            while (!$body->eof()) {
                $line = trim($this->readLine($body));

                if (!Str::startsWith($line, 'data: ')) continue;
                $jsonLine = trim(Str::replaceFirst('data: ', '', $line));
                if ($jsonLine === '[DONE]') break;

                $data  = json_decode($jsonLine, true);
                $chunk = $data['choices'][0]['delta']['content'] ?? null;
                if ($chunk !== null && $chunk !== '') {
                    $out = $format ? $this->formatMessage($chunk) : $chunk;
                    $output .= $out;
                    echo $out;
                    ob_flush();
                    flush();
                }
            }

            if ($format == false && $converId) {
                $this->inputAssistantChatByConversationId($converId, $provider, $output);
            }
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'Connection' => 'keep-alive',
        ]);
    }

    public function streamDeepSeek($apiKey, $model = null, $userMessage, $format = true, $converId = null, $provider = null)
    {
        return response()->stream(function () use ($apiKey, $model, $userMessage, $format, $converId, $provider) {
            $client = new Client();

            // DeepSeek tidak mendukung vision — gambar distrip, hanya teks yang dikirim
            $messages = $format === false
                ? $this->normalizeMessagesTextOnly($userMessage)
                : [['role' => 'user', 'content' => $userMessage]];

            $response = $client->request('POST', 'https://api.deepseek.com/chat/completions', [
                'headers' => [
                    'Authorization' => "Bearer $apiKey",
                    'Content-Type' => 'application/json',
                    'Accept' => 'text/event-stream',
                ],
                'json'   => [
                    'model' => $model ?? 'deepseek-chat',
                    'messages' => $messages,
                    'stream' => true,
                ],
            ]);

            $body = $response->getBody();
            $output = '';
            $buffer = '';

            while (!$body->eof()) {
                $line = trim($this->readLine($body));

                if (!Str::startsWith($line, 'data: ')) continue;
                $jsonLine = trim(Str::replaceFirst('data: ', '', $line));
                if ($jsonLine === '[DONE]') break;

                try {
                    $data = json_decode($jsonLine, true);
                    $chunk = $data['choices'][0]['delta']['content'] ?? null;
                    if ($chunk !== null && $chunk !== '') {
                        $buffer .= $chunk;
                        if (strlen($buffer) >= 12 || preg_match('/[.!?]\s$/', $buffer)) {
                            $out = $format ? $this->formatMessage($buffer) : $buffer;
                            $output .= $out;
                            echo $out;
                            ob_flush();
                            flush();
                            $buffer = '';
                        }
                    }
                } catch (\Exception $e) {
                    echo 'Terjadi kesalahan koneksi ke model.';
                    return;
                }
            }

            if ($format == false && $converId) {
                $this->inputAssistantChatByConversationId($converId, $provider, $output);
            }
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'Connection' => 'keep-alive',
        ]);
    }

    public function streamQwen($apiKey, $model = null, $userMessage, $format = true, $converId = null, $provider = null, $userQuota = null, $withImage = false)
    {
        return response()->stream(function () use ($apiKey, $model, $userMessage, $format, $converId, $provider, $withImage) {
            $client    = new Client();
            $baseModel = $model ?? 'qwen-turbo';

            $hasVision = $format === false && $this->messagesHaveImages($userMessage);
            $finalModel = ($withImage || $hasVision) ? 'qwen-vl-plus' : $baseModel;

            $messages = $format === false
                ? ($hasVision
                    ? $this->normalizeMessagesForOpenAI($userMessage)
                    : $this->normalizeMessagesTextOnly($userMessage))
                : [['role' => 'user', 'content' => $userMessage]];

            try {
                $response = $client->request('POST', 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions', [
                    'headers' => [
                        'Authorization' => "Bearer $apiKey",
                        'Content-Type'  => 'application/json',
                        'Accept'        => 'text/event-stream',
                    ],
                    'json'   => [
                        'model' => $finalModel,
                        'messages' => $messages,
                        'stream' => true,
                        'stream_options' => ['include_usage' => true],
                    ],
                    'stream' => true,
                ]);
            } catch (\Exception $e) {
                echo 'Terjadi kesalahan koneksi ke model.';
                return;
            }

            $body = $response->getBody();
            $output = '';
            $buffer = '';

            while (!$body->eof()) {
                $line = trim($this->readLine($body));

                if (!Str::startsWith($line, 'data: ')) continue;
                $jsonLine = trim(Str::replaceFirst('data: ', '', $line));
                if ($jsonLine === '[DONE]') break;

                try {
                    $data  = json_decode($jsonLine, true);
                    $chunk = $data['choices'][0]['delta']['content'] ?? null;
                    if ($chunk !== null && $chunk !== '') {
                        $buffer .= $chunk;
                        if (strlen($buffer) >= 12 || preg_match('/[.!?]\s$/', $buffer)) {
                            $out    = $format ? $this->formatMessage($buffer) : $buffer;
                            $output .= $out;
                            echo $out;
                            ob_flush();
                            flush();
                            $buffer = '';
                        }
                    }
                } catch (\Exception $e) {
                    echo 'Terjadi kesalahan koneksi ke model.';
                    return;
                }
            }

            if ($format == false && $converId) {
                $this->inputAssistantChatByConversationId($converId, $provider, $output);
            }
        }, 200, [
            'Content-Type'  => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'Connection'    => 'keep-alive',
        ]);
    }

    private function normalizeMessagesForOpenAI(array $messages): array
    {
        return array_map(function ($msg) {
            if (is_array($msg['content'] ?? null)) {
                return [
                    'role' => $msg['role'],
                    'content' => $msg['content'],
                ];
            }
            return [
                'role' => $msg['role'],
                'content' => (string) ($msg['content'] ?? ''),
            ];
        }, $messages);
    }

    private function normalizeMessagesTextOnly(array $messages): array
    {
        return array_map(function ($msg) {
            if (is_array($msg['content'] ?? null)) {
                $text = collect($msg['content'])
                    ->where('type', 'text')
                    ->pluck('text')
                    ->implode(' ');
                return ['role' => $msg['role'], 'content' => $text];
            }
            return ['role' => $msg['role'], 'content' => (string) ($msg['content'] ?? '')];
        }, $messages);
    }

    private function normalizeClaudeContent(array|string $content): array
    {
        if (is_string($content)) {
            return [['type' => 'text', 'text' => $content]];
        }

        $result = [];
        foreach ($content as $item) {
            if (($item['type'] ?? '') === 'text') {
                $result[] = ['type' => 'text', 'text' => $item['text'] ?? ''];
            }

            if (($item['type'] ?? '') === 'image_url') {
                $url = $item['image_url']['url'] ?? '';
                if (str_starts_with($url, 'data:image/')) {
                    preg_match('/data:image\/(.+);base64,(.*)/', $url, $matches);
                    if (!empty($matches)) {
                        $result[] = [
                            'type'   => 'image',
                            'source' => [
                                'type'       => 'base64',
                                'media_type' => 'image/' . $matches[1],
                                'data'       => $matches[2],
                            ],
                        ];
                    }
                }
            }
        }

        return $result;
    }

    private function messagesHaveImages(array $messages): bool
    {
        foreach ($messages as $msg) {
            if (!is_array($msg['content'] ?? null)) continue;
            foreach ($msg['content'] as $part) {
                if (($part['type'] ?? '') === 'image_url') return true;
            }
        }
        return false;
    }

    private function readLine($body): string
    {
        $line = '';
        while (!$body->eof()) {
            $char = $body->read(1);
            if ($char === "\n") break;
            $line .= $char;
        }
        return $line;
    }

    private function formatMessage($chunk)
    {
        $chunk = nl2br($chunk);
        $chunk = preg_replace('/^###+\s*/m', '', $chunk);
        $chunk = preg_replace('/-{3,}/', '<hr>', $chunk);
        $chunk = preg_replace('/\*\*(.*?)\*\*/', '<strong>$1</strong>', $chunk);
        $chunk = preg_replace('/\*(.*?)\*/', '<em>$1</em>', $chunk);
        $chunk = preg_replace('/_(.*?)_/', '<u>$1</u>', $chunk);
        $chunk = str_replace(['*', '`'], '', $chunk);
        return $chunk;
    }

    private function inputAssistantChatByConversationId($converId, $provider, $output)
    {
        Chat::create([
            'T_ChatT_ConversationID' => $converId,
            'T_ChatCode' => $provider,
            'T_ChatRole' => 'assistant',
            'T_ChatContent' => $output,
        ]);

        Conver::findOrFail($converId)->update([
            'T_ConversationLastUpdated' => now(),
        ]);
    }

    public function generateImageOpenAI($apiKey, $prompt, $size = '1024x1024', $imageModel = 'flux')
    {
        // Menggunakan Pollinations AI sebagai alternatif gratis karena API Key OpenAI saat ini menolak model DALL-E
        $encodedPrompt = urlencode($prompt);
        $url = "https://image.pollinations.ai/prompt/{$encodedPrompt}?width=1024&height=1024&nologo=true&model={$imageModel}";
        
        return $url;
    }
}
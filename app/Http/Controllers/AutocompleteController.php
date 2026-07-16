<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\AiProviderService;
use App\Models\SettingAI;
use Illuminate\Support\Facades\Log;

class AutocompleteController extends Controller
{
    protected $aiProvider;

    public function __construct(AiProviderService $aiProvider)
    {
        $this->aiProvider = $aiProvider;
    }

    public function suggest(Request $request)
    {
        $request->validate([
            'text' => 'required|string|max:2000',
        ]);

        $text = $request->text;

        try {
            // Get any active AI provider
            $activeSetting = SettingAI::where('M_SettingIsActive', 'Y')
                ->whereNotNull('M_SettingKey')
                ->where('M_SettingKey', '!=', '')
                ->first();

            if (!$activeSetting) {
                return response()->json(['suggestion' => ' (Error: API Key AI Belum Diatur)']);
            }

            $messages = [
                [
                    'role' => 'system',
                    'content' => 'Anda adalah AI autocomplete. Lanjutkan kalimat terakhir pengguna dengan 1-5 kata. JANGAN ulang kalimat pengguna. JANGAN beri salam. LANGSUNG berikan sambungan katanya.'
                ],
                [
                    'role' => 'user',
                    'content' => "Teks: " . $text
                ]
            ];

            // Use the model configured for this active provider
            $model = $activeSetting->M_SettingModel;
            $provider = $activeSetting->M_SettingCode;
            
            // Fallbacks if model is not properly set
            if (empty($model)) {
                if ($provider === 'SETTING-GMN') $model = 'gemini-1.5-flash';
                else if ($provider === 'SETTING-OAI') $model = 'gpt-4o-mini';
                else if ($provider === 'SETTING-CLD') $model = 'claude-3-haiku-20240307';
            }

            $response = $this->aiProvider->generateText(
                $provider,
                $activeSetting->M_SettingKey,
                $model,
                $messages,
                20
            );

            // Ensure response is a string
            $suggestion = is_string($response) ? trim($response) : '';
            
            // Cleanup quotes
            $suggestion = preg_replace('/^["\']|["\']$/', '', $suggestion);

            // Strip the exact input text if the AI repeated it
            if (str_starts_with(strtolower($suggestion), strtolower(trim($text)))) {
                $suggestion = trim(substr($suggestion, strlen(trim($text))));
            }

            return response()->json(['suggestion' => ltrim($suggestion)]);

        } catch (\Throwable $e) {
            $msg = $e->getMessage();
            if ($e instanceof \GuzzleHttp\Exception\ClientException) {
                $msg = $e->getResponse()->getBody()->getContents();
            }
            Log::error('Autocomplete Error: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
            return response()->json(['suggestion' => ' (Error AI: ' . substr($msg, 0, 50) . '...)']);
        }
    }
}

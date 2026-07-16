<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\AiProviderService;
use App\Models\SettingAi;
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
            // Get Gemini provider as default for fast autocomplete
            $geminiSetting = SettingAi::where('M_SettingAiProvider', 'SETTING-GMN')
                ->where('M_SettingAiIsActive', 'Y')
                ->first();

            if (!$geminiSetting || empty($geminiSetting->M_SettingAiAPIKey)) {
                return response()->json(['suggestion' => '']);
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

            // Use gemini flash or similar fast model
            $model = 'gemini-1.5-flash';

            $response = $this->aiProvider->generateText(
                'SETTING-GMN',
                $geminiSetting->M_SettingAiAPIKey,
                $model,
                $messages,
                20
            );

            $suggestion = trim($response);
            
            // Cleanup quotes
            $suggestion = preg_replace('/^["\']|["\']$/', '', $suggestion);

            // Strip the exact input text if the AI repeated it
            if (str_starts_with(strtolower($suggestion), strtolower(trim($text)))) {
                $suggestion = trim(substr($suggestion, strlen(trim($text))));
            }

            return response()->json(['suggestion' => ltrim($suggestion)]);

        } catch (\Exception $e) {
            Log::error('Autocomplete Error: ' . $e->getMessage());
            return response()->json(['suggestion' => '']);
        }
    }
}

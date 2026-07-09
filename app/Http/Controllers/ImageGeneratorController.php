<?php

namespace App\Http\Controllers;

use App\Services\AiProviderService;
use App\Services\UsageService;
use App\Services\TokenDeductionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImageGeneratorController extends Controller
{
    public function generate(Request $request, AiProviderService $aiService, UsageService $usageService, TokenDeductionService $tokenDeductionService)
    {
        $request->validate([
            'prompt' => 'required|string|max:1000',
            'model' => 'nullable|string|max:50',
            'images' => 'nullable|array|max:5',
            'images.*' => 'image|max:10240', // Max 10MB per image
            'providerId' => 'nullable|integer',
        ]);

        $imageModel = $request->input('model', 'flux');

        $user = $request->user();

        // Cari API Key berdasarkan providerId dari user, atau fallback ke OpenAI random
        $providerQuery = DB::table('m_plansetting as ps')
            ->join('m_setting as s', 's.M_SettingID', '=', 'ps.M_PlanSettingM_SettingID')
            ->where('ps.M_PlanSettingM_PlanID', $user->M_UserPlan)
            ->where('s.M_SettingIsActive', 'Y')
            ->select('s.M_SettingKey', 's.M_SettingCode');

        if ($request->has('providerId') && !empty($request->providerId)) {
            $providerQuery->where('s.M_SettingID', $request->providerId);
        } else {
            $providerQuery->where('s.M_SettingCode', 'SETTING-GPT')->inRandomOrder();
        }

        $provider = $providerQuery->first();

        if (!$provider || empty($provider->M_SettingKey)) {
            return response()->json(['message' => 'API Key OpenAI tidak ditemukan pada langganan Anda.'], 403);
        }

        // Cek kuota harian Claude/dsbg
        if (!$usageService->checkQuota($user->M_UserID, $provider->M_SettingCode)) {
            return response()->json(['message' => 'Kuota harian fitur ini telah habis.'], 429);
        }

        // Cek saldo M_UserQuota dan potong
        if (!$tokenDeductionService->deductQuota($user, 'cost_image_generator')) {
            return response()->json(['message' => 'Saldo koin/kuota Anda tidak mencukupi untuk membuat gambar.'], 402);
        }

        try {
            // 1. Menerjemahkan dan Memperbagus Prompt menggunakan OpenAI Vision (gpt-4o-mini)
            $client = \OpenAI::client($provider->M_SettingKey);
            
            $userContent = [
                ['type' => 'text', 'text' => $request->prompt]
            ];

            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $file) {
                    $base64 = base64_encode(file_get_contents($file->getRealPath()));
                    $mime = $file->getMimeType();
                    $userContent[] = [
                        'type' => 'image_url',
                        'image_url' => [
                            'url' => "data:{$mime};base64,{$base64}"
                        ]
                    ];
                }
            }

            $completion = $client->chat()->create([
                'model' => 'gpt-4o-mini',
                'messages' => [
                    [
                        'role' => 'system', 
                        'content' => 'You are an expert AI image prompt engineer. The user has provided a prompt and potentially some reference images. Analyze the images (if any) and the prompt to create a single, highly detailed English prompt for an image generator that accurately describes the requested final scene (incorporating details from the images like faces, colors, or objects). Add professional modifiers (e.g., highly detailed, masterpiece, cinematic lighting, 8k resolution, photorealistic) to make the image look amazing. Respond ONLY with the final enhanced English prompt. Do not include quotes or extra text.'
                    ],
                    ['role' => 'user', 'content' => $userContent],
                ],
            ]);
            
            $enhancedPrompt = trim($completion->choices[0]->message->content);

            if (empty($enhancedPrompt)) {
                $enhancedPrompt = $request->prompt; // Fallback jika OpenAI gagal membalas
            }

            // 2. Generate dari Pollinations API menggunakan Enhanced Prompt
            $imageUrl = $aiService->generateImageOpenAI($provider->M_SettingKey, $enhancedPrompt, '1024x1024', $imageModel);

            if (!$imageUrl) {
                throw new \Exception('Gagal mendapatkan gambar dari AI.');
            }

            // Download gambar agar tidak expired (URL OpenAI expired dalam 2 jam)
            $imageContent = file_get_contents($imageUrl);
            $filename = 'generated_images/' . Str::uuid() . '.png';
            Storage::disk('public')->put($filename, $imageContent);

            $localUrl = Storage::disk('public')->url($filename);

            // Potong kuota
            $usageService->increment($user->M_UserID, 'SETTING-GPT');

            return response()->json([
                'message' => 'Gambar berhasil dibuat!',
                'url' => $localUrl,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal membuat gambar: ' . $e->getMessage(),
            ], 500);
        }
    }
}

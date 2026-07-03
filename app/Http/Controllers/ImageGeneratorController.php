<?php

namespace App\Http\Controllers;

use App\Services\AiProviderService;
use App\Services\UsageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImageGeneratorController extends Controller
{
    public function generate(Request $request, AiProviderService $aiService, UsageService $usageService)
    {
        $request->validate([
            'prompt' => 'required|string|max:1000',
            'model' => 'nullable|string|max:50',
        ]);

        $imageModel = $request->input('model', 'flux');

        $user = $request->user();

        // Cari API Key OpenAI dari langganan user (SETTING-GPT)
        $provider = DB::table('m_plansetting as ps')
            ->join('m_setting as s', 's.M_SettingID', '=', 'ps.M_PlanSettingM_SettingID')
            ->where('ps.M_PlanSettingM_PlanID', $user->M_UserPlan)
            ->where('s.M_SettingCode', 'SETTING-GPT')
            ->where('s.M_SettingIsActive', 'Y')
            ->select('s.M_SettingKey')
            ->first();

        if (!$provider || empty($provider->M_SettingKey)) {
            return response()->json(['message' => 'API Key OpenAI tidak ditemukan pada langganan Anda.'], 403);
        }

        // Cek kuota
        if (!$usageService->checkQuota($user->M_UserID, 'SETTING-GPT')) {
            return response()->json(['message' => 'Kuota Anda telah habis.'], 429);
        }

        try {
            // Generate dari OpenAI (Atau Pollinations API Fallback)
            $imageUrl = $aiService->generateImageOpenAI($provider->M_SettingKey, $request->prompt, '1024x1024', $imageModel);

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

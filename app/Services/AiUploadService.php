<?php

namespace App\Services;

use OpenAI;
use Illuminate\Support\Facades\Http;

class AiUploadService
{
    public function uploadOpenAI(string $apiKey, array $uploadedFiles)
    {
        $client = OpenAI::client($apiKey);
        $fileIds = [];

        foreach ($uploadedFiles as $uploadedFile) {
            $tempFilePath = tempnam(sys_get_temp_dir(), 'upload_') . '.' . $uploadedFile->getClientOriginalExtension();
            file_put_contents($tempFilePath, file_get_contents($uploadedFile->getRealPath()));

            $responseFile = $client->files()->upload([
                'purpose' => 'assistants',
                'file'    => fopen($tempFilePath, 'r'),
            ]);

            $fileIds[] = $responseFile->id;
            unlink($tempFilePath);
        }

        return response()->json([
            'message' => count($uploadedFiles) > 1 ? 'Files uploaded successfully.' : 'File uploaded successfully.',
            'fileIds' => $fileIds,
        ], 200);
    }

    public function uploudGemini(string $apiKey, array $uploadedFiles)
    {
        $uploaded = [];

        foreach ($uploadedFiles as $file) {
            $tempPath = tempnam(sys_get_temp_dir(), 'upload_') . '.' . $file->getClientOriginalExtension();
            file_put_contents($tempPath, file_get_contents($file->getRealPath()));

            $response = Http::attach(
                'file', file_get_contents($tempPath), $file->getClientOriginalName()
            )->post("https://generativelanguage.googleapis.com/upload/v1beta/files?key=$apiKey");

            unlink($tempPath);

            if ($response->failed()) {
                return response()->json(['error' => 'Upload ke Gemini gagal.'], 500);
            }

            $fileInfo = $response->json()['file'];
            $uploaded[] = [
                'name' => $fileInfo['name'],
                'uri' => $fileInfo['uri'],
                'mime_type' => $fileInfo['mimeType'],
            ];
        }

        return response()->json([
            'message' => count($uploadedFiles) > 1 ? 'Files uploaded successfully.' : 'File uploaded successfully.',
            'files' => $uploaded,
        ]);
    }
}

<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Jobs\TranscribeJob;
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

    public function transcribe(Request $request, \App\Services\TokenDeductionService $tokenDeductionService)
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

        // Cek saldo M_UserQuota dan potong
        if (!$tokenDeductionService->deductQuota($user, 'cost_transcribe')) {
            return response()->json(['error' => 'Saldo koin/kuota Anda tidak mencukupi untuk melakukan Transcribe.'], 402);
        }

        // Check if user already has an active transcription (pending or processing)
        $activeTranscription = Transcribe::where('M_TranscribeM_UserID', $user->M_UserID)
            ->whereIn('M_TranscribeStatus', ['pending', 'processing'])
            ->first();

        if ($activeTranscription) {
            return response()->json([
                'error' => 'You already have a transcription in progress. Please wait for it to complete before starting a new one.',
                'activeId' => $activeTranscription->M_TranscribeID,
                'activeStatus' => $activeTranscription->M_TranscribeStatus
            ], 409);
        }

        $source = $request->input('source');
        $filePath = null;
        $youtubeUrl = null;

        try {
            if ($source === 'youtube') {
                $youtubeUrl = $request->video_url;
            } elseif ($source === 'upload') {
                $file = $request->file('file');
                $filename = uniqid() . '.' . $file->getClientOriginalExtension();
                $file->move(storage_path('app/private/uploads'), $filename);
                $filePath = storage_path('app/private/uploads/' . $filename);

                if (!file_exists($filePath)) {
                    return response()->json([
                        'error' => 'Uploaded file not found',
                    ], 500);
                }
            } elseif ($source === 'record') {
                $file = $request->file('file');
                $filename = uniqid() . ".webm";
                $file->move(storage_path('app/private/record'), $filename);
                $filePath = storage_path('app/private/record/' . $filename);

                if (!file_exists($filePath)) {
                    return response()->json([
                        'error' => 'Recorded file not found',
                    ], 500);
                }
            }

            // Create transcription record with pending status
            $transcribe = Transcribe::create([
                'M_TranscribeM_UserID' => $user->M_UserID,
                'M_TranscribeName' => ucfirst($source) . ' transcribe ' . now()->format('Y-m-d H:i'),
                'M_TranscribeSource' => $source,
                'M_TranscribeStatus' => 'pending'
            ]);

            // Dispatch job to process transcription asynchronously
            // ffmpeg conversion (for upload/record) happens inside the job
            TranscribeJob::dispatch(
                $transcribe->M_TranscribeID,
                $source,
                $filePath,
                $youtubeUrl
            );

            return response()->json([
                'success' => true,
                'id' => $transcribe->M_TranscribeID,
                'name' => $transcribe->M_TranscribeName,
                'source' => $transcribe->M_TranscribeSource,
                'status' => $transcribe->M_TranscribeStatus,
                'message' => 'Transcription started. Processing in the background...'
            ], 201);
        } catch (\Exception $e) {
            // Cleanup files on error
            if ($filePath && file_exists($filePath)) {
                unlink($filePath);
            }

            return response()->json([
                'error' => 'Failed to start transcription',
                'message' => $e->getMessage()
            ], 500);
        }
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

    /**
     * Get status of a specific transcription
     */
    public function getStatus(Request $request, $id)
    {
        $user = $request->user();
        $transcribe = Transcribe::where('M_TranscribeID', $id)
            ->where('M_TranscribeM_UserID', $user->M_UserID)
            ->first();

        if (!$transcribe) {
            return response()->json([
                'message' => 'Transcription not found.'
            ], 404);
        }

        return response()->json([
            'id' => $transcribe->M_TranscribeID,
            'status' => $transcribe->M_TranscribeStatus,
            'name' => $transcribe->M_TranscribeName,
            'source' => $transcribe->M_TranscribeSource,
            'started_at' => $transcribe->M_TranscribeStartedAt,
            'completed_at' => $transcribe->M_TranscribeCompletedAt,
            'has_error' => $transcribe->M_TranscribeStatus === 'failed',
            'error_message' => $transcribe->M_TranscribeErrorMessage,
            'data' => $transcribe->M_TranscribeStatus === 'completed' ? $transcribe->M_TranscribeData : null
        ]);
    }

    /**
     * Get active transcription (pending or processing) for current user
     */
    public function getActive(Request $request)
    {
        $user = $request->user();
        $activeTranscription = Transcribe::where('M_TranscribeM_UserID', $user->M_UserID)
            ->whereIn('M_TranscribeStatus', ['pending', 'processing'])
            ->first();

        if (!$activeTranscription) {
            return response()->json([
                'active' => false,
                'data' => null
            ]);
        }

        return response()->json([
            'active' => true,
            'data' => [
                'id' => $activeTranscription->M_TranscribeID,
                'status' => $activeTranscription->M_TranscribeStatus,
                'name' => $activeTranscription->M_TranscribeName,
                'source' => $activeTranscription->M_TranscribeSource,
                'started_at' => $activeTranscription->M_TranscribeStartedAt,
            ]
        ]);
    }
}


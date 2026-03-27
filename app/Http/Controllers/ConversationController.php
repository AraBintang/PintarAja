<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Chat;
use App\Models\Conver;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class ConversationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $search = $request->input('search');
        $limit = 20;

        $conversations = Conver::where('T_ConversationM_UserID', $user->M_UserID)
            ->where('T_ConversationIsActive', 'Y')
            ->when($search, fn ($q) =>
                $q->where('T_ConversationTitle', 'like', "%{$search}%")
            )
            ->orderByDesc('T_ConversationLastUpdated')
            ->get()
            ->map(function ($conver) use ($limit) {

                $chatBatch = Chat::where('T_ChatT_ConversationID', $conver->T_ConversationID)
                    ->orderByDesc('T_ChatID')
                    ->limit($limit + 1)
                    ->get();

                $hasMore = $chatBatch->count() > $limit;

                $chats = $chatBatch->take($limit);

                $nextCursor = $chats->last()?->T_ChatID;

                $chats = $chats
                    ->reverse()
                    ->values()
                    ->map(function ($chat) {
                        $annotations = [];
                        if (!empty($chat->T_ChatAnnotations)) {
                            $decoded = json_decode($chat->T_ChatAnnotations, true);
                            if (is_array($decoded)) {
                                $annotations = $decoded;
                            }
                        }

                        return [
                            'id' => $chat->T_ChatID,
                            'conversationId' => $chat->T_ChatT_ConversationID,
                            'code' => $chat->T_ChatCode,
                            'role' => $chat->T_ChatRole,
                            'content' => $chat->T_ChatContent,
                            'annotations' => $annotations,
                            'time' => Carbon::parse($chat->T_ChatCreated)->format('H:i')
                        ];
                    });

                return [
                    'id' => $conver->T_ConversationID,
                    'title' => $conver->T_ConversationTitle,
                    'lastUpdated' => Carbon::parse($conver->T_ConversationLastUpdated)->diffForHumans(),
                    'nextCursor' => $nextCursor,
                    'hasMoreChats' => $hasMore,
                    'chats' => $chats
                ];
            });

        return response()->json($conversations);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $conversation = Conver::create([
            'T_ConversationM_UserID' => $user->M_UserID,
            'T_ConversationTitle' => 'New Conversation'
        ]);

        return response()->json([
            'conversation' => [
                'id' => $conversation->T_ConversationID,
                'title' => $conversation->T_ConversationTitle,
                'lastUpdated' => 'just now'
            ],
        ]);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'title' => 'required|string|max:50'
        ]);

        $conversation = Conver::findOrFail($id);

        $conversation->update([
            'T_ConversationTitle' => $request->title
        ]);

        return response()->json([
            'id' => $conversation->T_ConversationID,
            'title' => $conversation->T_ConversationTitle,
            'lastUpdated' => Carbon::parse($conversation->T_ConversationLastUpdated)->diffForHumans()
        ]);
    }

    public function destroy($id)
    {
        $conversation = Conver::findOrFail($id);

        $conversation->update([
            'T_ConversationIsActive' => 'N'
        ]);

        return response()->json([
            'message' => 'Conversation deleted'
        ]);
    }
}

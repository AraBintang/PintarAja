<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;

class ApiTokenController extends Controller
{
    public function index(Request $request)
    {
        $query = PersonalAccessToken::with('tokenable')
            ->where('name', 'api-access')
            ->orderBy('created_at', 'desc');

        $tokens = $query->paginate($request->get('limit', 10));

        $tokens->getCollection()->transform(function ($token) {
            return [
                'id' => $token->id,
                'name' => $token->name,
                'user_name' => $token->tokenable ? $token->tokenable->M_UserFullName : 'Unknown',
                'user_email' => $token->tokenable ? $token->tokenable->M_UserEmail : 'Unknown',
                'last_used_at' => $token->last_used_at,
                'created_at' => $token->created_at,
            ];
        });

        return response()->json($tokens);
    }

    public function store(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:m_user,M_UserID',
            'token_name' => 'nullable|string|max:255',
        ]);

        $user = User::findOrFail($request->user_id);
        
        $tokenName = $request->token_name ?: 'api-access';

        $token = $user->createToken($tokenName, ['external-api']);

        return response()->json([
            'message' => 'Token berhasil dibuat.',
            'token' => $token->plainTextToken,
        ]);
    }

    public function destroy($id)
    {
        $token = PersonalAccessToken::findOrFail($id);
        $token->delete();

        return response()->json([
            'message' => 'Token berhasil dihapus.'
        ]);
    }

    public function getUsers(Request $request)
    {
        $search = $request->get('search', '');
        
        $users = User::select('M_UserID as id', 'M_UserFullName as name', 'M_UserEmail as email')
            ->when($search, function($q) use ($search) {
                $q->where('M_UserFullName', 'like', "%{$search}%")
                  ->orWhere('M_UserEmail', 'like', "%{$search}%");
            })
            ->where('M_UserIsActive', 'Y')
            ->limit(20)
            ->get();

        return response()->json($users);
    }
}

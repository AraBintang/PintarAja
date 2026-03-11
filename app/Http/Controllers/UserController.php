<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $perPage = (int) $request->input('per_page', 10);
        $page = max(1, (int) $request->input('page', 1));
        $search = $request->input('search');

        $query = User::query()
            ->when($search, function ($q) use ($search) {
                $q->where('M_UserFullName', 'like', "%{$search}%")
                  ->orWhere('M_UserEmail', 'like', "%{$search}%");
            })
            ->when($request->filled('role'), function ($q) use ($request) {
                $q->where('M_UserRole', $request->role);
            })
            ->when($request->filled('plan'), function ($q) use ($request) {
                $q->where('M_UserPlan', $request->plan);
            })
            ->when($request->filled('status'), function ($q) use ($request) {
                $q->where('M_UserIsActive', $request->status);
            })
            ->orderBy('M_UserID', 'asc');

        $paginated = $query->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'data' => $paginated->items(),

            'summary' => [
                'total' => User::count(),
                'active' => User::where('M_UserIsActive', 'Y')->count(),
                'admin' => User::where('M_UserRole', 'A')->count(),
                'premium' => User::where('M_UserPlan', '!=', 1)->count(),
            ],

            'pagination' => [
                'current_page' => $paginated->currentPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
                'last_page' => $paginated->lastPage()
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email|unique:m_user,M_UserEmail',
            'name' => 'required|string|max:20',
            'password' => 'required|min:6',
            'phone' => 'nullable|string',
            'role' => 'nullable|string|size:1',
            'plan' => 'nullable|integer',
            'isActive' => 'nullable|string|size:1',
            'subsDay' => 'nullable|integer',
        ]);

        $user = new User();
        $user->M_UserEmail = $validated['email'];
        $user->M_UserFullName = $validated['name'];
        $user->M_UserPhone = $validated['phone'] ?? null;
        $user->M_UserPassword = Hash::make($validated['password']);
        $user->M_UserRole = $validated['role'] ?? 'U';
        $user->M_UserPlan = $validated['plan'] ?? 1;
        $user->M_UserIsActive = $validated['isActive'] ?? 'Y';

        $user->M_UserSubsExp = isset($validated['subsDay'])
            ? Carbon::now()->addDays($validated['subsDay'])
            : null;

        $user->M_UserCreated = now();
        $user->M_UserLastUpdated = now();
        $user->save();

        return response()->json([
            'message' => 'User created successfully',
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'email' => 'required|email|unique:m_user,M_UserEmail,' . $id . ',M_UserID',
            'name' => 'required|string|max:20',
            'password' => 'nullable|min:6',
            'phone' => 'nullable|string',
            'role' => 'nullable|string|size:1',
            'plan' => 'nullable|integer',
            'isActive' => 'nullable|string|size:1',
            'subsDay' => 'nullable|integer',
        ]);

        $user->M_UserEmail = $validated['email'];
        $user->M_UserFullName = $validated['name'];
        $user->M_UserPhone = $validated['phone'] ?? $user->M_UserPhone;
        $user->M_UserRole = $validated['role'] ?? $user->M_UserRole;
        $user->M_UserPlan = $validated['plan'] ?? $user->M_UserPlan;
        $user->M_UserIsActive = $validated['isActive'] ?? $user->M_UserIsActive;

        if (!empty($validated['password'])) {
            $user->M_UserPassword = Hash::make($validated['password']);
        }

        if (isset($validated['subsDay'])) {
            $baseDate = $user->M_UserSubsExp && Carbon::parse($user->M_UserSubsExp)->isFuture()
                ? Carbon::parse($user->M_UserSubsExp)
                : Carbon::now();

            $user->M_UserSubsExp = $baseDate->addDays($validated['subsDay']);
        }

        $user->M_UserLastUpdated = now();
        $user->save();

        return response()->json([
            'message' => 'User updated successfully',
        ]);
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);

        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully'
        ]);
    }
}
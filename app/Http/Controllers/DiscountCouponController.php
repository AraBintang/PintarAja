<?php

namespace App\Http\Controllers;

use App\Models\DiscountCoupon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class DiscountCouponController extends Controller
{
    /**
     * Get paginated list of discount coupons (Admin)
     */
    public function index(Request $request)
    {
        $perPage = (int) $request->input('per_page', 10);
        $page = max(1, (int) $request->input('page', 1));
        $search = $request->input('search');

        $query = DiscountCoupon::query()
            ->when($search, function ($q) use ($search) {
                $q->where('M_DiscountCouponCode', 'like', "%{$search}%");
            })
            ->orderBy('M_DiscountCouponID', 'desc');

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

    /**
     * Store a new discount coupon (Admin)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:32|alpha_num|unique:m_discount_coupon,M_DiscountCouponCode',
            'type' => 'required|in:percentage,fixed',
            'amount' => 'required|integer|min:1',
            'maxUses' => 'nullable|integer|min:1',
            'expired' => 'required|date|after:today',
        ]);

        if ($validated['type'] === 'percentage' && $validated['amount'] > 100) {
            return response()->json(['message' => 'Diskon persentase tidak boleh lebih dari 100%'], 422);
        }

        $user = Auth::user();

        $coupon = DiscountCoupon::create([
            'M_DiscountCouponCode' => strtoupper(trim($validated['code'])),
            'M_DiscountCouponType' => $validated['type'],
            'M_DiscountCouponAmount' => $validated['amount'],
            'M_DiscountCouponMaxUses' => $validated['maxUses'] ?? null,
            'M_DiscountCouponExpired' => $validated['expired'],
            'M_DiscountCouponIsActive' => true,
            'M_DiscountCouponCreatedBy' => $user->M_UserID,
            'M_DiscountCouponCreated' => now(),
            'M_DiscountCouponLastUpdated' => now(),
        ]);

        return response()->json(['message' => 'Kupon diskon berhasil dibuat.', 'data' => $coupon], 201);
    }

    /**
     * Toggle active status of a discount coupon (Admin)
     */
    public function destroy($id)
    {
        $coupon = DiscountCoupon::findOrFail($id);
        $coupon->M_DiscountCouponIsActive = !$coupon->M_DiscountCouponIsActive;
        $coupon->save();

        $status = $coupon->M_DiscountCouponIsActive ? 'diaktifkan' : 'dinonaktifkan';
        return response()->json(['message' => "Kupon berhasil $status."]);
    }

    /**
     * Validate a discount coupon code (Public / Customer)
     */
    public function check(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
            'original_amount' => 'required|integer|min:1000'
        ]);

        $code = strtoupper(trim($request->input('code')));
        $originalAmount = (int) $request->input('original_amount');

        $coupon = DiscountCoupon::where('M_DiscountCouponCode', $code)
            ->where('M_DiscountCouponIsActive', true)
            ->first();

        if (!$coupon) {
            return response()->json(['message' => 'Kode kupon tidak valid atau tidak aktif.'], 404);
        }

        if (now() > $coupon->M_DiscountCouponExpired) {
            return response()->json(['message' => 'Kode kupon sudah kedaluwarsa.'], 400);
        }

        if ($coupon->M_DiscountCouponMaxUses !== null && $coupon->M_DiscountCouponUsedCount >= $coupon->M_DiscountCouponMaxUses) {
            return response()->json(['message' => 'Batas maksimal penggunaan kupon ini telah habis.'], 400);
        }

        $discountAmount = 0;
        if ($coupon->M_DiscountCouponType === 'percentage') {
            $discountAmount = (int) round($originalAmount * ($coupon->M_DiscountCouponAmount / 100));
        } else {
            $discountAmount = $coupon->M_DiscountCouponAmount;
        }

        // Prevent discount from making total negative
        if ($discountAmount >= $originalAmount) {
            $discountAmount = $originalAmount - 1000; // Keep minimum payment 1000 IDR or equivalent depending on Tripay
            if ($discountAmount < 0) {
                 $discountAmount = 0;
            }
        }

        return response()->json([
            'code' => $coupon->M_DiscountCouponCode,
            'type' => $coupon->M_DiscountCouponType,
            'amount' => $coupon->M_DiscountCouponAmount,
            'discount_value' => $discountAmount,
            'final_amount' => $originalAmount - $discountAmount
        ]);
    }
}

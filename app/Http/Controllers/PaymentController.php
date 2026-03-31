<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\ReferralUsage;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $perPage = (int) $request->input('per_page', 10);
        $page = max(1, (int) $request->input('page', 1));
        $status = $request->input('status');

        $query = Transaction::where('T_TransactionM_UserID', $user->M_UserID)
            ->when($status !== null && $status !== '', fn($q) => $q->where('T_TransactionStatus', $status))
            ->orderBy('T_TransactionCreated', 'desc');

        $paginated = $query->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'data' => $paginated->getCollection()->map(fn($tx) => $this->formatTransaction($tx)),
            'pagination' => [
                'current_page' => $paginated->currentPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
                'last_page' => $paginated->lastPage(),
            ],
        ]);
    }

    public function indexByReferenceId(Request $request, $referenceId)
    {
        $user = Auth::user();

        $tx = Transaction::where('T_TransactionIdRefrence', $referenceId)
            ->where('T_TransactionM_UserID', $user->M_UserID)
            ->first();

        if (!$tx) {
            return response()->json(['message' => 'Transaction not found'], 404);
        }

        return response()->json($this->formatTransaction($tx, true));
    }

    public function store(Request $request)
    {
        $apiKey = config('services.tripay.api_key');
        $privateKey = config('services.tripay.private_key');
        $merchantCode = config('services.tripay.merchant_code');
    
        $validated = $request->validate([
            'planId' => 'required',
            'amount' => 'required|numeric|min:1000',
            'channel' => 'required|string',
            'method' => 'required|string',
            'item' => 'required|string|max:255',
            'phone' => 'required|string|max:15',
        ]);
    
        if ($validated['planId'] == 1) {
            return response()->json(['error' => 'Plan Tidak Valid'], 500);
        }
    
        $user = Auth::user();
    
        $pendingDiscountPercent = $this->getPendingReferralDiscount($user->M_UserID);
        $originalAmount = (int) $validated['amount'];
        $discountAmount = 0;
        $finalAmount = $originalAmount;
    
        if ($pendingDiscountPercent > 0) {
            $discountAmount = (int) round($originalAmount * ($pendingDiscountPercent / 100));
            $finalAmount = max($originalAmount - $discountAmount, 1000);
        }
    
        $merchantRef = 'ORDER-' . time() . '-' . rand(1000, 9999);
    
        $payload = [
            'method' => $validated['channel'],
            'merchant_ref' => $merchantRef,
            'amount' => $finalAmount,
            'customer_name' => $user->M_UserFullName,
            'customer_email' => $user->M_UserEmail,
            'customer_phone' => $validated['phone'],
            'order_items' => [[
                'name' => $validated['item'],
                'price' => $finalAmount,
                'quantity' => 1,
            ]],
            'signature' => hash_hmac('sha256', $merchantCode . $merchantRef . $finalAmount, $privateKey),
        ];

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $apiKey,
        ])->post('https://tripay.co.id/api/transaction/create', $payload);

        if ($response->failed()) {
            \Log::error('Tripay API Error', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            return response()->json(['error' => 'Failed while creating payment'], 500);
        }

        $data = $response['data'];
        $isQris = strtolower($validated['channel']) === 'qris2' || strtolower($validated['method']) === 'qris';

        $paymentCode = null;
        if ($isQris) {
            $paymentCode = $data['qr_url'] ?? null;
        } elseif (!empty($data['pay_code'])) {
            $paymentCode = $data['pay_code'];
        } elseif (!empty($data['pay_url'])) {
            $paymentCode = $data['pay_url'];
        }

        $instructions = $data['instructions'] ?? [];
        $checkoutUrl = $data['checkout_url'] ?? null;

        $tx = Transaction::create([
            'T_TransactionM_UserID' => $user->M_UserID,
            'T_TransactionM_PlanID' => $validated['planId'],
            'T_TransactionIdResult' => $data['reference'],
            'T_TransactionIdRefrence' => $data['merchant_ref'],
            'T_TransactionQR' => $paymentCode,
            'T_TransactionItem' => $validated['item'],
            'T_TransactionAmount' => $finalAmount,
            'T_TransactionStatus' => 0,
            'T_TransactionMethod' => $validated['method'],
            'T_TransactionExpired' => $data['expired_time'] ?? (time() + 86400),
            'T_TransactionChannel' => $validated['channel'],
            'T_TransactionStep' => json_encode($instructions),
            'T_TransactionCheckoutURL' => $checkoutUrl,
        ]);
    
        if ($pendingDiscountPercent > 0) {
            $this->markReferralDiscountsUsed($user->M_UserID);
        }
    
        return response()->json([
            'status' => 'success',
            'referenceId' => $data['merchant_ref'],
            'paymentCode' => $paymentCode,
            'payUrl' => $data['pay_url'] ?? null,
            'checkoutUrl' => $checkoutUrl,
            'expiredAt' => $data['expired_time'] ?? null,
            'instructions' => $instructions,
            'discountInfo' => [
                'originalAmount' => $originalAmount,
                'discountPercent' => $pendingDiscountPercent,
                'discountAmount' => $discountAmount,
                'finalAmount' => $finalAmount,
            ],
        ], 200);
    }

    private function getPendingReferralDiscount(int $userID): int
    {
        return (int) ReferralUsage::where('T_ReferralUsageOwnerID', $userID)
            ->where('T_ReferralUsageIsUsed', false)
            ->where('T_ReferralUsageIsFreeMonth', false)
            ->sum('T_ReferralUsageDiscountPercent');
    }
    
    private function markReferralDiscountsUsed(int $userID): void
    {
        ReferralUsage::where('T_ReferralUsageOwnerID', $userID)
            ->where('T_ReferralUsageIsUsed', false)
            ->where('T_ReferralUsageIsFreeMonth', false)
            ->update(['T_ReferralUsageIsUsed' => true]);
    }

    public function getReferralDiscount(Request $request)
    {
        $user = Auth::user();
        $discountPercent = $this->getPendingReferralDiscount($user->M_UserID);
        $hasFreeMonth = $user->hasPendingFreeMonth();
    
        return response()->json([
            'discount_percent' => $discountPercent,
            'has_free_month' => $hasFreeMonth,
            'referral_count' => $user->getReferralCount(),
            'next_reward' => $this->getNextRewardInfo($user->M_UserID),
        ]);
    }

    private function getNextRewardInfo(int $userID): array
    {
        $total = ReferralUsage::where('T_ReferralUsageOwnerID', $userID)->count();
        $posInCycle = ($total % 7) + 1;
        $remainingToFree = 7 - $posInCycle + 1;
    
        if ($remainingToFree === 1) {
            return ['type' => 'free_month', 'remaining' => 1, 'message' => '1 orang lagi untuk free 1 bulan!'];
        }
    
        return [
            'type' => 'discount',
            'remaining' => $remainingToFree - 1,
            'message'   => ($remainingToFree - 1) . ' orang lagi untuk free 1 bulan',
        ];
    }

    public function notify(Request $request)
    {
        $data = $request->all();

        if (!isset($data['reference'])) {
            return response()->json(['message' => 'Invalid callback data'], 400);
        }

        $statusMap = ['UNPAID' => 0, 'PAID' => 1, 'REFUND' => 2, 'EXPIRED' => 3, 'FAILED' => 3];
        $statusCode = $statusMap[$data['status']] ?? 3;

        $tx = Transaction::where('T_TransactionIdResult', $data['reference'])->first();

        if (!$tx) {
            return response()->json(['message' => 'Transaction not found'], 404);
        }

        $tx->update(['T_TransactionStatus' => $statusCode]);

        if ($statusCode === 1) {
            $daysMap = ['Weekly' => 7, 'Monthly' => 30, 'Yearly' => 365];
            $suffix = trim(Str::afterLast($tx->T_TransactionItem, '-'));
            $days = $daysMap[$suffix] ?? 0;

            $user = User::find($tx->T_TransactionM_UserID);
            if ($user && $days > 0) {
                $base = ($user->M_UserSubsExp && !Carbon::parse($user->M_UserSubsExp)->isPast())
                    ? Carbon::parse($user->M_UserSubsExp)
                    : now();

                $user->update([
                    'M_UserPlan' => $tx->T_TransactionM_PlanID,
                    'M_UserSubsExp' => $base->addDays($days),
                ]);
            }
        }

        return response()->json(['message' => 'Callback processed successfully']);
    }

    private function formatTransaction(Transaction $tx, bool $withDetail = false): array
    {
        $labels = [
            '0' => 'Menunggu Pembayaran',
            '1' => 'Berhasil',
            '2' => 'Refund',
            '3' => 'Kadaluarsa',
        ];

        $result = [
            'id' => $tx->T_TransactionID,
            'referenceId' => $tx->T_TransactionIdRefrence,
            'resultId' => $tx->T_TransactionIdResult,
            'paymentCode' => $tx->T_TransactionQR,
            'planName' => $tx->T_TransactionItem,
            'amount' => $tx->T_TransactionAmount,
            'status' => $labels[(string) $tx->T_TransactionStatus] ?? 'Unknown',
            'statusCode' => (int) $tx->T_TransactionStatus,
            'method' => $tx->T_TransactionMethod,
            'channel' => $tx->T_TransactionChannel,
            'expiredAt' => $tx->T_TransactionExpired,
            'createdAt' => $tx->T_TransactionCreated,
        ];

        if ($withDetail) {
            $result['checkoutUrl'] = $tx->T_TransactionCheckoutURL;
            $result['instructions'] = $tx->T_TransactionStep
                ? json_decode($tx->T_TransactionStep, true)
                : [];
        }

        return $result;
    }
}
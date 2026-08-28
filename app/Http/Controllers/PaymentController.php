<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Controllers\PlagiarismController;
use App\Models\Plagiarism;
use App\Models\Plan;
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

        // Check and update expired transactions
        $paginated->getCollection()->each(function ($tx) {
            if ($tx->T_TransactionStatus == 0 && Carbon::createFromTimestamp($tx->T_TransactionExpired)->isPast()) {
                $tx->update(['T_TransactionStatus' => 3]);
            }
        });

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
            'discount_code' => 'nullable|string',
        ]);
    
        if ($validated['planId'] == 1) {
            return response()->json(['error' => 'Plan Tidak Valid'], 500);
        }
    
        $user = Auth::user();
    
        $pendingDiscountPercent = $user->getReferralDiscount();
        $originalAmount = (int) $validated['amount'];
        $discountAmount = 0;
        $finalAmount = $originalAmount;
    
        if ($pendingDiscountPercent > 0) {
            $discountAmount += (int) round($originalAmount * ($pendingDiscountPercent / 100));
        }

        $appliedCoupon = null;
        if (!empty($validated['discount_code'])) {
            $code = strtoupper(trim($validated['discount_code']));
            $coupon = \App\Models\DiscountCoupon::where('M_DiscountCouponCode', $code)
                ->where('M_DiscountCouponIsActive', true)
                ->first();

            if ($coupon && now() <= $coupon->M_DiscountCouponExpired) {
                if ($coupon->M_DiscountCouponMaxUses === null || $coupon->M_DiscountCouponUsedCount < $coupon->M_DiscountCouponMaxUses) {
                    $couponDiscount = 0;
                    if ($coupon->M_DiscountCouponType === 'percentage') {
                        $couponDiscount = (int) round($originalAmount * ($coupon->M_DiscountCouponAmount / 100));
                    } else {
                        $couponDiscount = $coupon->M_DiscountCouponAmount;
                    }
                    $discountAmount += $couponDiscount;
                    $appliedCoupon = $code;

                    // Increment used count
                    $coupon->increment('M_DiscountCouponUsedCount');
                }
            }
        }

        $finalAmount = max($originalAmount - $discountAmount, 1000);
    
        $merchantRef = 'ORDER-' . time() . '-' . rand(1000, 9999);
    
        $checkoutUrl = null;
        $paymentCode = null;
        $instructions = [];
        $expiredTime = time() + 86400;
        $referenceIdResult = '';

        
        // SELALU PAKAI XENDIT (Menghilangkan Tripay)
        $xenditSecret = config('services.xendit.secret_key');
        $response = Http::withBasicAuth($xenditSecret, '')
            ->post('https://api.xendit.co/v2/invoices', [
                'external_id' => $merchantRef,
                'amount' => $finalAmount,
                'payer_email' => !empty($user->M_UserEmail) ? $user->M_UserEmail : 'user@pintaraja.com',
                'description' => $validated['item'],
                'customer' => [
                    'given_names' => !empty($user->M_UserFullName) ? $user->M_UserFullName : 'User Pintaraja',
                    'email' => !empty($user->M_UserEmail) ? $user->M_UserEmail : 'user@pintaraja.com',
                    'mobile_number' => $validated['phone']
                ],
                'currency' => 'IDR'
            ]);

        if ($response->failed()) {
            \Log::error('Xendit API Error', ['status' => $response->status(), 'body' => $response->body()]);
            $errorMsg = $response->json('message') ?? 'Failed while creating payment';
            return response()->json(['error' => 'Xendit Error: ' . $errorMsg], 500);
        }
            
        $data = $response->json();
        $checkoutUrl = $data['invoice_url'];
        $referenceIdResult = $data['id']; // Xendit Invoice ID
        $expiredTime = strtotime($data['expiry_date'] ?? '+1 day');

        $tx = Transaction::create([
            'T_TransactionM_UserID' => $user->M_UserID,
            'T_TransactionM_PlanID' => $validated['planId'],
            'T_TransactionType' => 'subscription',
            'T_TransactionIdResult' => $referenceIdResult,
            'T_TransactionIdRefrence' => $merchantRef,
            'T_TransactionQR' => null,
            'T_TransactionItem' => $validated['item'],
            'T_TransactionAmount' => $finalAmount,
            'T_TransactionStatus' => 0,
            'T_TransactionMethod' => 'Xendit',
            'T_TransactionExpired' => $expiredTime,
            'T_TransactionChannel' => 'Xendit',
            'T_TransactionStep' => json_encode([]),
            'T_TransactionCheckoutURL' => $checkoutUrl,
        ]);
    
        return response()->json([
            'status' => 'success',
            'referenceId' => $merchantRef,
            'paymentCode' => null,
            'payUrl' => null,
            'checkoutUrl' => $checkoutUrl,
            'expiredAt' => $expiredTime,
            'instructions' => [],
            'discountInfo' => [
                'originalAmount' => $originalAmount,
                'discountPercent' => $pendingDiscountPercent,
                'discountAmount' => $discountAmount,
                'finalAmount' => $finalAmount,
                'appliedCoupon' => $appliedCoupon,
            ],
        ], 200);
    }

public function topup(Request $request, \App\Services\TokenDeductionService $tokenService)
    {
        $defaultAmount = $tokenService->getCost('cost_topup_amount') ?: 100;
        $defaultPrice  = $tokenService->getCost('cost_topup_price')  ?: 10000;

        $validated = $request->validate([
            'coins'   => 'required|integer|min:1',
            'phone'   => 'required|string|max:20',
            'channel' => 'nullable|string',
            'method'  => 'nullable|string',
            'amount'  => 'nullable|numeric',
        ]);

        $user   = Auth::user();
        $coins  = (int) $validated['coins'];

        // Use amount from request if provided (Flutter sends it), otherwise calculate
        if (!empty($validated['amount']) && (int)$validated['amount'] > 0) {
            $amount = (int) $validated['amount'];
        } else {
            $amount = ($defaultAmount > 0)
                ? (int) floor(($coins / $defaultAmount) * $defaultPrice)
                : $coins * 1000;
        }

        // Ensure minimum amount for Xendit (IDR 1000)
        $amount = max($amount, 1000);

        $merchantRef = 'TOPUP-' . time() . '-' . rand(1000, 9999);

        
        // SELALU PAKAI XENDIT
        $xenditSecret = config('services.xendit.secret_key');
        $response = Http::withBasicAuth($xenditSecret, '')
            ->post('https://api.xendit.co/v2/invoices', [
                'external_id' => $merchantRef,
                'amount' => $amount,
                'payer_email' => !empty($user->M_UserEmail) ? $user->M_UserEmail : 'user@pintaraja.com',
                'description' => 'Topup Koin - ' . $coins,
                'customer' => [
                    'given_names' => !empty($user->M_UserFullName) ? $user->M_UserFullName : 'User Pintaraja',
                    'email' => !empty($user->M_UserEmail) ? $user->M_UserEmail : 'user@pintaraja.com',
                    'mobile_number' => $validated['phone']
                ],
                'currency' => 'IDR'
            ]);

        if ($response->failed()) {
            \Log::error('Xendit API Error (Topup)', ['status' => $response->status(), 'body' => $response->body()]);
            $errorMsg = $response->json('message') ?? 'Failed while creating payment';
            return response()->json(['error' => 'Xendit Error: ' . $errorMsg], 500);
        }
        
        $data = $response->json();
        $checkoutUrl = $data['invoice_url'];
        $referenceIdResult = $data['id'];
        $expiredTime = strtotime($data['expiry_date'] ?? '+1 day');

        $tx = Transaction::create([
            'T_TransactionM_UserID' => $user->M_UserID,
            'T_TransactionM_PlanID' => 0,
            'T_TransactionType' => 'topup',
            'T_TransactionIdResult' => $referenceIdResult,
            'T_TransactionIdRefrence' => $merchantRef,
            'T_TransactionQR' => null,
            'T_TransactionItem' => 'Topup Koin - ' . $coins,
            'T_TransactionAmount' => $amount,
            'T_TransactionStatus' => 0,
            'T_TransactionMethod' => 'Xendit',
            'T_TransactionExpired' => $expiredTime,
            'T_TransactionChannel' => 'Xendit',
            'T_TransactionStep' => json_encode([]),
            'T_TransactionCheckoutURL' => $checkoutUrl,
        ]);

        return response()->json([
            'status' => 'success',
            'referenceId' => $merchantRef,
            'paymentCode' => null,
            'payUrl' => null,
            'checkoutUrl' => $checkoutUrl,
            'expiredAt' => $expiredTime,
            'instructions' => [],
            'amount' => $amount,
        ]);
    }

public function notify(Request $request)
    {
        $data = $request->all();

        if (isset($data['id'])) { $data['reference'] = $data['id']; }
        elseif (isset($data['external_id'])) { $data['reference'] = $data['external_id']; }
        if (!isset($data['reference'])) {
            return response()->json(['message' => 'Invalid callback data'], 400);
        }

        $statusMap = ['UNPAID' => 0, 'PAID' => 1, 'REFUND' => 2, 'EXPIRED' => 3, 'FAILED' => 3, 'SETTLED' => 1];
        $statusCode = $statusMap[$data['status']] ?? 3;

        $tx = Transaction::where('T_TransactionIdResult', $data['reference'])->first();

        if (!$tx) {
            return response()->json(['message' => 'Transaction not found'], 404);
        }

        $wasPaidAlready = $tx->T_TransactionStatus === 1;
        $tx->update(['T_TransactionStatus' => $statusCode]);

        if ($statusCode === 1 && !$wasPaidAlready) {
            $this->markReferralDiscountsUsed($tx->T_TransactionM_UserID);
            $this->createReferralUsageForFirstPaidTransaction($tx);
        }

        if ($statusCode === 1 && !$wasPaidAlready && $tx->T_TransactionType === 'subscription') {
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

                // Give plan quota to user
                $plan = Plan::find($tx->T_TransactionM_PlanID);
                if ($plan) {
                    $user->increment('M_UserQuota', $plan->M_PlanQuota);
                }
            }
        }

        if ($statusCode === 1 && !$wasPaidAlready && $tx->T_TransactionType === 'topup') {
            $user = User::find($tx->T_TransactionM_UserID);
            if ($user && str_starts_with($tx->T_TransactionItem, 'Topup Koin - ')) {
                $coins = (int) trim(str_replace('Topup Koin - ', '', $tx->T_TransactionItem));
                if ($coins > 0) {
                    $user->increment('M_UserQuota', $coins);
                }
            }
        }

        if ($statusCode === 1 && $tx->T_TransactionType === 'plagiarism') {
            try {
                $plagiarismController = new PlagiarismController();
                $plagiarismController->pushFilesToBepro($tx);
            } catch (\Exception $e) {
                \Log::error('Failed to push files to BePro after payment', [
                    'transaction_id' => $tx->T_TransactionID,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        if (in_array($statusCode, [2, 3]) && $tx->T_TransactionType === 'plagiarism') {
            Plagiarism::where('M_PlagiarismTransactionID', $tx->T_TransactionID)
                ->where('M_PlagiarismStatus', 'waiting_payment')
                ->update(['M_PlagiarismStatus' => 'cancelled']);
        }
 
        return response()->json(['success' => true]);
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
            'transactionType' => $tx->T_TransactionType,
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






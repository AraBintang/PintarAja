<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use App\Models\DiscountCoupon;
use App\Models\Transaction;
use App\Models\User;
use App\Models\ReferralUsage;
use App\Models\Plagiarism;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    public function getPlans()
    {
        \ = Plan::where('M_PlanIsActive', 'Y')->get();
        return response()->json(['plans' => \]);
    }

    public function checkCoupon(Request \)
    {
        \->validate([
            'code' => 'required|string',
            'plan_id' => 'required|integer'
        ]);

        \ = DiscountCoupon::where('M_DiscountCouponCode', \->code)
            ->where('M_DiscountCouponIsActive', true)
            ->first();

        if (!\) {
            return response()->json(['valid' => false, 'message' => 'Kupon tidak ditemukan atau tidak aktif']);
        }

        if (now() > \->M_DiscountCouponExpired) {
            return response()->json(['valid' => false, 'message' => 'Kupon sudah kadaluarsa']);
        }

        if (\->M_DiscountCouponMaxUses !== null && \->M_DiscountCouponUsedCount >= \->M_DiscountCouponMaxUses) {
            return response()->json(['valid' => false, 'message' => 'Kupon sudah mencapai batas penggunaan maksimal']);
        }

        return response()->json([
            'valid' => true,
            'discount_type' => \->M_DiscountCouponType,
            'discount_amount' => \->M_DiscountCouponAmount
        ]);
    }

    public function store(Request \)
    {
        \ = \->validate([
            'planId' => 'required|integer',
            'amount' => 'required|numeric',
            'channel' => 'required|string',
            'method' => 'required|string',
            'item' => 'required|string',
            'phone' => 'required|string|max:15',
            'coupon' => 'nullable|string'
        ]);

        \ = Auth::user();
        
        \ = Plan::find(\['planId']);
        if (!\) {
            return response()->json(['error' => 'Plan not found'], 404);
        }

        \ = \->M_PlanPrice;
        \ = 0;
        \ = null;
        \ = 0;

        // Cek Referral
        \ = ReferralUsage::where('T_ReferralUsageOwnerID', \->M_UserID)
            ->where('T_ReferralUsageIsUsed', false)
            ->where('T_ReferralUsageIsFreeMonth', false)
            ->first();

        if (\) {
            \ = 20;
            \ += (int) round(\ * 0.20);
        }

        // Cek Coupon
        if (!empty(\['coupon'])) {
            \ = trim(\['coupon']);
            \ = DiscountCoupon::where('M_DiscountCouponCode', \)
                ->where('M_DiscountCouponIsActive', true)
                ->first();

            if (\ && now() <= \->M_DiscountCouponExpired) {
                if (\->M_DiscountCouponMaxUses === null || \->M_DiscountCouponUsedCount < \->M_DiscountCouponMaxUses) {
                    \ = 0;
                    if (\->M_DiscountCouponType === 'percentage') {
                        \ = (int) round(\ * (\->M_DiscountCouponAmount / 100));
                    } else {
                        \ = \->M_DiscountCouponAmount;
                    }
                    \ += \;
                    \ = \;

                    // Increment used count
                    \->increment('M_DiscountCouponUsedCount');
                }
            }
        }

        \ = max(\ - \, 1000);
        \ = 'ORDER-' . time() . '-' . rand(1000, 9999);
    
        // SELALU PAKAI XENDIT (Menghilangkan Tripay)
        \ = config('services.xendit.secret_key');
        \ = Http::withBasicAuth(\, '')
            ->post('https://api.xendit.co/v2/invoices', [
                'external_id' => \,
                'amount' => \,
                'payer_email' => !empty(\->M_UserEmail) ? \->M_UserEmail : 'user@pintaraja.com',
                'description' => \['item'],
                'customer' => [
                    'given_names' => !empty(\->M_UserFullName) ? \->M_UserFullName : 'User Pintaraja',
                    'email' => !empty(\->M_UserEmail) ? \->M_UserEmail : 'user@pintaraja.com',
                    'mobile_number' => \['phone']
                ],
                'currency' => 'IDR'
            ]);

        if (\->failed()) {
            \Log::error('Xendit API Error', ['status' => \->status(), 'body' => \->body()]);
            return response()->json(['error' => 'Failed while creating payment'], 500);
        }
            
        \ = \->json();
        \ = \['invoice_url'];
        \ = \['id']; // Xendit Invoice ID
        \ = strtotime(\['expiry_date'] ?? '+1 day');

        \ = Transaction::create([
            'T_TransactionM_UserID' => \->M_UserID,
            'T_TransactionM_PlanID' => \['planId'],
            'T_TransactionType' => 'subscription',
            'T_TransactionIdResult' => \,
            'T_TransactionIdRefrence' => \,
            'T_TransactionQR' => null,
            'T_TransactionItem' => \['item'],
            'T_TransactionAmount' => \,
            'T_TransactionStatus' => 0,
            'T_TransactionMethod' => 'Xendit',
            'T_TransactionExpired' => \,
            'T_TransactionChannel' => 'Xendit',
            'T_TransactionStep' => json_encode([]),
            'T_TransactionCheckoutURL' => \,
        ]);
    
        return response()->json([
            'status' => 'success',
            'referenceId' => \,
            'paymentCode' => null,
            'payUrl' => null,
            'checkoutUrl' => \,
            'expiredAt' => \,
            'instructions' => [],
            'discountInfo' => [
                'originalAmount' => \,
                'discountPercent' => \,
                'discountAmount' => \,
                'finalAmount' => \,
                'appliedCoupon' => \,
            ],
        ], 200);
    }

    public function topup(Request \, \App\Services\TokenDeductionService \)
    {
        \ = \->getCost('cost_topup_amount');
        \ = \->getCost('cost_topup_price');

        \ = \->validate([
            'coins' => 'required|integer|min:' . \,
            'channel' => 'required|string',
            'method' => 'required|string',
            'phone' => 'required|string|max:15',
        ]);

        \ = Auth::user();
        \ = (int) \['coins'];
        // Pastikan rasio harga menyesuaikan update terbaru (1 token = Rp 1000)
        // tapi di controller topup biarkan saja menghitung secara dinamis dari harga M_WebSetting
        \ = (int) floor((\ / \) * \);

        \ = 'TOPUP-' . time() . '-' . rand(1000, 9999);

        // SELALU PAKAI XENDIT
        \ = config('services.xendit.secret_key');
        \ = Http::withBasicAuth(\, '')
            ->post('https://api.xendit.co/v2/invoices', [
                'external_id' => \,
                'amount' => \,
                'payer_email' => !empty(\->M_UserEmail) ? \->M_UserEmail : 'user@pintaraja.com',
                'description' => 'Topup Koin - ' . \,
                'customer' => [
                    'given_names' => !empty(\->M_UserFullName) ? \->M_UserFullName : 'User Pintaraja',
                    'email' => !empty(\->M_UserEmail) ? \->M_UserEmail : 'user@pintaraja.com',
                    'mobile_number' => \['phone']
                ],
                'currency' => 'IDR'
            ]);

        if (\->failed()) {
            \Log::error('Xendit API Error (Topup)', ['status' => \->status(), 'body' => \->body()]);
            return response()->json(['error' => 'Failed while creating payment'], 500);
        }
        
        \ = \->json();
        \ = \['invoice_url'];
        \ = \['id'];
        \ = strtotime(\['expiry_date'] ?? '+1 day');

        \ = Transaction::create([
            'T_TransactionM_UserID' => \->M_UserID,
            'T_TransactionM_PlanID' => 0,
            'T_TransactionType' => 'topup',
            'T_TransactionIdResult' => \,
            'T_TransactionIdRefrence' => \,
            'T_TransactionQR' => null,
            'T_TransactionItem' => 'Topup Koin - ' . \,
            'T_TransactionAmount' => \,
            'T_TransactionStatus' => 0,
            'T_TransactionMethod' => 'Xendit',
            'T_TransactionExpired' => \,
            'T_TransactionChannel' => 'Xendit',
            'T_TransactionStep' => json_encode([]),
            'T_TransactionCheckoutURL' => \,
        ]);

        return response()->json([
            'status' => 'success',
            'referenceId' => \,
            'paymentCode' => null,
            'payUrl' => null,
            'checkoutUrl' => \,
            'expiredAt' => \,
            'instructions' => [],
            'amount' => \,
        ]);
    }

    public function notify(Request \)
    {
        \ = \->all();

        if (isset(\['id'])) { \['reference'] = \['id']; }
        elseif (isset(\['external_id'])) { \['reference'] = \['external_id']; }

        if (!isset(\['reference'])) {
            return response()->json(['message' => 'Invalid callback data'], 400);
        }

        \ = ['UNPAID' => 0, 'PAID' => 1, 'REFUND' => 2, 'EXPIRED' => 3, 'FAILED' => 3, 'SETTLED' => 1];
        \ = \[\['status']] ?? 3;

        \ = Transaction::where('T_TransactionIdResult', \['reference'])->first();

        if (!\) {
            return response()->json(['message' => 'Transaction not found'], 404);
        }

        \ = \->T_TransactionStatus === 1;
        \->update(['T_TransactionStatus' => \]);

        if (\ === 1 && !\) {
            \->markReferralDiscountsUsed(\->T_TransactionM_UserID);
            \->createReferralUsageForFirstPaidTransaction(\);
        }

        if (\ === 1 && !\ && \->T_TransactionType === 'subscription') {
            \ = ['Weekly' => 7, 'Monthly' => 30, 'Yearly' => 365];
            \ = trim(Str::afterLast(\->T_TransactionItem, '-'));
            \ = \[\] ?? 0;

            \ = User::find(\->T_TransactionM_UserID);
            if (\ && \ > 0) {
                \ = (\->M_UserSubsExp && !Carbon::parse(\->M_UserSubsExp)->isPast())
                    ? Carbon::parse(\->M_UserSubsExp)
                    : now();

                \->update([
                    'M_UserPlan' => \->T_TransactionM_PlanID,
                    'M_UserSubsExp' => \->addDays(\),
                ]);

                // Give plan quota to user
                \ = Plan::find(\->T_TransactionM_PlanID);
                if (\) {
                    \->increment('M_UserQuota', \->M_PlanQuota);
                }
            }
        }

        if (\ === 1 && !\ && \->T_TransactionType === 'topup') {
            \ = User::find(\->T_TransactionM_UserID);
            if (\ && str_starts_with(\->T_TransactionItem, 'Topup Koin - ')) {
                \ = (int) trim(str_replace('Topup Koin - ', '', \->T_TransactionItem));
                if (\ > 0) {
                    \->increment('M_UserQuota', \);
                }
            }
        }

        if (\ === 1 && \->T_TransactionType === 'plagiarism') {
            try {
                \ = new PlagiarismController();
                \->pushFilesToBepro(\);
            } catch (\Exception \) {
                \Log::error('Failed to push files to BePro after payment', [
                    'transaction_id' => \->T_TransactionID,
                    'error' => \->getMessage(),
                ]);
            }
        }

        if (in_array(\, [2, 3]) && \->T_TransactionType === 'plagiarism') {
            Plagiarism::where('M_PlagiarismTransactionID', \->T_TransactionID)
                ->where('M_PlagiarismStatus', 'waiting_payment')
                ->update(['M_PlagiarismStatus' => 'cancelled']);
        }
 
        return response()->json(['success' => true]);
    }
 
    private function formatTransaction(Transaction \, bool \ = false): array
    {
        \ = [
            'id' => \->T_TransactionID,
            'referenceId' => \->T_TransactionIdRefrence,
            'resultId' => \->T_TransactionIdResult,
            'paymentCode' => \->T_TransactionQR,
            'planName' => \->T_TransactionItem,
            'amount' => \->T_TransactionAmount,
            'status' => \->T_TransactionStatus,
            'method' => \->T_TransactionMethod,
            'channel' => \->T_TransactionChannel,
            'expiredAt' => \->T_TransactionExpired,
            'checkoutUrl' => \->T_TransactionCheckoutURL,
            'createdAt' => \->T_TransactionCreated,
        ];

        if (\) {
            \['instructions'] = json_decode(\->T_TransactionStep, true) ?? [];
        }

        return \;
    }

    private function markReferralDiscountsUsed(int \): void
    {
        ReferralUsage::where('T_ReferralUsageOwnerID', \)
            ->where('T_ReferralUsageIsUsed', false)
            ->where('T_ReferralUsageIsFreeMonth', false)
            ->update(['T_ReferralUsageIsUsed' => true]);
    }

    private function createReferralUsageForFirstPaidTransaction(Transaction \): void
    {
        \ = User::find(\->T_TransactionM_UserID);

        if (!\ || empty(\->M_UserAffiliate)) {
            return;
        }

        \ = User::where('M_UserRefCode', \->M_UserAffiliate)->first();
        if (!\) {
            return;
        }

        \ = Transaction::where('T_TransactionM_UserID', \->M_UserID)
            ->where('T_TransactionStatus', 1)
            ->count();

        if (\ === 1) {
            ReferralUsage::create([
                'T_ReferralUsageOwnerID' => \->M_UserID,
                'T_ReferralUsageUsedByID' => \->M_UserID,
                'T_ReferralUsageIsUsed' => false,
                'T_ReferralUsageIsFreeMonth' => true,
            ]);
        }
    }
}

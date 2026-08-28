import sys
import re

with open('app/Http/Controllers/PaymentController.php', 'r', encoding='utf-8') as f:
    content = f.read()

store_start = content.find("if (strtolower($validated['channel']) === 'visa'")
store_end = content.find("public function topup")

if store_start != -1 and store_end != -1:
    before = content[:store_start]
    after = content[store_end:]
    new_logic = """
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
            \\Log::error('Xendit API Error', ['status' => $response->status(), 'body' => $response->body()]);
            return response()->json(['error' => 'Failed while creating payment'], 500);
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

"""
    content = before + new_logic + after

topup_start = content.find("$payload = [")
topup_end = content.find("public function notify")

if topup_start != -1 and topup_end != -1:
    before = content[:topup_start]
    after = content[topup_end:]
    
    new_topup_logic = """
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
            \\Log::error('Xendit API Error (Topup)', ['status' => $response->status(), 'body' => $response->body()]);
            return response()->json(['error' => 'Failed while creating payment'], 500);
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

"""
    content = before + new_topup_logic + after

with open('app/Http/Controllers/PaymentController.php', 'w', encoding='utf-8') as f:
    f.write(content)

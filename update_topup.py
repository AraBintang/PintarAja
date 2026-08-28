import re

with open(r'C:\Users\ASUS\.gemini\antigravity\scratch\pintaraja_web\app\Http\Controllers\PaymentController.php', 'r', encoding='utf-8') as f:
    content = f.read()

# For topup method
start_str = "         = [\n            'method' => ['channel'],\n            'merchant_ref' => ,\n            'amount' => ,"
end_str = "'T_TransactionCheckoutURL' => ,\n        ]);"

idx_start = content.find(start_str)
idx_end = content.find(end_str) + len(end_str)

if idx_start != -1 and idx_end != -1:
    original = content[idx_start:idx_end]
    
    replace = """         = null;
         = null;
         = [];
         = time() + 86400;
         = '';

        if (strtolower(['channel']) === 'visa' || strtolower(['channel']) === 'cards') {
             = config('services.xendit.secret_key');
             = Http::withBasicAuth(, '')
                ->post('https://api.xendit.co/v2/invoices', [
                    'external_id' => ,
                    'amount' => ,
                    'payer_email' => ->M_UserEmail,
                    'description' => 'Topup Koin - ' . ,
                    'customer' => [
                        'given_names' => ->M_UserFullName,
                        'email' => ->M_UserEmail,
                        'mobile_number' => ['phone']
                    ],
                    'payment_methods' => ['CREDIT_CARD']
                ]);

            if (->failed()) {
                \Log::error('Xendit API Error', ['status' => ->status(), 'body' => ->body()]);
                return response()->json(['error' => 'Failed while creating payment'], 500);
            }
            
             = ->json();
             = ['invoice_url'];
             = ['id'];
             = strtotime(['expiry_date'] ?? '+1 day');
        } else {
             = [
                'method' => ['channel'],
                'merchant_ref' => ,
                'amount' => ,
                'customer_name' => ->M_UserFullName,
                'customer_email' => ->M_UserEmail,
                'customer_phone' => ['phone'],
                'order_items' => [[
                    'name' => 'Topup Koin - ' . ,
                    'price' => ,
                    'quantity' => 1,
                ]],
                'signature' => hash_hmac('sha256',  .  . , ),
            ];

             = app()->environment('local', 'development');
             = 
                ? 'https://tripay.co.id/api-sandbox/transaction/create'
                : 'https://tripay.co.id/api/transaction/create';

             = Http::withHeaders([
                'Authorization' => 'Bearer ' . ,
            ])->post(, );

            if (->failed()) {
                \Log::error('Tripay API Error (Topup)', [
                    'status' => ->status(),
                    'body' => ->body(),
                ]);
                return response()->json(['error' => 'Failed while creating payment'], 500);
            }

             = ['data'];
             = strtolower(['channel']) === 'qris2' || strtolower(['method']) === 'qris';

            if () {
                 = ['qr_url'] ?? null;
            } elseif (!empty(['pay_code'])) {
                 = ['pay_code'];
            } elseif (!empty(['pay_url'])) {
                 = ['pay_url'];
            }

             = ['instructions'] ?? [];
             = ['checkout_url'] ?? null;
             = ['reference'];
             = ['expired_time'] ?? (time() + 86400);
        }

         = Transaction::create([
            'T_TransactionM_UserID' => ->M_UserID,
            'T_TransactionM_PlanID' => 0,
            'T_TransactionType' => 'topup',
            'T_TransactionIdResult' => ,
            'T_TransactionIdRefrence' => ,
            'T_TransactionQR' => ,
            'T_TransactionItem' => 'Topup Koin - ' . ,
            'T_TransactionAmount' => ,
            'T_TransactionStatus' => 0,
            'T_TransactionMethod' => ['method'],
            'T_TransactionExpired' => ,
            'T_TransactionChannel' => ['channel'],
            'T_TransactionStep' => json_encode(),
            'T_TransactionCheckoutURL' => ,
        ]);"""
    content = content[:idx_start] + replace + content[idx_end:]

with open(r'C:\Users\ASUS\.gemini\antigravity\scratch\pintaraja_web\app\Http\Controllers\PaymentController.php', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")

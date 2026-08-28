file = "app/Http/Controllers/PaymentController.php"
with open(file, "r", encoding="utf-8") as f:
    content = f.read()

# Replace topup method to add better error handling and debug output
old = """public function topup(Request $request, \\App\\Services\\TokenDeductionService $tokenService)
    {
        $apiKey = config('services.tripay.api_key');
        $privateKey = config('services.tripay.private_key');
        $merchantCode = config('services.tripay.merchant_code');

        $defaultAmount = $tokenService->getCost('cost_topup_amount');
        $defaultPrice = $tokenService->getCost('cost_topup_price');

        $validated = $request->validate([
            'coins' => 'required|integer|min:' . $defaultAmount,
            'channel' => 'required|string',
            'method' => 'required|string',
            'phone' => 'required|string|max:15',
        ]);

        $user = Auth::user();
        $coins = (int) $validated['coins'];
        $amount = (int) floor(($coins / $defaultAmount) * $defaultPrice);"""

new = """public function topup(Request $request, \\App\\Services\\TokenDeductionService $tokenService)
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
        $amount = max($amount, 1000);"""

if old in content:
    content = content.replace(old, new)
    print("REPLACED OK")
else:
    print("NOT FOUND - checking partial match")
    # try to find the topup function start
    idx = content.find("public function topup(")
    print(f"topup starts at index: {idx}")
    print(repr(content[idx:idx+300]))

with open(file, "w", encoding="utf-8") as f:
    f.write(content)

import glob

file = 'app/Http/Controllers/PaymentController.php'
with open(file, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace Xendit error handling in store
content = content.replace(
    """if ($response->failed()) {
            \\Log::error('Xendit API Error', ['status' => $response->status(), 'body' => $response->body()]);
            return response()->json(['error' => 'Failed while creating payment'], 500);
        }""",
    """if ($response->failed()) {
            \\Log::error('Xendit API Error', ['status' => $response->status(), 'body' => $response->body()]);
            $errorMsg = $response->json('message') ?? 'Failed while creating payment';
            return response()->json(['error' => 'Xendit Error: ' . $errorMsg], 500);
        }"""
)

# Replace Xendit error handling in topup
content = content.replace(
    """if ($response->failed()) {
            \\Log::error('Xendit API Error (Topup)', ['status' => $response->status(), 'body' => $response->body()]);
            return response()->json(['error' => 'Failed while creating payment'], 500);
        }""",
    """if ($response->failed()) {
            \\Log::error('Xendit API Error (Topup)', ['status' => $response->status(), 'body' => $response->body()]);
            $errorMsg = $response->json('message') ?? 'Failed while creating payment';
            return response()->json(['error' => 'Xendit Error: ' . $errorMsg], 500);
        }"""
)

with open(file, 'w', encoding='utf-8') as f:
    f.write(content)

<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Plagiarism;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class PlagiarismController extends Controller
{
    private const PRICE_PER_FILE = 22000;

    public function index(Request $request)
    {
        $user = Auth::user();
        $perPage = (int) $request->input('per_page', 20);
        $page = max(1, (int) $request->input('page', 1));
        $status = $request->input('status');

        $query = Plagiarism::where('M_PlagiarismUserID', $user->M_UserID)
            ->whereNotIn('M_PlagiarismStatus', ['waiting_payment', 'cancelled'])
            ->when($status, fn($q) => $q->where('M_PlagiarismStatus', $status))
            ->orderByDesc('M_PlagiarismCreated');

        $paginated = $query->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'data' => $paginated->getCollection()->map(fn($p) => $this->formatPlagiarism($p)),
            'pagination' => [
                'current_page' => $paginated->currentPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
                'last_page' => $paginated->lastPage(),
            ],
        ]);
    }

    public function pendingPayment()
    {
        $user = Auth::user();

        $tx = Transaction::where('T_TransactionM_UserID', $user->M_UserID)
            ->where('T_TransactionType', 'plagiarism')
            ->where('T_TransactionStatus', 0)
            ->where('T_TransactionExpired', '>', time())
            ->orderByDesc('T_TransactionCreated')
            ->first();

        if (!$tx) {
            return response()->json(['has_pending' => false]);
        }

        $files = Plagiarism::where('M_PlagiarismTransactionID', $tx->T_TransactionID)
            ->get()
            ->map(fn($p) => $this->formatPlagiarism($p));

        $instructions = $tx->T_TransactionStep
            ? json_decode($tx->T_TransactionStep, true)
            : [];

        return response()->json([
            'has_pending'  => true,
            'transaction'  => [
                'referenceId'  => $tx->T_TransactionIdRefrence,
                'resultId' => $tx->T_TransactionIdResult,
                'amount' => $tx->T_TransactionAmount,
                'method' => $tx->T_TransactionMethod,
                'channel' => $tx->T_TransactionChannel,
                'paymentCode' => $tx->T_TransactionQR,
                'checkoutUrl' => $tx->T_TransactionCheckoutURL,
                'expiredAt' => $tx->T_TransactionExpired,
                'instructions' => $instructions,
            ],
            'files' => $files,
            'total_files' => $files->count(),
        ]);
    }

    public function store(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'documents' => 'required|array|min:1|max:10',
            'documents.*' => 'required|file|max:51200|mimes:pdf,doc,docx,txt,rtf,odt',
            'service_type' => 'required|in:turnitin,drillbot',
            'author_first_name' => 'required|string|max:100',
            'author_last_name' => 'required|string|max:100',
            'whatsapp_phone' => 'required|string|max:20',
            'external_reference_id' => 'nullable|string|max:255',
            'exclude_bibliography' => 'nullable|boolean',
            'exclude_cited_text' => 'nullable|boolean',
            'exclude_quoted_text' => 'nullable|boolean',
            'exclude_small_matches' => 'nullable|boolean',


            'channel' => 'required|string',
            'method' => 'required|string',
            'phone' => 'required|string|max:15',
        ]);

        $existingTx = Transaction::where('T_TransactionM_UserID', $user->M_UserID)
            ->where('T_TransactionType', 'plagiarism')
            ->where('T_TransactionStatus', 0)
            ->where('T_TransactionExpired', '>', time())
            ->first();

        if ($existingTx) {
            return response()->json([
                'error' => 'Anda masih memiliki pembayaran yang belum diselesaikan.',
            ], 422);
        }

        $files = $request->file('documents');
        $fileCount = count($files);
        $totalAmount = $fileCount * self::PRICE_PER_FILE;

        $storedFiles = [];
        foreach ($files as $file) {
            if (!$file->isValid()) {
                return response()->json(['error' => 'Salah satu file tidak valid'], 422);
            }
            $path = $file->store('plagiarism_temp', 'local');
            $storedFiles[] = [
                'path' => $path,
                'original_name' => $file->getClientOriginalName(),
            ];
        }

        $apiKey = config('services.tripay.api_key');
        $privateKey = config('services.tripay.private_key');
        $merchantCode = config('services.tripay.merchant_code');

        $merchantRef = 'PLG-' . time() . '-' . rand(1000, 9999);
        $itemName = 'Plagiarism Check - ' . $fileCount . ' file';

        $payload = [
            'method' => $validated['channel'],
            'merchant_ref' => $merchantRef, 
            'amount' => $totalAmount,
            'customer_name' => $user->M_UserFullName,
            'customer_email' => $user->M_UserEmail,
            'customer_phone' => $validated['phone'],
            'order_items' => [[
                'name' => $itemName,
                'price' => $totalAmount,
                'quantity' => 1,
            ]],
            'signature' => hash_hmac('sha256', $merchantCode . $merchantRef . $totalAmount, $privateKey),
        ];

        $tripayResponse = Http::withHeaders([
            'Authorization' => 'Bearer ' . $apiKey,
        ])->post('https://tripay.co.id/api/transaction/create', $payload);

        if ($tripayResponse->failed()) {
            foreach ($storedFiles as $sf) {
                Storage::disk('local')->delete($sf['path']);
            }
            Log::error('Tripay API Error (Plagiarism)', [
                'status' => $tripayResponse->status(),
                'body' => $tripayResponse->body(),
            ]);
            return response()->json(['error' => 'Gagal membuat pembayaran'], 500);
        }

        $tripayData = $tripayResponse['data'];
        $isQris = strtolower($validated['channel']) === 'qris2' || strtolower($validated['method']) === 'qris';

        $paymentCode = null;
        if ($isQris) {
            $paymentCode = $tripayData['qr_url'] ?? null;
        } elseif (!empty($tripayData['pay_code'])) {
            $paymentCode = $tripayData['pay_code'];
        } elseif (!empty($tripayData['pay_url'])) {
            $paymentCode = $tripayData['pay_url'];
        }

        $instructions = $tripayData['instructions'] ?? [];
        $checkoutUrl = $tripayData['checkout_url'] ?? null;

        $tx = Transaction::create([
            'T_TransactionM_UserID' => $user->M_UserID,
            'T_TransactionM_PlanID' => 0,
            'T_TransactionType' => 'plagiarism',
            'T_TransactionIdResult' => $tripayData['reference'],
            'T_TransactionIdRefrence' => $tripayData['merchant_ref'],
            'T_TransactionQR' => $paymentCode,
            'T_TransactionItem' => $itemName,
            'T_TransactionAmount' => $totalAmount,
            'T_TransactionStatus' => 0,
            'T_TransactionMethod' => $validated['method'],
            'T_TransactionChannel' => $validated['channel'],
            'T_TransactionCheckoutURL'=> $checkoutUrl,
            'T_TransactionStep' => json_encode($instructions),
            'T_TransactionExpired' => $tripayData['expired_time'] ?? (time() + 86400),
        ]);

        foreach ($storedFiles as $sf) {
            Plagiarism::create([
                'M_PlagiarismUserID' => $user->M_UserID,
                'M_PlagiarismTransactionID' => $tx->T_TransactionID,
                'M_PlagiarismFileName' => $sf['original_name'],
                'M_PlagiarismServiceType' => $validated['service_type'],
                'M_PlagiarismAuthorFirst' => $validated['author_first_name'],
                'M_PlagiarismAuthorLast' => $validated['author_last_name'],
                'M_PlagiarismWhatsApp' => $validated['whatsapp_phone'],
                'M_PlagiarismExtRef' => $validated['external_reference_id'] ?? null,
                'M_PlagiarismExclBiblio' => !empty($validated['exclude_bibliography']),
                'M_PlagiarismExclCited' => !empty($validated['exclude_cited_text']),
                'M_PlagiarismExclQuoted' => !empty($validated['exclude_quoted_text']),
                'M_PlagiarismExclSmall' => !empty($validated['exclude_small_matches']),
                'M_PlagiarismStatus' => 'waiting_payment',
                'M_PlagiarismPrice' => self::PRICE_PER_FILE,
                'M_PlagiarismAdminNotes' => json_encode(['temp_path' => $sf['path']]),
            ]);
        }

        return response()->json([
            'status' => 'success',
            'referenceId' => $tripayData['merchant_ref'],
            'paymentCode' => $paymentCode,
            'payUrl' => $tripayData['pay_url'] ?? null,
            'checkoutUrl' => $checkoutUrl,
            'expiredAt' => $tripayData['expired_time'] ?? null,
            'instructions' => $instructions,
            'total_files' => $fileCount,
            'amount' => $totalAmount,
        ], 201);
    }

    public function cancelPayment(Request $request)
    {
        $user = Auth::user();

        $tx = Transaction::where('T_TransactionM_UserID', $user->M_UserID)
            ->where('T_TransactionType', 'plagiarism')
            ->where('T_TransactionStatus', 0)
            ->orderByDesc('T_TransactionCreated')
            ->first();

        if (!$tx) {
            return response()->json(['error' => 'Tidak ada transaksi pending'], 404);
        }

        $tx->update(['T_TransactionStatus' => 3]);

        $plagiarisms = Plagiarism::where('M_PlagiarismTransactionID', $tx->T_TransactionID)->get();
        foreach ($plagiarisms as $p) {
            $adminNotes = json_decode($p->M_PlagiarismAdminNotes, true);
            if (!empty($adminNotes['temp_path'])) {
                Storage::disk('local')->delete($adminNotes['temp_path']);
            }
            $p->update([
                'M_PlagiarismStatus' => 'cancelled',
                'M_PlagiarismAdminNotes' => null,
            ]);
        }

        return response()->json(['success' => true, 'message' => 'Pembayaran dibatalkan']);
    }

    public function downloadResult($id)
    {
        $user = Auth::user();

        $plagiarism = Plagiarism::where('M_PlagiarismID', $id)
            ->where('M_PlagiarismUserID', $user->M_UserID)
            ->first();

        if (!$plagiarism) {
            return response()->json(['error' => 'Plagiarism tidak ditemukan'], 404);
        }

        if ($plagiarism->M_PlagiarismStatus !== 'done') {
            return response()->json(['error' => 'Hasil belum tersedia'], 422);
        }

        if (empty($plagiarism->M_PlagiarismResultURL)) {
            return response()->json(['error' => 'URL hasil tidak tersedia'], 404);
        }

        return response()->json(['download_url' => $plagiarism->M_PlagiarismResultURL]);
    }

    public function pushFilesToBepro(Transaction $tx): void
    {
        $apiKey = config('services.bepro.api_key');
        $apiSecret = config('services.bepro.secret');

        if (!$apiKey || !$apiSecret) {
            Log::error('BePro credentials not configured');
            return;
        }

        $plagiarisms = Plagiarism::where('M_PlagiarismTransactionID', $tx->T_TransactionID)
            ->where('M_PlagiarismStatus', 'waiting_payment')
            ->get();

        foreach ($plagiarisms as $p) {
            $adminNotes = json_decode($p->M_PlagiarismAdminNotes, true);
            $tempPath = $adminNotes['temp_path'] ?? null;

            if (!$tempPath || !Storage::disk('local')->exists($tempPath)) {
                Log::error('Temp file not found for plagiarism', ['id' => $p->M_PlagiarismID]);
                $p->update(['M_PlagiarismStatus' => 'failed']);
                continue;
            }

            $fullPath = Storage::disk('local')->path($tempPath);
            $fileStream = fopen($fullPath, 'r');

            $payload = [
                'service_type' => $p->M_PlagiarismServiceType,
                'author_first_name' => $p->M_PlagiarismAuthorFirst,
                'author_last_name' => $p->M_PlagiarismAuthorLast,
                'whatsapp_phone' => $p->M_PlagiarismWhatsApp,
            ];

            if ($p->M_PlagiarismExtRef) {
                $payload['external_reference_id'] = $p->M_PlagiarismExtRef;
            }
            if ($p->M_PlagiarismExclBiblio) $payload['exclude_bibliography'] = 'true';
            if ($p->M_PlagiarismExclCited) $payload['exclude_cited_text'] = 'true';
            if ($p->M_PlagiarismExclQuoted) $payload['exclude_quoted_text'] = 'true';
            if ($p->M_PlagiarismExclSmall) $payload['exclude_small_matches'] = 'true';

            try {
                $response = Http::withHeaders([
                    'X-API-Key' => $apiKey,
                    'X-API-Secret' => $apiSecret,
                ])
                    ->attach('document', $fileStream, $p->M_PlagiarismFileName)
                    ->post('https://api.bepro.id/api/partner/checker/submit', $payload);

                if ($response->successful()) {
                    $order = $response->json('order');
                    $p->update([
                        'M_PlagiarismStatus' => 'pending',
                        'M_PlagiarismBeproOrderID'=> $order['id'] ?? null,
                        'M_PlagiarismWordCount' => $order['word_count'] ?? null,
                        'M_PlagiarismAdminNotes' => null,
                    ]);
                } else {
                    Log::error('BePro submit failed', [
                        'plagiarism_id' => $p->M_PlagiarismID,
                        'response' => $response->json(),
                    ]);
                    $p->update(['M_PlagiarismStatus' => 'failed']);
                }
            } catch (\Exception $e) {
                Log::error('BePro submit exception', [
                    'plagiarism_id' => $p->M_PlagiarismID,
                    'error' => $e->getMessage(),
                ]);
                $p->update(['M_PlagiarismStatus' => 'failed']);
            } finally {
                if (is_resource($fileStream)) fclose($fileStream);
                Storage::disk('local')->delete($tempPath);
            }
        }
    }

    public function callback(Request $request)
    {
        $secret = config('services.bepro.webhook_secret');
        $signature = $request->header('X-Webhook-Signature');

        if (!$secret || !$signature) {
            return response()->json(['error' => 'Invalid webhook signature'], 401);
        }

        $expected = hash_hmac('sha256', $request->getContent(), $secret);
        if (!hash_equals($expected, $signature)) {
            return response()->json(['error' => 'Invalid webhook signature'], 401);
        }

        $event = $request->input('event');
        $order = $request->input('order');

        if (!$event || !$order || empty($order['id'])) {
            return response()->json(['error' => 'Invalid payload'], 400);
        }

        $beproOrderId = $order['id'];
        $plagiarism = Plagiarism::where('M_PlagiarismBeproOrderID', $beproOrderId)->first();

        if (!$plagiarism) {
            Log::warning('BePro webhook: order not found', ['bepro_order_id' => $beproOrderId]);
            return response()->json(['received' => true]);
        }

        $statusMap = [
            'order.processing' => 'processing',
            'order.done' => 'done',
            'order.cancelled'  => 'cancelled',
        ];

        $newStatus = $statusMap[$event] ?? null;
        if (!$newStatus) {
            return response()->json(['received' => true]);
        }

        $updateData = ['M_PlagiarismStatus' => $newStatus];

        if ($newStatus === 'done') {
            $updateData['M_PlagiarismResultURL'] = $order['result_download_url'] ?? null;
            $updateData['M_PlagiarismCompletedAt'] = now();
        }

        if ($newStatus === 'cancelled' && !empty($order['admin_notes'])) {
            $updateData['M_PlagiarismAdminNotes'] = $order['admin_notes'];
        }

        $plagiarism->update($updateData);

        Log::info('BePro webhook processed', [
            'event' => $event,
            'bepro_order' => $beproOrderId,
            'plagiarism_id' => $plagiarism->M_PlagiarismID,
            'new_status' => $newStatus,
        ]);

        return response()->json(['received' => true]);
    }

    private function formatPlagiarism(Plagiarism $p): array
    {
        $statusLabels = [
            'waiting_payment' => 'Menunggu Pembayaran',
            'pending' => 'Menunggu Proses',
            'processing' => 'Sedang Diproses',
            'done' => 'Selesai',
            'cancelled' => 'Dibatalkan',
            'failed' => 'Gagal',
        ];

        return [
            'id' => $p->M_PlagiarismID,
            'name' => $p->M_PlagiarismFileName,
            'title' => $p->M_PlagiarismFileName,
            'service' => $p->M_PlagiarismServiceType,
            'status' => $p->M_PlagiarismStatus,
            'statusLabel' => $statusLabels[$p->M_PlagiarismStatus] ?? $p->M_PlagiarismStatus,
            'beproOrderId' => $p->M_PlagiarismBeproOrderID,
            'wordCount' => $p->M_PlagiarismWordCount,
            'resultUrl' => $p->M_PlagiarismResultURL,
            'price' => $p->M_PlagiarismPrice,
            'time' => $p->M_PlagiarismCreated
                ? $p->M_PlagiarismCreated->diffForHumans()
                : null,
            'lastUpdated' => $p->M_PlagiarismCreated
                ? $p->M_PlagiarismCreated->format('d M Y')
                : null,
            'completedAt' => $p->M_PlagiarismCompletedAt?->format('d M Y H:i'),
        ];
    }

    // public function services()
    // {
    //     return response()->json([
    //         'services' => [
    //             [
    //                 'service_key' => 'turninitin',
    //                 'display_name' => 'Turnin Check',
    //                 'description'  => 'Professional plagiarism check using Turnin',
    //                 'price' => self::PRICE_PER_FILE,
    //             ],
    //             [
    //                 'service_key' => 'drillbot',
    //                 'display_name' => 'Drillbot AI Check',
    //                 'description' => 'AI content detection using Drillbot',
    //                 'price' => self::PRICE_PER_FILE,
    //             ],
    //         ],
    //     ]);
    // }
}
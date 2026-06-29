<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class VoucherController extends Controller
{
    public function generate(Request $request)
    {
        // Keamanan sederhana: Pastikan request datang dari SMTech
        $secretKey = $request->header('X-SMTECH-SECRET');
        if ($secretKey !== 'SMTech_PintarAja_Api_2026') {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Generate kode acak (Contoh: PTR-X7B9K2)
        $kodeUnik = 'PTR-' . strtoupper(Str::random(6));

        // Simpan kode ke tabel kupon PintarAja
        // Asumsi standar tabel coupons
        DB::table('coupons')->insert([
            'code' => $kodeUnik,
            'type' => 'fixed',
            'value' => 5000,
            'status' => 'active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Kembalikan kode unik tersebut ke SMTech
        return response()->json([
            'success' => true,
            'voucher_code' => $kodeUnik
        ]);
    }
}

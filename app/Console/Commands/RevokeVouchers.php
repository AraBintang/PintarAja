<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Coupon;
use Carbon\Carbon;
use Illuminate\Support\Str;

class RevokeVouchers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'vouchers:revoke';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Revoke/scramble vouchers created today by the automatic process';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $today = Carbon::today();
        
        $coupons = Coupon::where('created_at', '>=', $today)
            ->where('discount_type', 'percentage')
            ->where('discount_amount', 100)
            ->get();
            
        $count = 0;
        foreach ($coupons as $coupon) {
            // Kacaukan kodenya agar tidak bisa dipakai
            $coupon->code = 'REVOKED-' . Str::random(10);
            $coupon->is_active = false; // Jika ada field is_active, tapi biarkan saja kodenya berubah
            $coupon->save();
            $count++;
        }
        
        $this->info("Berhasil mengacaukan dan menghapus " . $count . " voucher yang salah kirim hari ini.");
    }
}

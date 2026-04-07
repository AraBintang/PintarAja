<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── 1. Tambah kolom maxUses ke tabel m_coupon ─────────────────────────
        Schema::table('m_coupon', function (Blueprint $table) {
            $table->unsignedSmallInteger('M_CouponMaxUses')
                  ->nullable()
                  ->after('M_CouponExpired')
                  ->comment('NULL = single-use (legacy) | 0 = unlimited | N = max N redemptions');
        });

        // ── 2. Buat tabel tracking redemption ────────────────────────────────
        Schema::create('m_coupon_redemption', function (Blueprint $table) {
            $table->bigIncrements('M_RedemptionID');

            $table->unsignedBigInteger('M_RedemptionCouponID')
                  ->comment('FK → m_coupon.M_CouponID');

            $table->unsignedBigInteger('M_RedemptionUserID')
                  ->comment('FK → m_user.M_UserID');

            $table->timestamp('M_RedemptionDate')->useCurrent();

            // Satu user hanya bisa redeem satu coupon sekali
            $table->unique(['M_RedemptionCouponID', 'M_RedemptionUserID'], 'uq_redemption_coupon_user');

            $table->foreign('M_RedemptionCouponID')
                  ->references('M_CouponID')
                  ->on('m_coupon')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('m_coupon_redemption');

        Schema::table('m_coupon', function (Blueprint $table) {
            $table->dropColumn('M_CouponMaxUses');
        });
    }
};
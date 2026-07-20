<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('m_discount_coupon', function (Blueprint $table) {
            $table->id('M_DiscountCouponID');
            $table->string('M_DiscountCouponCode')->unique();
            $table->enum('M_DiscountCouponType', ['percentage', 'fixed']);
            $table->integer('M_DiscountCouponAmount');
            $table->integer('M_DiscountCouponMaxUses')->nullable();
            $table->integer('M_DiscountCouponUsedCount')->default(0);
            $table->dateTime('M_DiscountCouponExpired');
            $table->boolean('M_DiscountCouponIsActive')->default(true);
            $table->integer('M_DiscountCouponCreatedBy');
            $table->timestamp('M_DiscountCouponCreated')->useCurrent();
            $table->timestamp('M_DiscountCouponLastUpdated')->useCurrent()->useCurrentOnUpdate();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('m_discount_coupon');
    }
};

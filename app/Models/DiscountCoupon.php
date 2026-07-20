<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DiscountCoupon extends Model
{
    use HasFactory;

    protected $table = 'm_discount_coupon';
    protected $primaryKey = 'M_DiscountCouponID';

    public $timestamps = false;

    protected $fillable = [
        'M_DiscountCouponCode',
        'M_DiscountCouponType',
        'M_DiscountCouponAmount',
        'M_DiscountCouponMaxUses',
        'M_DiscountCouponUsedCount',
        'M_DiscountCouponExpired',
        'M_DiscountCouponIsActive',
        'M_DiscountCouponCreatedBy',
        'M_DiscountCouponCreated',
        'M_DiscountCouponLastUpdated',
    ];

    protected $casts = [
        'M_DiscountCouponIsActive' => 'boolean',
        'M_DiscountCouponAmount' => 'integer',
        'M_DiscountCouponMaxUses' => 'integer',
        'M_DiscountCouponUsedCount' => 'integer',
    ];
}

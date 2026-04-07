<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CouponRedemption extends Model
{
    protected $table = 'm_coupon_redemption';
    protected $primaryKey = 'M_RedemptionID';
 
    protected $fillable = [
        'M_RedemptionCouponID',
        'M_RedemptionUserID',
        'M_RedemptionDate',
    ];

    public $timestamps = false;
}
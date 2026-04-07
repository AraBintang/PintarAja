<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Coupon extends Model
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'm_coupon';
    protected $primaryKey = 'M_CouponID';

    protected $fillable = [
        'M_CouponM_PlanID',
        'M_CouponDays',
        'M_CouponCode',
        'M_CouponUsed',
        'M_CouponUsedDate',
        'M_CouponM_UserID',
        'M_CouponExpired',
        'M_CouponMaxUses',
    ];

    public $timestamps = false;
}

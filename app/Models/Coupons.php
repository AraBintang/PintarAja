<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Coupons extends Model
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'm_coupons';
    protected $primaryKey = 'M_CouponsID';

    protected $fillable = [
        'M_CouponsCode',
        'M_CouponsUsed',
        'M_CouponsCreated',
        'M_CouponsLastUpdated',
    ];

    public $timestamps = false;
}

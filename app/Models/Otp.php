<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Otp extends Model
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 't_otp';
    protected $primaryKey = 'T_OtpID';

    protected $fillable = [
        'T_OtpM_UserEmail',
        'T_OtpValue',
        'T_OtpExpired',
        'T_OtpCreated',
        'T_OtpLastUpdated',
    ];

    public $timestamps = false;
}

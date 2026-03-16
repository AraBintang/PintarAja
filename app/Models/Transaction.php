<?php

namespace App\Models;

use App\Models\Plan;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Transaction extends Model
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 't_transaction';
    protected $primaryKey = 'T_TransactionID';
 
    public $timestamps = false;
 
    protected $fillable = [
        'T_TransactionM_UserID',
        'T_TransactionM_PlanID',
        'T_TransactionIdResult',
        'T_TransactionIdRefrence',
        'T_TransactionQR',
        'T_TransactionItem',
        'T_TransactionAmount',
        'T_TransactionStatus',
        'T_TransactionMethod',
        'T_TransactionChannel',
        'T_TransactionCheckoutURL',
        'T_TransactionStep',
        'T_TransactionExpired',
        'T_TransactionCreated',
        'T_TransactionLastUpdated',
    ];
 
    protected $casts = [
        'T_TransactionCreated' => 'datetime',
        'T_TransactionLastUpdated' => 'datetime',
    ];
 
    public function user()
    {
        return $this->belongsTo(User::class, 'T_TransactionM_UserID', 'M_UserID');
    }
 
    public function plan()
    {
        return $this->belongsTo(Plan::class, 'T_TransactionM_PlanID', 'M_PlanID');
    }
}
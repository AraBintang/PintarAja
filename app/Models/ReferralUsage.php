<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReferralUsage extends Model
{
    protected $table = 't_referralusage';
    protected $primaryKey = 'T_ReferralUsageID';
    public $timestamps = false;
 
    protected $fillable = [
        'T_ReferralUsageOwnerID',
        'T_ReferralUsageUserID',
        'T_ReferralUsageSequence',
        'T_ReferralUsageDiscountPercent',
        'T_ReferralUsageIsFreeMonth',
        'T_ReferralUsageIsUsed',
        'T_ReferralUsageCreated',
    ];
 
    protected function casts(): array
    {
        return [
            'T_ReferralUsageIsFreeMonth' => 'boolean',
            'T_ReferralUsageIsUsed' => 'boolean',
            'T_ReferralUsageCreated'  => 'datetime',
        ];
    }
 
    public function owner()
    {
        return $this->belongsTo(User::class, 'T_ReferralUsageOwnerID', 'M_UserID');
    }
 
    public function referredUser()
    {
        return $this->belongsTo(User::class, 'T_ReferralUsageUserID', 'M_UserID');
    }
}
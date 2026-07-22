<?php

namespace App\Models;

use App\Models\Plan;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class SettingAI extends Model
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'm_setting';
    protected $primaryKey = 'M_SettingID';

    protected $fillable = [
        'M_SettingCode',
        'M_SettingName',
        'M_SettingModel',
        'M_SettingKey',
        'M_SettingIsActive',
        'M_SettingDailyLimit',
        'M_SettingCreated',
        'M_SettingLastUpdated',
    ];

    public function plans()
    {
        return $this->belongsToMany(
            Plan::class,
            'm_plansetting',
            'M_PlanSettingM_SettingID',
            'M_PlanSettingM_PlanID',
            'M_SettingID',
            'M_PlanID'
        );
    }

    public $timestamps = false;
}

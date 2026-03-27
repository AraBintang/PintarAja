<?php

namespace App\Models;

use App\Models\Plan;
use App\Models\SettingAI;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Plan extends Model
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'm_plan';
    protected $primaryKey = 'M_PlanID';

    protected $fillable = [
        'M_PlanName',
        'M_PlanTagLine',
        'M_PlanPrice',
        'M_PlanFeature',
        'M_PlanIsPopular',
        'M_PlanCreated',
        'M_PlanLastUpdated',
    ];

    public function plan()
    {
        return $this->belongsTo(
            Plan::class,
            'M_UserPlan',
            'M_PlanID'
        );
    }

    public function aiSettings()
    {
        return $this->belongsToMany(
            SettingAI::class,
            'm_plansetting',
            'M_PlanSettingM_PlanID',
            'M_PlanSettingM_SettingID',
            'M_PlanID',
            'M_SettingID'
        );
    }

    public $timestamps = false;
}

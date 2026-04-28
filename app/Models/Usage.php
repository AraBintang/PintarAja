<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Usage extends Model
{
    protected $table = 't_usage';
    protected $primaryKey = 'T_UsageID';

    public $timestamps = false;

    protected $fillable = [
        'T_UsageM_UserID',
        'T_UsageDate',
        'T_UsageCount',
        'T_UsageModels',
    ];
}
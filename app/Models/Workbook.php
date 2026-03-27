<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Workbook extends Model
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'm_workbook';
    protected $primaryKey = 'M_WorkbookID';

    protected $fillable = [
        'M_WorkbookM_UserID',
        'M_WorkbookName',
        'M_WorkbookCreated',
        'M_WorkbookLastUpdated',
    ];

    public $timestamps = false;
}

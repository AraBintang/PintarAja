<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Paraphrase extends Model
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'm_paraphrase';
    protected $primaryKey = 'M_ParaphraseID';

    protected $fillable = [
        'M_ParaphraseM_UserID',
        'M_ParaphraseName',
        'M_ParaphraseData',
        'M_ParaphraseCreated',
        'M_ParaphraseLastUpdated',
    ];

    public $timestamps = false;
}

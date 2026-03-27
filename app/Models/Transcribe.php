<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Transcribe extends Model
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'm_transcribe';
    protected $primaryKey = 'M_TranscribeID';

    protected $fillable = [
        'M_TranscribeM_UserID',
        'M_TranscribeName',
        'M_TranscribeData',
        'M_TranscribeSource',
        'M_TranscribeCreated',
        'M_TranscribeLastUpdated',
    ];

    public $timestamps = false;
}

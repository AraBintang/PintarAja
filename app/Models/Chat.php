<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Chat extends Model
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 't_chat';
    protected $primaryKey = 'T_ChatID';

    protected $fillable = [
        'T_ChatT_ConversationID',
        'T_ChatCode',
        'T_ChatRole',
        'T_ChatContent',
        'T_ChatCreated',
        'T_ChatLastUpdated'
    ];

    public $timestamps = false;
}

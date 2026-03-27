<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Conver extends Model
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 't_conversation';
    protected $primaryKey = 'T_ConversationID';

    protected $fillable = [
        'T_ConversationM_UserID',
        'T_ConversationTitle',
        'T_ConversationIsActive',
        'T_ConversationCreated',
        'T_ConversationLastUpdated'
    ];

    public $timestamps = false;
}

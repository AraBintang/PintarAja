<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Humanizer extends Model
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'm_humanizer';
    protected $primaryKey = 'M_HumanizerID';

    protected $fillable = [
        'M_HumanizerM_UserID',
        'M_HumanizerName',
        'M_HumanizerData',
        'M_HumanizerCreated',
        'M_HumanizerLastUpdated',
    ];

    public $timestamps = false;
}

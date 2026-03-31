<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;

class WebSetting extends Model
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'm_websetting';
    protected $primaryKey = 'M_WebSettingID';

    protected $fillable = [
        'M_WebSettingKey',
        'M_WebSettingLabel',
        'M_WebSettingValue',
    ];

    public $timestamps = false;

    public static function get(string $key, $default = null)
    {
        return static::where('M_WebSettingKey', $key)->value('M_WebSettingValue') ?? $default;
    }
}


<?php

namespace App\Models;

use App\Models\Paper;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Section extends Model
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'm_section';
    protected $primaryKey = 'M_SectionID';

    protected $fillable = [
        'M_SectionM_PaperID',
        'M_SectionName',
        'M_SectionCreated',
        'M_SectionLastUpdated',
    ];

    public function paper()
    {
        return $this->belongsTo(
            Paper::class,
            'M_SectionM_PaperID',
            'M_PaperID'
        );
    }

    public $timestamps = false;
}

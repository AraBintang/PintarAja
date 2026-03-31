<?php

namespace App\Models;

use App\Models\Section;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Paper extends Model
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'm_paper';
    protected $primaryKey = 'M_PaperID';

    protected $fillable = [
        'M_PaperName',
        'M_PaperCreated',
        'M_PaperLastUpdated',
    ];

    public function sections()
    {
        return $this->hasMany(
            Section::class,
            'M_SectionM_PaperID',
            'M_PaperID'
        );
    }

    public function prompts()
    {
        return $this->hasMany(Prompt::class, 'M_PromptM_PaperID', 'M_PaperID');
    }

    public $timestamps = false;
}

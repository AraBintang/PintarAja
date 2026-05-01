<?php

namespace App\Models;

use App\Models\Paper;
use App\Models\Section;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Prompt extends Model
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'm_prompt';
    protected $primaryKey = 'M_PromptID';

    protected $fillable = [
        'M_PromptM_PaperID',
        'M_PromptM_UserID',
        'M_PromptM_PaperID',
        'M_PromptM_SectionID',
        'M_PromptName',
        'M_PromptValue',
        'M_PromptFor',
        'M_PromptCreated',
        'M_PromptLastUpdated',
    ];

    public function paper()
    {
        return $this->belongsTo(
            Paper::class,
            'M_PromptM_PaperID',
            'M_PaperID'
        );
    }

    public function section()
    {
        return $this->belongsTo(
            Section::class,
            'M_PromptM_SectionID',
            'M_SectionID'
        );
    }

    public $timestamps = false;
}

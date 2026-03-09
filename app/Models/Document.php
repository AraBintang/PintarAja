<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Document extends Model
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'm_document';
    protected $primaryKey = 'M_DocumentID';

    protected $fillable = [
        'M_DocumentM_UserID',
        'M_DocumentM_WorkbookID',
        'M_DocumentName',
        'M_DocumentM_TopicID',
        'M_DocumentFullPrompt',
        'M_DocumentResult',
        'M_DocumentCreated',
        'M_DocumentLastUpdated',
    ];

    public $timestamps = false;
}

<?php

namespace App\Models;

use App\Models\Transaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Plagiarism extends Model
{
    use HasApiTokens, HasFactory, Notifiable;
    
    protected $table = 'm_plagiarism';
    protected $primaryKey = 'M_PlagiarismID';
 
    public $timestamps = false;
 
    protected $fillable = [
        'M_PlagiarismUserID',
        'M_PlagiarismTransactionID',
        'M_PlagiarismFileName',
        'M_PlagiarismServiceType',
        'M_PlagiarismAuthorFirst',
        'M_PlagiarismAuthorLast',
        'M_PlagiarismWhatsApp',
        'M_PlagiarismExtRef',
        'M_PlagiarismExclBiblio',
        'M_PlagiarismExclCited',
        'M_PlagiarismExclQuoted',
        'M_PlagiarismExclSmall',
        'M_PlagiarismBeproOrderID',
        'M_PlagiarismStatus',
        'M_PlagiarismWordCount',
        'M_PlagiarismResultURL',
        'M_PlagiarismAdminNotes',
        'M_PlagiarismPrice',
        'M_PlagiarismCreated',
        'M_PlagiarismUpdated',
        'M_PlagiarismCompletedAt',
    ];
 
    protected $casts = [
        'M_PlagiarismCreated' => 'datetime',
        'M_PlagiarismUpdated' => 'datetime',
        'M_PlagiarismCompletedAt' => 'datetime',
        'M_PlagiarismExclBiblio' => 'boolean',
        'M_PlagiarismExclCited' => 'boolean',
        'M_PlagiarismExclQuoted' => 'boolean',
        'M_PlagiarismExclSmall' => 'boolean',
    ];
 
    public function user()
    {
        return $this->belongsTo(User::class, 'M_PlagiarismUserID', 'M_UserID');
    }
 
    public function transaction()
    {
        return $this->belongsTo(Transaction::class, 'M_PlagiarismTransactionID', 'T_TransactionID');
    }
}
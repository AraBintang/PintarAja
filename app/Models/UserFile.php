<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserFile extends Model
{
    protected $table = 'm_user_file';
    protected $primaryKey = 'M_UserFileID';
    public $timestamps = false;

    protected $fillable = [
        'M_UserFileM_UserID',
        'M_UserFileM_PlanSettingID',
        'M_UserFileName',
        'M_UserFileMime',
        'M_UserFileSize',
        'M_UserFileStatus',
        'M_UserFileOpenAiFileId',
        'M_UserFileVectorStoreId',
        'M_UserFileCreated',
        'M_UserFileLastUpdated',
    ];

    protected $casts = [
        'M_UserFileSize' => 'integer',
        'M_UserFileCreated' => 'datetime',
        'M_UserFileLastUpdated' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'M_UserFileM_UserID', 'M_UserID');
    }
}

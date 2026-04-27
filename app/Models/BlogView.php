<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BlogView extends Model
{
    protected $table = 't_blog_view';

    protected $primaryKey = 'T_BlogViewID';

    public $timestamps = false;

    protected $fillable = [
        'T_BlogViewM_BlogID',
        'T_BlogViewCreated',
    ];

    protected function casts(): array
    {
        return [
            'T_BlogViewCreated' => 'datetime',
        ];
    }
}

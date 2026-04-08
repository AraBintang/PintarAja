<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Blog extends Model
{
    protected $table = 'm_blog';
    protected $primaryKey = 'M_BlogID';

    public $timestamps = false;

    protected $fillable = [
        'M_BlogTitle',
        'M_BlogSlug',
        'M_BlogExcerpt',
        'M_BlogMetaTitle',
        'M_BlogDescription',
        'M_BlogContent',
        'M_BlogFeaturedImage',
        'M_BlogCategory',
        'M_BlogAuthorId',
        'M_BlogViewCount',
        'M_BlogPublishedAt',
        'M_BlogIsPublished',
    ];

    protected $casts = [
        'M_BlogPublishedAt' => 'datetime',
        'M_BlogCreatedAt' => 'datetime',
        'M_BlogLastUpdatedAt' => 'datetime',
        'M_BlogIsPublished' => 'boolean',
    ];

    public function author()
    {
        return $this->belongsTo(User::class, 'M_BlogAuthorId', 'M_UserID');
    }

    public function scopePublished($query)
    {
        return $query->where('M_BlogIsPublished', true)
            ->whereNotNull('M_BlogPublishedAt')
            ->where('M_BlogPublishedAt', '<=', now());
    }

    public function incrementViewCount()
    {
        $this->increment('M_BlogViewCount');
    }
}
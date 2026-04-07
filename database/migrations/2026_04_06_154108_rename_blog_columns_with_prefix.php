<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('m_blog', function (Blueprint $table) {
            // Rename columns with M_Blog prefix
            $table->renameColumn('id', 'M_BlogId');
            $table->renameColumn('title', 'M_BlogTitle');
            $table->renameColumn('slug', 'M_BlogSlug');
            $table->renameColumn('excerpt', 'M_BlogExcerpt');
            $table->renameColumn('description', 'M_BlogDescription');
            $table->renameColumn('content', 'M_BlogContent');
            $table->renameColumn('featured_image', 'M_BlogFeaturedImage');
            $table->renameColumn('category', 'M_BlogCategory');
            $table->renameColumn('author_id', 'M_BlogAuthorId');
            $table->renameColumn('view_count', 'M_BlogViewCount');
            $table->renameColumn('published_at', 'M_BlogPublishedAt');
            $table->renameColumn('is_published', 'M_BlogIsPublished');
            $table->renameColumn('created_at', 'M_BlogCreatedAt');
            $table->renameColumn('updated_at', 'M_BlogUpdatedAt');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('m_blog', function (Blueprint $table) {
            // Reverse the rename
            $table->renameColumn('M_BlogTitle', 'title');
            $table->renameColumn('M_BlogSlug', 'slug');
            $table->renameColumn('M_BlogExcerpt', 'excerpt');
            $table->renameColumn('M_BlogDescription', 'description');
            $table->renameColumn('M_BlogContent', 'content');
            $table->renameColumn('M_BlogFeaturedImage', 'featured_image');
            $table->renameColumn('M_BlogCategory', 'category');
            $table->renameColumn('M_BlogAuthorId', 'author_id');
            $table->renameColumn('M_BlogViewCount', 'view_count');
            $table->renameColumn('M_BlogPublishedAt', 'published_at');
            $table->renameColumn('M_BlogIsPublished', 'is_published');
        });
    }
};

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
        Schema::create('m_blog', function (Blueprint $table) {
            $table->id();
            $table->string('M_BlogTitle');
            $table->string('M_BlogSlug')->unique();
            $table->string('M_BlogExcerpt')->nullable();
            $table->longText('M_BlogDescription')->nullable();
            $table->longText('M_BlogContent');
            $table->string('M_BlogFeaturedImage')->nullable();
            $table->string('M_BlogCategory')->nullable();
            $table->foreignId('M_BlogAuthorId')->nullable();
            $table->integer('M_BlogViewCount')->default(0);
            $table->timestamp('M_BlogPublishedAt')->nullable();
            $table->boolean('M_BlogIsPublished')->default(false);
            $table->dateTime('M_BlogCreatedAt')->useCurrent();
            $table->dateTime('M_BlogLastUpdatedAt')->useCurrent()->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('m_blog');
    }
};

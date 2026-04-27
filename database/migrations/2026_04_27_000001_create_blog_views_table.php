<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('t_blog_view', function (Blueprint $table) {
            $table->increments('T_BlogViewID');
            $table->unsignedInteger('T_BlogViewM_BlogID');
            $table->dateTime('T_BlogViewCreated')->useCurrent();

            $table->index('T_BlogViewCreated');
            $table->index(['T_BlogViewM_BlogID', 'T_BlogViewCreated']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('t_blog_view');
    }
};

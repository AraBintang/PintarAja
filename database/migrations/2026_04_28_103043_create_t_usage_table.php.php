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
        Schema::create('t_usage', function (Blueprint $table) {
            $table->id('T_UsageID');
            $table->unsignedBigInteger('T_UsageM_UserID');
            $table->date('T_UsageDate');
            $table->unsignedInteger('T_UsageCount')->default(0);
            $table->string('T_UsageModels', 50)->nullable(); // e.g. 'SETTING-CLD'
            $table->unique(['T_UsageM_UserID', 'T_UsageDate', 'T_UsageModels']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};

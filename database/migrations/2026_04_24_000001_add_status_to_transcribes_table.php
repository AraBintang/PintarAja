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
        // Schema::table('m_transcribe', function (Blueprint $table) {
        //     // Add status column with enum values
        //     if (!Schema::hasColumn('m_transcribe', 'status')) {
        //         $table->enum('status', ['pending', 'processing', 'completed', 'failed'])
        //             ->default('completed')
        //             ->after('M_TranscribeSource');
        //     }
            
        //     // Add timestamps for tracking
        //     if (!Schema::hasColumn('m_transcribe', 'started_at')) {
        //         $table->timestamp('started_at')->nullable()->after('status');
        //     }
            
        //     if (!Schema::hasColumn('m_transcribe', 'completed_at')) {
        //         $table->timestamp('completed_at')->nullable()->after('started_at');
        //     }
            
        //     // Add error message column for failed transcriptions
        //     if (!Schema::hasColumn('m_transcribe', 'error_message')) {
        //         $table->text('error_message')->nullable()->after('completed_at');
        //     }
        // });

        // Add index separately (after columns exist)
        Schema::table('m_transcribe', function (Blueprint $table) {
            if (!Schema::hasIndex('m_transcribe', 'index_user_status')) {
                $table->index(['M_TranscribeM_UserID', 'M_TranscribeStatus'], 'index_user_status');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('m_transcribe', function (Blueprint $table) {
            $table->dropIndex(['M_TranscribeM_UserID', 'M_TranscribeStatus']);
            $table->dropColumn(['M_TranscribeStatus', 'M_TranscribeStartedAt', 'M_TranscribeCompletedAt', 'M_TranscribeErrorMessage']);
        });
    }
};

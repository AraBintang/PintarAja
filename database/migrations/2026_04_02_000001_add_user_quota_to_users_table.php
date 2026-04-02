<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('m_user', 'M_UserQuota')) {
            Schema::table('m_user', function (Blueprint $table) {
                $table->integer('M_UserQuota')->default(0)->after('M_UserPlan');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('m_user', 'M_UserQuota')) {
            Schema::table('m_user', function (Blueprint $table) {
                $table->dropColumn('M_UserQuota');
            });
        }
    }
};

<?php

namespace App\Services;

use App\Models\Usage;
use Illuminate\Support\Carbon;

class UsageService
{
    public function isLimited(string $settingCode): bool
    {
        $limit = \App\Models\SettingAI::where('M_SettingCode', $settingCode)->value('M_SettingDailyLimit');
        return !is_null($limit) && $limit > 0;
    }

    public function getRemainingQuota(int $userId, string $settingCode): int
    {
        $limit = \App\Models\SettingAI::where('M_SettingCode', $settingCode)->value('M_SettingDailyLimit');
        if (is_null($limit) || $limit <= 0) return PHP_INT_MAX;

        $used = Usage::where('T_UsageM_UserID', $userId)
            ->where('T_UsageDate', Carbon::today())
            ->where('T_UsageModels', $settingCode)
            ->value('T_UsageCount') ?? 0;

        return max(0, $limit - $used);
    }

    public function checkQuota(int $userId, string $settingCode): bool
    {
        return $this->getRemainingQuota($userId, $settingCode) > 0;
    }

    public function increment(int $userId, string $settingCode): void
    {
        $limit = \App\Models\SettingAI::where('M_SettingCode', $settingCode)->value('M_SettingDailyLimit');
        if (is_null($limit) || $limit <= 0) return;

        Usage::firstOrCreate(
            [
                'T_UsageM_UserID' => $userId,
                'T_UsageDate' => Carbon::today(),
                'T_UsageModels' => $settingCode,
            ],
            ['T_UsageCount' => 0]
        );

        Usage::where('T_UsageM_UserID', $userId)
            ->where('T_UsageDate', Carbon::today())
            ->where('T_UsageModels', $settingCode)
            ->increment('T_UsageCount');
    }

    public function getQuotaByUser(int $userId): array
    {
        $today = Carbon::today();
        $usages = Usage::where('T_UsageM_UserID', $userId)
            ->where('T_UsageDate', $today)
            ->whereIn('T_UsageModels', self::LIMITED_MODELS)
            ->get()
            ->keyBy('T_UsageModels');

        $result = [];
        foreach (self::LIMITED_MODELS as $model) {
            $used = $usages->get($model)?->T_UsageCount ?? 0;
            $result[$model] = [
                'used'      => $used,
                'limit'     => self::DAILY_LIMIT,
                'remaining' => max(0, self::DAILY_LIMIT - $used),
            ];
        }
        return $result;
    }
}
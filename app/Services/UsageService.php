<?php

namespace App\Services;

use App\Models\Usage;
use Illuminate\Support\Carbon;

class UsageService
{
    public function isLimited(string $settingCode, ?int $userId = null): bool
    {
        $limit = \App\Models\SettingAI::where('M_SettingCode', $settingCode)->value('M_SettingDailyLimit');
        
        if ($settingCode === 'SETTING-CLD' && $userId !== null) {
            $userLimit = \App\Models\User::where('M_UserID', $userId)->value('M_UserClaudeLimit');
            if (!is_null($userLimit)) {
                $limit = $userLimit;
            }
        }

        return !is_null($limit) && $limit > 0;
    }

    public function getRemainingQuota(int $userId, string $settingCode): int
    {
        $limit = \App\Models\SettingAI::where('M_SettingCode', $settingCode)->value('M_SettingDailyLimit');
        
        if ($settingCode === 'SETTING-CLD') {
            $userLimit = \App\Models\User::where('M_UserID', $userId)->value('M_UserClaudeLimit');
            if (!is_null($userLimit)) {
                $limit = $userLimit;
            }
        }

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

        if ($settingCode === 'SETTING-CLD') {
            $userLimit = \App\Models\User::where('M_UserID', $userId)->value('M_UserClaudeLimit');
            if (!is_null($userLimit)) {
                $limit = $userLimit;
            }
        }

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
        
        $limitedSettings = \App\Models\SettingAI::whereNotNull('M_SettingDailyLimit')
            ->where('M_SettingDailyLimit', '>', 0)
            ->get(['M_SettingCode', 'M_SettingDailyLimit']);

        $userClaudeLimit = \App\Models\User::where('M_UserID', $userId)->value('M_UserClaudeLimit');

        $settingCodes = $limitedSettings->pluck('M_SettingCode')->toArray();
        if (!is_null($userClaudeLimit) && !in_array('SETTING-CLD', $settingCodes)) {
            $settingCodes[] = 'SETTING-CLD';
            $limitedSettings->push((object)[
                'M_SettingCode' => 'SETTING-CLD',
                'M_SettingDailyLimit' => $userClaudeLimit
            ]);
        }

        $usages = Usage::where('T_UsageM_UserID', $userId)
            ->where('T_UsageDate', $today)
            ->whereIn('T_UsageModels', $settingCodes)
            ->get()
            ->keyBy('T_UsageModels');

        $result = [];
        foreach ($limitedSettings as $setting) {
            $code = $setting->M_SettingCode;
            $limit = $setting->M_SettingDailyLimit;

            if ($code === 'SETTING-CLD' && !is_null($userClaudeLimit)) {
                $limit = $userClaudeLimit;
            }

            if ($limit <= 0) continue;

            $used = $usages->get($code)?->T_UsageCount ?? 0;
            
            $result[$code] = [
                'used'      => $used,
                'limit'     => $limit,
                'remaining' => max(0, $limit - $used),
            ];
        }
        return $result;
    }
}
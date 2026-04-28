<?php

namespace App\Services;

use App\Models\Usage;
use Illuminate\Support\Carbon;

class UsageService
{
    const DAILY_LIMIT = 5;
    const LIMITED_MODELS = ['SETTING-CLD'];

    public function isLimited(string $settingCode): bool
    {
        return in_array($settingCode, self::LIMITED_MODELS);
    }

    public function getRemainingQuota(int $userId, string $settingCode): int
    {
        if (!$this->isLimited($settingCode)) return PHP_INT_MAX;

        $used = Usage::where('T_UsageM_UserID', $userId)
            ->where('T_UsageDate', Carbon::today())
            ->where('T_UsageModels', $settingCode)
            ->value('T_UsageCount') ?? 0;

        return max(0, self::DAILY_LIMIT - $used);
    }

    public function checkQuota(int $userId, string $settingCode): bool
    {
        return $this->getRemainingQuota($userId, $settingCode) > 0;
    }

    public function increment(int $userId, string $settingCode): void
    {
        if (!$this->isLimited($settingCode)) return;

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
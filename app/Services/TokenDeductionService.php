<?php

namespace App\Services;

use App\Models\User;
use App\Models\WebSetting;
use Illuminate\Support\Facades\Log;

class TokenDeductionService
{
    /**
     * Get the configured token cost for a specific feature from m_websetting.
     * Default costs are applied if not found in the database.
     */
    public function getCost(string $featureKey): int
    {
        $defaultCosts = [
            'cost_chat' => 1,
            'cost_image_generator' => 5,
            'cost_video_generator' => 10,
            'cost_writer' => 2,
            'cost_humanizer' => 3,
            'cost_paraphrase' => 2,
            'cost_transcribe' => 5,
        ];

        $setting = WebSetting::where('M_WebSettingKey', $featureKey)->first();

        if ($setting && is_numeric($setting->M_WebSettingValue)) {
            return (int) $setting->M_WebSettingValue;
        }

        return $defaultCosts[$featureKey] ?? 1;
    }

    /**
     * Get all token costs
     */
    public function getAllCosts(): array
    {
        $features = [
            'cost_chat',
            'cost_image_generator',
            'cost_video_generator',
            'cost_writer',
            'cost_humanizer',
            'cost_paraphrase',
            'cost_transcribe',
        ];

        $costs = [];
        foreach ($features as $key) {
            $costs[$key] = $this->getCost($key);
        }

        return $costs;
    }

    /**
     * Update token costs in bulk
     */
    public function updateCosts(array $costs): void
    {
        foreach ($costs as $key => $value) {
            if (strpos($key, 'cost_') === 0) {
                WebSetting::updateOrCreate(
                    ['M_WebSettingKey' => $key],
                    [
                        'M_WebSettingValue' => (string) $value,
                        'M_WebSettingLabel' => 'Token Cost for ' . str_replace('cost_', '', $key)
                    ]
                );
            }
        }
    }

    /**
     * Check if user has enough quota and deduct it.
     * Returns true if successful, false if insufficient quota.
     */
    public function deductQuota(User $user, string $featureKey): bool
    {
        $cost = $this->getCost($featureKey);

        // If cost is 0, no deduction needed
        if ($cost <= 0) {
            return true;
        }

        // Check if user has sufficient quota
        if ((int) $user->M_UserQuota < $cost) {
            return false;
        }

        // Deduct quota
        $user->decrement('M_UserQuota', $cost);
        
        Log::info("Deducted {$cost} tokens for {$featureKey} from user ID: {$user->M_UserID}");
        return true;
    }
}

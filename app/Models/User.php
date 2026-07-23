<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Models\Plan;
use App\Models\ReferralUsage;
use App\Models\Transaction;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Http\Request;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'm_user';
    protected $primaryKey = 'M_UserID';

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'M_UserEmail',
        'M_UserEmailVerifiedAt',
        'M_UserToken',
        'M_UserFullName',
        'M_UserImage',
        'M_UserPhone',
        'M_UserPassword',
        'M_UserIsActive',
        'M_UserRole',
        'M_UserPlan',
        'M_UserQuota',
        'M_UserReferralCode',
        'M_UserReferredBy',
        'M_UserSubsExp',
        'M_UserLastLogin',
        'M_UserLastActive',
        'M_UserLastLoginIP',
        'M_UserLastActiveIP',
        'M_UserLastDevice',
        'M_UserLastUserAgent',
        'M_UserCreated',
        'M_UserLastUpdated',
        'M_UserClaudeLimit',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'M_UserPassword',
        'M_UserToken',
    ];

    public function getAuthPassword()
    {
        return $this->M_UserPassword;
    }

    public function getAuthIdentifierName()
    {
        return 'M_UserID';
    }

    public function isAdmin()
    {
        return $this->M_UserRole === 'A';
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'M_UserPassword' => 'hashed',
            'M_UserSubsExp' => 'datetime',
            'M_UserLastLogin' => 'datetime',
            'M_UserLastActive' => 'datetime',
            'M_UserCreated' => 'datetime',
            'M_UserLastUpdated' => 'datetime',
            'M_UserQuota' => 'integer',
        ];
    }

    public function recordLoginFromRequest(Request $request): void
    {
        $now = now();

        $this->forceFill([
            'M_UserLastLogin' => $now,
            'M_UserLastActive' => $now,
            'M_UserLastLoginIP' => $request->ip(),
            'M_UserLastActiveIP' => $request->ip(),
            'M_UserLastDevice' => self::deviceLabel($request->userAgent() ?? ''),
            'M_UserLastUserAgent' => substr($request->userAgent() ?? '', 0, 1000),
        ])->save();
    }

    public function recordActivityFromRequest(Request $request): void
    {
        $this->forceFill([
            'M_UserLastActive' => now(),
            'M_UserLastActiveIP' => $request->ip(),
            'M_UserLastDevice' => self::deviceLabel($request->userAgent() ?? ''),
            'M_UserLastUserAgent' => substr($request->userAgent() ?? '', 0, 1000),
        ])->save();
    }

    private static function deviceLabel(string $userAgent): string
    {
        $ua = strtolower($userAgent);

        $device = str_contains($ua, 'tablet') || str_contains($ua, 'ipad')
            ? 'Tablet'
            : (str_contains($ua, 'mobile') || str_contains($ua, 'iphone') || str_contains($ua, 'android')
                ? 'Mobile'
                : 'Desktop');

        $os = match (true) {
            str_contains($ua, 'windows') => 'Windows',
            str_contains($ua, 'mac os') || str_contains($ua, 'macintosh') => 'macOS',
            str_contains($ua, 'iphone') || str_contains($ua, 'ipad') => 'iOS',
            str_contains($ua, 'android') => 'Android',
            str_contains($ua, 'linux') => 'Linux',
            default => 'Unknown OS',
        };

        $browser = match (true) {
            str_contains($ua, 'edg/') => 'Edge',
            str_contains($ua, 'opr/') || str_contains($ua, 'opera') => 'Opera',
            str_contains($ua, 'chrome/') && !str_contains($ua, 'chromium') => 'Chrome',
            str_contains($ua, 'firefox/') => 'Firefox',
            str_contains($ua, 'safari/') && !str_contains($ua, 'chrome/') => 'Safari',
            default => 'Unknown Browser',
        };

        return "{$device} - {$os} - {$browser}";
    }

    public function plan()
    {
        return $this->belongsTo(
            Plan::class,
            'M_UserPlan',
            'M_PlanID'
        );
    }

    /** Referral usages yang dimiliki user ini (sebagai owner kode) */
    public function referralUsages()
    {
        return $this->hasMany(ReferralUsage::class, 'T_ReferralUsageOwnerID', 'M_UserID');
    }
    
    /** User yang mereferral user ini */
    public function referredBy()
    {
        return $this->belongsTo(User::class, 'M_UserReferredBy', 'M_UserID');
    }

    /**
     * Hitung diskon referral yang tersedia untuk user ini.
     * Jika user direferensikan dan belum pernah melakukan transaksi,
     * dapat tambahan 10% diskon.
     * Diskon ini bisa ditumpuk dengan pendapatan referral dari orang lain.
     */
    public function getReferralDiscount(): int
    {
        $discount = $this->getPendingDiscountPercent();

        if ($this->M_UserReferredBy && !Transaction::where('T_TransactionM_UserID', $this->M_UserID)->where('T_TransactionStatus', 1)->exists()) {
            $discount += 10;
        }

        return $discount;
    }
    
    /**
     * Generate kode referral unik untuk user ini.
     * Format: 8 karakter alfanumerik uppercase, contoh: "AB3X9K2M"
     */
    public function generateReferralCode(): string
    {
        $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        
        do {
            $code = '';
            for ($i = 0; $i < 8; $i++) {
                $code .= $chars[random_int(0, strlen($chars) - 1)];
            }
        } while (User::where('M_UserReferralCode', $code)->exists());

        $this->M_UserReferralCode = $code;
        $this->save();

        return $code;
    }
    
    /**
     * Hitung total diskon pending yang belum dipakai (dari referral orang ke-1 s/d 6).
     * Max 60% (6 orang × 10%)
     */
    public function getPendingDiscountPercent(): int
    {
        return (int) ReferralUsage::where('T_ReferralUsageOwnerID', $this->M_UserID)
            ->where('T_ReferralUsageIsUsed', false)
            ->where('T_ReferralUsageIsFreeMonth', false)
            ->sum('T_ReferralUsageDiscountPercent');
    }
    
    /**
     * Cek apakah user punya reward free 1 bulan yang belum diklaim.
     */
    public function hasPendingFreeMonth(): bool
    {
        return ReferralUsage::where('T_ReferralUsageOwnerID', $this->M_UserID)
            ->where('T_ReferralUsageIsUsed', false)
            ->where('T_ReferralUsageIsFreeMonth', true)
            ->exists();
    }
    
    /**
     * Jumlah total orang yang sudah pakai kode referral user ini.
     */
    public function getReferralCount(): int
    {
        return ReferralUsage::where('T_ReferralUsageOwnerID', $this->M_UserID)->count();
    }

    public $timestamps = false;
}

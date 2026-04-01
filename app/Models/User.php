<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Models\Plan;
use App\Models\ReferralUsage;
use App\Models\Transaction;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
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
        'M_UserReferralCode',
        'M_UserReferredBy',
        'M_UserSubsExp',
        'M_UserCreated',
        'M_UserLastUpdated',
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
            'M_UserCreated' => 'datetime',
            'M_UserLastUpdated' => 'datetime',
        ];
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

        if ($this->M_UserReferredBy && !Transaction::where('T_TransactionM_UserID', $this->M_UserID)->exists()) {
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
        do {
            $code = strtoupper(substr(str_shuffle('ABCDEFGHJKLMNPQRSTUVWXYZ23456789'), 0, 8));
        } while (static::where('M_UserReferralCode', $code)->exists());
    
        $this->update(['M_UserReferralCode' => $code]);
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

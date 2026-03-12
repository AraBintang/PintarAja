<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Models\Plan;
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
        'M_UserToken',
        'M_UserFullName',
        'M_UserImage',
        'M_UserPhone',
        'M_UserPassword',
        'M_UserIsActive',
        'M_UserRole',
        'M_UserPlan',
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

    public $timestamps = false;
}

<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'employee_id',
        'phone',
        'department_id',
        'department',
        'role',
        'status',
        'joined',
        'avatar',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'joined' => 'date',
            'password' => 'hashed',
        ];
    }

    public function attendances(){
            
        return $this->hasMany(Attendance::class);
        
    }   

    public function departmentModel()
    {
        return $this->belongsTo(Department::class, 'department_id');
    }

    public function isAdmin(): bool
    {
        $role = strtolower((string) $this->role);

        return in_array($role, ['admin', 'manager'], true)
            || $this->hasConfiguredAdminEmail();
    }

    public function hasConfiguredAdminEmail(): bool
    {
        return in_array(strtolower((string) $this->email), config('admin.emails', []), true);
    }

    public function ensureConfiguredAdminRole(): bool
    {
        if (! $this->hasConfiguredAdminEmail() || strtolower((string) $this->role) === 'admin') {
            return false;
        }

        $this->role = 'Admin';

        return $this->saveQuietly();
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attendance extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'check_in', 'check_out'];

    // This fixes the "format() on string" error from your first image!
    protected $casts = [
        'check_in' => 'datetime',
        'check_out' => 'datetime',
    ];

    /**
     * Get the user that owns the attendance.
     */
    public function user()
    {
    return $this->belongsTo(\App\Models\User::class);
    }
}
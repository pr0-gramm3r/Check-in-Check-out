<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Attendance extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'check_in', 'check_out'];

    // This fixes the "format() on string" error from your first image!
    protected $casts = [
        'check_in' => 'datetime',
        'check_out' => 'datetime',
    ];
}
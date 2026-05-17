<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Shift extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'start', 'end', 'grace_minutes', 'days'];

    protected $casts = [
        'days' => 'array',
    ];
}

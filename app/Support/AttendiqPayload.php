<?php

namespace App\Support;

use App\Models\Attendance;
use App\Models\User;

class AttendiqPayload
{
    public static function statusFor(?Attendance $attendance): string
    {
        if (! $attendance) {
            return 'absent';
        }

        $lateCutoff = $attendance->check_in?->copy()->setTime(9, 15);

        if ($attendance->check_in && $lateCutoff && $attendance->check_in->greaterThan($lateCutoff)) {
            return 'late';
        }

        return 'present';
    }

    public static function user(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'employee_id' => $user->employee_id ?: 'EMP'.str_pad((string) $user->id, 4, '0', STR_PAD_LEFT),
            'phone' => $user->phone,
            'department' => $user->departmentModel?->name ?: $user->department ?: 'Unassigned',
            'department_id' => $user->department_id,
            'role' => $user->isAdmin() && ! in_array(strtolower((string) $user->role), ['admin', 'manager'], true)
                ? 'Admin'
                : ($user->role ?: 'Employee'),
            'is_admin' => $user->isAdmin(),
            'status' => $user->status ?: 'active',
            'joined' => optional($user->joined ?: $user->created_at)->toDateString(),
            'avatar' => $user->avatar,
        ];
    }

    public static function attendance(Attendance $attendance): array
    {
        $user = $attendance->user;

        return [
            'id' => $attendance->id,
            'employee' => $user ? self::user($user) : [
                'name' => 'Deleted User',
                'department' => 'Unassigned',
                'employee_id' => 'N/A',
            ],
            'date' => optional($attendance->check_in ?: $attendance->created_at)->toDateString(),
            'check_in' => $attendance->check_in,
            'check_out' => $attendance->check_out,
            'status' => self::statusFor($attendance),
            'location' => $attendance->location,
            'notes' => $attendance->notes,
        ];
    }
}

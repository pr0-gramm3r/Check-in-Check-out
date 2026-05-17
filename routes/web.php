<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\AuthController;
use App\Models\AppSetting;
use App\Models\Attendance;
use App\Models\Department;
use App\Models\Shift;
use App\Models\User;
use App\Support\AttendiqPayload;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

Route::get('/', function () {
    return view('app');
});

Route::prefix('api')->group(function () {
    Route::post('/auth/login', function (Request $request) {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (! Auth::attempt($credentials, (bool) $request->boolean('remember'))) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $request->session()->regenerate();

        return response()->json([
            'token' => $request->session()->getId(),
            'user' => Auth::user(),
        ]);
    });

    Route::post('/auth/register', function (Request $request) {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'employee_id' => ['nullable', 'string', 'max:50', 'unique:users,employee_id'],
            'department' => ['nullable', 'string', 'max:255'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $department = null;
        if (! empty($data['department'])) {
            $department = Department::firstOrCreate(['name' => $data['department']]);
        }

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'employee_id' => $data['employee_id'] ?? null,
            'department_id' => $department?->id,
            'department' => $department?->name,
            'role' => 'Employee',
            'status' => 'active',
            'joined' => Carbon::today(),
            'password' => Hash::make($data['password']),
        ]);

        Auth::login($user);
        $request->session()->regenerate();

        return response()->json([
            'token' => $request->session()->getId(),
            'user' => AttendiqPayload::user($user->fresh('departmentModel')),
        ], 201);
    });

    Route::middleware('auth')->group(function () {
        Route::get('/auth/me', function (Request $request) {
            return response()->json([
                'token' => $request->session()->getId(),
                'user' => AttendiqPayload::user($request->user()->load('departmentModel')),
            ]);
        });

        Route::post('/auth/logout', function (Request $request) {
            $attendance = Attendance::where('user_id', Auth::id())
                ->whereNull('check_out')
                ->latest()
                ->first();

            if ($attendance) {
                $attendance->update(['check_out' => Carbon::now()]);
            }

            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return response()->json(['message' => 'Logged out successfully.']);
        });

        Route::get('/dashboard/stats', function () {
            $today = Carbon::today();
            $users = User::with('departmentModel')->get();
            $activeUsers = $users->where('status', '!=', 'inactive');
            $todayRecords = Attendance::with('user')
                ->whereDate('check_in', $today)
                ->get()
                ->unique('user_id');
            $present = $todayRecords->count();
            $late = $todayRecords->filter(fn ($record) => AttendiqPayload::statusFor($record) === 'late')->count();
            $avgCheckin = $todayRecords->filter(fn ($record) => $record->check_in)->avg(fn ($record) => $record->check_in->secondsSinceMidnight());

            return response()->json([
                'total_employees' => $activeUsers->count(),
                'present_today' => $present,
                'absent_today' => max($activeUsers->count() - $present, 0),
                'late_today' => $late,
                'on_leave' => 0,
                'avg_checkin_time' => $avgCheckin ? Carbon::today()->addSeconds((int) $avgCheckin)->format('h:i A') : '—',
                'attendance_rate' => $activeUsers->count() ? round(($present / $activeUsers->count()) * 100) : 0,
            ]);
        });

        Route::get('/dashboard/activity', function () {
            return response()->json(
                Attendance::with(['user.departmentModel'])
                    ->latest()
                    ->limit(10)
                    ->get()
                    ->flatMap(function (Attendance $record) {
                        $employee = $record->user ? AttendiqPayload::user($record->user) : ['name' => 'Deleted User', 'department' => 'Unassigned'];
                        $events = [[
                            'id' => $record->id.'-in',
                            'employee' => $employee,
                            'type' => 'check_in',
                            'time' => $record->check_in,
                        ]];

                        if ($record->check_out) {
                            $events[] = [
                                'id' => $record->id.'-out',
                                'employee' => $employee,
                                'type' => 'check_out',
                                'time' => $record->check_out,
                            ];
                        }

                        return $events;
                    })
                    ->sortByDesc('time')
                    ->values()
                    ->take(10)
            );
        });

        Route::get('/dashboard/live', function () {
            return response()->json([
                'checked_in' => Attendance::where('user_id', Auth::id())->whereNull('check_out')->exists(),
                'active_now' => Attendance::whereNull('check_out')->count(),
            ]);
        });

        Route::get('/dashboard/weekly-chart', function () {
            $totalEmployees = User::where('status', '!=', 'inactive')->count();

            return response()->json(
                collect(range(6, 0))->map(function ($offset) use ($totalEmployees) {
                    $date = Carbon::today()->subDays($offset);
                    $present = Attendance::whereDate('check_in', $date)->distinct('user_id')->count('user_id');

                    return [
                        'day' => $date->format('D'),
                        'present' => $present,
                        'absent' => max($totalEmployees - $present, 0),
                    ];
                })->values()
            );
        });

        Route::get('/attendance/today', function () {
            $attendance = Attendance::where('user_id', Auth::id())
                ->whereDate('check_in', Carbon::today())
                ->latest()
                ->first();

            return response()->json([
                'checked_in' => (bool) ($attendance && ! $attendance->check_out),
                'check_in_time' => $attendance?->check_in,
                'check_out_time' => $attendance?->check_out,
            ]);
        });

        Route::get('/attendance', function (Request $request) {
            $query = Attendance::with(['user.departmentModel'])->latest();

            if ($request->filled('date')) {
                $query->whereDate('check_in', $request->date('date'));
            }

            $records = $query->get()->map(fn (Attendance $attendance) => AttendiqPayload::attendance($attendance));

            if ($request->filled('status') && $request->status !== 'all') {
                $records = $records->where('status', $request->status)->values();
            }

            if ($request->filled('search')) {
                $search = Str::lower($request->string('search'));
                $records = $records->filter(function ($record) use ($search) {
                    return Str::contains(Str::lower($record['employee']['name'] ?? ''), $search)
                        || Str::contains(Str::lower($record['employee']['employee_id'] ?? ''), $search);
                })->values();
            }

            return response()->json($records->values());
        });

        Route::get('/attendance/my', function () {
            return response()->json(
                Attendance::with(['user.departmentModel'])
                    ->where('user_id', Auth::id())
                    ->latest()
                    ->limit(30)
                    ->get()
                    ->map(fn (Attendance $attendance) => AttendiqPayload::attendance($attendance))
            );
        });

        Route::post('/attendance/check-in', function (Request $request) {
            $openAttendance = Attendance::where('user_id', Auth::id())
                ->whereNull('check_out')
                ->latest()
                ->first();

            if ($openAttendance) {
                return response()->json([
                    'message' => 'You are already checked in.',
                    'attendance' => $openAttendance,
                ], 409);
            }

            $attendance = Attendance::create([
                'user_id' => Auth::id(),
                'check_in' => Carbon::now(),
                'status' => 'active',
                'location' => $request->input('location'),
                'notes' => $request->input('notes'),
            ]);

            return response()->json([
                'message' => 'Checked in successfully.',
                'attendance' => $attendance,
            ], 201);
        });

        Route::post('/attendance/check-out', function () {
            $attendance = Attendance::where('user_id', Auth::id())
                ->whereNull('check_out')
                ->latest()
                ->first();

            if (! $attendance) {
                return response()->json(['message' => 'No active check-in found.'], 404);
            }

            $attendance->update(['check_out' => Carbon::now()]);

            return response()->json([
                'message' => 'Checked out successfully.',
                'attendance' => $attendance,
            ]);
        });

        Route::delete('/attendance/{attendance}', function (Attendance $attendance) {
            $attendance->delete();

            return response()->json(['message' => 'Attendance record deleted.']);
        });

        Route::get('/employees', function () {
            $todayRecords = Attendance::whereDate('check_in', Carbon::today())->get()->keyBy('user_id');

            return response()->json(
                User::with('departmentModel')
                    ->orderBy('name')
                    ->get()
                    ->map(function (User $user) use ($todayRecords) {
                        return [
                            ...AttendiqPayload::user($user),
                            'today_status' => AttendiqPayload::statusFor($todayRecords->get($user->id)),
                        ];
                    })
            );
        });

        Route::post('/employees', function (Request $request) {
            $data = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'email', 'max:255', 'unique:users,email'],
                'phone' => ['nullable', 'string', 'max:50'],
                'employee_id' => ['required', 'string', 'max:50', 'unique:users,employee_id'],
                'department' => ['nullable', 'string', 'max:255'],
                'role' => ['nullable', 'string', 'max:255'],
                'joined' => ['nullable', 'date'],
                'status' => ['required', 'in:active,inactive'],
            ]);

            $department = ! empty($data['department']) ? Department::firstOrCreate(['name' => $data['department']]) : null;
            $user = User::create([
                ...$data,
                'department_id' => $department?->id,
                'department' => $department?->name,
                'password' => Hash::make(Str::random(16)),
            ]);

            return response()->json(AttendiqPayload::user($user->fresh('departmentModel')), 201);
        });

        Route::put('/employees/{user}', function (Request $request, User $user) {
            $data = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'email', 'max:255', 'unique:users,email,'.$user->id],
                'phone' => ['nullable', 'string', 'max:50'],
                'employee_id' => ['required', 'string', 'max:50', 'unique:users,employee_id,'.$user->id],
                'department' => ['nullable', 'string', 'max:255'],
                'role' => ['nullable', 'string', 'max:255'],
                'joined' => ['nullable', 'date'],
                'status' => ['required', 'in:active,inactive'],
            ]);

            $department = ! empty($data['department']) ? Department::firstOrCreate(['name' => $data['department']]) : null;
            $user->update([
                ...$data,
                'department_id' => $department?->id,
                'department' => $department?->name,
            ]);

            return response()->json(AttendiqPayload::user($user->fresh('departmentModel')));
        });

        Route::delete('/employees/{user}', function (User $user) {
            $user->delete();

            return response()->json(['message' => 'Employee deleted.']);
        });

        Route::get('/departments', function () {
            return response()->json(
                Department::withCount('users')
                    ->orderBy('name')
                    ->get()
                    ->map(fn (Department $department) => [
                        'id' => $department->id,
                        'name' => $department->name,
                        'head' => $department->head ?: 'Unassigned',
                        'employee_count' => $department->users_count,
                        'color' => $department->color,
                        'description' => $department->description,
                    ])
            );
        });

        Route::post('/departments', function (Request $request) {
            $data = $request->validate([
                'name' => ['required', 'string', 'max:255', 'unique:departments,name'],
                'head' => ['nullable', 'string', 'max:255'],
                'description' => ['nullable', 'string'],
                'color' => ['nullable', 'integer', 'min:0', 'max:5'],
            ]);

            $department = Department::create($data);

            return response()->json([
                ...$department->toArray(),
                'employee_count' => 0,
            ], 201);
        });

        Route::put('/departments/{department}', function (Request $request, Department $department) {
            $data = $request->validate([
                'name' => ['required', 'string', 'max:255', 'unique:departments,name,'.$department->id],
                'head' => ['nullable', 'string', 'max:255'],
                'description' => ['nullable', 'string'],
                'color' => ['nullable', 'integer', 'min:0', 'max:5'],
            ]);

            $department->update($data);

            return response()->json([
                ...$department->fresh()->toArray(),
                'employee_count' => $department->users()->count(),
            ]);
        });

        Route::delete('/departments/{department}', function (Department $department) {
            User::where('department_id', $department->id)->update([
                'department_id' => null,
                'department' => null,
            ]);
            $department->delete();

            return response()->json(['message' => 'Department deleted.']);
        });

        Route::get('/settings', function () {
            $settings = AppSetting::where('key', 'general')->first()?->value ?? [];

            return response()->json([
                'company_name' => $settings['company_name'] ?? config('app.name', 'AttendIQ'),
                'timezone' => $settings['timezone'] ?? config('app.timezone', 'UTC'),
                'work_hours' => $settings['work_hours'] ?? 8,
                'overtime_threshold' => $settings['overtime_threshold'] ?? 9,
                'notifications' => AppSetting::where('key', 'notifications')->first()?->value ?? [],
            ]);
        });

        Route::put('/settings', function (Request $request) {
            $data = $request->validate([
                'company_name' => ['nullable', 'string', 'max:255'],
                'timezone' => ['nullable', 'string', 'max:255'],
                'work_hours' => ['nullable', 'numeric', 'min:1', 'max:24'],
                'overtime_threshold' => ['nullable', 'numeric', 'min:1', 'max:24'],
                'notifications' => ['nullable', 'array'],
            ]);

            if (array_key_exists('notifications', $data)) {
                AppSetting::updateOrCreate(['key' => 'notifications'], ['value' => $data['notifications']]);
                unset($data['notifications']);
            }

            AppSetting::updateOrCreate(['key' => 'general'], ['value' => $data]);

            return response()->json(['message' => 'Settings saved.']);
        });

        Route::get('/settings/shifts', fn () => response()->json(Shift::orderBy('start')->get()));

        Route::post('/settings/shifts', function (Request $request) {
            $data = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'start' => ['required', 'date_format:H:i'],
                'end' => ['required', 'date_format:H:i'],
                'grace_minutes' => ['required', 'integer', 'min:0', 'max:180'],
                'days' => ['required', 'array', 'min:1'],
            ]);

            return response()->json(Shift::create($data), 201);
        });

        Route::put('/settings/shifts/{shift}', function (Request $request, Shift $shift) {
            $data = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'start' => ['required', 'date_format:H:i'],
                'end' => ['required', 'date_format:H:i'],
                'grace_minutes' => ['required', 'integer', 'min:0', 'max:180'],
                'days' => ['required', 'array', 'min:1'],
            ]);

            $shift->update($data);

            return response()->json($shift->fresh());
        });

        Route::delete('/settings/shifts/{shift}', function (Shift $shift) {
            $shift->delete();

            return response()->json(['message' => 'Shift deleted.']);
        });

        Route::put('/profile', function (Request $request) {
            $user = $request->user();
            $data = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'email', 'max:255', 'unique:users,email,'.$user->id],
                'phone' => ['nullable', 'string', 'max:50'],
                'role' => ['nullable', 'string', 'max:255'],
            ]);

            $user->update($data);

            return response()->json(AttendiqPayload::user($user->fresh('departmentModel')));
        });

        Route::put('/profile/password', function (Request $request) {
            $data = $request->validate([
                'current_password' => ['required', 'string'],
                'password' => ['required', 'string', 'min:8', 'confirmed'],
            ]);

            if (! Hash::check($data['current_password'], $request->user()->password)) {
                throw ValidationException::withMessages([
                    'current_password' => ['The current password is incorrect.'],
                ]);
            }

            $request->user()->update(['password' => Hash::make($data['password'])]);

            return response()->json(['message' => 'Password changed successfully.']);
        });

        Route::get('/reports/attendance-summary', function () {
            $users = User::where('status', '!=', 'inactive')->count();
            $records = Attendance::with('user')->get();
            $presentDays = $records->count();
            $lateDays = $records->filter(fn ($record) => AttendiqPayload::statusFor($record) === 'late')->count();
            $avgMinutes = $records->filter(fn ($record) => $record->check_in && $record->check_out)
                ->avg(fn ($record) => $record->check_in->diffInMinutes($record->check_out));

            return response()->json([
                'avg_attendance_rate' => $users ? round(($presentDays / max($users * 30, 1)) * 100, 1) : 0,
                'total_present_days' => $presentDays,
                'late_arrivals' => $lateDays,
                'avg_work_hours_day' => $avgMinutes ? round($avgMinutes / 60, 1) : 0,
            ]);
        });

        Route::get('/reports/dashboard', function () {
            $activeUsers = User::with('departmentModel')->where('status', '!=', 'inactive')->get();
            $records = Attendance::with(['user.departmentModel'])->get();
            $today = Carbon::today();
            $todayRecords = $records->filter(fn ($record) => $record->check_in?->isSameDay($today))->unique('user_id');
            $presentToday = $todayRecords->count();
            $lateToday = $todayRecords->filter(fn ($record) => AttendiqPayload::statusFor($record) === 'late')->count();
            $absentToday = max($activeUsers->count() - $presentToday, 0);

            $monthly = collect(range(8, 0))->map(function ($offset) use ($records, $activeUsers) {
                $month = Carbon::today()->subMonths($offset);
                $monthRecords = $records->filter(fn ($record) => $record->check_in?->isSameMonth($month));
                $workdays = max($activeUsers->count() * max($month->daysInMonth, 1), 1);
                $present = $monthRecords->count();
                $late = $monthRecords->filter(fn ($record) => AttendiqPayload::statusFor($record) === 'late')->count();

                return [
                    'month' => $month->format('M'),
                    'present' => round(($present / $workdays) * 100, 1),
                    'absent' => round(max(0, 100 - (($present / $workdays) * 100)), 1),
                    'late' => round(($late / $workdays) * 100, 1),
                ];
            });

            $departmentAttendance = Department::with('users')->get()->map(function (Department $department) use ($records) {
                $userIds = $department->users->pluck('id');
                $expected = max($userIds->count() * Carbon::today()->daysInMonth, 1);
                $present = $records->whereIn('user_id', $userIds)->count();

                return [
                    'dept' => $department->name,
                    'rate' => round(($present / $expected) * 100, 1),
                ];
            })->values();

            $avgMinutes = $records->filter(fn ($record) => $record->check_in && $record->check_out)
                ->avg(fn ($record) => $record->check_in->diffInMinutes($record->check_out));

            return response()->json([
                'summary' => [
                    'avg_attendance_rate' => $activeUsers->count() ? round(($presentToday / $activeUsers->count()) * 100, 1) : 0,
                    'total_present_days' => $records->count(),
                    'late_arrivals' => $records->filter(fn ($record) => AttendiqPayload::statusFor($record) === 'late')->count(),
                    'avg_work_hours_day' => $avgMinutes ? round($avgMinutes / 60, 1) : 0,
                ],
                'monthly' => $monthly,
                'department_attendance' => $departmentAttendance,
                'status_pie' => [
                    ['name' => 'Present', 'value' => $presentToday, 'color' => '#22c55e'],
                    ['name' => 'Absent', 'value' => $absentToday, 'color' => '#ef4444'],
                    ['name' => 'Late', 'value' => $lateToday, 'color' => '#f59e0b'],
                    ['name' => 'On Leave', 'value' => 0, 'color' => '#6366f1'],
                ],
            ]);
        });

        Route::get('/reports/late-arrivals', function () {
            return response()->json(
                Attendance::with(['user.departmentModel'])
                    ->get()
                    ->filter(fn ($record) => AttendiqPayload::statusFor($record) === 'late')
                    ->groupBy('user_id')
                    ->map(function ($records) {
                        $first = $records->first();
                        $avgDelay = (int) round($records->avg(function ($record) {
                            return max(0, $record->check_in->diffInMinutes($record->check_in->copy()->setTime(9, 15), false) * -1);
                        }));

                        return [
                            'name' => $first->user?->name ?? 'Deleted User',
                            'dept' => $first->user ? AttendiqPayload::user($first->user)['department'] : 'Unassigned',
                            'times' => $records->count(),
                            'avg_delay' => $avgDelay.' min',
                        ];
                    })
                    ->sortByDesc('times')
                    ->values()
                    ->take(10)
            );
        });

        Route::get('/reports/export', function () {
            $rows = Attendance::with(['user.departmentModel'])->latest()->get()->map(fn ($record) => AttendiqPayload::attendance($record));
            $csv = "Employee,Employee ID,Department,Date,Check In,Check Out,Status,Location\n";
            foreach ($rows as $row) {
                $csv .= implode(',', [
                    $row['employee']['name'] ?? '',
                    $row['employee']['employee_id'] ?? '',
                    $row['employee']['department'] ?? '',
                    $row['date'],
                    $row['check_in'],
                    $row['check_out'],
                    $row['status'],
                    $row['location'],
                ])."\n";
            }

            return response($csv, 200, [
                'Content-Type' => 'text/csv',
                'Content-Disposition' => 'attachment; filename="attendance-report.csv"',
            ]);
        });
    });
});

Route::middleware("auth")->group(function(){

    Route::get('/dashboard', fn () => view('app'))->name('home');
    // Route::view('/','welcome')->name("home");

    // Dashboard for manager
    Route::get('/admin/dashboard', [AttendanceController::class, 'adminDashboard'])->name('admin.dashboard');

    // Delete user
    Route::delete('/admin/user/{id}', function($id) {
        \App\Models\User::find($id)->delete();
        return back()->with('success', 'User deleted successfully');
    })->name('admin.deleteUser');
  
    // Reset Password 
    Route::post('/admin/user/{id}/reset-password', [AttendanceController::class, 'resetPassword'])
    ->name('admin.resetPassword');

});

// Register
Route::get('register', fn () => view('app'))->name("register");
Route::post('register', [AuthController::class, 'registerPost'])->name("register.post");

// Login
Route::get('login', fn () => view('app'))->name("login");
Route::post('login', [AuthController::class, 'loginPost'])->name("login.post");

//Logout
Route::post('logout', [AuthController::class, 'logout'])->name('logout');

//Check_in Check_out
Route::middleware(['auth'])->group(function () {
    Route::post('check-in', [AttendanceController::class, 'checkIn'])->name('checkin');
    Route::post('check-out', [AttendanceController::class, 'checkOut'])->name('checkout');
});

Route::get('/{any}', fn () => view('app'))->where('any', '^(?!admin|api).*$');

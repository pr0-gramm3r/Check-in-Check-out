<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Attendance;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class AttendanceController extends Controller
{
    // Check In: Create a new row
    public function checkIn()
    {
        Attendance::create([
            'user_id' => Auth::id(),
            'check_in' => Carbon::now(),
        ]);

        return back()->with('success', 'Checked in successfully!');
    }

    // Check Out: Update the row where check_out is still null
    public function checkOut()
    {
        $attendance = Attendance::where('user_id', Auth::id())
                                ->whereNull('check_out')
                                ->latest()
                                ->first();

        if ($attendance) {
            $attendance->update([
                'check_out' => Carbon::now(),
            ]);
            return back()->with('success', 'Checked out successfully!');
        }

        return back()->with('error', 'No active check-in found.');
    }

    // Display attendance history
    public function index() 
    {
    $history = \App\Models\Attendance::where('user_id', auth()->id())
                ->orderBy('created_at', 'desc')
                ->paginate(10);

    return view("welcome", compact('history'));
    }
    // Admin Dashboard
    public function adminDashboard()
    {
        // Database-neutral monthly totals, compatible with MySQL and PostgreSQL.
        $monthlyReportRows = \App\Models\Attendance::with('user')
            ->whereNotNull('check_out')
            ->get()
            ->groupBy(fn ($attendance) => $attendance->user_id.'-'.$attendance->check_in->format('Y-m'))
            ->map(function ($records) {
                $first = $records->first();

                return (object) [
                    'name' => $first->user?->name ?? 'Deleted User',
                    'id' => $first->user_id,
                    'year' => (int) $first->check_in->format('Y'),
                    'month' => (int) $first->check_in->format('m'),
                    'total_seconds' => $records->sum(fn ($record) => $record->check_in->diffInSeconds($record->check_out)),
                ];
            })
            ->sortByDesc(fn ($row) => sprintf('%04d-%02d', $row->year, $row->month))
            ->values();

        $reportPage = request()->integer('report_page', 1);
        $monthlyReports = new \Illuminate\Pagination\LengthAwarePaginator(
            $monthlyReportRows->forPage($reportPage, 5)->values(),
            $monthlyReportRows->count(),
            5,
            $reportPage,
            ['path' => request()->url(), 'pageName' => 'report_page']
        );
            // Fetch all attendance records, grouped by user
            $allAttendances = \App\Models\Attendance::with('user')
                            ->orderBy('created_at', 'desc')
                            ->paginate(10, ['*'], 'attendance_page');
                            
            // Fetch all users for the management list
            $users = \App\Models\User::paginate(10, ['*'], 'user_page');

            return view('admin.dashboard', compact('allAttendances', 'users','monthlyReports'));
        }

        // Reset User Password
        public function resetPassword(Request $request, $id) 
    {
    // Validate that a password was actually typed
    $request->validate([
        'new_password' => 'required|min:6'
    ]);

    $user = \App\Models\User::find($id);
    
    // Update with the custom password provided by the manager
    $user->update([
        'password' => \Hash::make($request->new_password)
    ]);

    return back()->with('success', "Password for {$user->name} has been updated!");
}
}

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
        // Access control first
        if (!in_array(auth()->user()->email, ['raj@gmail.com', 'ayush123@gmail.com'])) {
            return redirect('/dashboard')->with('error', 'You do not have manager access.');
        }

        // Then run queries
        $monthlyReports = \App\Models\Attendance::join('users', 'attendances.user_id', '=', 'users.id')
        ->select(
            'users.name',
            'users.id',
            \DB::raw('EXTRACT(YEAR FROM check_in)::integer as year'),
            \DB::raw('EXTRACT(MONTH FROM check_in)::integer as month'),
            \DB::raw('SUM(EXTRACT(EPOCH FROM (check_out - check_in)))::integer as total_seconds')
        )
        ->whereNotNull('check_out')
        ->groupBy('users.id', 'users.name', 'year', 'month')
        ->orderBy('year', 'desc')
        ->orderBy('month', 'desc')
        ->paginate(5, ['*'], 'report_page');
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

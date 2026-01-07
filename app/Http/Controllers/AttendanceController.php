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

   public function index() 
    {
    $history = \App\Models\Attendance::where('user_id', auth()->id())
                ->orderBy('created_at', 'desc')
                ->paginate(15);

    return view("welcome", compact('history'));
    }
}

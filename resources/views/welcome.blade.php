<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard</title>
    <link rel="stylesheet" href="{{ asset('css/welcome.css') }}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
</head>
<body>
    <div class="logo">
        <h1>TimeFlow-AD.</h1>
    </div>
    <div class="dash">
        <h2> Dashboard</h2>
    </div>
  

@auth
    <h3>Welcome, {{ auth()->user()->name }}</h3>

@endauth

@php
    // Check if the user has an open session (check_in exists but check_out is null)
    $currentAttendance = \App\Models\Attendance::where('user_id', auth()->id())
                                              ->whereNull('check_out')
                                              ->first();
@endphp

{{-- Manager Panel only Don't Change pls  --}}
@auth
    <nav >
        
        
        {{-- Only show this link if the logged-in user's ID is 1 --}}
        @if(in_array(auth()->user()->email, ['raj@gmail.com', 'ayush123@gmail.com'])){{--These two emails got the admin privillage u can change it later accordingly  --}}
            <a href="{{ route('admin.dashboard') }}" style="color: red; font-weight: bold; font-size: 25px; padding: 0px 0px 0px 42px;">Manager Panel</a>
        @endif
    </nav>
@endauth

{{-- Shows Checkin and check out status --}}
<div >
    @if(!$currentAttendance)
        <form action="{{ route('checkin') }}" method="POST">
            @csrf
            <button type="submit" >
                Punch In
            </button>
        </form>
    @else
        <div>
            <h3>
                You checked in at: {{ \Carbon\Carbon::parse($currentAttendance->check_in)?->format('h:i:s A') }}
            </h3>
            {{-- You checked in at: {{ $currentAttendance->check_in->format('h:i A') }} --}}
        </div>
        
        <form action="{{ route('checkout') }}" method="POST">
            @csrf
            <button type="submit" >
                Punch Out
            </button>
        </form>
    @endif
</div>

{{-- Shows the History of Attendance --}}
<div >
    <h3>Your Recent Activity</h3>
    <table >
        <thead>
            <tr>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Total time</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            @foreach($history as $record)
            <tr>
                <td>{{ $record->created_at->format('D, M d, Y') }}</td>
                <td>{{ $record->check_in->format('h:i:s A') }}</td>
                <td>{{ $record->check_out ? $record->check_out->format('h:i:s A') : '---' }}</td>
                <td>
                    @if($record->check_out)
                        {{-- diff() calculates the time between two dates --}}
                        {{ $record->check_in->diff($record->check_out)->format('%h : %i : %s') }}
                    @else
                        <span>Calculating...</span>
                    @endif
                </td>
                <td>
                    @if($record->check_out)
                        <span>Completed</span>
                    @else
                        <span>Active Now</span>
                    @endif
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>
</div>

{{-- Adds Button for paggination --}}
    <div>
        {{ $history->links() }}
    </div>



    
    


{{-- Authantication --}}
@auth
    <div>        
        <form action="{{ route('logout') }}" method="POST">
            @csrf
            <button type="submit" >
                <h3 style="margin: auto;font-size: large;">Logout</h3>
            </button>
        </form>
    </div>
@endauth
</body>
</html>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manager Dashboard</title>
    <link rel="stylesheet" href="{{ asset('css/dashboard.css') }}">
</head>
<body>
     <div class="nav">
         <h1>TimeFlow-AD.</h1>
       <nav>
         <a href="{{ route('home') }}">Dashboard</a>
       </nav>
         </nav>
        </div>
   
    
   
   <div class="manager">
       <h1>Manager Dashboard</h1>
     
</div>
  
    

{{-- Shows Recent Records --}}
<h2>All Attendance Records</h2>
<table class="admin-table">
    <thead>
        <tr>
            <th>Employee Name</th>
            <th>Check In</th>
            <th>Check Out</th>
            <th>Total Duration</th>
        </tr>
    </thead>
    <tbody>
        @foreach($allAttendances as $record)
        <tr>
            <td>{{ $record->user->name }}</td>
            <td>{{ $record->check_in->format('d M, h:i:s A') }}</td>
            <td>{{ $record->check_out ? $record->check_out->format('h:i:s A') : 'Still In' }}</td>
            <td>
                @if($record->check_out)
                    {{ $record->check_in->diff($record->check_out)->format('%h: %i: %s') }}
                @else
                    --
                @endif
            </td>
        </tr>
        @endforeach
    </tbody>
</table>
{{-- Adds Button for paggination --}}
<div style="width: fit-content; margin-top: 2px; padding: 25px; font-size: 25px;">
    {{ $allAttendances->links() }}
</div>


{{-- Management Panel --}}
<h2>User Management (Delete/Ban)</h2>
<table class="admin-table">
    <thead>
        <tr>
            <th>User ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Reset Password</th>
            <th>Action</th>
        </tr>
    </thead>
    <tbody>
        @foreach($users as $user)
        <tr>
            <td>{{ $user->id }}</td>
            <td>{{ $user->name }}</td>
            <td>{{ $user->email }}</td>
            <td>
                <form action="{{ route('admin.resetPassword', $user->id) }}" method="POST" style="display: flex; gap: 5px;">
                    @csrf
                    <input type="text" name="new_password" placeholder="New Password" required 
                           style="padding: 5px; border: 2px solid #b39a50; width: 100px;">
                    <button type="submit" >
                        Reset
                    </button>
                </form>
            </td>
            <td>
                <form action="{{ route('admin.deleteUser', $user->id) }}" method="POST" onsubmit="return confirm('Delete this user?')">
                    @csrf
                    @method('DELETE')
                    <button type="submit" class="btn-delete">Delete User</button>
                </form>
            </td>
        </tr>
        @endforeach
    </tbody>
</table>

{{-- Adds Button for paggination --}}
<div style="width: fit-content; margin-top: 2px; padding: 25px; font-size: 25px;">
    {{ $users->links() }}
</div>

<br>
<br>


{{-- Employee monthly report here --}}
<h2 style="margin-top: 40px;">Employee Monthly Work Report</h2>
<table class="admin-table">
    <thead>
        <tr>
            <th>Employee Name</th>
            <th>Month / Year</th>
            <th>Total Monthly Time</th>
        </tr>
    </thead>
    <tbody>
        @foreach($monthlyReports as $report)
        <tr>
            <td>{{ $report->name }}</td>
            <td>
                {{-- Converts month number to Name (e.g., 1 to January) --}}
                {{ DateTime::createFromFormat('!m', $report->month)->format('F') }} {{ $report->year }}
            </td>
            <td>
                @php
                    $hours = floor($report->total_seconds / 3600);
                    $minutes = floor(($report->total_seconds / 60) % 60);
                    $seconds = $report->total_seconds % 60;
                @endphp
                <span style="font-weight: bold;">{{ $hours }} Hours, {{ $minutes }} Minutes, {{ $seconds }} Seconds</span>
            </td>
        </tr>
        @endforeach
    </tbody>
</table>

{{-- Adds Button for paggination --}}
<div style="width: fit-content; margin-top: 2px; padding: 25px; font-size: 25px;">
    {{ $monthlyReports->links() }}
</div>
</body>
</html>
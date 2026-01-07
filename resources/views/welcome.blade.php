<h1>HI</h1>

@auth
    <h3>Welcome, {{ auth()->user()->name }}</h3>

@endauth

@php
    // Check if the user has an open session (check_in exists but check_out is null)
    $currentAttendance = \App\Models\Attendance::where('user_id', auth()->id())
                                              ->whereNull('check_out')
                                              ->first();
@endphp

{{-- Shows Checkin and check out status --}}
<div class="container mt-5">
    @if(!$currentAttendance)
        <form action="{{ route('checkin') }}" method="POST">
            @csrf
            <button type="submit" class="btn btn-success btn-lg">
                Punch In
            </button>
        </form>
    @else
        <div class="alert alert-info">
            <h3>
                You checked in at: {{ \Carbon\Carbon::parse($currentAttendance->check_in)?->format('h:i:s A') }}
            </h3>
            {{-- You checked in at: {{ $currentAttendance->check_in->format('h:i A') }} --}}
        </div>
        
        <form action="{{ route('checkout') }}" method="POST">
            @csrf
            <button type="submit" class="btn btn-danger btn-lg">
                Punch Out
            </button>
        </form>
    @endif
</div>

{{-- Shows the History of Attendance --}}
<div class="container mt-5">
    <h3>Your Recent Activity</h3>
    <table class="table table-bordered table-striped border-dark">
        <thead class="table-dark">
            <tr>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            @foreach($history as $record)
            <tr>
                <td>{{ $record->created_at->format('D, M d, Y') }}</td>
                <td class="text-success">{{ $record->check_in->format('h:i:s A') }}</td>
                <td class="text-danger">
                    {{ $record->check_out ? $record->check_out->format('h:i:s A') : '---' }}
                </td>
                <td>
                    @if($record->check_out)
                        <span class="badge bg-success">Completed</span>
                    @else
                        <span class="badge bg-warning text-dark">Active Now</span>
                    @endif
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>
    <div class="mt-3" >
        {{ $history->links() }}
    </div>
</div>

{{-- Styling --}}
<style>
    .w-5.h-5{
        width:25px;
    }
    .table, th, td {
        border: 1px solid #2b2e30 !important;
        font-size: larger; 
    }
    
</style>

{{-- Authantication --}}
@auth
    <div class="d-flex align-items-center justify-content-between p-3">        
        <form action="{{ route('logout') }}" method="POST">
            @csrf
            <button type="submit" class="btn btn-outline-danger btn-sm">
                <h3 style="margin: auto;font-size: large;">Logout</h3>
            </button>
        </form>
    </div>
@endauth    
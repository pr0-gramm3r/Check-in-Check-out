{{-- Shows the massage --}}
{{-- @if (session()->has("success"))
    <div class="alert-success">
        {{ session()->get("success") }} 
    </div>
@endif  --}}
@if (session()->has("error"))   
    <div class="alert-error">
        {{ session()->get("error") }}
    </div>
@endif

{{-- Main Content --}}
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

{{-- Manager Panel only Don't Change pls  --}}
@auth
    <nav >
        
        
        {{-- Only show this link if the logged-in user's ID is 1 --}}
        @if(in_array(auth()->user()->email, ['raj@gmail.com', 'ayush123@gmail.com'])){{--These two emails got the admin privillage u can change it later accordingly  --}}
            <a href="{{ route('admin.dashboard') }}" style="color: red; font-weight: bold;">Manager Panel</a>
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

{{-- Styling --}}
<style>
    .w-5.h-5{
        width:25px;
    }
    table,th,td{
        border: 3px solid #2b2e30 !important;
        font-size: larger;
        border-collapse: collapse;

    }
    
    form{
        padding:10px 20px;
        margin: 23px;
        
    }
    button{
        cursor: pointer;
    }
    .alert-success{
        background-color: #cbe4ce;
        color: #155724;
        padding: 10px;
        margin: 10px 0;
        border: 1px solid #c3e6cb;
        max-width: 325px;
        border-radius: 5px;
        font-size: 30px;
        text-align: center
    }
    .alert-error{
        background-color: #f8d7da;
        color: #721c24;
        padding: 10px;
        margin: 10px 0;
        border: 1px solid #f5c6cb;
        border-radius: 5px;
    }
    
</style>

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
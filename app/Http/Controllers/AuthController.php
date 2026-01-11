<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use App\Models\Attendance;

class AuthController extends Controller
{
    public function login(){
        return view("Auth.login");
    }

    function loginPost(Request $req){
        $credentials = $req->only("email","password");
        if(Auth::attempt($credentials)){
            return redirect()->intended(route("home"));
        }
        return redirect(route("login"))->with("error","Login Failed Try Again");
    }

    function register(){
        return view("Auth.register");
    }

    function registerPost(Request $req){
            $user= new User();
            $user->name = $req->fullname;
            $user->email = $req->email;
            $user->password = hash::make($req->password);
            if($user->save()){

                return redirect(route("login"))->with("success","User Created Successfully");
            }
            return redirect(route("register"))->with("error","Failed To Create Account");
    }


    public function logout(Request $req) {
    // 1. First, check if there is an active attendance session
    $attendance = Attendance::where('user_id', Auth::id())
                            ->whereNull('check_out')
                            ->latest()
                            ->first();

    // 2. If found, punch them out automatically
    if ($attendance) {
        $attendance->update([
            'check_out' => \Carbon\Carbon::now(),
        ]);
    }

    // 3. Now perform the standard logout process
    Auth::logout(); 
    $req->session()->invalidate(); 
    $req->session()->regenerateToken(); // Recommended for security

    return redirect(route('login'))->with('success', 'You have been logged out successfully.');
}
}

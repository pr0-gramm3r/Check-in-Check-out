<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

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
    
        Auth::logout(); // Log the user out
        $req->session()->invalidate(); // Clear the session data    
        return redirect(route('login'))->with('success', 'You have been logged out.');
}
}

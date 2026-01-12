<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\AuthController;

Route::get('/', function () {
    return view('origin');
});

Route::middleware("auth")->group(function(){

    Route::get('/dashboard', [AttendanceController::class, 'index'])->name('home');
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
Route::get('register', [AuthController::class, 'register'])->name("register");
Route::post('register', [AuthController::class, 'registerPost'])->name("register.post");

// Login
Route::get('login', [AuthController::class, 'login'])->name("login");
Route::post('login', [AuthController::class, 'loginPost'])->name("login.post");

//Logout
Route::post('logout', [AuthController::class, 'logout'])->name('logout');

//Check_in Check_out
Route::middleware(['auth'])->group(function () {
    Route::post('check-in', [AttendanceController::class, 'checkIn'])->name('checkin');
    Route::post('check-out', [AttendanceController::class, 'checkOut'])->name('checkout');
});
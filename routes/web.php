<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Auth\AuthController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::middleware('auth')->prefix('/api')->group(function() {
    Route::prefix('/admin')->group(function() {
        Route::get('/getUserNamaLengkap', [DashboardController::class, 'getUserNamaLengkap']);
    });
});

Route::middleware(['guest'])->group(function (): void {
    Route::post('/login', [AuthController::class, 'login']);
    Route::get('/login', [AuthController::class, 'index'])->name('login');
});

Route::middleware(['auth', 'web'])->group(function() {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
});

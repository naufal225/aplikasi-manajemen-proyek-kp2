<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use SebastianBergmann\CodeCoverage\Report\Html\Dashboard;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::prefix('/api')->group(function() {
    Route::get('/', []);
});

Route::middleware(['guest'])->group(function (): void {
    Route::post('/login', [AuthController::class, 'login']);
    Route::get('/login', [AuthController::class, 'index'])->name('login');
});

Route::middleware(['auth', 'web'])->group(function() {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
});

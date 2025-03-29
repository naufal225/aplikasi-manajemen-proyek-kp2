<?php

use App\Http\Controllers\Admin\DashboardAdminController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Auth\AuthController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::middleware('auth')->prefix('/api')->group(function() {
    Route::prefix('/admin')->group(function() {
        Route::get('/getUserNamaLengkap', [DashboardAdminController::class, 'getUserNamaLengkap']);

        Route::get('/getDashboardStats', [DashboardAdminController::class, 'getDashboardStats']);

        Route::get('/getTimeLineProyek', [DashboardAdminController::class, 'getTimeLineProyek']);

        Route::get('/getTopPerformers', [DashboardAdminController::class, 'getTopPerformers']);

    });

});

Route::middleware(['guest'])->group(function (): void {
    Route::post('/login', [AuthController::class, 'login']);
    Route::get('/login', [AuthController::class, 'index'])->name('login');
});

Route::middleware(['auth', 'web'])->group(function() {
    Route::get('/dashboard', [DashboardAdminController::class, 'index'])->name('dashboard');

    Route::get('/kelola-data-divisi', function() {
        return Inertia::render('admin/divisi/kelola-divisi');
    });
});

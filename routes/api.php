<?php

use App\Http\Controllers\ApiMobile\LoginController;
use App\Http\Controllers\ApiMobile\ManajerController;
use App\Http\Controllers\Auth\AuthController;
use GuzzleHttp\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/login-mobile', [LoginController::class, 'login']);


Route::prefix('/manajer')->group(function() {
    Route::get('/proyek-all', [ManajerController::class, 'getAllDataProyek'])->middleware('auth:sanctum');
    Route::get('/proyek-done', [ManajerController::class, 'ProyekDone'])->middleware('auth:sanctum');
    Route::get('/proyek-in-progress', [ManajerController::class, 'ProyekInProgress'])->middleware('auth:sanctum');
    Route::get('/proyek-by-id/{id}', [ManajerController::class, 'getProyekById'])->middleware('auth:sanctum');
});


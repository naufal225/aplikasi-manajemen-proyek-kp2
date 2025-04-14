<?php

use App\Http\Controllers\ApiMobile\KaryawanController;
use App\Http\Controllers\ApiMobile\LoginController;
use App\Http\Controllers\ApiMobile\ManajerController;
use App\Models\Karyawan;
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
    Route::post('/proyek-add', [ManajerController::class, "addProyek"])->middleware('auth:sanctum');
    Route::get('/get-tugas-by-id-proyek/{id}', [ManajerController::class, 'getTugasByIdProyek'])->middleware('auth:sanctum');
    Route::get('/get-tugas-by-id-tugas/{id}', [ManajerController::class, 'getTugasByIdTugas'])->middleware('auth:sanctum');
    Route::get('/get-tugas-by-id-tugas-with-bukti/{id}', [ManajerController::class, 'getTugasByIdTugasWithBukti'])->middleware('auth:sanctum');
    Route::put('/update-proyek/{id}', [ManajerController::class, 'updateDataProyek'])->middleware('auth:sanctum');
    Route::put('/update-status-proyek/{id}', [ManajerController::class, 'updateStatusProyek'])->middleware('auth:sanctum');
    Route::post('/add-tugas/{id_proyek}', [ManajerController::class, 'addTugas'])->middleware('auth:sanctum');
    Route::put('/update-tugas/{id_tugas}', [ManajerController::class, 'updateTugas'])->middleware('auth:sanctum');
    Route::put('/update-status-tugas/{id_tugas}', [ManajerController::class, 'updateStatusTugas'])->middleware('auth:sanctum');
    Route::get('/get-all-karyawan-by-divisi', [ManajerController::class, 'getAllDataKaryawanByDivisi'])->middleware('auth:sanctum');
    Route::post('/create-notification', [KaryawanController::class, 'createNotification'])->middleware('auth:sanctum');
    Route::get('/getAllDataNotification', [ManajerController::class, 'getAllDataNotification'])->middleware('auth:sanctum');
});

Route::prefix('/karyawan')->group(function() {
    Route::post('/upload-bukti-tugas/{id}', [KaryawanController::class, 'uploadBuktiDanReviewTugas'])->middleware('auth:sanctum');
    Route::post('/upload-foto-profil', [KaryawanController::class, 'uploadFotoProfil'])->middleware('auth:sanctum');
    Route::post('/create-notification', [KaryawanController::class, 'createNotification'])->middleware('auth:sanctum');
    Route::get('/getAllDataNotification', [KaryawanController::class, 'getAllDataNotification'])->middleware('auth:sanctum');
});

Route::get('/logout', [LoginController::class, 'logout'])->middleware('auth:sanctum');

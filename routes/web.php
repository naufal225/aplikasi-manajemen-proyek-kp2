<?php

use App\Http\Controllers\Admin\DashboardAdminController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\KelolaDataDivisiAdminController;
use App\Http\Controllers\Admin\KelolaDataKaryawanAdminController;
use App\Http\Controllers\Admin\KelolaDataProyekAdminController;
use App\Http\Controllers\Auth\AuthController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\Worksheet\RowIterator;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::middleware('auth')->prefix('/api')->group(function() {
    Route::post('/sendReview', [KelolaDataProyekAdminController::class, 'sendReview']);

    Route::prefix('/admin')->group(function() {
        Route::get('/getUserNamaLengkap', [DashboardAdminController::class, 'getUserNamaLengkap']);

        Route::get('/getDashboardStats', [DashboardAdminController::class, 'getDashboardStats']);

        Route::get('/getTimeLineProyek', [DashboardAdminController::class, 'getTimeLineProyek']);

        Route::get('/getTopPerformers', [DashboardAdminController::class, 'getTopPerformers']);

        Route::get('/getAllDataDivisi', [KelolaDataDivisiAdminController::class, 'getAllDataDivisi']);

        Route::get('/getAllDataKaryawanForDivisi', [KelolaDataDivisiAdminController::class, 'getAllDataKaryawanForDivisi']);

        Route::post('/storeDataDivisi', [KelolaDataDivisiAdminController::class, 'storeDataDivisi']);

        Route::put('/updateDataDivisi', [KelolaDataDivisiAdminController::class, 'updateDataDivisi']);

        Route::delete('/deleteDivisi', [KelolaDataDivisiAdminController::class, 'deleteDivisi']);

        Route::get('/getAllDataKaryawan', [KelolaDataKaryawanAdminController::class, 'getAllDataKaryawan']);

        Route::post('/storeDataKaryawan', [KelolaDataKaryawanAdminController::class, 'storeDataKaryawan']);

        Route::put('/updateDataKaryawan/{id}', [KelolaDataKaryawanAdminController::class, 'updateDataKaryawan']);

        Route::delete('/deleteKaryawan', [KelolaDataKaryawanAdminController::class, 'deleteKaryawan']);

        Route::post('/importDataKaryawan', [KelolaDataKaryawanAdminController::class, 'importDataKaryawan']);

        Route::get('/downloadTemplate', [KelolaDataKaryawanAdminController::class, 'downloadTemplate']);

        Route::get('/getAllDataProyek', [KelolaDataProyekAdminController::class, 'getAllDataProyek']);

        Route::get('/getProyekById/{id_proyek}', [KelolaDataProyekAdminController::class, 'getProyekById']);

        Route::post('/storeDataProyek', [KelolaDataProyekAdminController::class, 'storeDataProyek']);

        Route::put('/updateDataProyek/{id_proyek}', [KelolaDataProyekAdminController::class, 'updateDataProyek']);

        Route::delete('/deleteDataProyek', [KelolaDataProyekAdminController::class, 'deleteDataProyek']);

        Route::put('/giveReview', [KelolaDataProyekAdminController::class, 'giveReview']);

        Route::get('/getTugasByIdProyek/{id_proyek}', [KelolaDataProyekAdminController::class, 'getTugasByIdProyek']);

        Route::get('/exportDataProyek', [KelolaDataProyekAdminController::class, 'exportDataProyek']);
    });

});

Route::middleware(['guest'])->group(function (): void {
    Route::post('/login', [AuthController::class, 'login']);
    Route::get('/login', [AuthController::class, 'index'])->name('login');
});

Route::middleware(['auth', 'web'])->group(function() {
    Route::get('/dashboard', [DashboardAdminController::class, 'index'])->name('dashboard');

    Route::prefix('/kelola-data-divisi')->group(function() {
        Route::get('/', function() {
            return Inertia::render('admin/divisi/kelola-divisi');
        });

        Route::get('/tambah', function() {
            return Inertia::render('admin/divisi/tambah/tambah-divisi');
        });
    });

    Route::prefix('/kelola-data-karyawan')->group(function() {
        Route::get('/', function() {
            return Inertia::render('admin/karyawan/kelola-karyawan');
        });

        Route::get('/tambah', function() {
            return Inertia::render('admin/karyawan/tambah/tambah-karyawan');
        });
    });

    Route::prefix('/kelola-data-proyek')->group(function() {
        Route::get('/', function() {
            return Inertia::render('admin/proyek/kelola-proyek');
        });

        Route::get('/tambah', function() {
            return Inertia::render('admin/proyek/tambah/tambah-proyek');
        });

        Route::get('/persetujuan/{id_proyek}', function($id_proyek) {
            return Inertia::render('admin/proyek/persetujuan/persetujuan', [
                'id' => $id_proyek
            ]);
        });

        Route::get('/detail-tugas/{id_proyek}', function($id_proyek) {
            return Inertia::render('admin/proyek/detail-tugas/detail-tugas', [
                'id_proyek' => $id_proyek
            ]);
        });
    });


});

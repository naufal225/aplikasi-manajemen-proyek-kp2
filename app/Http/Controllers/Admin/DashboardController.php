<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Divisi;
use App\Models\Karyawan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{

    public function index() {
        return Inertia::render('admin/dashboard');
    }

    public function getUserNamaLengkap() {
        $user = Auth::user();
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'User not authenticated'
            ], 401);
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'nama_lengkap' => Auth::user()->nama_lengkap
            ]
        ]);
    }

    public function getDashboardStats() {
        $total_divisi = Divisi::count();
        $total_karyawan = Karyawan::count();
        
    }
}

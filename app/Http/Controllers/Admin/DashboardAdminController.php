<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Divisi;
use App\Models\Karyawan;
use App\Models\Proyek;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardAdminController extends Controller
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
        $total_proyek = Proyek::count();
        $total_proyek_menunggu_persetujuan = Proyek::where('status', 'waiting_for_review')->count();
        $total_proyek_terlambat = Proyek::whereDate('tenggat_waktu', '<', now())
            ->where(function($query) {
                $query->where('status', '!=', 'done')
                    ->where('status', '!=', 'waiting_for_review');
            })
            ->count();

        return response()->json([
            'status' => 'success',
            'data' => [
                'total_divisi' => $total_divisi,
                'total_karyawan' => $total_karyawan,
                'total_proyek' => $total_proyek,
                'total_proyek_menunggu_persetujuan' => $total_proyek_menunggu_persetujuan,
                'total_proyek_terlambat' => $total_proyek_terlambat
            ]
        ]);
     }

     public function getTimeLineProyek() {
        $proyek = Proyek::all()->map(function ($item) {
            return [
                'id' => $item->id,
                'nama_proyek' => $item->nama_proyek,
                'tanggal_mulai' => $item->tanggal_mulai,
                'tenggat_waktu' => $item->tenggat_waktu,
                'bulan_mulai' => Carbon::parse($item->tanggal_mulai)->month,
                'durasi' => Carbon::parse($item->tenggat_waktu)->month - Carbon::parse($item->tanggal_mulai)->month + 1, // Hitung selisih bulan
                'progress' => $item->progress,
                'status' => $item->status === 'done' ? 'completed' : $item->status,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $proyek
        ]);
     }

     public function getTopPerformers()
    {
        $topKaryawan = Karyawan::with('divisi')
            ->orderByDesc('skor_kinerja') // Urut berdasarkan skor tertinggi
            ->limit(10)
            ->get()
            ->map(function ($karyawan) {
                return [
                    'id' => $karyawan->id,
                    'nama_lengkap' => $karyawan->nama_lengkap,
                    'divisi' => $karyawan->divisi->nama_divisi ?? 'Tidak Ada Divisi', // Ambil nama divisi
                    'skor_kinerja' => $karyawan->skor_kinerja,
                ];
            });

        return response()->json([
            'status' => 'success',
            'data' => $topKaryawan
        ]);
    }
}

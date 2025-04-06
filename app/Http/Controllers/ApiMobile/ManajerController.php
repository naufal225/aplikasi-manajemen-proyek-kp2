<?php

namespace App\Http\Controllers\ApiMobile;

use App\Http\Controllers\Controller;
use App\Models\Karyawan;
use App\Models\Proyek;
use Exception;
use Illuminate\Http\Request;

class ManajerController extends Controller
{
    public function getAllDataProyek(Request $request) {
        try {
            $user = $request->user();
            $karyawan = Karyawan::where('email', $user->email)->first();
            $divisi = $karyawan->divisi;

            if (!$divisi) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'User tidak memiliki divisi.'
                ], 404);
            }

            $data = $divisi->proyek()
                           ->latest()
                           ->get();

            return response()->json([
                'status' => 'success',
                'data' => [
                    'proyek' => $data,
                    'jumlah' => $data->count() ?? 0
                ]
            ]);
        } catch(Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat mengambil data.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function ProyekInProgress(Request $request) {
        try {
            $user = $request->user();
            $karyawan = Karyawan::where('email', $user->email)->first();
            $divisi = $karyawan->divisi;

            if (!$divisi) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'User tidak memiliki divisi.'
                ], 404);
            }

            $data = $divisi->proyek()
                           ->where('status', 'in-progress')
                           ->latest()
                           ->get();

            return response()->json([
                'status' => 'success',
                'data' => [
                    'proyek' => $data,
                    'jumlah' => $data->count() ?? 0
                ]
            ]);

        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat mengambil data.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function ProyekDone(Request $request) {
        try {
            $user = $request->user();
            // dd($user);

            $karyawan = Karyawan::where('email', $user->email)->first();

            $divisi = $karyawan->divisi;


            if (!$divisi) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'User tidak memiliki divisi.'
                ], 404);
            }

            $data = $divisi->proyek()
                           ->where('status', 'done')
                           ->latest()
                           ->get();

            return response()->json([
                'status' => 'success',
                'data' => [
                    'proyek' => $data,
                    'jumlah' => $data->count() ?? 0
                ]
            ]);

        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat mengambil data.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getProyekById(Request $request, $id) {
        try {
            $user = $request->user();
            $karyawan = Karyawan::where('email', $user->email)->first();
            $divisi = $karyawan->divisi;

            if (!$divisi) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'User tidak memiliki divisi.'
                ], 404);
            }

            try {
                $data = $divisi->proyek()->find($id);

                if (!$data) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Data proyek tidak ditemukan.'
                    ], 404);
                }

                return response()->json([
                    'status' => 'success',
                    'data' => [
                        'proyek' => $data,
                        'jumlah' => 1 // karena ini ambil 1 data berdasarkan ID
                    ]
                ]);
            } catch (Exception $e) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Terjadi kesalahan saat mengambil data.',
                    'error' => $e->getMessage()
                ], 500);
            }

        } catch(Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat mengambil data.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

<?php

namespace App\Http\Controllers\ApiMobile;

use App\Http\Controllers\Controller;
use App\Models\Karyawan;
use App\Models\Proyek;
use Exception;
use GuzzleHttp\Handler\Proxy;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

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

    public function addProyek(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                "nama_proyek" => "required|string",
                "deskripsi_proyek" => "required|string",
                "tenggat_waktu" => "required|date",
                "tanggal_mulai" => "required|date"
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => $validator->errors()->messages()
                ], 422);
            }

            $validated = $validator->validated();

            $karyawan = Karyawan::find($request->user()->id);

            if (!$karyawan || !$karyawan->id_divisi) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Divisi tidak ditemukan untuk karyawan ini.'
                ], 404);
            }

            $proyek = Proyek::create([
                'id_divisi' => $karyawan->id_divisi,
                'nama_proyek' => $validated['nama_proyek'],
                'deskripsi_proyek' => $validated['deskripsi_proyek'],
                'tanggal_mulai' => $validated['tanggal_mulai'],
                'tenggat_waktu' => $validated['tenggat_waktu'],
                'progress' => 0,
                'status' => 'pending',
                'tanggal_selesai' => null
            ]);

            return response()->json([
                'status' => 'success',
                'data' => $proyek
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat menambah data.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    

}

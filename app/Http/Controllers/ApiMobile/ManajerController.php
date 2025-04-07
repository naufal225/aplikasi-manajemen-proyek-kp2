<?php

namespace App\Http\Controllers\ApiMobile;

use App\Http\Controllers\Controller;
use App\Models\Karyawan;
use App\Models\Proyek;
use App\Models\Tugas;
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

    public function getTugasByIdProyek(Request $request, $id) {
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

                // Ambil tugas dengan relasi karyawan
                $tugas = $data->tugas()->with('karyawan')->get();

                // Ubah format tugas agar menyertakan info karyawan
                $tugasFormatted = $tugas->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'id_proyek' => $item->id_proyek,
                        'id_karyawan' => $item->id_karyawan,
                        'nama_tugas' => $item->nama_tugas,
                        'deskripsi_tugas' => $item->deskripsi_tugas,
                        'tenggat_waktu' => $item->tenggat_waktu,
                        'status' => $item->status,
                        'created_at' => $item->created_at,
                        'updated_at' => $item->updated_at,
                        'karyawan' => $item->karyawan ? [
                            'id' => $item->karyawan->id,
                            'nama' => $item->karyawan->nama_lengkap,
                            'email' => $item->karyawan->email,
                            'username' => $item->karyawan->username
                        ] : null
                    ];
                });

                return response()->json([
                    'status' => 'success',
                    'data' => [
                        'tugas' => $tugasFormatted,
                        'jumlah' => $tugas->count()
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

    public function updateDataProyek(Request $request, $id)
{
    try {
        $validator = Validator::make($request->all(), [
            "nama_proyek" => "required|string",
            "deskripsi_proyek" => "required|string",
            "tenggat_waktu" => "required|date",
            "tanggal_mulai" => "required|date",
            "status" => "required|in:pending,in-progress,waiting-for-review,done"
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

        $proyek = Proyek::find($id);

        if (!$proyek) {
            return response()->json([
                'status' => 'error',
                'message' => 'Proyek tidak ditemukan.'
            ], 404);
        }

        $proyek->update([
            'id_divisi' => $karyawan->id_divisi,
            'nama_proyek' => $validated['nama_proyek'],
            'deskripsi_proyek' => $validated['deskripsi_proyek'],
            'tanggal_mulai' => $validated['tanggal_mulai'],
            'tenggat_waktu' => $validated['tenggat_waktu'],
            'status' => $validated['status'],
        ]);

        return response()->json([
            'status' => 'success',
            'data' => $proyek->refresh()
        ]);
    } catch (Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Terjadi kesalahan saat memperbarui data.',
            'error' => $e->getMessage()
        ], 500);
    }
}

    public function addTugas(Request $request, $id_proyek) {
        try {
            $validator = Validator::make($request->all(), [
                "nama_tugas" => "required|string",
                "deskripsi_tugas" => "required|string",
                "tenggat_waktu" => "required|date",
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

            $tugas = Tugas::create([
                'id_divisi' => $karyawan->id_divisi,
                'id_proyek' => $id_proyek,
                'nama_tugas' => $validated['nama_tugas'],
                'deskripsi_tugas' => $validated['deskripsi_proyek'],
                'tenggat_waktu' => $validated['tenggat_waktu'],
                'status' => 'pending',
            ]);

            return response()->json([
                'status' => 'success',
                'data' => $tugas
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

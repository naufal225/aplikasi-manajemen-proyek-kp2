<?php

namespace App\Http\Controllers\ApiMobile;

use App\Http\Controllers\Controller;
use App\Models\Karyawan;
use App\Models\Notifikasi;
use App\Models\Proyek;
use App\Models\ReviewProyek;
use App\Models\Tugas;
use Exception;
use GuzzleHttp\Handler\Proxy;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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

    public function getTugasByIdTugas(Request $request, $id)
{
    try {
        $user = $request->user();
        $karyawan = Karyawan::where('email', $user->email)->first();

        if (!$karyawan || !$karyawan->id_divisi) {
            return response()->json([
                'status' => 'error',
                'message' => 'User tidak memiliki divisi.'
            ], 404);
        }

        // Ambil tugas dengan relasi proyek dan karyawan
        $tugas = Tugas::with(['karyawan', 'proyek'])
            ->where('id', $id)
            ->first();

        if (!$tugas) {
            return response()->json([
                'status' => 'error',
                'message' => 'Tugas tidak ditemukan.'
            ], 404);
        }

        // Pastikan tugas ini berasal dari proyek dalam divisi user
        if ($tugas->proyek->id_divisi !== $karyawan->id_divisi) {
            return response()->json([
                'status' => 'error',
                'message' => 'Tugas tidak termasuk dalam divisi Anda.'
            ], 403);
        }

        // Format data tugas
        $formatted = [
            'id' => $tugas->id,
            'id_proyek' => $tugas->id_proyek,
            'id_karyawan' => $tugas->id_karyawan,
            'nama_tugas' => $tugas->nama_tugas,
            'deskripsi_tugas' => $tugas->deskripsi_tugas,
            'tenggat_waktu' => $tugas->tenggat_waktu,
            'status' => $tugas->status,
            'created_at' => $tugas->created_at,
            'updated_at' => $tugas->updated_at,
            'karyawan' => $tugas->karyawan ? [
                'id' => $tugas->karyawan->id,
                'nama' => $tugas->karyawan->nama_lengkap,
                'email' => $tugas->karyawan->email,
                'username' => $tugas->karyawan->username
            ] : null
        ];

        return response()->json([
            'status' => 'success',
            'data' => $formatted
        ]);
    } catch (Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Terjadi kesalahan saat mengambil data.',
            'error' => $e->getMessage()
        ], 500);
    }
}

public function getTugasByIdTugasWithBukti(Request $request, $id)
{
    try {
        $user = $request->user();
        $karyawan = Karyawan::where('email', $user->email)->first();

        if (!$karyawan || !$karyawan->id_divisi) {
            return response()->json([
                'status' => 'error',
                'message' => 'User tidak memiliki divisi.'
            ], 404);
        }

        // Ambil tugas dengan relasi proyek dan karyawan
        $tugas = Tugas::with(['karyawan', 'proyek'])
            ->where('id', $id)
            ->first();

        if (!$tugas) {
            return response()->json([
                'status' => 'error',
                'message' => 'Tugas tidak ditemukan.'
            ], 404);
        }

        // Pastikan tugas ini berasal dari proyek dalam divisi user
        if ($tugas->proyek->id_divisi !== $karyawan->id_divisi) {
            return response()->json([
                'status' => 'error',
                'message' => 'Tugas tidak termasuk dalam divisi Anda.'
            ], 403);
        }

        // Format data tugas
        $formatted = [
            'id' => $tugas->id,
            'id_proyek' => $tugas->id_proyek,
            'id_karyawan' => $tugas->id_karyawan,
            'nama_tugas' => $tugas->nama_tugas,
            'deskripsi_tugas' => $tugas->deskripsi_tugas,
            'tenggat_waktu' => $tugas->tenggat_waktu,
            'path_file_bukti_tugas' => $tugas->fileBukti->path_file ?? null,
            'status' => $tugas->status,
            'created_at' => $tugas->created_at,
            'updated_at' => $tugas->updated_at,
            'karyawan' => $tugas->karyawan ? [
                'id' => $tugas->karyawan->id,
                'nama' => $tugas->karyawan->nama_lengkap,
                'email' => $tugas->karyawan->email,
                'username' => $tugas->karyawan->username
            ] : null
        ];

        return response()->json([
            'status' => 'success',
            'data' => $formatted
        ]);
    } catch (Exception $e) {
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
                "id_karyawan" => "required|exists:karyawan,id"
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

            $karyawanTugas = Karyawan::find($request->id_karyawan);

            if (!$karyawanTugas || !$karyawanTugas->id_divisi) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Divisi tidak ditemukan untuk karyawan ini untuk tugas.'
                ], 404);
            }

            $tugas = Tugas::create([
                'id_divisi' => $karyawan->id_divisi,
                'id_proyek' => $id_proyek,
                'id_karyawan' => $validated['id_karyawan'],
                'nama_tugas' => $validated['nama_tugas'],
                'deskripsi_tugas' => $validated['deskripsi_tugas'],
                'tenggat_waktu' => $validated['tenggat_waktu'],
                'status' => 'pending',
            ]);

            $this->hitungUlangProgressProyek($id_proyek);

            Notifikasi::create([
                'judul' => 'Penugasan',
                'pesan' => 'Anda ditugaskan ke tugas ' . $validated['nama_tugas'],
                'target' => 'karyawan',
                'id_target' => $validated['id_karyawan']
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

    public function updateTugas(Request $request, $id_tugas) {
        try {
            // Validasi input
            $validator = Validator::make($request->all(), [
                "nama_tugas" => "required|string",
                "deskripsi_tugas" => "required|string",
                "tenggat_waktu" => "required|date",
                "id_karyawan" => "required|exists:karyawan,id"
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => $validator->errors()->messages()
                ], 422);
            }

            $validated = $validator->validated();

            // Ambil data karyawan (yang sedang login sebagai manajer, misalnya)
            $karyawanLogin = Karyawan::find($request->user()->id);
            if (!$karyawanLogin || !$karyawanLogin->id_divisi) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Divisi tidak ditemukan untuk karyawan login.'
                ], 404);
            }

            // Ambil data karyawan yang ditugaskan
            $karyawanTugas = Karyawan::find($validated['id_karyawan']);
            if (!$karyawanTugas || !$karyawanTugas->id_divisi) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Divisi tidak ditemukan untuk karyawan yang ditugaskan.'
                ], 404);
            }

            // Ambil tugas yang akan diupdate
            $tugas = Tugas::find($id_tugas);
            if (!$tugas) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Tugas tidak ditemukan.'
                ], 404);
            }

            // Update tugas
            $tugas->update([
                'id_divisi' => $karyawanLogin->id_divisi,
                'id_karyawan' => $validated['id_karyawan'],
                'nama_tugas' => $validated['nama_tugas'],
                'deskripsi_tugas' => $validated['deskripsi_tugas'],
                'tenggat_waktu' => $validated['tenggat_waktu'],
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Tugas berhasil diperbarui.',
                'data' => $tugas->fresh() // ambil data terbaru setelah update
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat mengupdate data.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updateStatusTugas(Request $request, $id_tugas) {
        try {
            // Validasi input
            $validator = Validator::make($request->all(), [
                "status" => "required|string|in:pending,in-progress,waiting_for_review,done",
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => $validator->errors()->messages()
                ], 422);
            }

            $validated = $validator->validated();

            // Ambil tugas yang akan diupdate
            $tugas = Tugas::find($id_tugas);
            if (!$tugas) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Tugas tidak ditemukan.'
                ], 404);
            }

            // Update tugas
            $tugas->update([
                "status" => $validated['status']
            ]);

            $this->hitungUlangProgressProyek($tugas->proyek->id);

            return response()->json([
                'status' => 'success',
                'message' => 'Tugas berhasil diperbarui.',
                'data' => $tugas->fresh() // ambil data terbaru setelah update
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat mengupdate data.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updateStatusProyek(Request $request, $id_proyek) {
        try {
            // Validasi input
            $validator = Validator::make($request->all(), [
                "status" => "required|string|in:pending,in-progress,waiting_for_review,done",
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => $validator->errors()->messages()
                ], 422);
            }

            $validated = $validator->validated();

            // Ambil proyek yang akan diupdate
            $proyek = Proyek::find($id_proyek);
            if (!$proyek) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Proyek tidak ditemukan.'
                ], 404);
            }

            if($validated['status'] == "waiting_for_review") {
                ReviewProyek::create([
                    'id_proyek' => $id_proyek,
                ]);
            }

            // Update tugas
            $proyek->update([
                "status" => $validated['status']
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Proyek berhasil diperbarui.',
                'data' => $proyek->fresh() // ambil data terbaru setelah update
            ]);
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat mengupdate data.',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    public function getAllDataKaryawanByDivisi(Request $request) {
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

            $data = $divisi->karyawan()
                           ->latest()
                           ->get();

            return response()->json([
                'status' => 'success',
                'data' => [
                    'karyawan' => $data,
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

    public function createNotification(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'judul' => 'required|string|max:255',
            'pesan' => 'nullable|string',
            'target' => 'required|in:karyawan,divisi',
            'id_target' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $notif = Notifikasi::create([
            'judul' => $request->judul,
            'pesan' => $request->pesan,
            'target' => $request->target,
            'id_target' => $request->id_target,
            'dibaca' => false,
        ]);

        return response()->json([
            'message' => 'Notifikasi berhasil dibuat',
            'data' => $notif,
        ], 201);
    }

    private function hitungUlangProgressProyek($id_proyek) {
        $proyek = Proyek::find($id_proyek);

        if (!$proyek) return;

        $totalTugas = Tugas::where('id_proyek', $id_proyek)->count();
        $tugasSelesai = Tugas::where('id_proyek', $id_proyek)->where('status', 'done')->count();

        $progress = $totalTugas > 0 ? round(($tugasSelesai / $totalTugas) * 100) : 0;

        $proyek->update([
            'progress' => $progress
        ]);
    }

    public function getAllDataNotification(Request $request)
{
    $user = $request->user();

    $notifikasi = Notifikasi::where(function ($query) use ($user) {
        $query->where(function ($q) use ($user) {
            $q->where('target', 'divisi')
              ->where('id_target', $user->division_id);
        })->orWhere(function ($q) use ($user) {
            $q->where('target', 'karyawan')
              ->where('id_target', $user->id);
        });
    })
    ->orderBy('created_at', 'desc')
    ->get();

    return response()->json([
        'status' => 'success',
        'data' => $notifikasi
    ]);
}

}

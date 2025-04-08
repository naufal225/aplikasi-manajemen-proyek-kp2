<?php

namespace App\Http\Controllers\Admin;

use App\Exports\ProyekExport;
use App\Http\Controllers\Controller;
use App\Models\Proyek;
use App\Models\ReviewProyek;
use App\Models\Tugas;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Maatwebsite\Excel\Facades\Excel;

class KelolaDataProyekAdminController extends Controller
{
    public function getAllDataProyek() {
        $proyek = Proyek::with(['divisi:id,nama_divisi'])
            ->latest()
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $proyek
        ]);
    }

    public function storeDataProyek(Request $request) {
        $validator = Validator::make($request->all(), [
            'nama_proyek' => 'required|string|max:255',
            'deskripsi_proyek' => 'nullable|string',
            'status' => 'required|string|in:pending,in-progress',
            'tanggal_mulai' => 'required|date',
            'tenggat_waktu' => 'required|date',
            'id_divisi' => 'required|exists:divisi,id'
        ], [
            'nama_proyek.required' => 'Nama proyek wajib diisi.',
            'nama_proyek.string' => 'Nama proyek harus berupa teks.',
            'nama_proyek.max' => 'Nama proyek tidak boleh lebih dari 255 karakter.',

            'deskripsi_proyek.string' => 'Deskripsi proyek harus berupa teks.',

            'status.required' => 'Status proyek wajib diisi.',
            'status.string' => 'Status proyek harus berupa teks.',
            'status.in' => 'Status proyek harus salah satu dari: pending atau in-progress.',

            'tanggal_mulai.required' => 'Tanggal mulai proyek wajib diisi.',
            'tanggal_mulai.date' => 'Tanggal mulai proyek harus berupa tanggal yang valid.',

            'tenggat_waktu.required' => 'Tenggat waktu proyek wajib diisi.',
            'tenggat_waktu.date' => 'Tenggat waktu proyek harus berupa tanggal yang valid.',

            'id_divisi.required' => 'Nama divisi harus dipilih',
            'id_divisi.exists' => 'Nama divisi harus ada'
        ]);


        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal. Silakan periksa kembali input Anda.',
                'errors' => $validator->errors()->messages()
            ], 400);
        }

        $validated = $validator->validated();
        $proyek = Proyek::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Proyek baru berhasil ditambahkan.',
            'data' => $proyek
        ], 201);
    }

    public function updateDataProyek(Request $request, $id_proyek) {

        // Ambil proyek setelah validasi
        $proyek = Proyek::findOrFail($id_proyek);

        if(!$proyek) {
            return response()->json([
                'status' => 'error',
                'message' => 'Proyek tidak ditemukan.',
            ], 400);
        }

        // Validasi input terlebih dahulu
        $validator = Validator::make($request->all(), [
            'nama_proyek' => 'required|string|max:255',
            'deskripsi_proyek' => 'nullable|string',
            'status' => 'required|string|in:pending,in-progress',
            'tanggal_mulai' => 'required|date',
            'tenggat_waktu' => 'required|date',
            'id_divisi' => 'required|exists:divisi,id'
        ], [
            'nama_proyek.required' => 'Nama proyek wajib diisi.',
            'nama_proyek.string' => 'Nama proyek harus berupa teks.',
            'nama_proyek.max' => 'Nama proyek tidak boleh lebih dari 255 karakter.',

            'deskripsi_proyek.string' => 'Deskripsi proyek harus berupa teks.',

            'status.required' => 'Status proyek wajib diisi.',
            'status.string' => 'Status proyek harus berupa teks.',
            'status.in' => 'Status proyek harus salah satu dari: pending atau in-progress.',

            'tanggal_mulai.required' => 'Tanggal mulai proyek wajib diisi.',
            'tanggal_mulai.date' => 'Tanggal mulai proyek harus berupa tanggal yang valid.',

            'tenggat_waktu.required' => 'Tenggat waktu proyek wajib diisi.',
            'tenggat_waktu.date' => 'Tenggat waktu proyek harus berupa tanggal yang valid.',

            'id_divisi.required' => 'Nama divisi harus dipilih.',
            'id_divisi.exists' => 'Nama divisi harus ada.'
        ]);

        // Jika validasi gagal
        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal. Silakan periksa kembali input Anda.',
                'errors' => $validator->errors()->messages()
            ], 400);
        }

        // Perbarui data proyek
        $proyek->update($validator->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'Proyek berhasil diperbarui.',
            'data' => $proyek->refresh()
        ], 200);
    }

    public function deleteDataProyek(Request $request) {
        $validator = Validator::make($request->all(), [
            'id_proyek' => 'required|exists:proyek,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal. Silakan periksa kembali input Anda.',
                'errors' => $validator->errors()
            ], 400);
        }

        // Ambil data karyawan
        $proyek = Proyek::find($request->id_proyek);

        if (!$proyek) {
            return response()->json([
                'status' => 'error',
                'message' => 'Proyek tidak ditemukan.'
            ], 404);
        }

        // Hapus proyek
        $proyek->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Proyek berhasil dihapus.'
        ], 200);
    }

    public function getProyekById($id_proyek) {
        // Ambil proyek berdasarkan ID dengan relasi divisi (hanya ambil ID & nama_divisi)
        $proyek = Proyek::with(['divisi:id,nama_divisi'])
            ->findOrFail($id_proyek); // Langsung pakai findOrFail untuk error otomatis

        return response()->json([
            'status' => 'success',
            'data' => $proyek
        ]);
    }

    public function sendReview(Request $request, $id_proyek)
    {
        $proyek = Proyek::findOrFail($id_proyek);

        // Cek apakah proyek sudah "waiting_for_review"
        if ($proyek->status !== 'waiting_for_review') {
            return response()->json(['message' => 'Proyek belum siap untuk direview.'], 400);
        }

        // Cek apakah sudah ada pengajuan sebelumnya
        $existingReview = ReviewProyek::where('id_proyek', $id_proyek)->first();
        if ($existingReview) {
            return response()->json(['message' => 'Proyek sudah dalam proses review.'], 400);
        }

        // Buat pengajuan review baru
        $review = ReviewProyek::create([
            'id_proyek' => $id_proyek,
            'id_admin' => null,  // Belum direview
            'hasil_review' => null,
            'catatan' => null,
        ]);

        return response()->json(['status' => 'success','message' => 'Pengajuan review berhasil dikirim.', 'review' => $review], 201);
    }

    public function giveReview(Request $request)
    {
        $request->validate([
            'hasil_review' => 'required|in:approved,rejected',
            'catatan' => 'nullable|string',
            'id_proyek' => 'required|integer',
        ]);

        $review = ReviewProyek::where('id_proyek', $request->id_proyek)->first();

        if(!$review) {
            return response()->json(['message' => 'Proyek belum diajukan untuk review'], 400);
        }

        // Pastikan review belum dinilai
        if ($review->hasil_review == "approved") {
            return response()->json(['message' => 'Review sudah diproses sebelumnya.'], 400);
        }

        $proyek = Proyek::find($request->id_proyek);

        if($request->hasil_review == "approved") {
            $proyek->update([
                'status' => 'done'
            ]);
        } else if($request->hasil_review == "rejected") {
            $proyek->update([
                'status' => 'in-progress'
            ]);
        }

        // Simpan hasil review
        $review->update([
            'id_admin' => auth()->id(),
            'hasil_review' => $request->hasil_review,
            'catatan' => $request->catatan,
        ]);

        // Ubah status proyek berdasarkan hasil review
        if ($request->hasil_review === 'approved') {
            $review->proyek->update(['status' => 'done']);
        } else {
            $review->proyek->update(['status' => 'in-progress']); // Bisa dikembalikan ke in-progress jika ditolak
        }

        return response()->json(['status' => 'success', 'message' => 'Review berhasil dikirim.', 'review' => $review]);
    }

    public function getTugasByIdProyek($id_proyek) {
        // Ambil semua tugas berdasarkan id_proyek
        $tugas = Tugas::where('id_proyek', $id_proyek)
            ->with([
                'karyawan.divisi', // Ambil data karyawan dan divisinya
                'fileBukti' // Ambil bukti pengerjaan tugas
            ])
            ->get();

        // Format response sesuai kebutuhan
        $response = $tugas->map(function ($tugas) {
            return [
                'id' => $tugas->id,
                'id_proyek' => $tugas->id_proyek,
                'nama_tugas' => $tugas->nama_tugas,
                'deskripsi' => $tugas->deskripsi_tugas,
                'status' => $tugas->status,
                'tanggal_mulai' => Carbon::parse($tugas['created_at'])->format('Y-m-d') ?? null,
                'tenggat_waktu' => $tugas->tenggat_waktu,
                'bukti_pengerjaan' => $tugas->fileBukti->path_file ?? null,
                'bukti_type' => $tugas->fileBukti->mime_type ?? null,
                'penanggung_jawab' => $tugas->karyawan ? [
                    'id' => $tugas->karyawan->id,
                    'nama_lengkap' => $tugas->karyawan->nama,
                    'divisi' => [
                        'id' => $tugas->karyawan->divisi->id,
                        'nama_divisi' => $tugas->karyawan->divisi->nama_divisi,
                    ],
                ] : null,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $response
        ]);
    }

    public function exportDataProyek(Request $request)
    {
        $tanggal_awal = $request->tanggal_awal;
        $tanggal_akhir = $request->tanggal_akhir;

        return Excel::download(new ProyekExport($tanggal_awal, $tanggal_akhir), 'Laporan_Proyek.xlsx');
    }


}

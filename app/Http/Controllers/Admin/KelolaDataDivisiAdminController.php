<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Divisi;
use App\Models\Karyawan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class KelolaDataDivisiAdminController extends Controller
{
    public function getAllDataDivisi() {
        $divisi = Divisi::latest()->get();

        $data = [];

        foreach( $divisi as $item) {
            $data[] = [
                'id' => $item->id,
                'nama_divisi' => $item->nama_divisi,
                'jumlah_karyawan' => $item->karyawan->count(),
                'nama_manajer' => $item->manajer->nama_lengkap ?? null,
                'deskripsi' => $item->deskripsi,
                'id_manajer' => $item->manajer->id ?? null,
                'jumlah_proyek' => $item->proyek->count()
            ];
        }

        return response()->json([
            'status' => 'success',
            'data' => $data
        ]);
    }

    public function getAllDataKaryawanForDivisi() {
        $karyawan = Karyawan::with(['divisi.manajer', 'divisi.karyawan', 'divisi.proyek'])
            ->latest()
            ->get();

        $data = $karyawan->map(function ($item) {
            return [
                'id' => $item->id,
                'nama_karyawan' => $item->nama_lengkap,
                'divisi' => $item->divisi ? [
                    'id' => $item->divisi->id,
                    'nama_divisi' => $item->divisi->nama_divisi,
                    'jumlah_karyawan' => $item->divisi->karyawan->count(),
                    'nama_manajer' => $item->divisi->manajer->nama_lengkap ?? null,
                    'deskripsi' => $item->divisi->deskripsi,
                    'id_manajer' => $item->divisi->manajer->id ?? null,
                    'jumlah_proyek' => $item->divisi->proyek->count()
                ] : null,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $data
        ]);
    }

    public function storeDataDivisi(Request $request) {
        // Validasi request dengan pesan dalam bahasa Indonesia
        $validator = Validator::make($request->all(), [
            'nama_divisi' => 'required|string|max:255',
            'deskripsi' => 'nullable|string'
        ], [
            'nama_divisi.required' => 'Nama divisi wajib diisi.',
            'nama_divisi.string' => 'Nama divisi harus berupa teks.',
            'nama_divisi.max' => 'Nama divisi tidak boleh lebih dari 255 karakter.',
            'deskripsi.string' => 'Deskripsi harus berupa teks.'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal. Silakan periksa kembali input Anda.',
                'errors' => $validator->errors()->messages()
            ], 400);
        }

        // Simpan data divisi
        $validated = $validator->validated();
        $divisi = Divisi::create([
            'nama_divisi' => $validated['nama_divisi'],
            'deskripsi' => $validated['deskripsi'] ?? null // Gunakan null jika tidak ada input
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Divisi berhasil ditambahkan.',
            'data' => $divisi
        ], 201);
    }

    public function updateDataDivisi(Request $request) {
        // Validasi request dengan pesan dalam bahasa Indonesia
        $validator = Validator::make($request->all(), [
            'id_divisi' => 'required|exists:divisi,id',
            'nama_divisi' => 'required|string|min:2',
            'deskripsi' => 'nullable|string',
            'id_manajer' => 'nullable|exists:karyawan,id',
        ], [
            'id_divisi.required' => 'ID divisi wajib diisi.',
            'id_divisi.exists' => 'Divisi yang dipilih tidak ditemukan.',
            'nama_divisi.required' => 'Nama divisi wajib diisi.',
            'nama_divisi.string' => 'Nama divisi harus berupa teks.',
            'nama_divisi.max' => 'Nama divisi tidak boleh lebih dari 255 karakter.',
            'deskripsi.string' => 'Deskripsi harus berupa teks.',
            'id_manajer.exists' => 'Manajer tidak ditemukan dalam data karyawan.'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal. Silakan periksa kembali input Anda.',
                'errors' => $validator->errors()
            ], 400);
        }

        // Cari divisi berdasarkan ID
        $divisi = Divisi::find($request->id_divisi);

        if (!$divisi) {
            return response()->json([
                'status' => 'error',
                'message' => 'Divisi tidak ditemukan.',
            ], 404);
        }

        // Cek apakah id_manajer ada dalam request
        if ($request->filled('id_manajer')) {
            $manajer = Karyawan::find($request->id_manajer);

            if ($manajer && !$manajer->id_divisi) {
                // Jika karyawan belum memiliki divisi, masukkan ke divisi ini
                $manajer->update(['id_divisi' => $request->id_divisi]);
            }
        }

        // Perbarui data divisi
        $divisi->update([
            'nama_divisi' => $request->nama_divisi,
            'deskripsi' => $request->deskripsi ?? null,
            'id_manajer' => $request->id_manajer
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Divisi berhasil diperbarui.',
            'data' => $divisi
        ], 200);
    }

    public function deleteDivisi(Request $request) {
        $validator = Validator::make($request->all(), [
            'id_divisi' => 'required|exists:divisi,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal. Silakan periksa kembali input Anda.',
                'errors' => $validator->errors()
            ], 400);
        }

        // Ambil data divisi
        $divisi = Divisi::find($request->id_divisi);

        if (!$divisi) {
            return response()->json([
                'status' => 'error',
                'message' => 'Divisi tidak ditemukan.'
            ], 404);
        }

        // Cek apakah divisi masih memiliki karyawan atau proyek
        if ($divisi->karyawan()->count() > 0 || $divisi->proyek()->count() > 0) {
            return response()->json([
                'status' => 'error',
                'message' => 'Divisi tidak bisa dihapus karena masih memiliki karyawan atau proyek yang terhubung.'
            ], 400);
        }

        // Hapus divisi
        $divisi->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Divisi berhasil dihapus.'
        ], 200);
    }


}

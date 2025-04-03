<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Proyek;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

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


}

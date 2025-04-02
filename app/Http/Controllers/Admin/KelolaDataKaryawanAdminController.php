<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Divisi;
use App\Models\Karyawan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use App\Imports\KaryawanImport;
use Illuminate\Support\Facades\Response;
use Maatwebsite\Excel\Facades\Excel;
use Maatwebsite\Excel\Validators\ValidationException;

class KelolaDataKaryawanAdminController extends Controller
{
    public function getAllDataKaryawan() {
        $karyawan = Karyawan::with('divisi')->latest()->get();

        $data = $karyawan->map(function($item) {
            return [
                'id' => $item->id,
                'nama_lengkap' => $item->nama_lengkap,
                'divisi' => $item->divisi ? [
                    'id' => $item->divisi->id,
                    'nama_divisi' => $item->divisi->nama_divisi,
                    'jumlah_karyawan' => $item->divisi->karyawan->count(),
                    'nama_manajer' => $item->divisi->manajer->nama_lengkap ?? null,
                    'deskripsi' => $item->divisi->deskripsi,
                    'id_manajer' => $item->divisi->manajer->id ?? null,
                    'jumlah_proyek' => $item->divisi->proyek->count()
                ] : null,
                'email' => $item->email,
                'alamat' => $item->alamat,
                'jenis_kelamin' => $item->jenis_kelamin,
                'nomor_telepon' => $item->nomor_telepon,
                'username' => $item->username,
                'tanggal_lahir' => $item->tanggal_lahir
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $data
        ]);

    }

    public function showDataKaryawan() {

    }

    public function createDataKaryawan() {

    }

    public function storeDataKaryawan(Request $request) {
        // Validasi request dengan pesan dalam bahasa Indonesia
        $validator = Validator::make($request->all(), [
            'nama_lengkap' => 'required|string|max:255',
            'id_divisi' => 'required|integer|exists:divisi,id',
            'email' => 'required|email|max:255|unique:users,email',
            'alamat' => 'required|string|max:500',
            'nomor_telepon' => 'required|string|regex:/^\+?\d{10,15}$/',
            'jenis_kelamin' => 'required|in:LAKI-LAKI,PEREMPUAN',
            'username' => 'required|string|max:255|unique:users,username',
            'password' => 'required|string|min:8',
            'tanggal_lahir' => 'required|date',
        ], [
            'nama_lengkap.required' => 'Nama lengkap wajib diisi.',
            'nama_lengkap.string' => 'Nama lengkap harus berupa teks.',
            'nama_lengkap.max' => 'Nama lengkap tidak boleh lebih dari 255 karakter.',
            'id_divisi.required' => 'Divisi wajib dipilih.',
            'id_divisi.integer' => 'ID divisi harus berupa angka.',
            'id_divisi.exists' => 'Divisi yang dipilih tidak valid.',
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.max' => 'Email tidak boleh lebih dari 255 karakter.',
            'email.unique' => 'Email sudah digunakan, silakan gunakan email lain.',
            'alamat.required' => 'Alamat wajib diisi.',
            'alamat.string' => 'Alamat harus berupa teks.',
            'alamat.max' => 'Alamat tidak boleh lebih dari 500 karakter.',
            'nomor_telepon.required' => 'Nomor telepon wajib diisi.',
            'nomor_telepon.string' => 'Nomor telepon harus berupa teks.',
            'nomor_telepon.regex' => 'Format nomor telepon tidak valid.',
            'jenis_kelamin.required' => 'Jenis kelamin wajib dipilih.',
            'jenis_kelamin.in' => 'Jenis kelamin harus Laki-laki atau Perempuan.',
            'username.required' => 'Username wajib diisi.',
            'username.string' => 'Username harus berupa teks.',
            'username.max' => 'Username tidak boleh lebih dari 255 karakter.',
            'username.unique' => 'Username sudah digunakan, silakan gunakan username lain.',
            'password.required' => 'Password wajib diisi.',
            'password.string' => 'Password harus berupa teks.',
            'password.min' => 'Password minimal harus 8 karakter.',
            'tanggal_lahir.required' => 'Tanggal lahir wajib diisi.',
            'tanggal_lahir.date' => 'Format tanggal lahir tidak valid.',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal. Silakan periksa kembali input Anda.',
                'errors' => $validator->errors()->messages()
            ], 400);
        }


        // Simpan data karyawan
        $validated = $validator->validated();

        // Enkripsi password sebelum menyimpan ke database
        $validated['password'] = Hash::make($validated['password']);

        $karyawan = Karyawan::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Karyawan berhasil ditambahkan.',
            'data' => $karyawan
        ], 201);
    }

    public function updateDataKaryawan(Request $request, $id) {
        // Cari karyawan berdasarkan ID
        $karyawan = Karyawan::find($id);
        if (!$karyawan) {
            return response()->json([
                'status' => 'error',
                'message' => 'Karyawan tidak ditemukan.'
            ], 404);
        }

        // Validasi data
        $validator = Validator::make($request->all(), [
            'nama_lengkap' => 'required|string|max:255',
            'email' => 'required|string|email:dns|max:255|unique:users,email,' . $id,
            'username' => 'required|string|max:255|unique:users,username,' . $id,
            'jenis_kelamin' => 'required|string|in:LAKI-LAKI,PEREMPUAN',
            'nomor_telepon' => 'required|string',
            'alamat' => 'required|string',
            'tanggal_lahir' => 'required|date',
            'password' => 'nullable|string|min:8',
        ], [
            'nama_lengkap.required' => 'Nama lengkap wajib diisi.',
            'email.required' => 'Email wajib diisi.',
            'email.unique' => 'Email sudah digunakan oleh karyawan lain.',
            'username.required' => 'Username wajib diisi.',
            'username.unique' => 'Username sudah digunakan oleh karyawan lain.',
            'jenis_kelamin.required' => 'Jenis kelamin wajib diisi.',
            'nomor_telepon.required' => 'Nomor telepon wajib diisi.',
            'nomor_telepon.regex' => 'Nomor telepon hanya boleh berisi angka.',
            'alamat.required' => 'Alamat wajib diisi.',
            'tanggal_lahir.required' => 'Tanggal lahir wajib diisi.',
            'password.min' => 'Password minimal 8 karakter.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()->messages()
            ], 422);
        }

        // Ambil data yang sudah divalidasi
        $data = $validator->validated();

        // Jika password diisi, hash sebelum disimpan
        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        } else {
            unset($data['password']); // Jika kosong, jangan update password
        }

        // Update data karyawan
        $karyawan->update($data);

        return response()->json([
            'status' => 'success',
            'message' => 'Data karyawan berhasil diperbarui.',
            'data' => $karyawan->fresh()
        ]);
    }

    public function deleteKaryawan(Request $request) {
        $validator = Validator::make($request->all(), [
            'id_karyawan' => 'required|exists:karyawan,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal. Silakan periksa kembali input Anda.',
                'errors' => $validator->errors()
            ], 400);
        }

        // Ambil data karyawan
        $karyawan = Karyawan::find($request->id_karyawan);

        if (!$karyawan) {
            return response()->json([
                'status' => 'error',
                'message' => 'Karyawan tidak ditemukan.'
            ], 404);
        }

        // Hapus karyawan
        $karyawan->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Karyawan berhasil dihapus.'
        ], 200);
    }
    public function importDataKaryawan(Request $request)
    {
        // Validasi file yang di-upload
        $validator = Validator::make($request->all(), [
            'file' => 'required|mimes:xlsx,xls',
        ]);

        // Jika validasi gagal
        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'File excel harus dalam format .xlsx atau .xls.'
            ], 400);
        }

        try {
            // Check if file is empty
            if ($request->file('file')->getSize() === 0) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'File Excel kosong. Silakan pilih file yang berisi data.'
                ], 400);
            }

            // Proses import data karyawan
            Excel::import(new KaryawanImport, $request->file('file'));

            return response()->json([
                'status' => 'success',
                'message' => 'Data karyawan berhasil diimport.'
            ], 200);
        } catch (ValidationException $e) {
            // Tangani error validasi Excel
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            // Tangani kesalahan umum
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan pada sisi server: ' . $e->getMessage()
            ], 500);
        }
    }


    public function downloadTemplate()
    {
    // Tentukan path file template
        $templatePath = public_path('templates/template_karyawan.xlsx');

        // Cek apakah file ada
        if (file_exists($templatePath)) {
            return Response::download($templatePath);
        } else {
            return back()->with('error', 'Template tidak ditemukan!');
        }
    }



}

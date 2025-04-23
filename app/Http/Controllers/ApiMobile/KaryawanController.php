<?php

namespace App\Http\Controllers\ApiMobile;

use App\Http\Controllers\Controller;
use App\Models\Tugas;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use App\Models\FileBuktiPengerjaanTugas;
use App\Models\Notifikasi;
use App\Models\ReviewProyek;
use Illuminate\Support\Facades\Auth;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx\Rels;

class KaryawanController extends Controller
{
    public function uploadBuktiDanReviewTugas(Request $request, $id){
        try {
            $validator = Validator::make($request->all(), [
                'files' => 'required|array',
                'files.*' => 'image|mimes:jpeg,png,jpg|max:2048',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => $validator->errors()->messages(),
                ], 422);
            }

            $tugas = Tugas::findOrFail($id); // otomatis 404 kalau tidak ditemukan

            foreach ($request->file('files') as $file) {
                $originalName = $file->getClientOriginalName();
                $extension = $file->getClientOriginalExtension();
                $mimeType = $file->getMimeType();
                $size = $file->getSize();

                $uniqueFileName = time() . '_' . Str::random(10) . '.' . $extension;
                $path = $file->storeAs('bukti_tugas', $uniqueFileName, 'public');

                FileBuktiPengerjaanTugas::create([
                    'id_tugas' => $tugas->id,
                    'nama_file' => $originalName,
                    'path_file' => $path,
                    'mime_type' => $mimeType,
                    'ukuran_file' => $size,
                ]);
            }


            Notifikasi::create([
                "judul" => "Permintaan Review Tugas",
                "pesan" => $tugas->nama_tugas . " menunggu di review",
                "target" => "karyawan",
                "id_target" => $tugas->proyek->divisi->manajer->id
            ]);

            $tugas->update([
                'status' => 'waiting_for_review'
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Bukti tugas berhasil diupload.',
                'file_path' => Storage::url($path), // buat akses publik
            ], 201);

        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat mengunggah bukti tugas.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function uploadFotoProfil(Request $request)
{
    $request->validate([
        'foto' => 'required|image|mimes:jpg,jpeg,png|max:2048',
    ]);

    $karyawan = $request->user();


    if ($request->hasFile('foto')) {
        // Hapus foto lama jika ada
        if ($karyawan->url_foto_profil && file_exists(public_path('storage/' . $karyawan->url_foto_profil))) {
            unlink(public_path('storage/' . $karyawan->url_foto_profil));
        }

        $path = $request->file('foto')->store('foto_karyawan', 'public');
        $karyawan->url_foto_profil = $path;
        $karyawan->save();

        return response()->json([
            'status' => true,
            'message' => 'Foto profil berhasil diunggah',
            'data' => [
                'url_foto_profil' => asset('storage/' . $path),
            ]
        ]);
    }

    return response()->json([
        'status' => false,
        'message' => 'Tidak ada file yang diunggah'
    ], 400);
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

public function getAllDataNotification(Request $request)
{
    $user = $request->user();

    $notifikasi = Notifikasi::where(function ($query) use ($user) {
        $query->where(function ($q) use ($user) {
            $q->where('target', 'divisi')
              ->where('id_target', $user->id_divisi);
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

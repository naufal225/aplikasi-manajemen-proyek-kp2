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
use App\Models\ReviewProyek;

class KaryawanController extends Controller
{
    public function uploadBuktiDanReviewTugas(Request $request, $id){
        try {
            $validator = Validator::make($request->all(), [
                'file' => 'required|image|mimes:jpeg,png,jpg|max:2048',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => $validator->errors()->messages(),
                ], 422);
            }

            $tugas = Tugas::findOrFail($id); // otomatis 404 kalau tidak ditemukan

            $file = $request->file('file');
            $originalName = $file->getClientOriginalName();
            $extension = $file->getClientOriginalExtension();
            $mimeType = $file->getMimeType();
            $size = $file->getSize();

            // Generate nama unik
            $uniqueFileName = time() . '_' . Str::random(10) . '.' . $extension;

            // Simpan file ke storage/app/public/bukti_tugas
            $path = $file->storeAs('bukti_tugas', $uniqueFileName, 'public');

            // Catat ke DB
            FileBuktiPengerjaanTugas::create([
                'id_tugas' => $tugas->id,
                'nama_file' => $originalName,
                'path_file' => $path,
                'mime_type' => $mimeType,
                'ukuran_file' => $size,
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


}

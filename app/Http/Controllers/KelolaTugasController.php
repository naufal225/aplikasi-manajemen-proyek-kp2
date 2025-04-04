<?php

namespace App\Http\Controllers;

use App\Models\FileBuktiPengerjaanTugas;
use App\Models\Tugas;
use Illuminate\Http\Request;

class KelolaTugasController extends Controller
{
    public function sendReviewTugas(Request $request, $id_tugas) {
        $request->validate([
            'files.*' => 'required|file|max:10240|mimes:jpg,jpeg,png,pdf,doc,docx,zip', // Maks 10MB, hanya format tertentu
        ]);

        $tugas = Tugas::findOrFail($id_tugas);

        // Cek apakah tugas sudah selesai atau masih bisa direview
        if ($tugas->status !== 'waiting_for_review' && $tugas->status !== 'in-progress') {
            return response()->json(['message' => 'Tugas tidak dapat diajukan untuk review.'], 400);
        }

        $uploadedFiles = [];

        foreach ($request->file('files') as $file) {
            // Simpan file ke storage
            $path = $file->store('bukti_pengerjaan_tugas', 'public');

            // Simpan data ke database
            $bukti = FileBuktiPengerjaanTugas::create([
                'id_tugas' => $id_tugas,
                'id_user' => auth()->id(),
                'nama_file' => $file->getClientOriginalName(),
                'path_file' => $path,
                'mime_type' => $file->getMimeType(),
                'ukuran_file' => $file->getSize(),
            ]);

            $uploadedFiles[] = $bukti;
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Review berhasil diajukan!',
            'files' => $uploadedFiles
        ], 201);
    }
}

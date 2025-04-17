<?php

namespace App\Http\Controllers\ApiMobile;

use App\Http\Controllers\Controller;
use App\Models\Karyawan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class LoginController extends Controller
{
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'login' => 'required|string',
            'password' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()->messages()
            ], 422);
        }

        $validated = $validator->validated();

        // Cek apakah login pakai email atau username
        $field = filter_var($validated['login'], FILTER_VALIDATE_EMAIL) ? 'email' : 'username';

        // Cari karyawan berdasarkan field tersebut
        $karyawan = Karyawan::where($field, $validated['login'])->first();

        if(!$karyawan->divisi) {
            return response()->json([
                'status' => 'error',
                'message' =>"Pastikan user punya divisi sebelum menggunakan aplikasi."
            ], 422);
        }

        if (!$karyawan || !Hash::check($validated['password'], $karyawan->password)) {
            return response()->json([
                'status' => 'failed',
                'message' => 'Login gagal! Periksa kredensial Anda.'
            ], 401);
        }

        // Hapus token lama jika perlu (opsional)
        $karyawan->tokens()->delete();

        // Buat token baru
        $token = $karyawan->createToken('karyawan-token')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'token' => $token,
            'user' => $karyawan,
            'divisi' => $karyawan->divisi ?? null,
            'tipe' => $karyawan->isManajer()
        ]);
    }

    public function logout(Request $request)
{
    $user = $request->user(); // Mendapatkan user yang sedang login (autentikasi melalui Sanctum)

    if ($user) {
        $user->currentAccessToken()->delete(); // Hapus token saat ini saja (logout dari satu perangkat)
        return response()->json([
            'status' => true,
            'message' => 'Logout berhasil'
        ], 200);
    }

    return response()->json([
        'status' => false,
        'message' => 'User tidak ditemukan atau belum login'
    ], 401);
}


}

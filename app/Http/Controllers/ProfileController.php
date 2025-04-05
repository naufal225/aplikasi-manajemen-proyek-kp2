<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Validator;

use Illuminate\Support\Facades\Hash;

use Illuminate\Http\Request;

use Illuminate\Support\Facades\Storage;

use App\Models\User;


class ProfileController extends Controller
{

    public function updateProfile(Request $request) {
        $validator = Validator::make($request->all(), [
            'id' => 'required',
            'nama_lengkap' => 'required|string',
            'username' => 'required|string|unique:users,username,' . $request->id . ',id',
            'email' => 'required|email:dns|unique:users,email,' . $request->id, ',id',
            'nomor_telepon' => 'required|string|unique:users,nomor_telepon,' . $request->id, ',id',
            'alamat' => 'required|string',
            'tanggal_lahir' => 'required|date',
        ], [
            'nama_lengkap.required' => 'Nama lengkap wajib diisi.',
            'nama_lengkap.string' => 'Nama lengkap harus berupa teks.',

            'username.required' => 'Username wajib diisi.',
            'username.string' => 'Username harus berupa teks.',
            'username.unique' => 'Username sudah digunakan, silakan pilih yang lain.',

            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.string' => 'Email harus berupa teks.',

            'nomor_telepon.required' => 'Nomor telepon wajib diisi.',
            'nomor_telepon.string' => 'Nomor telepon harus berupa teks.',

            'alamat.required' => 'Alamat wajib diisi.',
            'alamat.string' => 'Alamat harus berupa teks.',

            'tanggal_lahir.required' => 'Tanggal lahir wajib diisi.',
            'tanggal_lahir.date' => 'Tanggal lahir harus berupa tanggal yang valid.',
        ]);

        if ($validator->fails()) {
            $errors = [];

            foreach($validator->errors()->messages() as $message) {
                $errors[] = $message;
            }

            return response()->json([
                'status' => 'error',
                'message' => $errors
            ]);
        }

        // Ambil data user berdasarkan ID
        $user = User::find($request->id);

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'User tidak ditemukan.'
            ], 404);
        }

        // Update data user
        $user->nama_lengkap = $request->nama_lengkap;
        $user->username = $request->username;
        $user->email = $request->email;
        $user->nomor_telepon = $request->nomor_telepon;
        $user->alamat = $request->alamat;
        $user->tanggal_lahir = $request->tanggal_lahir;

        // Simpan perubahan
        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Profil berhasil diperbarui.',
            'data' => $user
        ], 200);
    }

    public function updatePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|different:current_password',
            'confirm_password' => 'required|same:new_password'
        ], [
            'current_password.required' => 'Password saat ini wajib diisi.',
            'new_password.required' => 'Password baru wajib diisi.',
            'new_password.min' => 'Password baru minimal harus 8 karakter.',
            'new_password.different' => 'Password baru harus berbeda dengan password saat ini.',
            'confirm_password.required' => 'Konfirmasi password baru wajib diisi.',
            'confirm_password.same' => 'Konfirmasi password tidak cocok dengan password baru.'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => $validator->errors()->messages()
            ]);
        }

        // Misalnya user sudah login
        $user = auth()->user();

        // Cek apakah password saat ini cocok
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'status' => 'error',
                'message' => ['current_password' => ['Password saat ini salah.']]
            ], 401);
        }

        // Update password
        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Password berhasil diperbarui.'
        ]);
    }


    public function updateProfilePhoto(Request $request)
    {
        // Validasi request
        $validator = Validator::make($request->all(), [
            'id' => 'required|exists:users,id',
            'foto_profil' => 'required|image|mimes:jpeg,png,jpg|max:2048' // Maks 2MB
        ], [
            'id.required' => 'ID pengguna wajib diisi.',
            'id.exists' => 'Pengguna tidak ditemukan.',
            'foto_profil.required' => 'Foto profil wajib diunggah.',
            'foto_profil.image' => 'File harus berupa gambar.',
            'foto_profil.mimes' => 'Foto harus berformat jpeg, png, atau jpg.',
            'foto_profil.max' => 'Ukuran foto maksimal 2MB.',
        ]);

        if($validator->fails()) {
            $errors = [];
            foreach($validator->errors()->messages() as $message) {
                $errors[] = $message;
            }
            return response()->json([
                'status' => 'error',
                'message' => $errors
            ]);
        }

        // Ambil user
        $user = User::find($request->id);

        // Hapus foto lama jika ada dan bukan default
        if ($user->foto_profil && Storage::disk('public')->exists($user->foto_profil)) {
            Storage::disk('public')->delete($user->foto_profil);
        }

        // Simpan foto baru
        $path = $request->file('foto_profil')->store('foto_profil', 'public');

        // Update user
        $user->foto_profil = $path;
        $user->save();

        $filename = basename($path);

        return response()->json([
            'status' => 'success',
            'message' => 'Foto profil berhasil diperbarui.',
            'data' => [
                'foto_profil' => asset('storage/foto_profil/' . $filename)// URL lengkap ke gambar
            ]
        ]);
    }


}

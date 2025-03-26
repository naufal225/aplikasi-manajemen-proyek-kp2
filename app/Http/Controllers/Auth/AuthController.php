<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AuthController extends Controller
{
    public function index() {
        return Inertia::render('auth/login');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'login' => 'required|string',  // Bisa username atau email
            'password' => 'required|string',
        ]);

        // Cek apakah login menggunakan email atau username
        $field = filter_var($credentials['login'], FILTER_VALIDATE_EMAIL) ? 'email' : 'username';


        if (Auth::attempt([$field => $credentials['login'], 'password' => $credentials['password']])) {
            session()->regenerate();
            $user = Auth::user();

            if (!auth()->check()) {
                return response()->json(['error' => 'Auth attempt succeeded but user is not authenticated'], 500);
            }

            return redirect('/dashboard');
        }

        return response()->json([
            'status' => 'failed',
            'message' => 'Login gagal! Periksa kredensial Anda.'
        ], 401);
    }

    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();
        return response()->json([
            'success' => 'success',
            'message' => 'Logout berhasil!'
        ]);
    }
}

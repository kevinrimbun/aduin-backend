<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules\Password;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    // =========================================
    // REGISTER PENGGUNA BARU
    // =========================================

    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::min(8)],
        ]);

        // Mengambil nama depan
        $namaDepan = explode(' ', trim($data['name']))[0];

        // Mengubah menjadi huruf kecil
        $namaDepan = Str::lower(Str::slug($namaDepan, ''));

        // Membuat username dengan angka acak dan memastikan unik
        do {
            $username = $namaDepan . random_int(1000, 9999);
        } while (User::where('username', $username)->exists());

        $user = User::create([
            'name' => $data['name'],
            'username' => $username,
            'email' => $data['email'],
            'password' => $data['password'],
            'role' => 'masyarakat',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Registrasi berhasil. Silakan login.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->role,
            ],
        ], 201);
    }

    // =========================================
    // LOGIN PENGGUNA
    // =========================================


    
public function login(Request $request)
{
    $credentials = $request->validate([
        'email' => ['required', 'email'],
        'password' => ['required', 'string'],
    ]);

    if (!Auth::guard('web')->attempt($credentials)) {
        return response()->json([
            'success' => false,
            'message' => 'Email atau password salah.',
        ], 422);
    }

        $request->session()->regenerate();

        $user = Auth::guard('web')->user();

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->role,
            ],
        ], 200);
}


  
// public function login(Request $request)
// {
//     $credentials = $request->validate([
//         'email' => ['required', 'email'],
//         'password' => ['required', 'string'],
//     ]);

//     if (!Auth::guard('web')->attempt($credentials)) {
//         return response()->json([
//             'success' => false,
//             'message' => 'Email atau password salah.',
//         ], 422);
//     }

//     $request->session()->regenerate();

//     return response()->json([
//         'success' => true,
//         'message' => 'Login berhasil.',
//         'login' => Auth::guard('web')->check(),
//         'user_id' => Auth::guard('web')->id(),
//         'user' => Auth::guard('web')->user(),
//     ], 200);
// }


    // =========================================
    // MENGAMBIL DATA PENGGUNA LOGIN
    // =========================================

    public function user(Request $request)
    {
        $user = Auth::guard('web')->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Pengguna belum login.',
            ], 401);
        }

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'role' => $user->role,
            ],
        ], 200);
    }

    // =========================================
    // LOGOUT PENGGUNA
    // =========================================

    public function logout(Request $request)
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil.',
        ], 200);
    }
}

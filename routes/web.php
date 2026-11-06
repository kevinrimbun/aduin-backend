
<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

// ==========================================
// HALAMAN LOGIN DAN REGISTER (PUBLIK)
// ==========================================
Route::get("/login", function () {
    return view("home", ["page" => "login"]);
})
    ->middleware("guest")
    ->name("login");

Route::get("/register", function () {
    return view("home", ["page" => "register"]);
})
    ->middleware("guest")
    ->name("register");

// Beranda

// ==========================================
// PROSES AUTENTIKASI
// ==========================================

Route::post("/login", [AuthController::class, "login"])
    ->middleware("guest")
    ->name("login.process");

Route::post("/register", [AuthController::class, "register"])
    ->middleware("guest")
    ->name("register.process");

// ==========================================
// SEMUA HALAMAN WAJIB LOGIN
// ==========================================

Route::middleware("auth")->group(function () {
    // Beranda
    Route::get("/", function () {
        return view("home", ["page" => "beranda"]);
    })->name("beranda");
    
    // Pengaduan
    Route::get("/pengaduan", function () {
        return view("home", ["page" => "pengaduan"]);
    })->name("pengaduan");

    // Status Pengaduan
    Route::get("/status", function () {
        return view("home", ["page" => "status"]);
    })->name("status");

    // Riwayat Pengaduan
    Route::get("/riwayat", function () {
        return view("home", ["page" => "riwayat"]);
    })->name("riwayat");

    // Dashboard Masyarakat
    Route::get("/dashboard", function () {
        return view("home", ["page" => "dashboard_masyarakat"]);
    })->name("dashboard_masyarakat");

    // Dashboard Petugas
    Route::get("/dashboard-petugas", function () {
        return view("home", ["page" => "dashboard_petugas"]);
    })->name("dashboard_petugas");

    // // Informasi
    // Route::get('/informasi', function () {
    //     return view('home', ['page' => 'informasi']);
    // })->name('informasi');

    // Dashboard Admin
    Route::get('/dashboard-admin', function () {
        abort_unless(auth()->user()->role === 'admin', 403);

        return view('home', [
            'page' => 'dashboard_admin',
            'userName' => auth()->user()->name,
        ]);
    });

    // // Peta
    // Route::get('/peta', function () {
    //     return view('home', ['page' => 'peta']);
    // })->name('peta');

    // Data pengguna yang sedang login
    Route::get("/auth/user", [AuthController::class, "user"]);

    // Logout
    Route::post("/logout", [AuthController::class, "logout"])->name("logout");
});

// ==========================================
// CEK LOGIN (SEMENTARA)
// ==========================================

Route::get("/cek-login", function () {
    return response()->json([
        "login" => auth()->check(),
        "user_id" => auth()->id(),
    ]);
});


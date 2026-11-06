<?php

namespace App\Http\Controllers\Api;

use Illuminate\Support\Facades\Storage;
use App\Http\Controllers\Controller;
use App\Models\Pengaduan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class PengaduanController extends Controller
{
    // =========================================
    // ATURAN SKOR PRIORITAS
    // =========================================

    private const DAMPAK = [
        "Membahayakan keselamatan" => 40,
        "Mengganggu aktivitas masyarakat" => 25,
        "Gangguan ringan" => 10,
    ];

    private const TERDAMPAK = [
        ">100 orang" => 30,
        "50-100 orang" => 20,
        "<50 orang" => 10,
    ];

    private const URGENSI = [
        "Sangat mendesak" => 30,
        "Mendesak" => 20,
        "Tidak mendesak" => 10,
    ];

    private const STATUS = ["Dalam Pengerjaan", "Ajukan Penyelesaian"];

    // =========================================
    // GET /api/pengaduan
    // MENAMPILKAN DAFTAR PENGADUAN
    // =========================================

    public function index(Request $request)
    {
        $user = $request->user();

        $query = Pengaduan::query();

        // Masyarakat hanya melihat laporannya sendiri.
        $role = strtolower(trim($user->role ?? "masyarakat"));

        if (!in_array($role, ["petugas", "admin"], true)) {
            $query->where("user_id", $user->id);
        }

        // Pencarian laporan
        if ($request->filled("search")) {
            $search = $request->input("search");

            $query->where(function ($q) use ($search) {
                $q->where("nomor_laporan", "like", "%{$search}%")
                    ->orWhere("judul", "like", "%{$search}%")
                    ->orWhere("kategori", "like", "%{$search}%")
                    ->orWhere("alamat", "like", "%{$search}%");
            });
        }

        // Filter kategori
        if ($request->filled("kategori")) {
            $query->where("kategori", $request->input("kategori"));
        }

        // Filter status
        if (
            $request->filled("status") &&
            $request->input("status") !== "Semua"
        ) {
            $query->where("status", $request->input("status"));
        }

        // Filter prioritas
        if ($request->filled("prioritas")) {
            $query->where("prioritas", $request->input("prioritas"));
        }

        $perPage = min(max((int) $request->input("per_page", 10), 1), 100);

        // Statistik seluruh pengaduan
        $statistics = [
            "total" => Pengaduan::count(),

            "menunggu" => Pengaduan::whereIn("status", [
                "Pengaduan Baru",
                "Verifikasi",
            ])->count(),

            "diproses" => Pengaduan::whereIn("status", [
                "Ditugaskan",
                "Dalam Pengerjaan",
            ])->count(),

            "selesai" => Pengaduan::where("status", "Selesai")->count(),
        ];

        $laporan = $query
            ->orderByRaw(
                "
                CASE prioritas
                    WHEN 'Tinggi' THEN 1
                    WHEN 'Sedang' THEN 2
                    WHEN 'Rendah' THEN 3
                    ELSE 4
                END
            "
            )
            ->orderBy("created_at", "desc")
            ->paginate($perPage);

        return response()->json(
            [
                "success" => true,
                "message" => "Daftar pengaduan berhasil diambil",
                "data" => $laporan,
            ],
            200
        );
    }

    // =========================================
    // GET /api/riwayat-publik
    // MENAMPILKAN SELURUH PENGADUAN UNTUK PUBLIK
    // =========================================

    public function riwayatPublik(Request $request)
    {
        $perPage = min(max((int) $request->input("per_page", 10), 1), 100);

        $query = Pengaduan::query()->select([
            "id",
            "nomor_laporan",
            "kategori",
            "judul",
            "kecamatan",
            "kelurahan",
            "alamat",
            "latitude",
            "longitude",
            "deskripsi",
            "dampak",
            "terdampak",
            "urgensi",
            "total_skor",
            "prioritas",
            "status",
            "fotos",
            "created_at",
        ]);

        // FILTER PENCARIAN
        if ($request->filled("search")) {
            $search = $request->input("search");

            $query->where(function ($q) use ($search) {
                $q->where("nomor_laporan", "like", "%{$search}%")
                    ->orWhere("judul", "like", "%{$search}%")
                    ->orWhere("kategori", "like", "%{$search}%")
                    ->orWhere("alamat", "like", "%{$search}%")
                    ->orWhere("kelurahan", "like", "%{$search}%");
            });
        }

        // FILTER KATEGORI
        if ($request->filled("kategori")) {
            $query->where("kategori", $request->input("kategori"));
        }

        // FILTER STATUS
        if (
            $request->filled("status") &&
            $request->input("status") !== "semua"
        ) {
            $query->where("status", $request->input("status"));
        }

        // FILTER PRIORITAS
        if ($request->filled("prioritas")) {
            $query->where("prioritas", $request->input("prioritas"));
        }

        // STATISTIK SELURUH PENGADUAN
        $statistics = [
            "total" => Pengaduan::count(),

            "menunggu" => Pengaduan::whereIn("status", [
                "Pengaduan Baru",
                "Verifikasi",
            ])->count(),

            "diproses" => Pengaduan::whereIn("status", [
                "Ditugaskan",
                "Dalam Pengerjaan",
            ])->count(),

            "selesai" => Pengaduan::where("status", "Selesai")->count(),
        ];

        // PAGINATION
        $laporan = $query->orderBy("created_at", "desc")->paginate($perPage);

        // RESPONSE API
        return response()->json(
            [
                "success" => true,
                "message" => "Riwayat pengaduan publik berhasil diambil",
                "statistics" => $statistics,
                "data" => $laporan,
            ],
            200
        );
    }

    // =========================================
    // POST /api/pengaduan
    // MENYIMPAN PENGADUAN MASYARAKAT
    // =========================================

    public function store(Request $request)
    {
        // Pastikan pengguna sudah login
        $user = $request->user();

        if (!$user) {
            return response()->json(
                [
                    "success" => false,
                    "message" =>
                        "Sesi login tidak ditemukan. Silakan login kembali.",
                ],
                401
            );
        }

        // =========================================
        // VALIDASI DATA PENGADUAN
        // =========================================

        $data = $request->validate([
            "kategori" => ["required", "string", "max:100"],
            "judul" => ["required", "string", "max:150"],
            "kecamatan" => ["required", "string", "max:100"],
            "kelurahan" => ["required", "string", "max:100"],
            "alamat" => ["required", "string", "max:255"],

            "latitude" => ["nullable", "numeric", "between:-90,90"],

            "longitude" => ["nullable", "numeric", "between:-180,180"],

            "deskripsi" => ["required", "string", "min:10"],

            "dampak" => ["required", Rule::in(array_keys(self::DAMPAK))],

            "terdampak" => ["required", Rule::in(array_keys(self::TERDAMPAK))],

            "urgensi" => ["required", Rule::in(array_keys(self::URGENSI))],

            // Validasi dokumentasi
            "fotos" => ["required", "array", "min:1", "max:3"],

            "fotos.*" => [
                "required",
                "image",
                "mimes:jpg,jpeg,png",
                "max:5120",
            ],
        ]);

        // =========================================
        // PERHITUNGAN SKOR PRIORITAS
        // =========================================

        $skorDampak = self::DAMPAK[$data["dampak"]];
        $skorTerdampak = self::TERDAMPAK[$data["terdampak"]];
        $skorUrgensi = self::URGENSI[$data["urgensi"]];

        $totalSkor = $skorDampak + $skorTerdampak + $skorUrgensi;

        // =========================================
        // PENENTUAN KATEGORI PRIORITAS
        // =========================================

        if ($totalSkor >= 70) {
            $prioritas = "Tinggi";
        } elseif ($totalSkor >= 40) {
            $prioritas = "Sedang";
        } else {
            $prioritas = "Rendah";
        }

        // =========================================
        // UPLOAD FOTO DAN SIMPAN DATABASE
        // =========================================

        $fotoPaths = [];

        try {
            foreach ($request->file("fotos", []) as $foto) {
                $path = $foto->store("pengaduan", "public");

                if ($path === false) {
                    throw new \RuntimeException(
                        "Gagal menyimpan foto dokumentasi."
                    );
                }

                $fotoPaths[] = $path;
            }

            $pengaduan = DB::transaction(function () use (
                $user,
                $request,
                $data,
                $skorDampak,
                $skorTerdampak,
                $skorUrgensi,
                $totalSkor,
                $prioritas,
                $fotoPaths
            ) {
                // Nomor laporan unik
                $nomorLaporan =
                    "LP-" .
                    now()->format("Ymd") .
                    "-" .
                    strtoupper(Str::random(10));

                return Pengaduan::create([
                    "nomor_laporan" => $nomorLaporan,

                    // User login
                    "user_id" => $user->id,

                    // Informasi pengaduan
                    "kategori" => $data["kategori"],
                    "judul" => $data["judul"],

                    // Lokasi
                    "kecamatan" => $data["kecamatan"],
                    "kelurahan" => $data["kelurahan"],
                    "alamat" => $data["alamat"],

                    "latitude" => $data["latitude"] ?? null,
                    "longitude" => $data["longitude"] ?? null,

                    // Deskripsi
                    "deskripsi" => $data["deskripsi"],

                    // Dokumentasi
                    "fotos" => $fotoPaths,

                    // Dampak
                    "dampak" => $data["dampak"],
                    "skor_dampak" => $skorDampak,

                    // Jumlah terdampak
                    "terdampak" => $data["terdampak"],
                    "skor_terdampak" => $skorTerdampak,

                    // Urgensi
                    "urgensi" => $data["urgensi"],
                    "skor_urgensi" => $skorUrgensi,

                    // Prioritas
                    "total_skor" => $totalSkor,
                    "prioritas" => $prioritas,

                    // Status awal
                    "status" => "Pengaduan Baru",
                ]);
            });
        } catch (\Throwable $e) {
            // Hapus foto jika upload atau database gagal
            Storage::disk("public")->delete($fotoPaths);

            throw $e;
        }

        // =========================================
        // RESPONSE BERHASIL
        // =========================================

        return response()->json(
            [
                "success" => true,
                "message" => "Pengaduan berhasil dikirim",
                "data" => $pengaduan,
            ],
            201
        );
    }

    // =========================================
    // GET /api/pengaduan/{id}
    // DETAIL PENGADUAN
    // =========================================

    public function show(Request $request, Pengaduan $pengaduan)
    {
        $user = $request->user();

        $petugasAtauAdmin = in_array($user->role ?? "masyarakat", [
            "petugas",
            "admin",
        ]);

        // Hanya pemilik laporan, petugas,
        // atau admin yang boleh melihat.
        if (
            (int) $pengaduan->user_id !== (int) $user->id &&
            !$petugasAtauAdmin
        ) {
            return response()->json(
                [
                    "success" => false,
                    "message" => "Anda tidak memiliki akses",
                ],
                403
            );
        }

        return response()->json(
            [
                "success" => true,
                "message" => "Detail pengaduan berhasil diambil",
                "data" => $pengaduan,
            ],
            200
        );
    }

    // =========================================
    // PATCH /api/pengaduan/{id}/status
    // EDIT STATUS OLEH PETUGAS
    // =========================================

    public function updateStatus(Request $request, Pengaduan $pengaduan)
    {
        $user = $request->user();

        // Hanya petugas dan admin
        $role = strtolower(trim($user->role ?? "masyarakat"));

        if (!in_array($role, ["petugas", "admin"])) {
            return response()->json(
                [
                    "success" => false,
                    "message" => "Akses ditolak",
                ],
                403
            );
        }

        // Validasi status
        $data = $request->validate([
            "status" => ["required", Rule::in(self::STATUS)],

            "catatan" => ["nullable", "string", "max:1000"],
        ]);

        // Jika status tidak berubah
        if ($pengaduan->status === $data["status"]) {
            return response()->json(
                [
                    "success" => true,
                    "message" => "Status tidak mengalami perubahan",
                    "data" => $pengaduan,
                ],
                200
            );
        }

        // Simpan status baru
        $pengaduan->update([
            "status" => $data["status"],
        ]);

        return response()->json(
            [
                "success" => true,
                "message" => "Status pengaduan berhasil diperbarui",
                "data" => $pengaduan->fresh(),
            ],
            200
        );
    }

    public function konfirmasiPenyelesaian(
        Request $request,
        Pengaduan $pengaduan
    ) {
        $user = $request->user();

        // Pastikan hanya admin yang bisa mengonfirmasi.
        $role = strtolower(trim($user->role ?? ""));

        if ($role !== "admin") {
            return response()->json(
                [
                    "success" => false,
                    "message" =>
                        "Hanya administrator yang dapat mengonfirmasi penyelesaian.",
                ],
                403
            );
        }

        // Pastikan laporan sudah diajukan penyelesaiannya oleh petugas.
        if ($pengaduan->status !== "Ajukan Penyelesaian") {
            return response()->json(
                [
                    "success" => false,
                    "message" => "Laporan belum mengajukan penyelesaian.",
                ],
                422
            );
        }

        $pengaduan->update([
            "status" => "Selesai",
        ]);

        return response()->json([
            "success" => true,
            "message" => "Penyelesaian pengaduan berhasil dikonfirmasi.",
            "data" => $pengaduan->fresh(),
        ]);
    }
}

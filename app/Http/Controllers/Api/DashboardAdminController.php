<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DashboardAdmin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class DashboardAdminController extends Controller
{
    // ==========================================
    // DATA DASHBOARD ADMIN
    // ==========================================
    public function index(Request $request)
    {
        $pengaduan = DashboardAdmin::with('riwayat')
            ->orderByRaw("
                CASE prioritas
                    WHEN 'Tinggi' THEN 1
                    WHEN 'Sedang' THEN 2
                    WHEN 'Rendah' THEN 3
                    ELSE 4
                END
            ")
            ->orderBy('created_at', 'desc')
            ->get();

        // Statistik utama
        $total = $pengaduan->count();

        $selesai = $pengaduan
            ->where('status', 'Selesai')
            ->count();

        $belumDiproses = $pengaduan
            ->whereIn('status', [
                'Pengaduan Baru',
                'Verifikasi'
            ])
            ->count();

        $dalamProses = $pengaduan
            ->whereIn('status', [
                'Ditugaskan',
                'Dalam Pengerjaan',
                'Menunggu Konfirmasi Admin'
            ])
            ->count();

        $menungguKonfirmasi = $pengaduan
            ->where('status', 'Menunggu Konfirmasi Admin')
            ->count();

        // Persentase penyelesaian
        $persentase = $total > 0
            ? round(($selesai / $total) * 100, 2)
            : 0;

        // Rata-rata waktu penyelesaian
        $laporanSelesai = $pengaduan->filter(function ($item) {
            return $item->status === 'Selesai'
                && $item->created_at
                && $item->selesai_at;
        });

        $rataWaktu = $laporanSelesai->count() > 0
            ? round(
                $laporanSelesai->avg(function ($item) {
                    return $item->created_at
                        ->diffInSeconds($item->selesai_at) / 86400;
                }),
                2
            )
            : null;

        // Grafik berdasarkan kategori
        $kategori = $pengaduan
            ->groupBy(function ($item) {
                return $item->kategori ?: 'Lainnya';
            })
            ->map(function ($items, $nama) {
                return [
                    'name' => $nama,
                    'jumlah' => $items->count()
                ];
            })
            ->values();

        // Grafik berdasarkan wilayah
        $wilayah = $pengaduan
            ->groupBy(function ($item) {
                return $item->kecamatan ?: 'Lainnya';
            })
            ->map(function ($items, $nama) {
                return [
                    'name' => $nama,
                    'value' => $items->count()
                ];
            })
            ->sortByDesc('value')
            ->values();

        // Laporan menunggu konfirmasi
        $konfirmasi = $pengaduan
            ->where('status', 'Menunggu Konfirmasi Admin')
            ->values();

        return response()->json([
            'success' => true,
            'message' => 'Data dashboard admin berhasil diambil.',
            'data' => $pengaduan,
            'statistik' => [
                'total_pengaduan' => $total,
                'selesai' => $selesai,
                'dalam_proses' => $dalamProses,
                'belum_diproses' => $belumDiproses,
                'menunggu_konfirmasi' => $menungguKonfirmasi,
                'persentase_penyelesaian' => $persentase,
                'rata_waktu_penyelesaian' => $rataWaktu
            ],
            'grafik' => [
                'kategori' => $kategori,
                'wilayah' => $wilayah
            ],
            'menunggu_konfirmasi' => $konfirmasi
        ]);
    }

    // ==========================================
    // DETAIL PENGADUAN
    // ==========================================
    public function show(Request $request, DashboardAdmin $pengaduan)
    {
        $pengaduan->load([
            'user',
            'petugas',
            'riwayat.user'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Detail pengaduan berhasil diambil.',
            'data' => $pengaduan
        ]);
    }

    // ==========================================
    // KONFIRMASI PENYELESAIAN PETUGAS
    // ==========================================
    public function konfirmasi(Request $request, DashboardAdmin $pengaduan)
    {
        $validated = $request->validate([
            'keputusan' => 'required|in:setujui,kembalikan',
            'catatan' => 'nullable|string|max:2000'
        ]);

        $keputusan = $validated['keputusan'];
        $catatan = trim($validated['catatan'] ?? '');

        if ($keputusan === 'kembalikan' && $catatan === '') {
            throw ValidationException::withMessages([
                'catatan' => [
                    'Alasan pengembalian wajib diisi.'
                ]
            ]);
        }

        $hasil = DB::transaction(function () use (
            $pengaduan,
            $keputusan,
            $catatan,
            $request
        ) {
            // Mengunci laporan saat proses konfirmasi
            $laporan = DashboardAdmin::whereKey($pengaduan->id)
                ->lockForUpdate()
                ->firstOrFail();

            // Memastikan laporan sedang menunggu konfirmasi
            if ($laporan->status !== 'Menunggu Konfirmasi Admin') {
                throw ValidationException::withMessages([
                    'status' => [
                        'Laporan tidak sedang menunggu konfirmasi admin.'
                    ]
                ]);
            }

            $statusLama = $laporan->status;

            // Menentukan status baru
            $statusBaru = $keputusan === 'setujui'
                ? 'Selesai'
                : 'Dalam Pengerjaan';

            // Memperbarui status pengaduan
            $laporan->status = $statusBaru;

            // Menyimpan waktu penyelesaian
            $laporan->selesai_at = $keputusan === 'setujui'
                ? now()
                : null;

            $laporan->save();

            // Menyimpan riwayat keputusan admin
            $laporan->riwayat()->create([
                'user_id' => $request->user()->id,
                'status_lama' => $statusLama,
                'status_baru' => $statusBaru,
                'catatan' => $catatan !== ''
                    ? $catatan
                    : 'Penyelesaian pekerjaan disetujui oleh admin.',
                'fotos_progress' => []
            ]);

            return $laporan->load([
                'user',
                'petugas',
                'riwayat'
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => $keputusan === 'setujui'
                ? 'Penyelesaian pekerjaan berhasil disetujui.'
                : 'Pengaduan berhasil dikembalikan kepada petugas.',
            'data' => $hasil
        ]);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CekStatus;
use Illuminate\Http\Request;

class CekStatusController extends Controller
{
    // GET /api/cek-status
    public function index(Request $request)
    {
        $laporan = CekStatus::query()
            ->where('user_id', $request->user()->id)
            ->with('riwayat')
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Data status pengaduan berhasil diambil.',
            'data' => $laporan,
        ], 200);
    }

    // GET /api/cek-status/{nomorLaporan}
    public function show(
        Request $request,
        string $nomorLaporan
    ) {
        $laporan = CekStatus::query()
            ->where('user_id', $request->user()->id)
            ->where('nomor_laporan', $nomorLaporan)
            ->with('riwayat')
            ->first();

        if (!$laporan) {
            return response()->json([
                'success' => false,
                'message' => 'Laporan tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail status pengaduan berhasil diambil.',
            'data' => $laporan,
        ], 200);
    }
}

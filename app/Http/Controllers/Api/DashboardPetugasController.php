<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DashboardPetugas;
use App\Models\RiwayatPengaduan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class DashboardPetugasController extends Controller
{
    public function index(Request $request)
    {
        $laporan = DashboardPetugas::with('riwayat')  
            ->whereIn('status', [
                'Ditugaskan',
                'Dalam Pengerjaan',
                'Menunggu Konfirmasi Admin',
                'Selesai',
            ])
            ->orderByRaw(
                "CASE prioritas
                    WHEN 'Tinggi' THEN 1
                    WHEN 'Sedang' THEN 2
                    WHEN 'Rendah' THEN 3
                    ELSE 4 END"
            )
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $laporan,
        ]);
    }

    public function update(
        Request $request,
        DashboardPetugas $pengaduan
    ) {
        $data = $request->validate([
            'status' => [
                'required',
                Rule::in([
                    'Dalam Pengerjaan',
                    'Menunggu Konfirmasi Admin',
                ]),
            ],
            'catatan' => [
                'nullable',
                'string',
                'max:1000',
            ],
            'fotos_progress' => [
                'nullable',
                'array',
                'max:10',
            ],
            'fotos_progress.*' => [
                'required',
                'image',
                'mimes:jpg,jpeg,png',
                'max:5120',
            ],
        ]);

        $fotos = [];

        try {
            foreach ($request->file('fotos_progress', []) as $foto) {
                $path = $foto->store(
                    'progress-pengaduan',
                    'public'
                );

                if (!$path) {
                    throw new \RuntimeException(
                        'Gagal menyimpan foto progres.'
                    );
                }

                $fotos[] = $path;
            }

            DB::transaction(function () use (
                $request,
                $pengaduan,
                $data,
                $fotos
            ) {
                $laporan = DashboardPetugas::whereKey(
                    $pengaduan->id
                )
                    ->lockForUpdate()
                    ->firstOrFail();

                $statusLama = $laporan->status;
                $statusBaru = $data['status'];

                
                $transisiDiizinkan = [];

                if ($statusLama === 'Ditugaskan') {

                    $transisiDiizinkan = [
                        'Dalam Pengerjaan',
                    ];

                } elseif ($statusLama === 'Dalam Pengerjaan') {

                    $transisiDiizinkan = [
                        'Dalam Pengerjaan',
                        'Menunggu Konfirmasi Admin',
                    ];

                }


                if (!in_array(
                    $statusBaru,
                    $transisiDiizinkan,
                    true
                )) {
                    throw ValidationException::withMessages([
                        'status' => [
                            'Perubahan status tidak diizinkan untuk tahap pekerjaan ini.'
                        ],
                    ]);
                }

                $catatan = trim($data['catatan'] ?? '');

                if (
                    $statusBaru === $statusLama &&
                    $catatan === '' &&
                    count($fotos) === 0
                ) {
                    throw ValidationException::withMessages([
                        'status' => [
                            'Tambahkan catatan atau foto progres terlebih dahulu.'
                        ],
                    ]);
                }

                if (
                    $statusBaru === 'Menunggu Konfirmasi Admin' &&
                    $catatan === '' &&
                    count($fotos) === 0
                ) {
                    throw ValidationException::withMessages([
                        'catatan' => [
                            'Tambahkan catatan atau foto hasil pekerjaan sebelum mengajukan penyelesaian.'
                        ],
                    ]);
                }

                $laporan->update([
                    'status' => $statusBaru,
                ]);

                RiwayatPengaduan::create([
                    'pengaduan_id' => $laporan->id,
                    'petugas_id' => $request->user()->id,
                    'status_lama' => $statusLama,
                    'status_baru' => $statusBaru,
                    'catatan' => $catatan ?: null,
                    'fotos_progress' => $fotos,
                ]);
            });

        } catch (\Throwable $e) {
            foreach ($fotos as $foto) {
                Storage::disk('public')->delete($foto);
            }

            throw $e;
        }

        return response()->json([
            'success' => true,
            'message' => 'Tindak lanjut pekerjaan berhasil disimpan.',
            'data' => $pengaduan
                ->fresh()
                ->load('riwayat'),
        ]);
    }
}

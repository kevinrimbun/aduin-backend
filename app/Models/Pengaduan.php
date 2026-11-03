<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pengaduan extends Model
{
    protected $table = 'pengaduan';

    protected $fillable = [
        'nomor_laporan',
        'user_id',
        'kategori',
        'judul',
        'kecamatan',
        'kelurahan',
        'alamat',
        'latitude',
        'longitude',
        'deskripsi',
        'fotos',
        'dampak',
        'skor_dampak',
        'terdampak',
        'skor_terdampak',
        'urgensi',
        'skor_urgensi',
        'total_skor',
        'prioritas',
        'status'
    ];

    // Mengubah array foto menjadi JSON saat disimpan
    // dan menjadi array saat diambil dari database
    protected function casts(): array
    {
        return [
            'fotos' => 'array',
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
            'skor_dampak' => 'integer',
            'skor_terdampak' => 'integer',
            'skor_urgensi' => 'integer',
            'total_skor' => 'integer',
        ];
    }

    // Relasi pengaduan dengan pengguna
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

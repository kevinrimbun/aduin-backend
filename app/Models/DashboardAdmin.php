<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DashboardAdmin extends Model
{
    protected $table = 'pengaduan';

    protected $fillable = [
        'user_id',
        'nomor_laporan',
        'kategori',
        'deskripsi',
        'alamat',
        'kelurahan',
        'kecamatan',
        'latitude',
        'longitude',
        'prioritas',
        'status',
        'petugas_id',
        'selesai_at',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'selesai_at' => 'datetime',
    ];

    // Relasi dengan masyarakat yang membuat pengaduan
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // Relasi dengan petugas yang menangani pengaduan
    public function petugas(): BelongsTo
    {
        return $this->belongsTo(User::class, 'petugas_id');
    }

    // Relasi riwayat penanganan pengaduan
    public function riwayat(): HasMany
    {
        return $this->hasMany(RiwayatPengaduan::class, 'pengaduan_id')
            ->orderBy('created_at', 'desc');
    }

    // Scope laporan yang menunggu konfirmasi admin
    public function scopeMenungguKonfirmasi($query)
    {
        return $query->where('status', 'Menunggu Konfirmasi Admin');
    }

    // Scope laporan selesai
    public function scopeSelesai($query)
    {
        return $query->where('status', 'Selesai');
    }

    // Scope laporan dalam proses
    public function scopeDalamProses($query)
    {
        return $query->whereIn('status', [
            'Ditugaskan',
            'Dalam Pengerjaan',
            'Menunggu Konfirmasi Admin',
        ]);
    }

    // Scope laporan belum diproses
    public function scopeBelumDiproses($query)
    {
        return $query->whereIn('status', [
            'Pengaduan Baru',
            'Verifikasi',
        ]);
    }
}

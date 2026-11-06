<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DashboardPetugas extends Model
{
    // Menggunakan tabel pengaduan yang sudah ada
    protected $table = 'pengaduan';

    protected $primaryKey = 'id';

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'fotos' => 'array',
            'latitude' => 'float',
            'longitude' => 'float',
        ];
    }

    // Relasi dengan riwayat penanganan
    public function riwayat(): HasMany
    {
        return $this->hasMany(
            RiwayatPengaduan::class,
            'pengaduan_id',
            'id'
        )->orderBy('created_at', 'asc');
    }
}

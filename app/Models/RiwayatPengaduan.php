<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RiwayatPengaduan extends Model
{
    protected $table = 'riwayat_pengaduan';

    protected $fillable = [
        'pengaduan_id',
        'petugas_id',
        'status_lama',
        'status_baru',
        'catatan',
        'foto_progress',
        'fotos_progress',
    ];

    protected function casts(): array
    {
        return [
            'fotos_progress' => 'array',
        ];
    }
}

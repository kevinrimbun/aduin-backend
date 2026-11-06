<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CekStatus extends Model
{
    protected $table = 'pengaduan';

    protected $primaryKey = 'id';

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'fotos' => 'array',
        ];
    }

    public function riwayat(): HasMany
    {
        return $this->hasMany(
            RiwayatPengaduan::class,
            'pengaduan_id',
            'id'
        )->orderBy('created_at')->orderBy('id');
    }
}

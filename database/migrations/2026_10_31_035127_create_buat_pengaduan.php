
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pengaduan', function (Blueprint $table) {
            $table->id();

            // Identitas laporan
            $table->string('nomor_laporan', 40)->unique();

            // Relasi ke masyarakat
            $table->foreignId('user_id')
                ->constrained('users')
                ->restrictOnDelete();

            // Informasi pengaduan
            $table->string('kategori', 100);
            $table->string('judul', 150);

            // Lokasi
            $table->string('kecamatan', 100);
            $table->string('kelurahan', 100);
            $table->string('alamat', 255);

            // Koordinat peta
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();

            // Deskripsi
            $table->text('deskripsi');

            // Parameter dampak
            $table->string('dampak', 100);
            $table->unsignedTinyInteger('skor_dampak');

            // Parameter jumlah terdampak
            $table->string('terdampak', 100);
            $table->unsignedTinyInteger('skor_terdampak');

            // Parameter urgensi
            $table->string('urgensi', 100);
            $table->unsignedTinyInteger('skor_urgensi');

            // Hasil perhitungan prioritas
            $table->unsignedSmallInteger('total_skor');

            $table->enum('prioritas', [
                'Tinggi',
                'Sedang',
                'Rendah'
            ])->default('Rendah');

            // Status pengaduan
            $table->enum('status', [
                'Dalam Pengerjaan',
                'Ajukan Penyelesaian'
            ])->default('Pengaduan Baru');

            // Tanggal dibuat dan diperbarui
            $table->timestamps();

            // Index untuk dashboard petugas
            $table->index('status');
            $table->index('prioritas');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pengaduan');
    }
};

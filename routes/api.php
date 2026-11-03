<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PengaduanController;

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/pengaduan', [PengaduanController::class, 'index']);

    Route::post('/pengaduan', [PengaduanController::class, 'store']);

    Route::get('/pengaduan/{pengaduan}', [PengaduanController::class, 'show']);

    Route::patch('/pengaduan/{pengaduan}/status', [
        PengaduanController::class,
        'updateStatus'
    ]);

});

Route::get('/cek-session', function () {
    return response()->json([
        'login' => auth()->check(),
        'user_id' => auth()->id(),
    ]);
})->middleware('auth:sanctum');
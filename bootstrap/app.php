<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {

        // Mengaktifkan autentikasi session Sanctum untuk React
        $middleware->statefulApi();

        // Pengguna yang belum login diarahkan ke halaman Login
        $middleware->redirectGuestsTo('/login');

    })
    ->withExceptions(function (Exceptions $exceptions): void {

        // Mengembalikan respons JSON untuk request API
        $exceptions->shouldRenderJsonWhen(
            function (Request $request) {
                return $request->is('api/*') || $request->expectsJson();
            }
        );

    })
    ->create();

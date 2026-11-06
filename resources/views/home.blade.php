
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>ADUIN - Aduan Infrastruktur</title>

    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/index.jsx'])
</head>
<body>
    <div
        id="app"
        data-page="{{ $page ?? 'beranda' }}"
        data-user-name="{{ auth()->user()->name ?? '' }}"
        data-username="{{ auth()->user()->username ?? '' }}"
        data-user-role="{{ auth()->user()->role ?? '' }}"
        data-authenticated="{{ auth()->check() ? 'true' : 'false' }}"
    ></div>
</body>
</html>

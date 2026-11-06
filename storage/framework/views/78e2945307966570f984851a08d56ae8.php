
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="<?php echo e(csrf_token()); ?>">

    <title>ADUIN - Aduan Infrastruktur</title>

    <?php echo app('Illuminate\Foundation\Vite')->reactRefresh(); ?>
    <?php echo app('Illuminate\Foundation\Vite')(['resources/css/app.css', 'resources/js/index.jsx']); ?>
</head>
<body>
    <div
        id="app"
        data-page="<?php echo e($page ?? 'beranda'); ?>"
        data-user-name="<?php echo e(auth()->user()->name ?? ''); ?>"
        data-username="<?php echo e(auth()->user()->username ?? ''); ?>"
        data-user-role="<?php echo e(auth()->user()->role ?? ''); ?>"
        data-authenticated="<?php echo e(auth()->check() ? 'true' : 'false'); ?>"
    ></div>
</body>
</html>
<?php /**PATH D:\laragon\www\aduin\resources\views/home.blade.php ENDPATH**/ ?>
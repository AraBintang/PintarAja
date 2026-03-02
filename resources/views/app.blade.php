<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <link rel="icon" href="{{ asset('favicon.ico') }}" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <title>PINTARAJA</title>
    <meta name="description" content="Solusi Mahasiswa, di Pintar Aja">

    <!-- Open Graph (Facebook, LinkedIn, etc) -->
    <meta property="og:title" content="PINTARAJA" />
    <meta property="og:description" content="Solusi Mahasiswa, di Pintar Aja" />
    <meta property="og:image" content="https://pintaraja.com/images/miniLogo.svg" />
    <meta property="og:url" content="{{ url()->current() }}" />
    <meta property="og:type" content="website" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="PINTARAJA" />
    <meta name="twitter:description" content="Solusi Mahasiswa, di Pintar Aja" />
    <meta name="twitter:image" content="{{ asset('resources/images/miniLogo.svg') }}" />

    <link rel="stylesheet" type="text/css" href="{{ asset('loader.css') }}" />
    <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">
    @vite(['resources/js/main.js'])
</head>

<body>
    <div id="app">
        <div id="loading-bg">
            <div class="loading-logo">
                {!! file_get_contents(resource_path('images/logo.svg')) !!}
            </div>
            <div class="loading">
                <div class="effect-1 effects"></div>
                <div class="effect-2 effects"></div>
                <div class="effect-3 effects"></div>
            </div>
        </div>
    </div>

    <script>
        const loaderColor = localStorage.getItem('PINTARAJA-initial-loader-bg') || '#FFFFFF'
        const primaryColor = localStorage.getItem('PINTARAJA-initial-loader-color') || '#3568a7'

        if (loaderColor)
            document.documentElement.style.setProperty('--initial-loader-bg', loaderColor)

        if (primaryColor)
            document.documentElement.style.setProperty('--initial-loader-color', primaryColor)
    </script>

    <script src="https://cdn.jsdelivr.net/npm/aos@2.3.4/dist/aos.js"></script>
    <script>
        AOS.init({
            once: true,
        })
    </script>
</body>

</html>

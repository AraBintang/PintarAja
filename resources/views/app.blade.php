<!doctype html>
<html lang="id">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    {{-- SEO Meta Tags --}}
    <title>Pintaraja</title>
    <meta name="description" content="Pintaraja adalah platform solusi belajar untuk mahasiswa Indonesia. Temukan berbagai fitur yang membantu kamu belajar lebih pintar, lebih efisien, dan lebih percaya diri.">

    {{-- Open Graph (untuk share di sosmed) --}}
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://pintaraja.com/">
    <meta property="og:title" content="Pintaraja – Solusi Mahasiswa, di Pintar Aja">
    <meta property="og:description" content="Pintaraja adalah platform solusi belajar untuk mahasiswa Indonesia. Temukan berbagai fitur yang membantu kamu belajar lebih pintar, lebih efisien, dan lebih percaya diri.">
    <meta property="og:image" content="{{ asset('og-image.png') }}">

    {{-- Twitter Card --}}
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="https://pintaraja.com/">
    <meta name="twitter:title" content="Pintaraja – Solusi Mahasiswa, di Pintar Aja">
    <meta name="twitter:description" content="Pintaraja adalah platform solusi belajar untuk mahasiswa Indonesia. Temukan berbagai fitur yang membantu kamu belajar lebih pintar, lebih efisien, dan lebih percaya diri.">
    <meta name="twitter:image" content="{{ asset('og-image.png') }}">

    <link rel="icon" href="{{ asset('favicon.ico') }}" />

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" media="print" onload="this.media='all'">
    <noscript>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap">
    </noscript>

    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/main.jsx'])

    <x-turnstile.scripts />

    <script>
      window.APP = window.APP || {}
      window.APP.TURNSTILE_SITE_KEY = "{{ config('services.turnstile.key') }}"
    </script>

    <style>
      #app:empty::after {
        content: '';
        display: block;
        /* minimal skeleton */
      }
    </style>
  </head>

  <body>
    <div id="app"></div>
  </body>
</html>
<!doctype html>
<html lang="id">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Pintaraja</title>
    <link rel="icon" href="{{ asset('favicon.ico') }}" />

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">

    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/main.jsx'])

    <x-turnstile.scripts />

    <script>
      window.APP = window.APP || {}
      window.APP.TURNSTILE_SITE_KEY = "{{ config('services.turnstile.key') }}"
    </script>
  </head>

  <body>
    <div id="app"></div>
  </body>
</html>
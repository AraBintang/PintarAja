<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>{{ $title ?? 'Pintaraja Blog' }}</title>
    <meta name="description" content="{{ $description ?? 'Pintaraja AI — Blog articles' }}">

    <link rel="canonical" href="{{ $canonical ?? url()->current() }}">

    <meta property="og:title" content="{{ $title ?? 'Pintaraja Blog' }}">
    <meta property="og:description" content="{{ $description ?? 'Pintaraja AI — Blog articles' }}">
    <meta property="og:url" content="{{ $canonical ?? url()->current() }}">
    <meta property="og:type" content="{{ !empty($isArticle) && $isArticle ? 'article' : 'website' }}">
    <meta property="og:site_name" content="Pintaraja">

    @if (!empty($ogImage))
    <meta property="og:image" content="{{ $ogImage }}">
    <meta property="og:image:alt" content="{{ $title ?? 'Pintaraja Blog' }}">
    @endif

    @if (!empty($publishedTime) && !empty($isArticle) && $isArticle)
    <meta property="article:published_time" content="{{ $publishedTime }}">
    @endif

    @if (!empty($modifiedTime) && !empty($isArticle) && $isArticle)
    <meta property="article:modified_time" content="{{ $modifiedTime }}">
    @endif

    @if (!empty($authorUrl) && !empty($isArticle) && $isArticle)
    <meta property="article:author" content="{{ $authorUrl }}">
    @endif

    <link rel="icon" href="{{ asset('favicon.ico') }}" />

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">

    @vite(['resources/css/app.css'])

    {{-- Run BEFORE render to avoid flash --}}
    <script>
        (function () {
            const saved = localStorage.getItem('theme')
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
            const useDark = saved === 'dark' || (saved !== 'light' && prefersDark)
            document.documentElement.classList.toggle('dark', useDark)
        })()
    </script>

    <style>
        body { font-family: 'Plus Jakarta Sans', sans-serif; }

        .nav-line { position: relative; }
        .nav-line::after {
            content: ''; position: absolute; bottom: -2px; left: 0;
            width: 0; height: 2px; background: currentColor; transition: width .2s;
        }
        .nav-line:hover::after { width: 100%; }

        .card-hover { transition: transform .22s ease, box-shadow .22s ease; }
        .card-hover:hover { transform: translateY(-3px); box-shadow: 0 16px 40px -10px rgba(0,0,0,0.13); }

        /* ── Blog prose ── */
        .blog-content { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1.05rem; line-height: 1.85; color: #374151; }
        .dark .blog-content { color: #d1d5db; }
        .blog-content h2 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1.65rem; font-weight: 600; margin: 2.2em 0 .7em; color: #111827; line-height: 1.3; }
        .dark .blog-content h2 { color: #f3f4f6; }
        .blog-content h3 { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 1.3rem; font-weight: 600; margin: 1.8em 0 .6em; color: #111827; }
        .dark .blog-content h3 { color: #f3f4f6; }
        .blog-content p { margin-bottom: 1.5em; }
        .blog-content ul, .blog-content ol { margin: 0 0 1.5em 1.5em; }
        .blog-content li { margin-bottom: .4em; }
        .blog-content a { color: #2563eb; text-decoration: underline; text-underline-offset: 3px; }
        .dark .blog-content a { color: #fb923c; }
        .blog-content strong { font-weight: 600; color: #111827; }
        .dark .blog-content strong { color: #f3f4f6; }
        .blog-content blockquote { border-left: 3px solid #2563eb; padding: .75em 1.25em; margin: 1.8em 0; color: #6b7280; font-style: italic; background: #eff6ff; border-radius: 0 6px 6px 0; }
        .dark .blog-content blockquote { border-color: #fb923c; background: rgba(251,146,60,.07); color: #9ca3af; }
        .blog-content code { background: #eff6ff; color: #1d4ed8; padding: .15em .4em; border-radius: 4px; font-size: .875em; font-family: 'Courier New', monospace; }
        .dark .blog-content code { background: #1c1917; color: #fb923c; }
        .blog-content pre { background: #f8fafc; border-radius: 10px; padding: 1.25em; overflow-x: auto; margin: 1.8em 0; border: 1px solid #e2e8f0; }
        .dark .blog-content pre { background: #0f172a; border-color: #1e293b; }
        .blog-content pre code { background: none; padding: 0; color: inherit; }
        .blog-content img { border-radius: 10px; margin: 1.8em 0; max-width: 100%; }
    </style>
</head>
<body class="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 antialiased">

    {{-- Navigation --}}
    <header class="sticky top-0 z-50 bg-white/70 dark:bg-gray-950/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div class="max-w-5xl mx-auto px-6 sm:px-10 h-16 flex items-center justify-between">

            {{-- Logo --}}
            <a href="/" class="hover:opacity-75 transition-opacity flex items-end gap-0.5">
                <img src="{{ asset('p doank.png') }}" alt="Pintaraja" class="h-8 w-auto">
                <span class="text-base font-bold text-gray-900 dark:text-white leading-none mb-0.5">intaraja</span>
            </a>

            {{-- Nav + theme toggle --}}
            <div class="flex items-center gap-6">
                <nav class="flex items-center gap-6">
                    <a href="/blog" class="nav-line text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-[#4A90D9] transition-colors">Blog</a>
                    <a href="/" class="nav-line text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-[#4A90D9] transition-colors">Home</a>
                </nav>

                {{-- Cycle: system → light → dark → system … --}}
                <button
                    id="theme-btn"
                    aria-label="Toggle theme"
                    class="w-9 h-9 flex items-center justify-center transition-allp-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-all capitalize"
                >
                    {{-- Sun: light --}}
                    <svg id="icon-light"xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-brightness-high w-4 h-4 hidden" viewBox="0 0 16 16">
                        <path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6m0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0m0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13m8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5M3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8m10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0m-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0m9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707M4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708"/>
                    </svg>

                    {{-- Moon: dark --}}
                    <svg id="icon-dark" class="w-4 h-4 hidden" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
                    </svg>

                    {{-- Monitor: system --}}
                    <svg id="icon-system" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-display w-4 h-4 hidden" viewBox="0 0 16 16">
                        <path d="M0 4s0-2 2-2h12s2 0 2 2v6s0 2-2 2h-4q0 1 .25 1.5H11a.5.5 0 0 1 0 1H5a.5.5 0 0 1 0-1h.75Q6 13 6 12H2s-2 0-2-2zm1.398-.855a.76.76 0 0 0-.254.302A1.5 1.5 0 0 0 1 4.01V10c0 .325.078.502.145.602q.105.156.302.254a1.5 1.5 0 0 0 .538.143L2.01 11H14c.325 0 .502-.078.602-.145a.76.76 0 0 0 .254-.302 1.5 1.5 0 0 0 .143-.538L15 9.99V4c0-.325-.078-.502-.145-.602a.76.76 0 0 0-.302-.254A1.5 1.5 0 0 0 13.99 3H2c-.325 0-.502.078-.602.145"/>
                    </svg>
                </button>
            </div>
        </div>
    </header>

    {{-- Main --}}
    <main class="min-h-screen">
        @yield('content')
    </main>

    {{-- Footer --}}
    <footer class="border-t border-gray-100 dark:border-gray-800 mt-20">
        <div class="max-w-5xl mx-auto px-6 sm:px-10 py-14">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-10 mb-10">
                <div class="col-span-2 md:col-span-1">
                    <a href="/" class="hover:opacity-75 transition-opacity flex items-end gap-0.5 mb-3">
                        <img src="{{ asset('p doank.png') }}" alt="Pintaraja" class="h-8 w-auto">
                        <span class="text-base font-bold text-gray-900 dark:text-white leading-none mb-0.5">intaraja</span>
                    </a>
                    <p class="text-sm text-gray-400 dark:text-gray-500 leading-relaxed">Platform AI terbaik untuk pembelajaran dan produktivitas.</p>
                </div>
                <div>
                    <p class="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-4">Produk</p>
                    <ul class="space-y-2.5 text-sm text-gray-500 dark:text-gray-400">
                        <li><a href="/chat" class="hover:text-blue-600 dark:hover:text-orange-400 transition-colors">AI Chat</a></li>
                        <li><a href="/writer" class="hover:text-blue-600 dark:hover:text-orange-400 transition-colors">AI Writer</a></li>
                        <li><a href="/paraphrase" class="hover:text-blue-600 dark:hover:text-orange-400 transition-colors">Paraphrase</a></li>
                        <li><a href="/humanizer" class="hover:text-blue-600 dark:hover:text-orange-400 transition-colors">Humanizer AI</a></li>
                        <li><a href="/transcribe" class="hover:text-blue-600 dark:hover:text-orange-400 transition-colors">Transcribe</a></li>
                        <li><a href="/plagiarism" class="hover:text-blue-600 dark:hover:text-orange-400 transition-colors">Plagiarism Checker</a></li>
                    </ul>
                </div>
                <div>
                    <p class="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-4">Perusahaan</p>
                    <ul class="space-y-2.5 text-sm text-gray-500 dark:text-gray-400">
                        <li><a href="/blog" class="hover:text-blue-600 dark:hover:text-orange-400 transition-colors">Blog</a></li>
                        <li><a href="#" class="hover:text-blue-600 dark:hover:text-orange-400 transition-colors">Tentang</a></li>
                        <li><a href="#" class="hover:text-blue-600 dark:hover:text-orange-400 transition-colors">Kontak</a></li>
                    </ul>
                </div>
                <div>
                    <p class="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-4">Legal</p>
                    <ul class="space-y-2.5 text-sm text-gray-500 dark:text-gray-400">
                        <li><a href="#" class="hover:text-blue-600 dark:hover:text-orange-400 transition-colors">Privacy</a></li>
                        <li><a href="#" class="hover:text-blue-600 dark:hover:text-orange-400 transition-colors">Terms</a></li>
                    </ul>
                </div>
            </div>
            <div class="pt-8 border-t border-gray-100 dark:border-gray-800 text-center">
                <p class="text-sm text-gray-400 dark:text-gray-600">© 2026 Pintaraja AI. All rights reserved.</p>
            </div>
        </div>
    </footer>

    <script>
        // Order: system → light → dark → system → …
        const CYCLE = ['system', 'light', 'dark']

        function getEffective(pref) {
            if (pref === 'light') return 'light'
            if (pref === 'dark')  return 'dark'
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        }

        function applyTheme(pref) {
            document.documentElement.classList.toggle('dark', getEffective(pref) === 'dark')
            localStorage.setItem('theme', pref)
            document.getElementById('icon-light').classList.toggle('hidden', pref !== 'light')
            document.getElementById('icon-dark').classList.toggle('hidden', pref !== 'dark')
            document.getElementById('icon-system').classList.toggle('hidden', pref !== 'system')
        }

        // Init: if nothing saved, start from 'system'
        applyTheme(localStorage.getItem('theme') || 'system')

        // Cycle on click
        document.getElementById('theme-btn').addEventListener('click', () => {
            const current = localStorage.getItem('theme') || 'system'
            const next = CYCLE[(CYCLE.indexOf(current) + 1) % CYCLE.length]
            applyTheme(next)
        })

        // Respect OS change when on 'system'
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            if ((localStorage.getItem('theme') || 'system') === 'system') applyTheme('system')
        })
    </script>

</body>
</html>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="{{ $description ?? 'Pintaraja AI — Blog articles' }}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="{{ request()->url() }}">
    <meta property="og:title" content="{{ $title ?? 'Pintaraja AI Blog' }}">
    <meta property="og:description" content="{{ $description ?? 'Pintaraja AI — Blog articles' }}">

    <title>{{ $title ?? 'Pintaraja AI Blog' }}</title>
    <link rel="icon" href="{{ asset('favicon.ico') }}" />

    {{-- Fonts: Plus Jakarta Sans (body) + Lora (headings) --}}
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Lora:wght@400;500;600;700&display=swap" rel="stylesheet">

    @vite(['resources/css/app.css'])

    {{-- Dark mode: run BEFORE render to avoid flash --}}
    <script>
        (function () {
            const saved = localStorage.getItem('theme')
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
            if (saved === 'dark' || (!saved && prefersDark)) {
                document.documentElement.classList.add('dark')
            } else {
                document.documentElement.classList.remove('dark')
            }
        })()
    </script>

    <style>
        /* ── Base font ── */
        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .{
            font-family: 'Lora', Georgia, serif;
        }

        /* ── Nav underline animation ── */
        .nav-line { position: relative; }
        .nav-line::after {
            content: '';
            position: absolute;
            bottom: -2px; left: 0;
            width: 0; height: 1px;
            background: currentColor;
            transition: width .2s;
        }
        .nav-line:hover::after { width: 100%; }

        /* ── Card hover ── */
        .card-hover { transition: transform .22s ease, box-shadow .22s ease; }
        .card-hover:hover { transform: translateY(-3px); box-shadow: 0 16px 40px -10px rgba(0,0,0,0.13); }

        /* ── Blog article prose ── */
        .blog-content {
            font-family: 'Plus Jakarta Sans', sans-serif;
            font-size: 1.05rem;
            line-height: 1.85;
            color: #374151;
        }
        .dark .blog-content { color: #d1d5db; }

        .blog-content h2 {
            font-family: 'Lora', serif;
            font-size: 1.65rem; font-weight: 600;
            margin: 2.2em 0 .7em;
            color: #111827; line-height: 1.3;
        }
        .dark .blog-content h2 { color: #f3f4f6; }

        .blog-content h3 {
            font-family: 'Lora', serif;
            font-size: 1.3rem; font-weight: 600;
            margin: 1.8em 0 .6em;
            color: #111827;
        }
        .dark .blog-content h3 { color: #f3f4f6; }

        .blog-content p { margin-bottom: 1.5em; }
        .blog-content ul, .blog-content ol { margin: 0 0 1.5em 1.5em; }
        .blog-content li { margin-bottom: .4em; }

        /* accent links: blue light / orange dark */
        .blog-content a { color: #2563eb; text-decoration: underline; text-underline-offset: 3px; }
        .dark .blog-content a { color: #fb923c; }

        .blog-content strong { font-weight: 600; color: #111827; }
        .dark .blog-content strong { color: #f3f4f6; }

        .blog-content blockquote {
            border-left: 3px solid #2563eb;
            padding: .75em 1.25em; margin: 1.8em 0;
            color: #6b7280; font-style: italic;
            background: #eff6ff; border-radius: 0 6px 6px 0;
        }
        .dark .blog-content blockquote {
            border-color: #fb923c;
            background: rgba(251,146,60,.07);
            color: #9ca3af;
        }

        .blog-content code {
            background: #eff6ff; color: #1d4ed8;
            padding: .15em .4em; border-radius: 4px;
            font-size: .875em; font-family: 'Courier New', monospace;
        }
        .dark .blog-content code { background: #1c1917; color: #fb923c; }

        .blog-content pre {
            background: #f8fafc; border-radius: 10px;
            padding: 1.25em; overflow-x: auto;
            margin: 1.8em 0; border: 1px solid #e2e8f0;
        }
        .dark .blog-content pre { background: #0f172a; border-color: #1e293b; }
        .blog-content pre code { background: none; padding: 0; color: inherit; }
        .blog-content img { border-radius: 10px; margin: 1.8em 0; max-width: 100%; }

        /* ── Theme toggle button ── */
        #theme-toggle {
            width: 2.25rem; height: 2.25rem;
            display: flex; align-items: center; justify-content: center;
            border-radius: 50%;
            border: 1px solid #e5e7eb;
            color: #6b7280;
            cursor: pointer;
            background: transparent;
            transition: background .2s, border-color .2s, color .2s;
        }
        #theme-toggle:hover {
            background: #f3f4f6;
            color: #111827;
            border-color: #d1d5db;
        }
        .dark #theme-toggle {
            border-color: #374151;
            color: #9ca3af;
        }
        .dark #theme-toggle:hover {
            background: #1f2937;
            color: #f3f4f6;
            border-color: #4b5563;
        }

        /* show/hide icons */
        #icon-sun  { display: block; }
        #icon-moon { display: none; }
        .dark #icon-sun  { display: none; }
        .dark #icon-moon { display: block; }
    </style>
</head>
<body class="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 antialiased">

    {{-- Navigation --}}
    <header class="sticky top-0 z-50 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div class="max-w-5xl mx-auto px-6 sm:px-10 h-16 flex items-center justify-between">

            {{-- Logo --}}
          <a href="/" class="hover:opacity-75 transition-opacity flex">
              <img src="{{ asset('p doank.png') }}" alt="Pintaraja" class="h-8 w-auto">
              <span class="mt-auto -mb-1">intaraja</span>
          </a>
            {{-- Nav + toggle --}}
            <div class="flex items-center gap-6">
                <nav class="flex items-center gap-6">
                    <a href="/blog"
                       class="nav-line text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                        Blog
                    </a>
                    <a href="/"
                       class="nav-line text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                        Home
                    </a>
                </nav>

                {{-- Theme toggle --}}
                <button id="theme-toggle" aria-label="Toggle dark mode">

                    {{-- Moon icon (shown in light mode → click to go dark) --}}
                    <svg id="icon-moon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
                    </svg>

                    {{-- Sun icon (shown in dark mode → click to go light) --}}
                    <svg id="icon-sun" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="5"/>
                        <line x1="12" y1="1" x2="12" y2="3"/>
                        <line x1="12" y1="21" x2="12" y2="23"/>
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                        <line x1="1" y1="12" x2="3" y2="12"/>
                        <line x1="21" y1="12" x2="23" y2="12"/>
                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
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
                    <a href="/" class="hover:opacity-75 transition-opacity flex mb-2">
                        <img src="{{ asset('p doank.png') }}" alt="Pintaraja" class="h-8 w-auto">
                        <span class="mt-auto -mb-1">intaraja</span>
                    </a>
                    <p class="text-sm text-gray-400 dark:text-gray-500 leading-relaxed">Platform AI terbaik untuk pembelajaran dan produktivitas.</p>
                </div>
                <div>
                    <p class="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-4">Produk</p>
                    <ul class="space-y-2.5 text-sm text-gray-500 dark:text-gray-400">
                        <li><a href="chat" class="hover:text-blue-600 dark:hover:text-orange-400 transition-colors">AI Chat</a></li>
                        <li><a href="/writer" class="hover:text-blue-600 dark:hover:text-orange-400 transition-colors">AI Writer</a></li>
                        <li><a href="paraphrase" class="hover:text-blue-600 dark:hover:text-orange-400 transition-colors">Paraphrase</a></li>
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
            <div class="pt-8 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between flex-wrap gap-3">
                <p class="text-sm text-gray-400 dark:text-gray-600">© 2026 Pintaraja AI. All rights reserved.</p>
                {{-- Mini toggle in footer too --}}
                <button onclick="toggleTheme()"
                    class="text-xs text-gray-400 dark:text-gray-600 hover:text-blue-600 dark:hover:text-orange-400 transition-colors flex items-center gap-1.5">
                    <span id="footer-theme-label">Ganti tema</span>
                </button>
            </div>
        </div>
    </footer>

    <script>
        function applyTheme(dark) {
            if (dark) {
                document.documentElement.classList.add('dark')
                localStorage.setItem('theme', 'dark')
            } else {
                document.documentElement.classList.remove('dark')
                localStorage.setItem('theme', 'light')
            }
        }

        function toggleTheme() {
            const isDark = document.documentElement.classList.contains('dark')
            applyTheme(!isDark)
        }

        document.getElementById('theme-toggle').addEventListener('click', toggleTheme)
    </script>

</body>
</html>
@extends('blog.layout')

@section('content')

<div class="max-w-5xl mx-auto px-6 sm:px-10">

    <div class="pt-10 pb-8 md:pt-14">
        <a href="/blog"
          onclick="history.length > 1 ? (history.back(), event.preventDefault()) : null"
          class="inline-flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-600 hover:text-gray-700 dark:hover:text-gray-300 transition-colors group">
            <svg class="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            Blog
        </a>
    </div>

    {{-- Two-column layout: article + sidebar --}}
    <div class="flex gap-12 pb-20 items-start">

        {{-- ── Main Article ─────────────────────────────────────────── --}}
        <article class="min-w-0 flex-1">

            {{-- Header --}}
            <header class="mb-10">
                @if($blog->M_BlogCategory)
                <a href="/blog/category/{{ urlencode($blog->M_BlogCategory) }}"
                   class="inline-block text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-orange-400 hover:opacity-70 transition-opacity mb-5">
                    {{ $blog->M_BlogCategory }}
                </a>
                @endif

                <h1 class="text-3xl sm:text-4xl leading-tight font-bold text-gray-900 dark:text-gray-100 mb-7">
                    {{ $blog->M_BlogTitle }}
                </h1>

                {{-- Meta --}}
                <div class="flex flex-wrap items-center gap-5 text-sm text-gray-400 dark:text-gray-600 pb-7 border-b border-gray-100 dark:border-gray-800">
                    @if($blog->author)
                    <div class="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1zm-7.978-1L7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002-.014.002zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4m3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0M6.936 9.28a6 6 0 0 0-1.23-.247A7 7 0 0 0 5 9c-4 0-5 3-5 4q0 1 1 1h4.216A2.24 2.24 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816M4.92 10A5.5 5.5 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275ZM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0m3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4"/>
                        </svg>
                        <span class="text-gray-600 dark:text-gray-400 font-medium text-sm">Pintaraja Team</span>
                    </div>
                    <span class="text-gray-200 dark:text-gray-700">·</span>
                    @endif
                    <span>{{ $blog->M_BlogPublishedAt->format('d M Y') }}</span>
                    <span class="text-gray-200 dark:text-gray-700">·</span>
                    <span>{{ number_format($blog->M_BlogViewCount) }} views</span>
                </div>
            </header>

            {{-- Featured Image --}}
            @if($blog->M_BlogFeaturedImage)
            <div class="mb-10 rounded-2xl overflow-hidden" style="max-height:420px;">
                <img src="{{ asset('storage/' . $blog->M_BlogFeaturedImage) }}"
                     alt="{{ $blog->M_BlogTitle }}"
                     class="w-full h-full object-cover">
            </div>
            @endif

            {{-- Content --}}
            <div class="blog-content">
                {!! $blog->M_BlogContent !!}
            </div>

            {{-- Share --}}
            <div class="mt-14 pt-8 border-t border-gray-100 dark:border-gray-800">
                <p class="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-4">Bagikan artikel ini</p>
                <div class="flex items-center gap-2.5">
                    <a href="https://twitter.com/intent/tweet?url={{ urlencode(request()->url()) }}&text={{ urlencode($blog->M_BlogTitle) }}"
                       target="_blank"
                       class="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-600 hover:border-gray-500 dark:hover:border-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z"/>
                        </svg>
                    </a>
                    <a href="https://www.facebook.com/sharer/sharer.php?u={{ urlencode(request()->url()) }}"
                       target="_blank"
                       class="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-600 hover:border-gray-500 dark:hover:border-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951"/>
                        </svg>
                    </a>
                    <a href="https://www.linkedin.com/sharing/share-offsite/?url={{ urlencode(request()->url()) }}"
                       target="_blank"
                       class="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-600 hover:border-gray-500 dark:hover:border-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854zm4.943 12.248V6.169H2.542v7.225zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248S2.4 3.226 2.4 3.934c0 .694.521 1.248 1.327 1.248zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225z"/>
                        </svg>
                    </a>
                    {{-- Copy link --}}
                    <button
                        onclick="const svg = this.querySelector('.icon-share'); const chk = this.querySelector('.icon-check'); svg.classList.add('hidden'); chk.classList.remove('hidden'); navigator.clipboard.writeText(window.location.href).then(() => setTimeout(() => { svg.classList.remove('hidden'); chk.classList.add('hidden'); }, 2000))"
                        class="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-600 hover:border-gray-500 dark:hover:border-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="icon-share" viewBox="0 0 16 16">
                            <path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3M11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.5 2.5 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5m-8.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m11 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3"/>
                        </svg>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="icon-check hidden" viewBox="0 0 16 16">
                            <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0"/>
                        </svg>
                    </button>
                </div>
            </div>

            {{-- Back --}}
            <div class="mt-10 pt-8 border-t border-gray-100 dark:border-gray-800">
                <a href="/blog" class="inline-flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors group">
                    <svg class="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                    </svg>
                    Kembali ke Blog
                </a>
            </div>
        </article>

        {{-- ── Sidebar (hidden on mobile) ──────────────────────────── --}}
        <aside class="hidden lg:block w-64 shrink-0 sticky top-24 self-start space-y-8">

            {{-- About Pintaraja card --}}
            <div class="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 rounded-2xl p-6 border border-blue-100 dark:border-gray-700">
                <a href="/" class="flex items-end gap-0.5 mb-3 hover:opacity-75 transition-opacity">
                    <img src="{{ asset('pintaraja.webp') }}" alt="Pintaraja" class="h-7 w-auto">
                    <span class="text-sm font-bold text-gray-900 dark:text-white leading-none mb-0.5">intaraja</span>
                </a>
                <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                    Platform AI lengkap untuk belajar, menulis, dan bekerja lebih produktif — tersedia dalam bahasa Indonesia.
                </p>
                <a href="/"
                   class="block w-full text-center text-sm font-semibold px-4 py-2.5 rounded-xl bg-blue-600 dark:bg-orange-500 text-white hover:bg-blue-700 dark:hover:bg-orange-600 transition-colors">
                    Coba Gratis
                </a>
            </div>

            {{-- AI Tools quick links --}}
            <div>
                <p class="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-4">Tools AI</p>
                <ul class="space-y-2">
                    @foreach([
                        ['href' => '/chat', 'label' => 'AI Chat', 'desc' => 'Chat dengan AI pintar', 'icon' => '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="bi bi-chat-left" viewBox="0 0 16 16"><path d="M14 1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4.414A2 2 0 0 0 3 11.586l-2 2V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12.793a.5.5 0 0 0 .854.353l2.853-2.853A1 1 0 0 1 4.414 12H14a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/></svg>'],
                        ['href' => '/writer', 'label' => 'AI Writer', 'desc' => 'Tulis konten otomatis', 'icon' => '<svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6"/><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z"/><path d="M14 2v6h6"/></svg>'],
                        ['href' => '/paraphrase', 'label' => 'Paraphrase', 'desc' => 'Parafrasa teks instan', 'icon' => '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="bi bi-hash" viewBox="0 0 16 16"><path d="M8.39 12.648a1 1 0 0 0-.015.18c0 .305.21.508.5.508.266 0 .492-.172.555-.477l.554-2.703h1.204c.421 0 .617-.234.617-.547 0-.312-.188-.53-.617-.53h-.985l.516-2.524h1.265c.43 0 .618-.227.618-.547 0-.313-.188-.524-.618-.524h-1.046l.476-2.304a1 1 0 0 0 .016-.164.51.51 0 0 0-.516-.516.54.54 0 0 0-.539.43l-.523 2.554H7.617l.477-2.304c.008-.04.015-.118.015-.164a.51.51 0 0 0-.523-.516.54.54 0 0 0-.531.43L6.53 5.484H5.414c-.43 0-.617.22-.617.532s.187.539.617.539h.906l-.515 2.523H4.609c-.421 0-.609.219-.609.531s.188.547.61.547h.976l-.516 2.492c-.008.04-.015.125-.015.18 0 .305.21.508.5.508.265 0 .492-.172.554-.477l.555-2.703h2.242zm-1-6.109h2.266l-.515 2.563H6.859l.532-2.563z"/></svg>'],
                        ['href' => '/humanizer', 'label' => 'Humanizer AI', 'desc' => 'Buat teks terasa manusiawi', 'icon' => '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="bi bi-person-check-fill" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M15.854 5.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 0 1 .708-.708L12.5 7.793l2.646-2.647a.5.5 0 0 1 .708 0"/><path d="M1 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6"/></svg>'],
                        ['href' => '/transcribe','label' => 'Transcribe', 'desc' => 'Transkripsi audio & video', 'icon' => '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="bi bi-mic" viewBox="0 0 16 16"><path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5"/><path d="M10 8a2 2 0 1 1-4 0V3a2 2 0 1 1 4 0zM8 0a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V3a3 3 0 0 0-3-3"/></svg>'],
                        ['href' => '/plagiarism', 'label' => 'Plagiarism Check', 'desc' => 'Cek keaslian tulisan', 'icon' => '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16"><path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/></svg>'],
                    ] as $tool)
                    <li>
                        <a href="{{ $tool['href'] }}"
                           class="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                            <div class="w-7 h-7 rounded-lg bg-blue-100 dark:bg-gray-700 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-blue-200 dark:group-hover:bg-gray-600 transition-colors">
                                <span class="w-3.5 h-3.5 text-blue-600 dark:text-orange-400">{!! $tool['icon'] !!}</span>
                            </div>
                            <div class="min-w-0">
                                <p class="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-orange-400 transition-colors">{{ $tool['label'] }}</p>
                                <p class="text-xs text-gray-400 dark:text-gray-600 leading-snug mt-0.5">{{ $tool['desc'] }}</p>
                            </div>
                        </a>
                    </li>
                    @endforeach
                </ul>
            </div>

            {{-- Category quick links --}}
            @php
                $sidebarCategories = \App\Models\Blog::published()
                    ->whereNotNull('M_BlogCategory')
                    ->selectRaw('M_BlogCategory, count(*) as total')
                    ->groupBy('M_BlogCategory')
                    ->orderByDesc('total')
                    ->limit(6)
                    ->get();
            @endphp
            @if($sidebarCategories->count() > 0)
            <div>
                <p class="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-4">Kategori</p>
                <div class="flex flex-wrap gap-2">
                    @foreach($sidebarCategories as $cat)
                    <a href="/blog/category/{{ urlencode($cat->M_BlogCategory) }}"
                       class="px-3 py-1 rounded-full text-xs font-medium border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-400 dark:hover:border-orange-400 hover:text-blue-600 dark:hover:text-orange-400 transition-all">
                        {{ $cat->M_BlogCategory }}
                        <span class="text-gray-400 dark:text-gray-600 ml-0.5">{{ $cat->total }}</span>
                    </a>
                    @endforeach
                </div>
            </div>
            @endif

        </aside>
    </div>
</div>

{{-- Related Articles --}}
@if($relatedBlogs->count() > 0)
<section class="border-t border-gray-100 dark:border-gray-800 pb-20">
    <div class="max-w-5xl mx-auto px-6 sm:px-10 pt-14">
        <p class="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-8">Artikel Terkait</p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-7">
            @foreach($relatedBlogs as $related)
            <a href="/blog/{{ $related->M_BlogSlug }}"
               class="card-hover group flex flex-col rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                <div class="overflow-hidden bg-gray-50 dark:bg-gray-800 flex-shrink-0" style="height:176px;">
                    @if($related->M_BlogFeaturedImage)
                        <img src="{{ asset('storage/' . $related->M_BlogFeaturedImage) }}"
                             alt="{{ $related->M_BlogTitle }}"
                             class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out">
                    @endif
                </div>
                <div class="p-5 flex flex-col flex-1">
                    @if($related->M_BlogCategory)
                    <p class="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-orange-400 mb-2">
                        {{ $related->M_BlogCategory }}
                    </p>
                    @endif
                    <h3 class="text-base font-semibold leading-snug text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-orange-400 transition-colors flex-1">
                        {{ $related->M_BlogTitle }}
                    </h3>
                    <p class="text-xs text-gray-400 dark:text-gray-600 mt-3">
                        {{ $related->M_BlogPublishedAt->format('d M Y') }}
                    </p>
                </div>
            </a>
            @endforeach
        </div>
    </div>
</section>
@endif

@endsection
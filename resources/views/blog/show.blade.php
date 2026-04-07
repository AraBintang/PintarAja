@extends('blog.layout')

@section('content')

<div class="max-w-5xl mx-auto px-6 sm:px-10">

    {{-- Breadcrumb --}}
    <div class="pt-10 pb-8 md:pt-14">
        <a href="/blog"
           class="inline-flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-600 hover:text-gray-700 dark:hover:text-gray-300 transition-colors group">
            <svg class="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            Blog
        </a>
    </div>

    <article class="pb-20">

        {{-- Header --}}
        <header class="max-w-2xl mb-10">
            @if($blog->M_BlogCategory)
            <a href="/blog/category/{{ urlencode($blog->M_BlogCategory) }}"
               class="inline-block text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-orange-400 hover:opacity-70 transition-opacity mb-5">
                {{ $blog->M_BlogCategory }}
            </a>
            @endif

            <h1 class="text-3xl sm:text-4xl md:text-5xl leading-tight text-gray-900 dark:text-gray-100 mb-7">
                {{ $blog->M_BlogTitle }}
            </h1>

            {{-- Meta --}}
            <div class="flex flex-wrap items-center gap-5 text-sm text-gray-400 dark:text-gray-600 pb-7 border-b border-gray-100 dark:border-gray-800">
                @if($blog->author)
                <div class="flex items-center gap-2">
                    <div class="w-7 h-7 rounded-full bg-gray-900 dark:bg-gray-100 flex items-center justify-center text-xs font-bold text-white dark:text-gray-900">
                        {{ strtoupper(substr($blog->author->name, 0, 1)) }}
                    </div>
                    <span class="text-gray-600 dark:text-gray-400 font-medium text-sm">{{ $blog->author->name }}</span>
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
        <div class="mb-12 rounded-2xl overflow-hidden" style="max-height:480px;">
            <img src="{{ asset('storage/' . $blog->M_BlogFeaturedImage) }}"
                 alt="{{ $blog->M_BlogTitle }}"
                 class="w-full h-full object-cover">
        </div>
        @endif

        {{-- Content --}}
        <div class="max-w-2xl blog-content">
            {!! $blog->M_BlogContent !!}
        </div>

        {{-- Share --}}
        <div class="max-w-2xl mt-14 pt-8 border-t border-gray-100 dark:border-gray-800">
            <p class="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-4">Bagikan artikel ini</p>
            <div class="flex items-center gap-2.5">
                <a href="https://twitter.com/intent/tweet?url={{ urlencode(request()->url()) }}&text={{ urlencode($blog->M_BlogTitle) }}"
                   target="_blank"
                   class="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-600 hover:border-gray-500 dark:hover:border-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-all">
                    <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 5 20-5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-7 7-7z"/>
                    </svg>
                </a>
                <a href="https://www.facebook.com/sharer/sharer.php?u={{ urlencode(request()->url()) }}"
                   target="_blank"
                   class="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-600 hover:border-gray-500 dark:hover:border-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-all">
                    <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18 2h-3a6 6 0 00-6 6v3H7v4h2v8h4v-8h3l1-4h-4V8a1 1 0 011-1h3z"/>
                    </svg>
                </a>
                <a href="https://www.linkedin.com/sharing/share-offsite/?url={{ urlencode(request()->url()) }}"
                   target="_blank"
                   class="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-600 hover:border-gray-500 dark:hover:border-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-all">
                    <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/>
                    </svg>
                </a>
                <button
                    onclick="navigator.clipboard.writeText(window.location.href).then(() => { this.textContent = '✓ Tersalin'; setTimeout(() => this.textContent = 'Salin link', 2000) })"
                    class="ml-1 px-4 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:border-gray-500 dark:hover:border-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-all">
                    Salin link
                </button>
            </div>
        </div>

        {{-- Back --}}
        <div class="max-w-2xl mt-10 pt-8 border-t border-gray-100 dark:border-gray-800">
            <a href="/blog" class="inline-flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors group">
                <svg class="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                </svg>
                Kembali ke Blog
            </a>
        </div>
    </article>
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
                    <h3 class="text-base leading-snug text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-orange-400 transition-colors flex-1">
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
@extends('blog.layout')

@section('content')

{{-- Header --}}
<section class="max-w-5xl mx-auto px-6 sm:px-10 pt-16 pb-12 md:pt-24 md:pb-16">
    <a href="/blog"
       class="inline-flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-600 hover:text-gray-700 dark:hover:text-gray-300 transition-colors group mb-8">
        <svg class="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
        </svg>
        Semua Artikel
    </a>

    <div class="max-w-2xl">
        <p class="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-orange-400 mb-4">Kategori</p>
        <h1 class="text-4xl sm:text-5xl leading-tight text-gray-900 dark:text-gray-100 mb-5">
            {{ $currentCategory }}
        </h1>
        <p class="text-base text-gray-500 dark:text-gray-400 leading-relaxed">
            Semua artikel tentang <span class="text-gray-900 dark:text-gray-100 font-medium">{{ $currentCategory }}</span> di Blog Pintaraja AI.
        </p>
    </div>
</section>

{{-- Category Pills --}}
@if($categories->count() > 0)
<section class="max-w-5xl mx-auto px-6 sm:px-10 mb-12">
    <div class="flex flex-wrap gap-2">
        <a href="/blog"
           class="px-4 py-1.5 rounded-full text-sm font-medium border transition-all border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500">
            Semua
        </a>
        @foreach($categories as $cat)
        <a href="/blog/category/{{ urlencode($cat) }}"
           class="px-4 py-1.5 rounded-full text-sm font-medium border transition-all
                  {{ $currentCategory === $cat
                     ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-transparent'
                     : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500' }}">
            {{ $cat }}
        </a>
        @endforeach
    </div>
</section>
@endif

{{-- Article Grid --}}
<section class="max-w-5xl mx-auto px-6 sm:px-10 pb-20">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
        @forelse($blogs as $blog)
        <article class="card-hover group flex flex-col bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800">

            <a href="/blog/{{ $blog->M_BlogSlug }}" class="block overflow-hidden flex-shrink-0" style="height:210px;">
                @if($blog->M_BlogFeaturedImage)
                    <img src="{{ asset('storage/' . $blog->M_BlogFeaturedImage) }}"
                         alt="{{ $blog->M_BlogTitle }}"
                         class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out">
                @else
                    <div class="w-full h-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                        <svg class="w-10 h-10 text-gray-200 dark:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
                        </svg>
                    </div>
                @endif
            </a>

            <div class="flex flex-col flex-1 p-6">
                <div class="flex items-center gap-2 mb-3">
                    @if($blog->M_BlogCategory)
                    <span class="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-orange-400">
                        {{ $blog->M_BlogCategory }}
                    </span>
                    <span class="text-gray-300 dark:text-gray-700">·</span>
                    @endif
                    <span class="text-xs text-gray-400 dark:text-gray-600">
                        {{ $blog->M_BlogPublishedAt->format('d M Y') }}
                    </span>
                </div>

                <h2 class="text-lg leading-snug text-gray-900 dark:text-gray-100 mb-3 group-hover:text-blue-600 dark:group-hover:text-orange-400 transition-colors">
                    <a href="/blog/{{ $blog->M_BlogSlug }}">{{ $blog->M_BlogTitle }}</a>
                </h2>

                <p class="text-sm text-gray-500 dark:text-gray-500 leading-relaxed line-clamp-2 flex-1 mb-5">
                    {{ $blog->M_BlogExcerpt ?: Str::limit(strip_tags($blog->M_BlogContent), 110) }}
                </p>

                <div class="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div class="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-600">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                        <span>{{ number_format($blog->M_BlogViewCount) }}</span>
                    </div>
                    <a href="/blog/{{ $blog->M_BlogSlug }}"
                       class="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-orange-400 transition-colors">
                        Baca
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                        </svg>
                    </a>
                </div>
            </div>
        </article>

        @empty
        <div class="col-span-3 py-24 text-center">
            <div class="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                <svg class="w-8 h-8 text-gray-200 dark:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
                </svg>
            </div>
            <p class="text-xl text-gray-300 dark:text-gray-700 mb-1">Belum ada artikel</p>
            <p class="text-sm text-gray-400 dark:text-gray-600">Belum ada artikel dalam kategori ini.</p>
        </div>
        @endforelse
    </div>

    {{-- Pagination --}}
    @if($blogs->hasPages())
    <div class="mt-14 flex justify-center">
        <nav class="flex items-center gap-1">
            @if($blogs->onFirstPage())
                <span class="px-4 py-2 text-sm text-gray-300 dark:text-gray-700 cursor-not-allowed">← Prev</span>
            @else
                <a href="{{ $blogs->previousPageUrl() }}"
                   class="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    ← Prev
                </a>
            @endif

            @for($i = 1; $i <= $blogs->lastPage(); $i++)
                @if($i === $blogs->currentPage())
                    <span class="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-semibold">{{ $i }}</span>
                @elseif($i === 1 || $i === $blogs->lastPage() || abs($i - $blogs->currentPage()) <= 1)
                    <a href="{{ $blogs->url($i) }}"
                       class="w-9 h-9 flex items-center justify-center rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        {{ $i }}
                    </a>
                @elseif($i === 2 || $i === $blogs->lastPage() - 1)
                    <span class="w-9 h-9 flex items-center justify-center text-gray-300 dark:text-gray-700 text-sm">…</span>
                @endif
            @endfor

            @if($blogs->hasMorePages())
                <a href="{{ $blogs->nextPageUrl() }}"
                   class="px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    Next →
                </a>
            @else
                <span class="px-4 py-2 text-sm text-gray-300 dark:text-gray-700 cursor-not-allowed">Next →</span>
            @endif
        </nav>
    </div>
    @endif
</section>

@endsection
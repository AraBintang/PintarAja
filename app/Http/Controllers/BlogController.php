<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Blog;
use App\Models\BlogView;
use Illuminate\Support\Facades\Storage;

class BlogController extends Controller
{
    private function mapBlog(Blog $blog): array
    {
        return [
            'id' => $blog->M_BlogID,
            'title' => $blog->M_BlogTitle,
            'slug' => $blog->M_BlogSlug,
            'excerpt' => $blog->M_BlogExcerpt,
            'description' => $blog->M_BlogDescription,
            'meta_title' => $blog->M_BlogMetaTitle,
            'content' => $blog->M_BlogContent,
            'image' => $blog->M_BlogFeaturedImage,
            'category' => $blog->M_BlogCategory,
            'author_id' => $blog->M_BlogAuthorId,
            'view_count' => $blog->M_BlogViewCount,
            'published_at' => $blog->M_BlogPublishedAt,
            'is_published' => $blog->M_BlogIsPublished,
            'author' => $blog->relationLoaded('author') && $blog->author
                        ? ['id' => $blog->author->M_UserID, 'name' => $blog->author->M_UserFullName]
                        : null,
        ];
    }

    public function userIndex()
    {
        $blogs = Blog::published()
            ->latest('M_BlogPublishedAt')
            ->paginate(9);

        $categories = Blog::published()
            ->whereNotNull('M_BlogCategory')
            ->distinct()
            ->pluck('M_BlogCategory');

        return view('blog.index', [
            'blogs' => $blogs,
            'categories' => $categories,
            'title' => 'Blog - Pintaraja',
            'description' => 'Baca artikel terbaru tentang AI, pembelajaran, dan tips produktivitas dari Pintaraja.',
        ]);
    }

    public function show($slug)
    {
        $blog = Blog::published()
            ->where('M_BlogSlug', $slug)
            ->firstOrFail();

        $blog->incrementViewCount();

        // Logging view event for admin analytics (does not affect user experience)
        try {
            BlogView::create([
                'T_BlogViewM_BlogID' => $blog->M_BlogID,
                'T_BlogViewCreated' => now(),
            ]);
        } catch (\Throwable $e) {
            // ignore
        }

        $relatedBlogs = Blog::published()
            ->where('M_BlogID', '!=', $blog->M_BlogID)
            ->when($blog->M_BlogCategory, fn ($q) => $q->where('M_BlogCategory', $blog->M_BlogCategory))
            ->latest('M_BlogPublishedAt')
            ->limit(3)
            ->get();

        return view('blog.show', [
            'blog' => $blog,
            'relatedBlogs' => $relatedBlogs,
            'title' => ($blog->M_BlogMetaTitle ?: $blog->M_BlogTitle) . ' - Pintaraja',
            'description' => $blog->M_BlogDescription ?: $blog->M_BlogExcerpt,
        ]);
    }

    public function category($category)
    {
        $blogs = Blog::published()
            ->where('M_BlogCategory', $category)
            ->latest('M_BlogPublishedAt')
            ->paginate(10);

        $categories = Blog::published()
            ->whereNotNull('M_BlogCategory')
            ->distinct()
            ->pluck('M_BlogCategory');

        return view('blog.category', [
            'blogs' => $blogs,
            'categories' => $categories,
            'currentCategory' => $category,
            'title' => "Kategori: {$category} - Pintaraja",
            'description' => "Artikel tentang {$category} dari Pintaraja.",
        ]);
    }

    public function index()
    {
        $query = Blog::query()->with('author');

        if (request('search')) {
            $search = request('search');
            $query->where(function ($q) use ($search) {
                $q->where('M_BlogTitle', 'like', "%{$search}%")
                  ->orWhere('M_BlogSlug', 'like', "%{$search}%")
                  ->orWhere('M_BlogExcerpt', 'like', "%{$search}%");
            });
        }

        if (request('category')) {
            $query->where('M_BlogCategory', request('category'));
        }

        if (request('status') === 'published') {
            $query->where('M_BlogIsPublished', true);
        } elseif (request('status') === 'draft') {
            $query->where('M_BlogIsPublished', false);
        }

        $blogs = $query->latest('M_BlogCreatedAt')->paginate(request('per_page', 10));

        $summary = [
            'total' => Blog::count(),
            'published' => Blog::where('M_BlogIsPublished', true)->count(),
            'draft' => Blog::where('M_BlogIsPublished', false)->count(),
            'views' => Blog::sum('M_BlogViewCount'),
        ];

        return response()->json([
            'data' => array_map(fn ($b) => $this->mapBlog($b), $blogs->items()),
            'pagination' => [
                'current_page' => $blogs->currentPage(),
                'last_page' => $blogs->lastPage(),
                'per_page' => $blogs->perPage(),
                'total' => $blogs->total(),
                'from' => $blogs->firstItem(),
                'to' => $blogs->lastItem(),
            ],
            'summary' => $summary,
        ]);
    }

    public function store()
    {
        request()->merge([
            'M_BlogIsPublished' => filter_var(request('M_BlogIsPublished'), FILTER_VALIDATE_BOOLEAN),
        ]);

        $validated = request()->validate([
            'M_BlogTitle' => 'required|string|max:255',
            'M_BlogMetaTitle' => 'nullable|string|max:255',
            'M_BlogSlug' => 'required|string|max:255|unique:m_blog,M_BlogSlug',
            'M_BlogExcerpt' => 'nullable|string|max:500',
            'M_BlogDescription' => 'nullable|string|max:160',
            'M_BlogContent' => 'required|string',
            'M_BlogFeaturedImage' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:8192',
            'M_BlogCategory' => 'required|string|max:100',
            'M_BlogIsPublished' => 'boolean',
            'M_BlogPublishedAt' => 'nullable|date',
        ]);

        $validated['M_BlogAuthorId'] = auth()->id();

        if (request()->hasFile('M_BlogFeaturedImage')) {
            $validated['M_BlogFeaturedImage'] = request()
                ->file('M_BlogFeaturedImage')
                ->store('blogs', 'public');
        }

        $blog = Blog::create($validated);
        $blog->load('author');

        return response()->json([
            'message' => 'Blog created successfully',
            'data' => $this->mapBlog($blog),
        ], 201);
    }

    public function update($id)
    {
        $blog = Blog::findOrFail($id);

        request()->merge([
            'M_BlogIsPublished' => filter_var(request('M_BlogIsPublished'), FILTER_VALIDATE_BOOLEAN),
        ]);

        $validated = request()->validate([
            'M_BlogTitle' => 'required|string|max:255',
            'M_BlogMetaTitle' => 'nullable|string|max:255',
            'M_BlogSlug' => 'required|string|max:255|unique:m_blog,M_BlogSlug,' . $id . ',M_BlogID',
            'M_BlogExcerpt' => 'nullable|string|max:500',
            'M_BlogDescription' => 'nullable|string|max:160',
            'M_BlogContent' => 'required|string',
            'M_BlogFeaturedImage' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:8192',
            'M_BlogCategory' => 'required|string|max:100',
            'M_BlogIsPublished' => 'boolean',
            'M_BlogPublishedAt' => 'nullable|date',
        ]);

        $validated['M_BlogAuthorId'] = auth()->id();

        if (request()->hasFile('M_BlogFeaturedImage')) {
            if ($blog->M_BlogFeaturedImage) {
                Storage::disk('public')->delete($blog->M_BlogFeaturedImage);
            }
            $validated['M_BlogFeaturedImage'] = request()
                ->file('M_BlogFeaturedImage')
                ->store('blogs', 'public');
        }

        $blog->update($validated);
        $blog->load('author');

        return response()->json([
            'message' => 'Blog updated successfully',
            'data' => $this->mapBlog($blog),
        ]);
    }

    public function destroy($id)
    {
        $blog = Blog::findOrFail($id);

        if ($blog->M_BlogFeaturedImage) {
            Storage::disk('public')->delete($blog->M_BlogFeaturedImage);
        }

        $blog->delete();

        return response()->json(['message' => 'Blog deleted successfully']);
    }
}

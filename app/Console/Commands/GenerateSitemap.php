<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Spatie\Sitemap\Sitemap;
use Spatie\Sitemap\Tags\Url;
use App\Models\Blog; // sesuaikan model lo

class GenerateSitemap extends Command
{
    protected $signature = 'sitemap:generate';
    protected $description = 'Generate sitemap.xml';

    public function handle()
    {
        $sitemap = Sitemap::create();

        $sitemap->add(Url::create('/')->setPriority(1.0)->setChangeFrequency('daily'));
        $sitemap->add(Url::create('/blogs')->setPriority(0.8)->setChangeFrequency('daily'));

        Blog::all()->each(function ($blog) use ($sitemap) {
            $sitemap->add(
                Url::create("/blogs/{$blog->M_BlogSlug}")
                    ->setLastModificationDate($blog->updated_at ?? $blog->created_at ?? now())
                    ->setChangeFrequency('weekly')
                    ->setPriority(0.7)
            );
        });

        $sitemap->writeToFile(public_path('sitemap.xml'));

        $this->info('Sitemap generated!');
    }
}
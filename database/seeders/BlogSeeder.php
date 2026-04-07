<?php

namespace Database\Seeders;

use App\Models\Blog;
use Illuminate\Database\Seeder;

class BlogSeeder extends Seeder
{
    public function run(): void
    {
        $blogs = [
            [
                'M_BlogTitle' => 'Bagaimana AI Mengubah Cara Kita Belajar di Era Digital',
                'M_BlogSlug' => 'ai-mengubah-cara-belajar-digital',
                'M_BlogExcerpt' => 'Explore bagaimana teknologi AI membantu siswa belajar lebih efisien dan personal.',
                'M_BlogDescription' => 'Dalam era digital ini, Artificial Intelligence (AI) telah merevolusi cara kita belajar dan mengakses pengetahuan. Dengan kemampuan untuk menyesuaikan pembelajaran sesuai kebutuhan individu, AI membuat pendidikan menjadi lebih personal dan efektif.',
                'M_BlogContent' => '<h2>Revolusi Pendidikan dengan AI</h2>
<p>Teknologi AI tidak hanya mengubah industri, tetapi juga cara kita mendapatkan pendidikan. Platform pembelajaran seperti Pintaraja menggunakan machine learning untuk memahami kebutuhan unik setiap pengguna.</p>

<h2>Manfaat Utama AI dalam Pembelajaran</h2>
<ul>
<li><strong>Personalisasi</strong> - Setiap pembelajaran disesuaikan dengan kecepatan dan gaya belajar individu</li>
<li><strong>Efisiensi</strong> - Hemat waktu dengan mendapatkan jawaban instan untuk pertanyaan kompleks</li>
<li><strong>Fleksibilitas</strong> - Belajar kapan saja, dari mana saja, dengan perangkat apa pun</li>
<li><strong>Interaktif</strong> - Pembelajaran dua arah yang lebih engaging dan menyenangkan</li>
</ul>

<h2>Kesimpulan</h2>
<p>AI bukan hanya menciptakan alternatif untuk pembelajaran tradisional, tetapi memperkaya pengalaman belajar secara keseluruhan dengan cara yang belum pernah ada sebelumnya.</p>',
                'M_BlogCategory' => 'Pendidikan',
                'M_BlogAuthorId' => 1,
                'M_BlogIsPublished' => true,
                'M_BlogPublishedAt' => now()->subDays(7),
            ],
            [
                'M_BlogTitle' => 'Tips Menulis Konten yang SEO-Friendly dengan Bantuan AI',
                'M_BlogSlug' => 'tips-menulis-seo-friendly-ai',
                'M_BlogExcerpt' => 'Pelajari strategi menulis konten yang dioptimalkan SEO menggunakan tools AI modern.',
                'M_BlogDescription' => 'Menulis konten yang SEO-friendly bukan lagi tugas yang mustahil. Dengan bantuan AI dan beberapa tips sederhana, Anda bisa membuat konten yang tidak hanya menarik untuk pembaca tetapi juga disukai oleh mesin pencari.',
                'M_BlogContent' => '<h2>Pentingnya SEO dalam Konten Digital</h2>
<p>Dalam dunia digital yang kompetitif, memahami SEO (Search Engine Optimization) adalah kunci untuk membuat konten Anda ditemukan oleh audience yang tepat.</p>

<h2>Langkah-Langkah Menulis Konten SEO-Friendly</h2>
<ol>
<li><strong>Riset Keyword</strong> - Temukan keywords yang relevan dengan menggunakan tools seperti SEMrush atau Google Keyword Planner</li>
<li><strong>Struktur yang Baik</strong> - Gunakan heading (H1, H2, H3) dengan bijak untuk membuat konten mudah dipindai</li>
<li><strong>Meta Description</strong> - Tulis deskripsi yang menarik dalam 155-160 karakter</li>
<li><strong>Internal Linking</strong> - Hubungkan artikel Anda dengan artikel lain yang relevan</li>
<li><strong>Mobile Optimization</strong> - Pastikan konten responsif di semua perangkat</li>
</ol>

<h2>Peran AI dalam SEO</h2>
<p>AI dapat membantu menganalisis performa konten Anda, memberikan saran perbaikan, dan bahkan membantu menggenerate ide konten yang sesuai dengan trend pencarian terkini.</p>',
                'M_BlogCategory' => 'Content Marketing',
                'M_BlogAuthorId' => 1,
                'M_BlogIsPublished' => true,
                'M_BlogPublishedAt' => now()->subDays(14),
            ],
            [
                'M_BlogTitle' => '5 Cara Meningkatkan Produktivitas Dengan AI Tools',
                'M_BlogSlug' => '5-cara-tingkatkan-produktivitas-ai',
                'M_BlogExcerpt' => 'Discover bagaimana AI tools dapat membantu Anda bekerja lebih efisien dan produktif.',
                'M_BlogDescription' => 'Produktivitas adalah kunci kesuksesan modern. AI telah membuka peluang baru untuk bekerja lebih cerdas, bukan hanya lebih keras. Dalam artikel ini, kami bagikan 5 cara praktis menggunakan AI untuk meningkatkan produktivitas Anda.',
                'M_BlogContent' => '<h2>Era Baru Produktivitas</h2>
<p>Dengan pesatnya perkembangan teknologi AI, kita memiliki kesempatan emas untuk bekerja lebih efisien. Berikut adalah 5 cara yang terbukti meningkatkan produktivitas dengan menggunakan AI tools.</p>

<h2>1. Automasi Task Repetitif</h2>
<p>AI dapat mengotomatisasi tugas-tugas berulang seperti email classification, data entry, dan report generation. Ini memberi Anda waktu untuk fokus pada pekerjaan yang lebih strategis.</p>

<h2>2. Analisis Data yang Lebih Baik</h2>
<p>Tools AI seperti ChatGPT dan Claude dapat membantu Anda menganalisis data kompleks dan memberikan insights yang actionable dalam hitungan detik.</p>

<h2>3. Content Creation yang Lebih Cepat</h2>
<p>Dari membuat outline, menulis draft, hingga editing - AI dapat mempercepat seluruh proses content creation Anda.</p>

<h2>4. Scheduling dan Planning</h2>
<p>AI dapat membantu Anda mengorganisir schedule dan membuat planning yang lebih efisien berdasarkan data historis dan pattern recognition.</p>

<h2>5. Learning dan Development</h2>
<p>Gunakan AI untuk belajar skills baru dengan cepat, mendapatkan personalized learning path, dan practice dengan instantly feedback.</p>',
                'M_BlogCategory' => 'Produktivitas',
                'M_BlogAuthorId' => 1,
                'M_BlogIsPublished' => true,
                'M_BlogPublishedAt' => now()->subDays(3),
            ],
        ];

        foreach ($blogs as $blog) {
            Blog::create($blog);
        }
    }
}

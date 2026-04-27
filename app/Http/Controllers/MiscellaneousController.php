<?php

namespace App\Http\Controllers;

use App\Models\Blog;
use App\Models\BlogView;
use App\Models\Plagiarism;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MiscellaneousController extends Controller
{
    public function index(Request $request)
    {
        [$from, $to] = $this->resolveRange($request);

        $buckets = $this->buildDailyBuckets($from, $to);

        $usersByDay = User::query()
            ->selectRaw('DATE(M_UserCreated) as d, COUNT(*) as c')
            ->whereBetween('M_UserCreated', [$from, $to])
            ->groupBy('d')
            ->get();

        foreach ($usersByDay as $row) {
            $k = (string) $row->d;
            if (isset($buckets[$k])) {
                $buckets[$k]['users'] = (int) $row->c;
            }
        }

        $txPaidByDay = Transaction::query()
            ->selectRaw('DATE(T_TransactionCreated) as d, COUNT(*) as paid_count, COALESCE(SUM(T_TransactionAmount), 0) as revenue')
            ->where('T_TransactionStatus', 1)
            ->whereBetween('T_TransactionCreated', [$from, $to])
            ->groupBy('d')
            ->get();

        foreach ($txPaidByDay as $row) {
            $k = (string) $row->d;
            if (isset($buckets[$k])) {
                $buckets[$k]['tx_paid'] = (int) $row->paid_count;
                $buckets[$k]['tx_revenue'] = (int) $row->revenue;
            }
        }

        $plagiarismByDay = Plagiarism::query()
            ->selectRaw("DATE(M_PlagiarismCreated) as d, COUNT(*) as c, SUM(CASE WHEN M_PlagiarismStatus = 'waiting_payment' THEN 1 ELSE 0 END) as waiting_payment")
            ->whereBetween('M_PlagiarismCreated', [$from, $to])
            ->groupBy('d')
            ->get();

        foreach ($plagiarismByDay as $row) {
            $k = (string) $row->d;
            if (isset($buckets[$k])) {
                $buckets[$k]['plagiarism'] = (int) $row->c;
                $buckets[$k]['plagiarism_waiting_payment'] = (int) $row->waiting_payment;
            }
        }

        $blogViewsByDay = collect();
        try {
            $blogViewsByDay = BlogView::query()
                ->selectRaw('DATE(T_BlogViewCreated) as d, COUNT(*) as c')
                ->whereBetween('T_BlogViewCreated', [$from, $to])
                ->groupBy('d')
                ->get();

            foreach ($blogViewsByDay as $row) {
                $k = (string) $row->d;
                if (isset($buckets[$k])) {
                    $buckets[$k]['blog_views'] = (int) $row->c;
                }
            }
        } catch (\Throwable $e) {
            // If table not migrated yet, keep zeros.
            $blogViewsByDay = collect();
        }

        $series = array_values($buckets);

        $topBlogs = [];
        try {
            $blogIdCol = (new Blog)->getKeyName();
            $topBlogs = DB::table('t_blog_view')
                ->join('m_blog', 'm_blog.'.$blogIdCol, '=', 't_blog_view.T_BlogViewM_BlogID')
                ->whereBetween('t_blog_view.T_BlogViewCreated', [$from, $to])
                ->groupBy('t_blog_view.T_BlogViewM_BlogID', 'm_blog.M_BlogTitle', 'm_blog.M_BlogSlug')
                ->orderByDesc(DB::raw('COUNT(*)'))
                ->limit(5)
                ->get([
                    't_blog_view.T_BlogViewM_BlogID as id',
                    'm_blog.M_BlogTitle as title',
                    'm_blog.M_BlogSlug as slug',
                    DB::raw('COUNT(*) as views'),
                ])
                ->map(fn ($r) => [
                    'id' => (int) $r->id,
                    'title' => $r->title,
                    'slug' => $r->slug,
                    'views' => (int) $r->views,
                ])
                ->all();
        } catch (\Throwable $e) {
            $topBlogs = [];
        }

        $totals = [
            'users' => $usersByDay->sum('c'),
            'tx_paid' => $txPaidByDay->sum('paid_count'),
            'tx_revenue' => (int) $txPaidByDay->sum('revenue'),
            'plagiarism' => $plagiarismByDay->sum('c'),
            'plagiarism_waiting_payment' => $plagiarismByDay->sum('waiting_payment'),
            'blog_views' => $blogViewsByDay->sum('c'),
        ];

        return response()->json([
            'range' => [
                'from' => $from->toDateString(),
                'to' => $to->toDateString(),
            ],
            'totals' => $totals,
            'series' => $series,
            'topBlogs' => $topBlogs,
        ]);
    }

    private function resolveRange(Request $request): array
    {
        $fromQ = $request->query('from');
        $toQ = $request->query('to');

        if (! $fromQ && ! $toQ) {
            $d = now();

            return [$d->copy()->startOfDay(), $d->copy()->endOfDay()];
        }

        $from = $fromQ ? Carbon::parse($fromQ)->startOfDay() : now()->startOfDay();
        $to = $toQ ? Carbon::parse($toQ)->endOfDay() : now()->endOfDay();

        if ($from->greaterThan($to)) {
            [$from, $to] = [$to->copy()->startOfDay(), $from->copy()->endOfDay()];
        }

        // safety cap: max 366 days
        if ($from->diffInDays($to) > 366) {
            $to = $from->copy()->addDays(366)->endOfDay();
        }

        return [$from, $to];
    }

    private function buildDailyBuckets(Carbon $from, Carbon $to): array
    {
        $buckets = [];
        $cursor = $from->copy()->startOfDay();
        $end = $to->copy()->startOfDay();

        while ($cursor->lessThanOrEqualTo($end)) {
            $k = $cursor->toDateString();
            $buckets[$k] = [
                'date' => $k,
                'users' => 0,
                'tx_paid' => 0,
                'tx_revenue' => 0,
                'plagiarism' => 0,
                'plagiarism_waiting_payment' => 0,
                'blog_views' => 0,
            ];
            $cursor->addDay();
        }

        return $buckets;
    }
}

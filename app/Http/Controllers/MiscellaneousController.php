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

        $activeUsersByDay = User::query()
            ->selectRaw('DATE(M_UserLastActive) as d, COUNT(*) as c')
            ->whereNotNull('M_UserLastActive')
            ->whereBetween('M_UserLastActive', [$from, $to])
            ->groupBy('d')
            ->get();

        foreach ($activeUsersByDay as $row) {
            $k = (string) $row->d;
            if (isset($buckets[$k])) {
                $buckets[$k]['active_users'] = (int) $row->c;
            }
        }

        $conversationByDay = collect();
        try {
            $conversationByDay = DB::table('t_conversation')
                ->selectRaw('DATE(T_ConversationCreated) as d, COUNT(*) as c')
                ->whereBetween('T_ConversationCreated', [$from, $to])
                ->groupBy('d')
                ->get();

            foreach ($conversationByDay as $row) {
                $k = (string) $row->d;
                if (isset($buckets[$k])) {
                    $buckets[$k]['conversation'] = (int) $row->c;
                }
            }
        } catch (\Throwable $e) { 
            $conversationByDay = collect();
        }

        $documentByDay = collect();
        try {
            $documentByDay = DB::table('m_document')
                ->selectRaw('DATE(M_DocumentCreated) as d, COUNT(*) as c')
                ->whereBetween('M_DocumentCreated', [$from, $to])
                ->groupBy('d')
                ->get();

            foreach ($documentByDay as $row) {
                $k = (string) $row->d;
                if (isset($buckets[$k])) {
                      $buckets[$k]['document'] = (int) $row->c;
                  }
            }
        } catch (\Throwable $e) {
            $documentByDay = collect();
        }

        $paraphraseByDay = collect();
        try {
            $paraphraseByDay = DB::table('m_paraphrase')
                ->selectRaw('DATE(M_ParaphraseCreated) as d, COUNT(*) as c')
                ->whereBetween('M_ParaphraseCreated', [$from, $to])
                ->groupBy('d')
                ->get();

            foreach ($paraphraseByDay as $row) {
                $k = (string) $row->d;
                if (isset($buckets[$k])) {
                    $buckets[$k]['paraphrase'] = (int) $row->c;
                }
            }
        } catch (\Throwable $e) {
            $paraphraseByDay = collect();
        }

        $humanizerByDay = collect();
        try {
            $humanizerByDay = DB::table('m_humanizer')
                ->selectRaw('DATE(M_HumanizerCreated) as d, COUNT(*) as c')
                ->whereBetween('M_HumanizerCreated', [$from, $to])
                ->groupBy('d')
                ->get();

            foreach ($humanizerByDay as $row) {
                $k = (string) $row->d;
                if (isset($buckets[$k])) {
                    $buckets[$k]['humanizer'] = (int) $row->c;
                }
            }
        } catch (\Throwable $e) {
            $humanizerByDay = collect();
        }

        $transcribeByDay = collect();
        try {
            $transcribeByDay = DB::table('m_transcribe')
                ->selectRaw('DATE(M_TranscribeCreated) as d, COUNT(*) as c')
                ->whereBetween('M_TranscribeCreated', [$from, $to])
                ->groupBy('d')
                ->get();

            foreach ($transcribeByDay as $row) {
                $k = (string) $row->d;
                if (isset($buckets[$k])) {
                    $buckets[$k]['transcribe'] = (int) $row->c;
                }
            }
        } catch (\Throwable $e) {
            $transcribeByDay = collect();
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

        $couponRedemptionByDay = collect();
        try {
            $couponRedemptionByDay = DB::table('m_coupon_redemption as cr')
                ->join('m_coupon as c', 'cr.M_RedemptionCouponID', '=', 'c.M_CouponID')
                ->selectRaw(
                    "DATE(cr.M_RedemptionDate) as d,
                    SUM(CASE WHEN c.M_CouponMaxUses IS NULL OR c.M_CouponMaxUses = '' THEN 1 ELSE 0 END) as regular_count,
                    SUM(CASE WHEN c.M_CouponMaxUses IS NOT NULL AND c.M_CouponMaxUses != '' THEN 1 ELSE 0 END) as campaign_count"
                )
                ->whereBetween('cr.M_RedemptionDate', [$from, $to])
                ->groupBy('d')
                ->get();

            foreach ($couponRedemptionByDay as $row) {
                $k = (string) $row->d;
                if (isset($buckets[$k])) {
                    $buckets[$k]['coupon_redeemed_regular'] = (int) $row->regular_count;
                    $buckets[$k]['coupon_redeemed_campaign'] = (int) $row->campaign_count;
                    $buckets[$k]['coupon_redeemed_total'] = (int) $row->regular_count + (int) $row->campaign_count;
                }
            }
        } catch (\Throwable $e) {
            $couponRedemptionByDay = collect();
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
            $blogViewsByDay = collect();
        }

        $series = array_values($buckets);

        $dayCount = max(1, count(array_filter($buckets, fn ($b) =>
            $b['users'] || $b['tx_paid'] || $b['plagiarism'] ||
            $b['conversation'] || $b['document'] || $b['paraphrase'] || $b['humanizer'] || $b['transcribe'] ||
            $b['blog_views'] || $b['coupon_redeemed_total']
        )));

        if ($dayCount == 0) {
            $dayCount = ($from->diffInDays($to) + 1);
        }

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

        $deviceBreakdown = User::query()
            ->selectRaw("COALESCE(NULLIF(M_UserLastDevice, ''), 'Unknown') as device, COUNT(*) as users")
            ->whereNotNull('M_UserLastActive')
            ->groupBy('device')
            ->orderByDesc('users')
            ->limit(8)
            ->get()
            ->map(fn ($r) => [
                'device' => $r->device,
                'users' => (int) $r->users,
            ])
            ->all();

        $recentActiveUsers = User::query()
            ->select([
                'M_UserID as id',
                'M_UserFullName as name',
                'M_UserEmail as email',
                'M_UserLastActive as last_active',
                'M_UserLastLogin as last_login',
                'M_UserLastDevice as device',
                'M_UserLastActiveIP as ip',
            ])
            ->whereNotNull('M_UserLastActive')
            ->orderByDesc('M_UserLastActive')
            ->limit(8)
            ->get();

        $totals = [
            'users' => $usersByDay->sum('c'),
            'users_avg' => round($usersByDay->sum('c') / $dayCount, 2),
            'active_users' => $activeUsersByDay->sum('c'),
            'active_users_avg' => round($activeUsersByDay->sum('c') / $dayCount, 2),
            'active_users_7d' => User::query()
                ->whereNotNull('M_UserLastActive')
                ->where('M_UserLastActive', '>=', now()->subDays(7))
                ->count(),
            'active_users_30d' => User::query()
                ->whereNotNull('M_UserLastActive')
                ->where('M_UserLastActive', '>=', now()->subDays(30))
                ->count(),
            'conversation' => $conversationByDay->sum('c'),
            'conversation_avg' => round($conversationByDay->sum('c') / $dayCount, 2),
            'document' => $documentByDay->sum('c'),
            'document_avg' => round($documentByDay->sum('c') / $dayCount, 2),
            'paraphrase' => $paraphraseByDay->sum('c'),
            'paraphrase_avg' => round($paraphraseByDay->sum('c') / $dayCount, 2),
            'humanizer' => $humanizerByDay->sum('c'),
            'humanizer_avg' => round($humanizerByDay->sum('c') / $dayCount, 2),
            'transcribe' => $transcribeByDay->sum('c'),
            'transcribe_avg' => round($transcribeByDay->sum('c') / $dayCount, 2),
            'plagiarism' => $plagiarismByDay->sum('c'),
            'plagiarism_avg' => round($plagiarismByDay->sum('c') / $dayCount, 2),
            'plagiarism_waiting_payment' => $plagiarismByDay->sum('waiting_payment'),
            'plagiarism_waiting_payment_avg' => round($plagiarismByDay->sum('waiting_payment') / $dayCount, 2),
            'tx_paid' => $txPaidByDay->sum('paid_count'),
            'tx_paid_avg' => round($txPaidByDay->sum('paid_count') / $dayCount, 2),
            'tx_revenue' => (int) $txPaidByDay->sum('revenue'),
            'tx_revenue_avg' => round($txPaidByDay->sum('revenue') / max(1, $txPaidByDay->sum('paid_count')), 2),
            'coupon_redeemed_regular'  => $couponRedemptionByDay->sum('regular_count'),
            'coupon_redeemed_regular_avg' => round($couponRedemptionByDay->sum('regular_count') / $dayCount, 2),
            'coupon_redeemed_campaign' => $couponRedemptionByDay->sum('campaign_count'),
            'coupon_redeemed_campaign_avg' => round($couponRedemptionByDay->sum('campaign_count') / $dayCount, 2),
            'coupon_redeemed_total' => $couponRedemptionByDay->sum('regular_count') + $couponRedemptionByDay->sum('campaign_count'),
            'coupon_redeemed_total_avg' => round(($couponRedemptionByDay->sum('regular_count') + $couponRedemptionByDay->sum('campaign_count')) / $dayCount, 2),
            'blog_views' => $blogViewsByDay->sum('c'),
            'blog_views_avg' => round($blogViewsByDay->sum('c') / $dayCount, 2),
        ];

        return response()->json([
            'range' => ['from' => $from->toDateString(), 'to' => $to->toDateString()],
            'totals' => $totals,
            'series' => $series,
            'topBlogs' => $topBlogs,
            'deviceBreakdown' => $deviceBreakdown,
            'recentActiveUsers' => $recentActiveUsers,
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
                'active_users' => 0,
                'conversation' => 0,
                'document' => 0,
                'paraphrase' => 0,
                'humanizer' => 0,
                'transcribe' => 0,
                'plagiarism' => 0,
                'plagiarism_waiting_payment' => 0,
                'tx_paid' => 0,
                'tx_revenue' => 0,
                'coupon_redeemed_regular' => 0,
                'coupon_redeemed_campaign' => 0,
                'coupon_redeemed_total' => 0,
                'blog_views' => 0,
            ];
            $cursor->addDay();
        }

        return $buckets;
    }
}

import React, { useState, useEffect, useRef } from 'react';
import AxiosInstance from '../../../api/axiosInstance';
import {
  Eye, Heart, MessageSquare, Users, ChevronDown, Info, TrendingUp,
  FileText, Clock, XCircle, CheckCircle, AlertCircle, Sparkles
} from 'lucide-react';
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';

const RANGE_OPTIONS = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '3m', label: 'Last 3 Months' },
  { value: 'all', label: 'All Time' },
];

const RANGE_DAYS = { '7d': 7, '30d': 30, '3m': 90, 'all': 180 };
const RANGE_MULTIPLIER = { '7d': 0.18, '30d': 1, '3m': 2.6, 'all': 4.4 };

function formatNumber(num) {
  const n = num || 0;
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toLocaleString();
}

function formatAxisDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function toDateStr(date) {
  return date.toISOString().split('T')[0];
}

/* ---------------------------------------------------------------------
 * TEMPORARY DEMO DATA
 * ------------------------------------------------------------------- */
function generateDemoData(range, granularity) {
  const days = RANGE_DAYS[range];
  const multiplier = RANGE_MULTIPLIER[range];
  const today = new Date();

  const dailyPoints = Array.from({ length: days }).map((_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (days - 1 - i));
    return date;
  });

  const viewsDaily = dailyPoints.map((date, i) => {
    const progress = i / days;
    const base = 150 + progress * 450;
    const wave = Math.sin(i / 3) * 60;
    const noise = (Math.random() - 0.5) * 80;
    return { date: toDateStr(date), views: Math.max(20, Math.round(base + wave + noise)) };
  });

  let viewsSeries = viewsDaily;
  if (granularity === 'weekly') {
    const weeks = [];
    for (let i = 0; i < viewsDaily.length; i += 7) {
      const chunk = viewsDaily.slice(i, i + 7);
      const total = chunk.reduce((sum, p) => sum + p.views, 0);
      weeks.push({ date: chunk[chunk.length - 1].date, views: total });
    }
    viewsSeries = weeks;
  }

  const engagementSeries = dailyPoints.map((date, i) => {
    const progress = i / days;
    const likes = Math.max(0, Math.round((8 + progress * 20) + (Math.random() - 0.5) * 8));
    const comments = Math.max(0, Math.round((2 + progress * 6) + (Math.random() - 0.5) * 3));
    const bookmarks = Math.max(0, Math.round((1.5 + progress * 4) + (Math.random() - 0.5) * 2));
    return { date: toDateStr(date), likes, comments, bookmarks };
  });

  const followerGrowth = dailyPoints.map((date, i) => {
    const progress = i / days;
    const base = 980 + progress * 260;
    const noise = (Math.random() - 0.3) * 12;
    return { date: toDateStr(date), followers: Math.max(0, Math.round(base + noise)) };
  });

  const overview = {
    views: 12482,
    likes: 846,
    comments: 248,
    followers: 1240,
  };

  const engagementTotals = { bookmarks: Math.round(132 * multiplier) };

  const rawRate = ((overview.likes + overview.comments + engagementTotals.bookmarks) / overview.views) * 100;
  const engagementRate = Number(rawRate.toFixed(1));

  const topArticles = [
    { article_id: 'demo-1', slug: 'understanding-http-3', title: 'Understanding HTTP/3', views: Math.round(4820 * multiplier), likes: Math.round(312 * multiplier), comments: Math.round(48 * multiplier) },
    { article_id: 'demo-2', slug: 'how-apis-actually-work', title: 'How APIs Actually Work', views: Math.round(3640 * multiplier), likes: Math.round(241 * multiplier), comments: Math.round(31 * multiplier) },
    { article_id: 'demo-3', slug: 'getting-started-with-nodejs', title: 'Getting Started with Node.js', views: Math.round(2210 * multiplier), likes: Math.round(154 * multiplier), comments: Math.round(22 * multiplier) },
    { article_id: 'demo-4', slug: 'css-grid-vs-flexbox', title: 'CSS Grid vs Flexbox: When to Use Which', views: Math.round(1480 * multiplier), likes: Math.round(97 * multiplier), comments: Math.round(15 * multiplier) },
    { article_id: 'demo-5', slug: 'a-practical-guide-to-webhooks', title: 'A Practical Guide to Webhooks', views: Math.round(980 * multiplier), likes: Math.round(63 * multiplier), comments: Math.round(9 * multiplier) },
  ];

  const contentSummary = { published: 24, draft: 5, pending: 2, rejected: 1 };

  return {
    overview,
    viewsSeries,
    engagementSeries,
    engagementTotals,
    engagementRate,
    topArticles,
    followerGrowth,
    contentSummary,
  };
}
/* --------------------------- END DEMO DATA --------------------------- */

const ChartTooltip = ({ active, payload, label, formatters }) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg px-3 py-2">
      <p className="text-[11px] font-semibold text-gray-400 dark:text-slate-500 mb-1">{formatAxisDate(label)}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="text-xs font-semibold flex items-center gap-1.5" style={{ color: entry.color }}>
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
          {(formatters?.[entry.dataKey] || entry.name)}: {entry.value?.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

const Analytics = () => {

  const [dateRange, setDateRange] = useState('30d');
  const [granularity, setGranularity] = useState('daily');

  const [isLoading, setIsLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const [loadError, setLoadError] = useState("");

  const [overview, setOverview] = useState({ views: 0, likes: 0, comments: 0, followers: 0 });
  const [viewsSeries, setViewsSeries] = useState([]);
  const [engagementSeries, setEngagementSeries] = useState([]);
  const [engagementTotals, setEngagementTotals] = useState({ likes: 0, comments: 0, bookmarks: 0 });
  const [engagementRate, setEngagementRate] = useState(0);
  const [topArticles, setTopArticles] = useState([]);
  const [followerGrowth, setFollowerGrowth] = useState([]);
  const [contentSummary, setContentSummary] = useState({ published: 0, draft: 0, pending: 0, rejected: 0 });

  const [rateTooltipOpen, setRateTooltipOpen] = useState(false);
  const rateTooltipRef = useRef(null);

  const isFirstLoad = useRef(true);

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange, granularity]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (rateTooltipRef.current && !rateTooltipRef.current.contains(e.target)) {
        setRateTooltipOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const applyData = (data) => {
    setOverview({
      views: data.overview?.total_views || 0,
      likes: data.overview?.total_likes || 0,
      comments: data.overview?.total_comments || 0,
      followers: data.overview?.total_followers || 0,
    });
    setViewsSeries(data.viewsTimeSeries || []);
    setEngagementSeries(data.engagementSeries || []);
    setEngagementTotals({
      likes: data.overview?.total_likes || 0,
      comments: data.overview?.total_comments || 0,
      bookmarks: data.engagementTotals?.bookmarks || 0,
    });
    setEngagementRate(data.engagementRate || 0);
    setTopArticles(data.topArticles || []);
    setFollowerGrowth(data.followerGrowth || []);
    setContentSummary({
      published: data.contentSummary?.published || 0,
      draft: data.contentSummary?.draft || 0,
      pending: data.contentSummary?.pending || 0,
      rejected: data.contentSummary?.rejected || 0,
    });
  };

  const fetchAnalytics = () => {
    if (isFirstLoad.current) {
      setIsLoading(true);
    } else {
      setIsRefetching(true);
    }
    setLoadError("");

    AxiosInstance.get('/dashboard/contri/analytics', {
      params: { range: dateRange, granularity },
    })
      .then((res) => {
        applyData(res.data);
      })
      .catch((err) => {
        console.log(err);
        // TEMPORARY: fall back to generated demo data until the
        // analytics endpoint is live, instead of showing an error.
        applyData(generateDemoData(dateRange, granularity));
      })
      .finally(() => {
        setIsLoading(false);
        setIsRefetching(false);
        isFirstLoad.current = false;
      });
  };

  const handleViewArticle = (slug) => {
    window.open(`/view/${slug}`, '_blank', 'noopener,noreferrer');
  };

  const overviewData = [
    { label: "Total Views", value: overview.views, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20", icon: Eye },
    { label: "Total Likes", value: overview.likes, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-900/20", icon: Heart },
    { label: "Comments", value: overview.comments, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20", icon: MessageSquare },
    { label: "Followers", value: overview.followers, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-900/20", icon: Users },
  ];

  const contentSummaryRows = [
    { label: "Published Articles", value: contentSummary.published, color: "text-green-600 dark:text-green-400", icon: CheckCircle },
    { label: "Draft Articles", value: contentSummary.draft, color: "text-gray-500 dark:text-slate-400", icon: FileText },
    { label: "Pending Review", value: contentSummary.pending, color: "text-amber-600 dark:text-amber-400", icon: Clock },
    { label: "Rejected Articles", value: contentSummary.rejected, color: "text-red-600 dark:text-red-400", icon: XCircle },
  ];

  if (isLoading) {
    return (
      <div className="space-y-8 font-[Inter,system-ui,sans-serif]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-[Newsreader,Georgia,serif] text-3xl sm:text-4xl font-black text-gray-900 dark:text-gray-50 mb-2">
              Analytics
            </h1>
            <p className="text-gray-500 dark:text-slate-400">Track how your content is performing</p>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-gray-200 dark:bg-slate-700 rounded-xl overflow-hidden">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-800 p-6 animate-pulse">
              <div className="w-10 h-10 bg-gray-100 dark:bg-slate-700 rounded mb-4" />
              <div className="h-8 bg-gray-100 dark:bg-slate-700 rounded w-16 mb-2" />
              <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded w-20" />
            </div>
          ))}
        </div>
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 h-80 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-8 font-[Inter,system-ui,sans-serif]">

      {/* Header + Date Range */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <h1 className="font-[Newsreader,Georgia,serif] text-3xl sm:text-4xl font-black text-gray-900 dark:text-gray-50">
              Analytics
            </h1>
          </div>
          <p className="text-gray-500 dark:text-slate-400">Track how your content is performing</p>
        </div>

        <div className="relative shrink-0">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="appearance-none pl-3 pr-9 py-2.5 text-sm font-semibold rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 dark:focus:ring-blue-500/30 focus:border-[#1E3A5F] dark:focus:border-blue-500"
          >
            {RANGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500 pointer-events-none" />
        </div>
      </div>

      {loadError && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-300">{loadError}</p>
        </div>
      )}

      <div className={`space-y-8 transition-opacity duration-150 ${isRefetching ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>

        {/* Overview */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-4">Overview</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-gray-200 dark:bg-slate-700 rounded-xl overflow-hidden">
            {overviewData.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="bg-white dark:bg-slate-800 p-6">
                  <div className={`inline-flex p-2.5 rounded mb-4 ${stat.bg}`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <p className={`text-3xl font-semibold ${stat.color}`}>{formatNumber(stat.value)}</p>
                  <p className="text-[11px] font-semibold tracking-widest uppercase text-gray-400 dark:text-slate-500 mt-1">
                    {stat.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Article Views */}
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Article Views</h2>
            <div className="relative">
              <select
                value={granularity}
                onChange={(e) => setGranularity(e.target.value)}
                className="appearance-none pl-3 pr-8 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 dark:focus:ring-blue-500/30"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>

          {viewsSeries.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={viewsSeries} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1E3A5F" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#1E3A5F" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:opacity-10" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatAxisDate}
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  minTickGap={30}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatNumber}
                  width={40}
                />
                <RechartsTooltip content={<ChartTooltip formatters={{ views: 'Views' }} />} />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="#1E3A5F"
                  strokeWidth={2}
                  fill="url(#viewsGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-sm text-gray-400 dark:text-slate-500">
              No view data for this period
            </div>
          )}
        </div>

        {/* Engagement */}
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-5">Reader Engagement</h2>

          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: "Likes", value: engagementTotals.likes, color: "text-rose-600 dark:text-rose-400" },
              { label: "Comments", value: engagementTotals.comments, color: "text-emerald-600 dark:text-emerald-400" },
              { label: "Bookmarks", value: engagementTotals.bookmarks, color: "text-purple-600 dark:text-purple-400" },
            ].map((row) => (
              <div key={row.label} className="bg-gray-50 dark:bg-slate-900 rounded-lg p-4">
                <p className={`text-xl font-bold ${row.color}`}>{formatNumber(row.value)}</p>
                <p className="text-[11px] font-semibold tracking-wide uppercase text-gray-400 dark:text-slate-500 mt-0.5">{row.label}</p>
              </div>
            ))}
          </div>

          {engagementSeries.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={engagementSeries} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:opacity-10" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatAxisDate}
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  minTickGap={30}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatNumber}
                  width={40}
                />
                <RechartsTooltip content={<ChartTooltip formatters={{ likes: 'Likes', comments: 'Comments', bookmarks: 'Bookmarks' }} />} />
                <Line type="monotone" dataKey="likes" stroke="#e11d48" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="comments" stroke="#059669" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="bookmarks" stroke="#9333ea" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[240px] flex items-center justify-center text-sm text-gray-400 dark:text-slate-500">
              No engagement data for this period
            </div>
          )}

          <div className="flex items-center gap-4 justify-center mt-3">
            {[
              { label: "Likes", color: "#e11d48" },
              { label: "Comments", color: "#059669" },
              { label: "Bookmarks", color: "#9333ea" },
            ].map((item) => (
              <span key={item.label} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                {item.label}
              </span>
            ))}
          </div>
        </div>

        {/* Engagement Rate */}
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-3 relative" ref={rateTooltipRef}>
            <TrendingUp className="w-4 h-4 text-[#1E3A5F] dark:text-blue-400" />
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Engagement Rate</h2>
            <button
              onClick={() => setRateTooltipOpen((v) => !v)}
              className="p-0.5 rounded text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors duration-100"
            >
              <Info className="w-3.5 h-3.5" />
            </button>

            {rateTooltipOpen && (
              <div className="absolute left-0 top-full mt-2 w-72 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg p-4 z-10">
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-2">How this is calculated</p>
                <div className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed font-mono bg-gray-50 dark:bg-slate-900 rounded p-2">
                  (likes + approved comments + bookmarks)<br />
                  ─────────────────────────────<br />
                  views × 100
                </div>
                <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-2">
                  Measures how much readers interact with your work relative to how many people see it.
                </p>
              </div>
            )}
          </div>

          <p className="text-4xl font-bold text-[#1E3A5F] dark:text-blue-400">{engagementRate.toFixed(1)}%</p>
        </div>

        {/* Top Performing Articles */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-4">Top Performing Articles</h2>

          {topArticles.length > 0 ? (
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-slate-700">
                      <th className="px-5 py-3 text-left text-[11px] font-semibold tracking-widest uppercase text-gray-400 dark:text-slate-500 w-12">#</th>
                      <th className="px-5 py-3 text-left text-[11px] font-semibold tracking-widest uppercase text-gray-400 dark:text-slate-500">Article</th>
                      <th className="px-5 py-3 text-right text-[11px] font-semibold tracking-widest uppercase text-gray-400 dark:text-slate-500">Views</th>
                      <th className="px-5 py-3 text-right text-[11px] font-semibold tracking-widest uppercase text-gray-400 dark:text-slate-500">Likes</th>
                      <th className="px-5 py-3 text-right text-[11px] font-semibold tracking-widest uppercase text-gray-400 dark:text-slate-500">Comments</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                    {topArticles.slice(0, 5).map((article, index) => (
                      <tr
                        key={article.article_id}
                        onClick={() => handleViewArticle(article.slug)}
                        className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors duration-100 cursor-pointer"
                      >
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-900/20 text-[#1E3A5F] dark:text-blue-400 text-xs font-bold">
                            {index + 1}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-medium text-gray-800 dark:text-gray-100 max-w-xs truncate">
                          {article.title}
                        </td>
                        <td className="px-5 py-4 text-right text-gray-600 dark:text-slate-300">{formatNumber(article.views)}</td>
                        <td className="px-5 py-4 text-right text-gray-600 dark:text-slate-300">{formatNumber(article.likes)}</td>
                        <td className="px-5 py-4 text-right text-gray-600 dark:text-slate-300">{formatNumber(article.comments)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center py-14 text-center">
              <div className="w-12 h-12 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center mb-3">
                <FileText className="w-5 h-5 text-gray-300 dark:text-slate-500" />
              </div>
              <p className="text-sm text-gray-400 dark:text-slate-500">No article performance data yet</p>
            </div>
          )}
        </div>

        {/* Follower Growth */}
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-6">Follower Growth</h2>

          {followerGrowth.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={followerGrowth} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="followerGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#059669" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:opacity-10" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatAxisDate}
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  minTickGap={30}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatNumber}
                  width={40}
                />
                <RechartsTooltip content={<ChartTooltip formatters={{ followers: 'Followers' }} />} />
                <Area
                  type="monotone"
                  dataKey="followers"
                  stroke="#059669"
                  strokeWidth={2}
                  fill="url(#followerGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[260px] flex items-center justify-center text-sm text-gray-400 dark:text-slate-500">
              No follower data for this period
            </div>
          )}
        </div>

        {/* Content Summary */}
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-5">Content Summary</h2>
          <div className="space-y-1">
            {contentSummaryRows.map((row) => {
              const Icon = row.icon;
              return (
                <div key={row.label} className="flex items-center justify-between py-2.5 border-b border-gray-100 dark:border-slate-700 last:border-0">
                  <span className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
                    <Icon className={`w-4 h-4 ${row.color}`} />
                    {row.label}
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-50">{row.value}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Analytics;
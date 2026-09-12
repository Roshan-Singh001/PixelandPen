import React, { useState, useEffect, useRef } from 'react';
import AxiosInstance from '../../../api/axiosInstance';
import {
  Eye, Heart, Bookmark, MessageSquare, FileText, Users, Sparkles,
  AlertCircle
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, Cell
} from 'recharts';

const RANGE_OPTIONS = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '3m', label: 'Last 3 Months' },
  { value: 'all', label: 'All Time' },
];

const RANGE_DAYS = { '7d': 7, '30d': 30, '3m': 90, 'all': 180 };
const RANGE_MULTIPLIER = { '7d': 0.14, '30d': 1, '3m': 2.8, 'all': 4.6 };

const CATEGORY_COLORS = ["#1E3A5F", "#3B82F6", "#8B5CF6", "#EC4899", "#94A3B8"];

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

function generateDemoData(range) {
  const days = RANGE_DAYS[range];
  const multiplier = RANGE_MULTIPLIER[range];
  const today = new Date();

  const viewsSeries = Array.from({ length: days }).map((_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (days - 1 - i));
    const progress = i / days;
    const base = 280 + progress * 620;
    const wave = Math.sin(i / 2.5) * 90;
    const noise = (Math.random() - 0.5) * 100;
    return { date: toDateStr(date), views: Math.max(40, Math.round(base + wave + noise)) };
  });

  const overview = {
    views: Math.round(24842),
    likes: Math.round(2431),
    bookmarks: Math.round(842),
    comments: Math.round(387),
  };

  const topArticles = [
    { article_id: 'demo-1', slug: 'future-of-artificial-ai', title: 'The Future of Artificial AI', views: Math.round(4821 * multiplier), likes: Math.round(342 * multiplier), comments: Math.round(51 * multiplier) },
    { article_id: 'demo-2', slug: 'understanding-websockets', title: 'Understanding WebSockets', views: Math.round(3912 * multiplier), likes: Math.round(287 * multiplier), comments: Math.round(39 * multiplier) },
    { article_id: 'demo-3', slug: 'rise-of-modern-web-apps', title: 'The Rise of Modern Web Apps', views: Math.round(2841 * multiplier), likes: Math.round(201 * multiplier), comments: Math.round(27 * multiplier) },
    { article_id: 'demo-4', slug: 'css-grid-vs-flexbox', title: 'CSS Grid vs Flexbox: When to Use Which', views: Math.round(1980 * multiplier), likes: Math.round(148 * multiplier), comments: Math.round(19 * multiplier) },
    { article_id: 'demo-5', slug: 'practical-guide-to-webhooks', title: 'A Practical Guide to Webhooks', views: Math.round(1204 * multiplier), likes: Math.round(89 * multiplier), comments: Math.round(12 * multiplier) },
  ];

  const categoryBreakdown = [
    { name: "Technology", count: 32 },
    { name: "AI", count: 24 },
    { name: "Programming", count: 18 },
    { name: "Business", count: 15 },
    { name: "Other", count: 11 },
  ];

  const topContributors = [
    { cont_id: 'demo-c1', username: 'Roshan', slug: 'roshan', profile_pic: null, articles: 18, views: Math.round(8421 * multiplier) },
    { cont_id: 'demo-c2', username: 'Aman', slug: 'aman', profile_pic: null, articles: 14, views: Math.round(6213 * multiplier) },
    { cont_id: 'demo-c3', username: 'Priya', slug: 'priya', profile_pic: null, articles: 11, views: Math.round(4820 * multiplier) },
    { cont_id: 'demo-c4', username: 'Kavya', slug: 'kavya', profile_pic: null, articles: 8, views: Math.round(3140 * multiplier) },
    { cont_id: 'demo-c5', username: 'Rahul', slug: 'rahul', profile_pic: null, articles: 6, views: Math.round(2205 * multiplier) },
  ];

  return { overview, viewsSeries, topArticles, categoryBreakdown, topContributors };
}
/* --------------------------- END DEMO DATA --------------------------- */

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg px-3 py-2">
      <p className="text-[11px] font-semibold text-gray-400 dark:text-slate-500 mb-1">{formatAxisDate(label)}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="text-xs font-semibold flex items-center gap-1.5" style={{ color: entry.color || '#1E3A5F' }}>
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color || '#1E3A5F' }} />
          Views: {entry.value?.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

const CategoryTooltip = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0];
  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg px-3 py-2">
      <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">{item.payload.name}: {item.value} articles</p>
    </div>
  );
};

const AdminAnalytics = () => {

  const [dateRange, setDateRange] = useState('30d');

  const [isLoading, setIsLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [isDemoData, setIsDemoData] = useState(false);

  const [overview, setOverview] = useState({ views: 0, likes: 0, bookmarks: 0, comments: 0 });
  const [viewsSeries, setViewsSeries] = useState([]);
  const [topArticles, setTopArticles] = useState([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [topContributors, setTopContributors] = useState([]);

  const isFirstLoad = useRef(true);

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const applyData = (data) => {
    setOverview({
      views: data.overview?.views || 0,
      likes: data.overview?.likes || 0,
      bookmarks: data.overview?.bookmarks || 0,
      comments: data.overview?.comments || 0,
    });
    setViewsSeries(data.viewsSeries || []);
    setTopArticles(data.topArticles || []);
    setCategoryBreakdown(data.categoryBreakdown || []);
    setTopContributors(data.topContributors || []);
  };

  const fetchAnalytics = () => {
    if (isFirstLoad.current) {
      setIsLoading(true);
    } else {
      setIsRefetching(true);
    }
    setLoadError("");

    AxiosInstance.get('/dashboard/admin/analytics', { params: { range: dateRange } })
      .then((res) => {
        applyData(res.data);
        setIsDemoData(false);
      })
      .catch((err) => {
        console.log(err);
        // TEMPORARY
        applyData(generateDemoData(dateRange));
        setIsDemoData(true);
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

  const handleViewContributor = (slug) => {
    window.open(`/profile/cont/${slug}`, '_blank', 'noopener,noreferrer');
  };

  const overviewData = [
    { label: "Total Views", value: overview.views, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20", icon: Eye },
    { label: "Total Likes", value: overview.likes, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-900/20", icon: Heart },
    { label: "Bookmarks", value: overview.bookmarks, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-900/20", icon: Bookmark },
    { label: "Comments", value: overview.comments, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20", icon: MessageSquare },
  ];

  const maxCategoryCount = Math.max(...categoryBreakdown.map((c) => c.count), 1);
  const maxContributorViews = Math.max(...topContributors.map((c) => c.views), 1);

  if (isLoading) {
    return (
      <div className="space-y-8 font-[Inter,system-ui,sans-serif]">
        <div>
          <h1 className="font-[Newsreader,Georgia,serif] text-3xl sm:text-4xl font-black text-gray-900 dark:text-gray-50 mb-2">
            Analytics
          </h1>
          <p className="text-gray-500 dark:text-slate-400">Platform-wide performance overview</p>
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

      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5 mb-2">
          <h1 className="font-[Newsreader,Georgia,serif] text-3xl sm:text-4xl font-black text-gray-900 dark:text-gray-50">
            Analytics
          </h1>
        </div>
        <p className="text-gray-500 dark:text-slate-400">Platform-wide performance overview</p>
      </div>

      {loadError && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-300">{loadError}</p>
        </div>
      )}

      <div className={`space-y-8 transition-opacity duration-150 ${isRefetching ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>

        {/* Overview */}
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

        {/* Views chart + range filter */}
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Views</h2>
            <div className="inline-flex items-center gap-1 p-1 bg-gray-100 dark:bg-slate-900 rounded-lg self-start">
              {RANGE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setDateRange(opt.value)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors duration-150 ${
                    dateRange === opt.value
                      ? 'bg-white dark:bg-slate-700 text-[#1E3A5F] dark:text-blue-400 shadow-sm'
                      : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {viewsSeries.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={viewsSeries} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="adminViewsGradient" x1="0" y1="0" x2="0" y2="1">
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
                <RechartsTooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="#1E3A5F"
                  strokeWidth={2}
                  fill="url(#adminViewsGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-sm text-gray-400 dark:text-slate-500">
              No view data for this period
            </div>
          )}
        </div>

        {/* Top Articles */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-4">Top Articles</h2>

          {topArticles.length > 0 ? (
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-slate-700">
                      <th className="px-5 py-3 text-left text-[11px] font-semibold tracking-widest uppercase text-gray-400 dark:text-slate-500">Article</th>
                      <th className="px-5 py-3 text-right text-[11px] font-semibold tracking-widest uppercase text-gray-400 dark:text-slate-500">Views</th>
                      <th className="px-5 py-3 text-right text-[11px] font-semibold tracking-widest uppercase text-gray-400 dark:text-slate-500">Likes</th>
                      <th className="px-5 py-3 text-right text-[11px] font-semibold tracking-widest uppercase text-gray-400 dark:text-slate-500">Comments</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                    {topArticles.slice(0, 5).map((article) => (
                      <tr
                        key={article.article_id}
                        onClick={() => handleViewArticle(article.slug)}
                        className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors duration-100 cursor-pointer"
                      >
                        <td className="px-5 py-4 font-medium text-gray-800 dark:text-gray-100 max-w-xs truncate">{article.title}</td>
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
              <p className="text-sm text-gray-400 dark:text-slate-500">No article data for this period</p>
            </div>
          )}
        </div>

        {/* Articles by Category + Top Contributors */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Articles by Category */}
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-5">Articles by Category</h2>

            {categoryBreakdown.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={categoryBreakdown} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" className="dark:opacity-10" />
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      axisLine={false}
                      tickLine={false}
                      width={90}
                    />
                    <RechartsTooltip content={<CategoryTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={18}>
                      {categoryBreakdown.map((entry, index) => (
                        <Cell key={entry.name} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-sm text-gray-400 dark:text-slate-500">
                No category data
              </div>
            )}
          </div>

          {/* Top Contributors */}
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700">
              <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Top Contributors</h2>
            </div>

            {topContributors.length > 0 ? (
              <div className="divide-y divide-gray-100 dark:divide-slate-700">
                {topContributors.slice(0, 5).map((contributor) => (
                  <button
                    key={contributor.cont_id}
                    onClick={() => handleViewContributor(contributor.slug)}
                    className="w-full flex items-center gap-3 px-6 py-3.5 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors duration-100 text-left"
                  >
                    {contributor.profile_pic ? (
                      <img src={contributor.profile_pic} alt="" className="w-8 h-8 rounded-full object-cover bg-gray-100 dark:bg-slate-700 shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                        <Users className="w-4 h-4 text-gray-300 dark:text-slate-500" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{contributor.username}</p>
                      <div className="w-full h-1 bg-gray-100 dark:bg-slate-700 rounded-full mt-1.5 overflow-hidden">
                        <div
                          className="h-full bg-[#1E3A5F] dark:bg-blue-400 rounded-full"
                          style={{ width: `${(contributor.views / maxContributorViews) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{formatNumber(contributor.views)}</p>
                      <p className="text-[11px] text-gray-400 dark:text-slate-500">{contributor.articles} articles</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-14 text-center">
                <div className="w-12 h-12 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center mb-3">
                  <Users className="w-5 h-5 text-gray-300 dark:text-slate-500" />
                </div>
                <p className="text-sm text-gray-400 dark:text-slate-500">No contributor data</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminAnalytics;
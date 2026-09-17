import React, { useState, useEffect } from "react";
import AxiosInstance from "../../../api/axiosInstance";
import { BookOpen, CalendarDays, TrendingUp, FileText, Eye, Heart, ExternalLink } from "lucide-react";
import { toast } from "react-toastify";

function formatRelativeDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
}

const MyReads = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, week: 0, month: 0 });
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const fetchInitial = async () => {
      setLoading(true);
      try {
        const [readTotal, readWeek, readMonth, articlesRes] = await Promise.all([
          AxiosInstance.get('/dashboard/reader/stat/reads/total'),
          AxiosInstance.get('/dashboard/reader/stat/reads/week'),
          AxiosInstance.get('/dashboard/reader/stat/reads/month'),
          AxiosInstance.get('/dashboard/reader/recent/reads'),
        ]);

        setStats({
          total: readTotal.data.total_reads || 0,
          week: readWeek.data.week || 0,
          month: readMonth.data.month || 0,
        });

        const rows = articlesRes.data.recents || [];
        setArticles(rows);

      } catch (error) {
        const status = error.response?.status;
        if (status === 429) {
          toast.error("Too many requests. Please wait a few minutes before trying again.");
        } else {
          console.log(error);
          toast.error("Failed to fetch read articles. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchInitial();
  }, []);

  const statsData = [
    { label: "Total Read", value: stats.total, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20", icon: BookOpen },
    { label: "This Week", value: stats.week, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20", icon: CalendarDays },
    { label: "This Month", value: stats.month, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-900/20", icon: TrendingUp },
  ];

  return (
    <div className="space-y-8 font-[Inter,system-ui,sans-serif]">

      {/* Header */}
      <div>
        <h1 className="font-[Newsreader,Georgia,serif] text-3xl sm:text-4xl font-black text-gray-900 dark:text-gray-50 mb-2">
          My Reads
        </h1>
        <p className="text-gray-500 dark:text-slate-400">
          Track everything you've read
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 dark:divide-slate-700 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
        {loading
          ? [0, 1, 2].map((i) => (
            <div key={i} className="flex items-center justify-between px-6 sm:px-8 py-6 animate-pulse">
              <div>
                <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded w-20 mb-3" />
                <div className="h-8 bg-gray-100 dark:bg-slate-700 rounded w-10" />
              </div>
              <div className="w-11 h-11 rounded-lg bg-gray-100 dark:bg-slate-700" />
            </div>
          ))
          : statsData.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="flex items-center justify-between px-6 sm:px-8 py-6">
                <div>
                  <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 dark:text-slate-500 mb-2">
                    {stat.label}
                  </p>
                  <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
                <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${stat.bg}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
            );
          })}
      </div>

      {/* Articles Viewed */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">Articles Viewed</h2>
          {!loading && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              {stats.total} viewed
            </span>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
          {loading ? (
            <div className="divide-y divide-gray-100 dark:divide-slate-700">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 px-5 sm:px-6 py-4 animate-pulse">
                  <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-slate-700 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded w-16 mb-2" />
                    <div className="h-4 bg-gray-100 dark:bg-slate-700 rounded w-2/3 mb-2" />
                    <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : articles.length > 0 ? (
            <>
              <div className="divide-y divide-gray-100 dark:divide-slate-700">
                {articles.map((article) => (
                  <a
                  
                    key={article.article_id}
                    href={`/article/view/${article.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-4 px-5 sm:px-6 py-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors duration-100"
                  >
                    {article.thumbnail_url ? (
                      <img
                        src={article.thumbnail_url}
                        alt=""
                        className="w-16 h-16 rounded-lg object-cover shrink-0 bg-gray-100 dark:bg-slate-700"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                        <FileText className="w-6 h-6 text-gray-300 dark:text-slate-500" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      {article.category_name && (
                        <span className="inline-block text-[10px] font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded mb-1.5">
                          {article.category_name}
                        </span>
                      )}
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate group-hover:text-[#1E3A5F] dark:group-hover:text-blue-400 transition-colors duration-100">
                        {article.title}
                      </p>
                      <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1.5 text-xs text-gray-400 dark:text-slate-500">
                        <span>by {article.author}</span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {article.views ?? 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {article.likes ?? 0}
                        </span>
                        <span>Read {formatRelativeDate(article.created_at)}</span>
                      </div>
                    </div>

                    <ExternalLink className="w-4 h-4 text-gray-300 dark:text-slate-500 group-hover:text-gray-500 dark:group-hover:text-slate-300 shrink-0 transition-colors duration-100" />
                  </a>
                ))}
              </div>

            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-gray-300 dark:text-slate-500" />
              </div>
              <p className="text-gray-500 dark:text-slate-400 font-medium">No articles read yet</p>
              <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">
                Articles you view will show up here
              </p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default MyReads;
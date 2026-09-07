import React, { useState, useEffect, useMemo, useRef } from 'react';
import AxiosInstance from '../../../api/axiosInstance';
import {
  MessageSquare, CheckCircle, Clock, Trash2, UserRound, Calendar,
  Eye, MoreHorizontal, Search, X, ChevronDown, Copy, AlertCircle
} from 'lucide-react';

const PAGE_SIZE = 15;

const statusMeta = {
  Approved: { text: "text-green-700 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/20", Icon: CheckCircle },
  Pending: { text: "text-amber-700 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20", Icon: Clock },
  Deleted: { text: "text-gray-500 dark:text-slate-400", bg: "bg-gray-100 dark:bg-slate-700", Icon: Trash2 },
};

function getStatusMeta(status) {
  return statusMeta[status] ?? statusMeta.Pending;
}

function formatDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const Comments = () => {

  const [allComments, setAllComments] = useState([]);
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, deleted: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [articleFilter, setArticleFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const menuRef = useRef(null);

  useEffect(() => {
    fetchComments();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchComments = () => {
    setIsLoading(true);
    setLoadError("");
    AxiosInstance.get('/dashboard/contri/comments')
      .then((res) => {
        setAllComments(res.data.comments || []);
        setStats({
          total: res.data.stats?.totalComments || 0,
          approved: res.data.stats?.approvedComments || 0,
          pending: res.data.stats?.pendingComments || 0,
          deleted: res.data.stats?.deletedComments || 0,
        });
      })
      .catch((err) => {
        console.log(err);
        setLoadError("Couldn't load comments. Please refresh.");
      })
      .finally(() => setIsLoading(false));
  };

  const articleOptions = useMemo(() => {
    const seen = new Map();
    allComments.forEach((c) => {
      if (c.article_slug && !seen.has(c.article_slug)) {
        seen.set(c.article_slug, c.article_title);
      }
    });
    return Array.from(seen.entries()).map(([slug, title]) => ({ slug, title }));
  }, [allComments]);

  const filteredComments = useMemo(() => {
    const from = dateFrom ? new Date(dateFrom + 'T00:00:00') : null;
    const to = dateTo ? new Date(dateTo + 'T23:59:59') : null;
    const search = searchTerm.trim().toLowerCase();

    return allComments.filter((c) => {
      if (articleFilter !== "all" && c.article_slug !== articleFilter) return false;

      if (from || to) {
        const created = new Date(c.created_at);
        if (from && created < from) return false;
        if (to && created > to) return false;
      }

      if (search) {
        const haystack = `${c.username || ''} ${c.content || ''} ${c.article_title || ''}`.toLowerCase();
        if (!haystack.includes(search)) return false;
      }

      return true;
    });
  }, [allComments, articleFilter, dateFrom, dateTo, searchTerm]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchTerm, articleFilter, dateFrom, dateTo]);

  const visibleComments = filteredComments.slice(0, visibleCount);
  const hasMore = visibleCount < filteredComments.length;

  const hasActiveFilters = searchTerm.trim() !== "" || articleFilter !== "all" || dateFrom !== "" || dateTo !== "";

  const clearFilters = () => {
    setSearchTerm("");
    setArticleFilter("all");
    setDateFrom("");
    setDateTo("");
  };

  const handleViewArticle = (slug) => {
    window.open(`/view/${slug}`, '_blank', 'noopener,noreferrer');
  };

  const handleCopy = async (comment) => {
    try {
      await navigator.clipboard.writeText(comment.content);
      setCopiedId(comment.id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch (error) {
      console.log(error);
    }
    setOpenMenuId(null);
  };

  const statsData = [
    { label: "Total Comments", value: stats.total, color: "text-[#1E3A5F] dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20", icon: MessageSquare },
    { label: "Approved", value: stats.approved, color: "text-green-700 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/20", icon: CheckCircle },
    { label: "Pending", value: stats.pending, color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20", icon: Clock },
    { label: "Deleted", value: stats.deleted, color: "text-gray-500 dark:text-slate-400", bg: "bg-gray-100 dark:bg-slate-700", icon: Trash2 },
  ];

  if (isLoading) {
    return (
      <div className="space-y-8 font-[Inter,system-ui,sans-serif]">
        <div>
          <h1 className="font-[Newsreader,Georgia,serif] text-3xl sm:text-4xl font-black text-gray-900 dark:text-gray-50 mb-2">
            Comments
          </h1>
          <p className="text-gray-500 dark:text-slate-400">See what readers are saying on your articles</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 animate-pulse">
              <div className="h-8 bg-gray-100 dark:bg-slate-700 rounded w-12 mb-3" />
              <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded w-24" />
            </div>
          ))}
        </div>
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-5 animate-pulse">
            <div className="h-4 bg-gray-100 dark:bg-slate-700 rounded w-1/3 mb-4" />
            <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded w-full mb-2" />
            <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 font-[Inter,system-ui,sans-serif]">

      {/* Header */}
      <div>
        <h1 className="font-[Newsreader,Georgia,serif] text-3xl sm:text-4xl font-black text-gray-900 dark:text-gray-50 mb-2">
          Comments
        </h1>
        <p className="text-gray-500 dark:text-slate-400">
          See what readers are saying on your articles
        </p>
      </div>

      {loadError && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-300">{loadError}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-gray-200 dark:bg-slate-700 rounded-xl overflow-hidden">
        {statsData.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white dark:bg-slate-800 p-6">
              <div className="flex items-start justify-between mb-4">
                <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${stat.bg}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 dark:text-slate-500">
                {stat.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-5">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by reader, comment, or article..."
              className="w-full pl-10 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 dark:focus:ring-blue-500/30 focus:border-[#1E3A5F] dark:focus:border-blue-500"
            />
          </div>

          <div className="relative shrink-0 w-full lg:w-56">
            <select
              value={articleFilter}
              onChange={(e) => setArticleFilter(e.target.value)}
              className="w-full appearance-none pl-3 pr-8 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 dark:focus:ring-blue-500/30 focus:border-[#1E3A5F] dark:focus:border-blue-500"
            >
              <option value="all">All Articles</option>
              {articleOptions.map((a) => (
                <option key={a.slug} value={a.slug}>{a.title}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500 pointer-events-none" />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              max={dateTo || undefined}
              className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 dark:focus:ring-blue-500/30 focus:border-[#1E3A5F] dark:focus:border-blue-500"
            />
            <span className="text-xs text-gray-400 dark:text-slate-500">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              min={dateFrom || undefined}
              className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 dark:focus:ring-blue-500/30 focus:border-[#1E3A5F] dark:focus:border-blue-500"
            />
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors duration-150 shrink-0"
            >
              <X className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Comments */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">All Comments</h2>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            {filteredComments.length} {hasActiveFilters ? "matching" : "total"}
          </span>
        </div>

        {visibleComments.length > 0 ? (
          <>
            <div className="space-y-3">
              {visibleComments.map((comment) => {
                const { text, bg, Icon } = getStatusMeta(comment.status);
                return (
                  <div
                    key={comment.id}
                    className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-5"
                  >
                    <div className="flex items-center gap-2.5 mb-3">
                      {comment.profile_pic ? (
                        <img src={comment.profile_pic} alt="" className="w-8 h-8 rounded-full object-cover bg-gray-100 dark:bg-slate-700 shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                          <UserRound className="w-4 h-4 text-gray-300 dark:text-slate-500" />
                        </div>
                      )}
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{comment.username}</p>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-slate-300 italic leading-relaxed mb-4">
                      "{comment.content}"
                    </p>

                    <p className="text-xs text-gray-400 dark:text-slate-500 mb-3">
                      On: <span className="font-medium text-gray-500 dark:text-slate-400">{comment.article_title}</span>
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-slate-500">
                          <Calendar className="w-3 h-3" />
                          {formatDate(comment.created_at)}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded ${text} ${bg}`}>
                          <Icon className="w-3 h-3" />
                          {comment.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 relative">
                        <button
                          onClick={() => handleViewArticle(comment.slug)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded text-[#1E3A5F] dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors duration-150"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Article
                        </button>

                        <button
                          onClick={() => setOpenMenuId(openMenuId === comment.id ? null : comment.id)}
                          className="p-1.5 rounded text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-600 dark:hover:text-slate-300 transition-colors duration-100"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {openMenuId === comment.id && (
                          <div
                            ref={menuRef}
                            className="absolute right-0 top-full mt-1.5 w-40 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg z-10 py-1"
                          >
                            <button
                              onClick={() => handleCopy(comment)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors duration-100"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              {copiedId === comment.id ? "Copied!" : "Copy comment"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {hasMore && (
              <div className="mt-3">
                <button
                  onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                  className="w-full py-2.5 text-sm font-semibold rounded-lg text-[#1E3A5F] dark:text-blue-400 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors duration-150"
                >
                  Load more
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-gray-300 dark:text-slate-500" />
            </div>
            <p className="text-gray-500 dark:text-slate-400 font-medium">
              {hasActiveFilters ? "No comments match your filters" : "No comments yet"}
            </p>
            {hasActiveFilters ? (
              <button
                onClick={clearFilters}
                className="mt-3 text-xs font-semibold text-[#1E3A5F] dark:text-blue-400 hover:underline"
              >
                Clear filters
              </button>
            ) : (
              <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">
                Comments on your articles will show up here
              </p>
            )}
          </div>
        )}
      </div>

    </div>
  );
};

export default Comments;
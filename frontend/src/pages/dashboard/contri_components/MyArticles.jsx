import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AxiosInstance from '../../../api/axiosInstance';
import {
  Eye, Edit, FileText, Clock, CheckCircle, XCircle, Calendar, Tag,
  Plus, X, Heart, Bookmark, MessageSquare, Loader2, AlertCircle
} from 'lucide-react';

const statusMeta = {
  pending: { text: "text-amber-700 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20", Icon: Clock },
  approved: { text: "text-green-700 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/20", Icon: CheckCircle },
  rejected: { text: "text-red-700 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/20", Icon: XCircle },
  draft: { text: "text-gray-500 dark:text-slate-400", bg: "bg-gray-100 dark:bg-slate-700", Icon: FileText },
};

function getStatusMeta(status) {
  return statusMeta[status] ?? statusMeta.draft;
}

function formatDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

const MyArticles = () => {
  const navigate = useNavigate();
  const [draftArticles, setDraftArticles] = useState([]);
  const [pendingArticles, setPendingArticles] = useState([]);
  const [rejectedArticles, setRejectedArticles] = useState([]);
  const [approvedArticles, setApprovedArticles] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [performanceArticle, setPerformanceArticle] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);
  const [performanceLoading, setPerformanceLoading] = useState(false);
  const [performanceError, setPerformanceError] = useState("");

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const [draftRes, pendingRes, rejectRes, approveRes] = await Promise.allSettled([
        AxiosInstance.get('/dashboard/contri/article/fetch/draft'),
        AxiosInstance.get('/dashboard/contri/article/fetch/pending'),
        AxiosInstance.get('/dashboard/contri/article/fetch/reject'),
        AxiosInstance.get('/dashboard/contri/article/fetch/approve'),
      ]);

      setDraftArticles(draftRes.status === 'fulfilled' ? draftRes.value.data : []);
      setPendingArticles(pendingRes.status === 'fulfilled' ? pendingRes.value.data : []);
      setRejectedArticles(rejectRes.status === 'fulfilled' ? rejectRes.value.data : []);
      setApprovedArticles(approveRes.status === 'fulfilled' ? approveRes.value.data : []);

      if ([draftRes, pendingRes, rejectRes, approveRes].every(r => r.status === 'rejected')) {
        setLoadError("Couldn't load your articles. Please refresh.");
      }
    } catch (error) {
      console.log(error);
      setLoadError("Couldn't load your articles. Please refresh.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (slug) => {
    navigate(`/dashboard/contributor/article/editor/${slug}`);
  };

  const handleNewArticle = () => {
    navigate('/dashboard/contributor/article/editor');
  };

  const handlePreview = (slug) => {
    window.open(`/preview/${slug}`, '_blank', 'noopener,noreferrer');
  };

  const handleViewLive = (slug) => {
    window.open(`/view/${slug}`, '_blank', 'noopener,noreferrer');
  };

  const openPerformance = (article) => {
    setPerformanceArticle(article);
    setPerformanceData(null);
    setPerformanceError("");
    setPerformanceLoading(true);

    AxiosInstance.get(`/dashboard/contri/article/stats/${article.slug}`)
      .then((res) => {
        setPerformanceData({
          views: res.data[0].views || 0,
          likes: res.data[0].likes || 0,
          bookmarks: res.data[0].bookmarks || 0,
          comments: res.data[0].comments || 0,
        });
        setPerformanceLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setPerformanceError("Couldn't load performance data.");
        setPerformanceLoading(false);
      });
  };

  const closePerformance = () => {
    setPerformanceArticle(null);
    setPerformanceData(null);
    setPerformanceError("");
  };

  const totalArticles = draftArticles.length + pendingArticles.length + rejectedArticles.length + approvedArticles.length;

  const statsData = [
    { label: "Total Articles", value: totalArticles, color: "text-[#1E3A5F] dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20", icon: FileText },
    { label: "Drafts", value: draftArticles.length, color: "text-gray-500 dark:text-slate-400", bg: "bg-gray-100 dark:bg-slate-700", icon: FileText },
    { label: "In Review", value: pendingArticles.length, color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20", icon: Clock },
    { label: "Published", value: approvedArticles.length, color: "text-green-700 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/20", icon: CheckCircle },
    { label: "Rejected", value: rejectedArticles.length, color: "text-red-700 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/20", icon: XCircle },
  ];

  if (isLoading) {
    return (
      <div className="space-y-8 font-[Inter,system-ui,sans-serif]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-[Newsreader,Georgia,serif] text-3xl sm:text-4xl font-black text-gray-900 dark:text-gray-50 mb-2">
              Articles
            </h1>
            <p className="text-gray-500 dark:text-slate-400">Manage everything you've written</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-px bg-gray-200 dark:bg-slate-700 rounded-xl overflow-hidden">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-800 p-6 animate-pulse">
              <div className="w-10 h-10 bg-gray-100 dark:bg-slate-700 rounded mb-4" />
              <div className="h-8 bg-gray-100 dark:bg-slate-700 rounded w-10 mb-2" />
              <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded w-16" />
            </div>
          ))}
        </div>
        {[0, 1].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-5 animate-pulse">
            <div className="h-4 bg-gray-100 dark:bg-slate-700 rounded w-1/3 mb-3" />
            <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded w-1/4" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 font-[Inter,system-ui,sans-serif]">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-[Newsreader,Georgia,serif] text-3xl sm:text-4xl font-black text-gray-900 dark:text-gray-50 mb-2">
            Articles
          </h1>
          <p className="text-gray-500 dark:text-slate-400">Manage everything you've written</p>
        </div>
        <button
          onClick={handleNewArticle}
          className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-sm font-semibold rounded-lg text-white bg-[#1E3A5F] hover:bg-[#16304d] transition-colors duration-150 shrink-0"
        >
          <Plus className="w-4 h-4" />
          New Article
        </button>
      </div>

      {loadError && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-300">{loadError}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-px bg-gray-200 dark:bg-slate-700 rounded-xl overflow-hidden">
        {statsData.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white dark:bg-slate-800 p-6">
              <div className={`inline-flex p-2.5 rounded mb-4 ${stat.bg}`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className={`text-3xl font-semibold ${stat.color}`}>{stat.value}</p>
              <p className="text-[11px] font-semibold tracking-widest uppercase text-gray-400 dark:text-slate-500 mt-1">
                {stat.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* In Review */}
      <ArticleSection
        title="In Review"
        count={pendingArticles.length}
        icon={Clock}
        emptyLabel="No articles pending review"
      >
        {pendingArticles.map((article) => (
          <ArticleCard key={article.slug} article={article} status="pending" dateLabel="Submitted" dateField="pending_date">
            <CardAction onClick={() => handlePreview(article.slug)} icon={Eye} label="Preview" variant="secondary" />
          </ArticleCard>
        ))}
      </ArticleSection>

      {/* Drafts */}
      <ArticleSection
        title="Drafts"
        count={draftArticles.length}
        icon={FileText}
        emptyLabel="No draft articles"
      >
        {draftArticles.map((article) => (
          <ArticleCard key={article.slug} article={article} status="draft" dateLabel="Modified" dateField="updated_at">
            <CardAction onClick={() => handleEdit(article.slug)} icon={Edit} label="Edit" variant="primary" />
            <CardAction onClick={() => handlePreview(article.slug)} icon={Eye} label="Preview" variant="secondary" />
          </ArticleCard>
        ))}
      </ArticleSection>

      {/* Rejected */}
      <ArticleSection
        title="Rejected"
        count={rejectedArticles.length}
        icon={XCircle}
        emptyLabel="No rejected articles"
      >
        {rejectedArticles.map((article) => (
          <ArticleCard key={article.slug} article={article} status="rejected" dateLabel="Rejected" dateField="reject_date">
            <CardAction onClick={() => handleEdit(article.slug)} icon={Edit} label="Revise" variant="primary" />
          </ArticleCard>
        ))}
      </ArticleSection>

      {/* Published */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">Published Articles</h2>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            {approvedArticles.length} published
          </span>
        </div>

        {approvedArticles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {approvedArticles.map((article) => (
              <div
                key={article.slug}
                className="group bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden hover:shadow-sm transition-shadow duration-150 flex flex-col"
              >
                <button
                  onClick={() => openPerformance(article)}
                  className="block w-full h-36 shrink-0 bg-gray-100 dark:bg-slate-700 overflow-hidden"
                >
                  {article.thumbnail_url ? (
                    <img
                      src={article.thumbnail_url}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-200"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FileText className="w-7 h-7 text-gray-300 dark:text-slate-500" />
                    </div>
                  )}
                </button>

                <div className="p-5 flex-1 flex flex-col">
                  <h3
                    onClick={() => openPerformance(article)}
                    className="text-sm font-semibold text-gray-800 dark:text-gray-100 line-clamp-2 mb-2 cursor-pointer hover:text-[#1E3A5F] dark:hover:text-blue-400 transition-colors duration-100"
                  >
                    {article.title}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-slate-500 mb-4">
                    {article.category && (
                      <span className="inline-flex items-center gap-1"><Tag className="w-3 h-3" />{article.category}</span>
                    )}
                    {article.category && <span>·</span>}
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(article.approve_date)}</span>
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-slate-500">
                      <Eye className="w-3.5 h-3.5" />
                      {(article.views ?? 0).toLocaleString()} views
                    </span>
                    <button
                      onClick={() => openPerformance(article)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded text-[#1E3A5F] dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors duration-150"
                    >
                      Performance
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-gray-300 dark:text-slate-500" />
            </div>
            <p className="text-gray-500 dark:text-slate-400 font-medium">No published articles yet</p>
            <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">
              Articles the admins approve will show up here
            </p>
          </div>
        )}
      </div>

      {/* Performance modal */}
      {performanceArticle && (
        <div
          className="!m-0 fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={closePerformance}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-5">
              <div className="min-w-0">
                <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 dark:text-slate-500 mb-1">
                  Performance
                </p>
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 line-clamp-2">
                  {performanceArticle.title}
                </h3>
              </div>
              <button
                onClick={closePerformance}
                className="p-1 rounded text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-600 dark:hover:text-slate-300 transition-colors duration-100 shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {performanceLoading ? (
              <div className="grid grid-cols-2 gap-3">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="bg-gray-50 dark:bg-slate-900 rounded-lg p-4 animate-pulse">
                    <div className="h-6 bg-gray-100 dark:bg-slate-700 rounded w-10 mb-2" />
                    <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded w-14" />
                  </div>
                ))}
              </div>
            ) : performanceError ? (
              <div className="text-center py-6">
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-3">{performanceError}</p>
                <button
                  onClick={() => openPerformance(performanceArticle)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg text-white bg-[#1E3A5F] hover:bg-[#16304d] transition-colors duration-150"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <PerformanceStat icon={Eye} label="Views" value={performanceData.views} color="text-blue-600 dark:text-blue-400" bg="bg-blue-50 dark:bg-blue-900/20" />
                <PerformanceStat icon={Heart} label="Likes" value={performanceData.likes} color="text-rose-600 dark:text-rose-400" bg="bg-rose-50 dark:bg-rose-900/20" />
                <PerformanceStat icon={Bookmark} label="Bookmarks" value={performanceData.bookmarks} color="text-purple-600 dark:text-purple-400" bg="bg-purple-50 dark:bg-purple-900/20" />
                <PerformanceStat icon={MessageSquare} label="Comments" value={performanceData.comments} color="text-emerald-600 dark:text-emerald-400" bg="bg-emerald-50 dark:bg-emerald-900/20" />
              </div>
            )}

            <button
              onClick={() => handleViewLive(performanceArticle.slug)}
              className="w-full mt-5 inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors duration-150"
            >
              <Eye className="w-3.5 h-3.5" />
              View Live Article
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

const ArticleSection = ({ title, count, icon: Icon, emptyLabel, children }) => (
  <div>
    <div className="flex items-center gap-3 mb-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">{title}</h2>
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">
        <Icon className="w-3 h-3" />
        {count}
      </span>
    </div>
    {count > 0 ? (
      <div className="space-y-3">{children}</div>
    ) : (
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center py-14 text-center">
        <div className="w-12 h-12 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center mb-3">
          <Icon className="w-5 h-5 text-gray-300 dark:text-slate-500" />
        </div>
        <p className="text-sm text-gray-400 dark:text-slate-500">{emptyLabel}</p>
      </div>
    )}
  </div>
);

const ArticleCard = ({ article, status, dateLabel, dateField, children }) => {
  const { text, bg, Icon } = getStatusMeta(status);
  const dateValue = article[dateField];

  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate mb-2">
            {article.title}
          </h3>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded ${text} ${bg}`}>
              <Icon className="w-3 h-3" />
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
            {dateValue && (
              <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-slate-500">
                <Calendar className="w-3 h-3" />
                {dateLabel}: {formatDate(dateValue)}
              </span>
            )}
          </div>

          {article.reject_reason && (
            <div className="mt-3 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 border-l-2 border-red-300 dark:border-red-700">
              <p className="text-xs text-red-700 dark:text-red-300">
                <span className="font-semibold">Reason: </span>
                {article.reject_reason}
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {children}
        </div>
      </div>
    </div>
  );
};

const CardAction = ({ onClick, icon: Icon, label, variant }) => {
  const variants = {
    primary: "text-[#1E3A5F] dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40",
    secondary: "text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600",
  };
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded transition-colors duration-150 ${variants[variant]}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
};

const PerformanceStat = ({ icon: Icon, label, value, color, bg }) => (
  <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-4">
    <div className={`inline-flex p-2 rounded mb-2 ${bg}`}>
      <Icon className={`w-4 h-4 ${color}`} />
    </div>
    <p className={`text-xl font-bold ${color}`}>{(value ?? 0).toLocaleString()}</p>
    <p className="text-[10px] font-semibold tracking-wide uppercase text-gray-400 dark:text-slate-500 mt-0.5">{label}</p>
  </div>
);

export default MyArticles;
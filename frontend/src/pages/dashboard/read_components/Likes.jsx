import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, HeartOff, Eye, Tag, FileText, CalendarDays, TrendingUp } from 'lucide-react';
import AxiosInstance from '../../../api/axiosInstance';

function daysAgo(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const diffMs = Date.now() - date.getTime();
  const diffDay = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDay <= 0) return "Liked today";
  if (diffDay === 1) return "Liked 1 day ago";
  if (diffDay < 30) return `Liked ${diffDay} days ago`;

  return `Liked on ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
}

const Likes = () => {

  const navigate = useNavigate();
  const [likedArticles, setLikedArticles] = useState([]);
  const [stats, setStats] = useState({ total: 0, week: 0, month: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [unlikingId, setunlikingId] = useState(null);

  useEffect(() => {
    fetchLikes();
  }, []);

  const fetchLikes = async () => {
    setIsLoading(true);
    try {
      const [statsLikes, statsWeek, statsMonth, likesRes] = await Promise.all([
        AxiosInstance.get('/dashboard/reader/stat/likes'),
        AxiosInstance.get('/dashboard/reader/stat/likes/week'),
        AxiosInstance.get('/dashboard/reader/stat/likes/month'),
        AxiosInstance.get('/dashboard/reader/likes'),
      ]);

      setStats({
        total: statsLikes.data.total || 0,
        week: statsWeek.data.week || 0,
        month: statsMonth.data.month || 0,
      });
      setLikedArticles(likesRes.data);

    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlike = (articleId) => {
    setunlikingId(articleId);
    try {
      AxiosInstance.delete(`/dashboard/reader/like/${articleId}`)
        .then(() => {
          setLikedArticles((prev) => prev.filter(article => article.article_id !== articleId));
          setStats((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
          setunlikingId(null);
        })
        .catch((err) => {
          console.log(err);
          setunlikingId(null);
        });
    } catch (error) {
      console.log(error);
      setunlikingId(null);
    }
  };

  const handleViewArticle = (slug) => {
    navigate(`/article/${slug}`);
  };

  const statsData = [
    { label: "Total Likes", value: stats.total, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-900/20", icon: Heart },
    { label: "This Week", value: stats.week, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20", icon: CalendarDays },
    { label: "This Month", value: stats.month, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-900/20", icon: TrendingUp },
  ];

  return (
    <div className="space-y-8 font-[Inter,system-ui,sans-serif]">

      {/* Header */}
      <div>
        <h1 className="font-[Newsreader,Georgia,serif] text-3xl sm:text-4xl font-black text-gray-900 dark:text-gray-50 mb-2">
          My Likes
        </h1>
        <p className="text-gray-500 dark:text-slate-400">
          Articles you've liked
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 dark:divide-slate-700 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
        {isLoading
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

      {/* Liked Articles */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">Liked Articles</h2>
          {!isLoading && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              {likedArticles.length} liked
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden animate-pulse">
                <div className="h-40 bg-gray-100 dark:bg-slate-700" />
                <div className="p-5">
                  <div className="h-4 bg-gray-100 dark:bg-slate-700 rounded w-3/4 mb-3" />
                  <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded w-1/2 mb-2" />
                  <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : likedArticles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {likedArticles.map((article) => (
              <div
                key={article.slug}
                className="group bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden hover:shadow-sm transition-shadow duration-150 flex flex-col"
              >
                {/* Thumbnail */}
                <button
                  onClick={() => handleViewArticle(article.slug)}
                  className="block w-full h-40 shrink-0 bg-gray-100 dark:bg-slate-700 overflow-hidden"
                >
                  {article.thumbnail_url ? (
                    <img
                      src={article.thumbnail_url}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-200"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FileText className="w-8 h-8 text-gray-300 dark:text-slate-500" />
                    </div>
                  )}
                </button>

                {/* Body */}
                <div className="p-5 flex-1 flex flex-col">
                  <h3
                    onClick={() => handleViewArticle(article.slug)}
                    className="text-sm font-semibold text-gray-800 dark:text-gray-100 line-clamp-2 mb-2 cursor-pointer hover:text-[#1E3A5F] dark:hover:text-blue-400 transition-colors duration-100"
                  >
                    {article.title}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-slate-500 mb-1">
                    {article.category && (
                      <span className="inline-flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {article.category}
                      </span>
                    )}
                    {article.category && article.author && <span>·</span>}
                    {article.author && <span>{article.author}</span>}
                  </div>

                  <p className="text-xs text-gray-400 dark:text-slate-500 mb-4">
                    {daysAgo(article.created_at)}
                  </p>

                  {/* Actions */}
                  <div className="mt-auto pt-4 border-t border-gray-100 dark:border-slate-700 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleViewArticle(article.slug)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded text-[#1E3A5F] dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors duration-150"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Read
                    </button>
                    <button
                      onClick={() => handleUnlike(article.article_id)}
                      disabled={unlikingId === article.article_id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors duration-150 disabled:opacity-50"
                    >
                      <HeartOff className="w-3.5 h-3.5" />
                      {unlikingId === article.article_id ? "Removing…" : "Unlike"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center mb-4">
              <Heart className="w-6 h-6 text-gray-300 dark:text-slate-500" />
            </div>
            <p className="text-gray-500 dark:text-slate-400 font-medium">No liked articles yet</p>
            <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">
              Articles you like will show up here
            </p>
          </div>
        )}
      </div>

    </div>
  );
};

export default Likes;
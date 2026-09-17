import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, BookmarkX, Eye, Tag, FileText, CalendarCheck } from 'lucide-react';
import AxiosInstance from '../../../api/axiosInstance';
import { toast } from 'react-toastify';

function daysAgo(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const diffMs = Date.now() - date.getTime();
  const diffDay = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDay <= 0) return "Added today";
  if (diffDay === 1) return "Added 1 day ago";
  if (diffDay < 30) return `Added ${diffDay} days ago`;

  return `Added on ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
}

const Bookmarks = () => {

  const navigate = useNavigate();
  const [bookmarkedArticles, setBookmarkedArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingId, setremovingId] = useState(null);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = () => {
    setIsLoading(true);
    try {
      AxiosInstance.get('/dashboard/reader/bookmarks')
        .then((res) => {
          setBookmarkedArticles(res.data);
          setIsLoading(false);
        })
        .catch((err) => {
          const status = err.response?.status;
          if (status === 429) {
            toast.error("Too many requests. Please wait a few minutes before trying again.");
          } else {
            console.log(err);
            toast.error("Failed to fetch bookmarks. Please try again later.");
          }
          setIsLoading(false);
        });
    } catch (error) {
      const status = error.response?.status;
      if (status === 429) {
        toast.error("Too many requests. Please wait a few minutes before trying again.");
      } else {
        console.log(error);
        toast.error("Failed to fetch bookmarks. Please try again later.");
      }
      setIsLoading(false);
    }
  };

  const handleRemoveBookmark = (articleId) => {
    setremovingId(articleId);
    try {
      AxiosInstance.delete(`/dashboard/reader/bookmark/${articleId}`)
        .then(() => {
          setBookmarkedArticles((prev) => prev.filter(article => article.article_id !== articleId));
          setremovingId(null);
        })
        .catch((err) => {
          const status = err.response?.status;
          if (status === 429) {
            toast.error("Too many requests. Please wait a few minutes before trying again.");
          } else {
            console.log(err);
            toast.error("Failed to remove bookmark. Please try again later.");
          }
          setremovingId(null);
        });
    } catch (error) {
      const status = error.response?.status;
      if (status === 429) {
        toast.error("Too many requests. Please wait a few minutes before trying again.");
      } else {
        console.log(error);
        toast.error("Failed to remove bookmark. Please try again later.");
      }
      setremovingId(null);
    }
  };

  const handleViewArticle = (slug) => {
    navigate(`/view/article/${slug}`);
  };

  const totalBookmarks = bookmarkedArticles.length;
  const addedThisWeek = bookmarkedArticles.filter((article) => {
    if (!article.bookmarked_date) return false;
    const diffDay = (Date.now() - new Date(article.bookmarked_date).getTime()) / (1000 * 60 * 60 * 24);
    return diffDay <= 7;
  }).length;

  const statsData = [
    { label: "Total Bookmarks", value: totalBookmarks, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20", icon: Bookmark },
    { label: "Added This Week", value: addedThisWeek, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20", icon: CalendarCheck },
  ];

  return (
    <div className="space-y-8 font-[Inter,system-ui,sans-serif]">

      {/* Header */}
      <div>
        <h1 className="font-[Newsreader,Georgia,serif] text-3xl sm:text-4xl font-black text-gray-900 dark:text-gray-50 mb-2">
          My Bookmarks
        </h1>
        <p className="text-gray-500 dark:text-slate-400">
          Your saved articles for later reading
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 dark:divide-slate-700 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
        {isLoading
          ? [0, 1].map((i) => (
            <div key={i} className="flex items-center justify-between px-6 sm:px-8 py-6 animate-pulse">
              <div>
                <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded w-24 mb-3" />
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

      {/* Saved Articles */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">Saved Articles</h2>
          {!isLoading && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              {totalBookmarks} saved
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
        ) : bookmarkedArticles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {bookmarkedArticles.map((article) => (
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
                      View
                    </button>
                    <button
                      onClick={() => handleRemoveBookmark(article.article_id)}
                      disabled={removingId === article.article_id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors duration-150 disabled:opacity-50"
                    >
                      <BookmarkX className="w-3.5 h-3.5" />
                      {removingId === article.article_id ? "Removing…" : "Remove"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center mb-4">
              <Bookmark className="w-6 h-6 text-gray-300 dark:text-slate-500" />
            </div>
            <p className="text-gray-500 dark:text-slate-400 font-medium">No bookmarks yet</p>
            <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">
              Start bookmarking articles to read them later
            </p>
          </div>
        )}
      </div>

    </div>
  );
};

export default Bookmarks;
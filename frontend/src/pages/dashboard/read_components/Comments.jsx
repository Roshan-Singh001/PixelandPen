import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, CheckCircle, Clock, XCircle, Eye, Trash2 } from 'lucide-react';
import AxiosInstance from '../../../api/axiosInstance';

const statusMeta = {
  Approved: { text: "text-green-700 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/20", Icon: CheckCircle },
  Pending: { text: "text-amber-700 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20", Icon: Clock },
  Deleted: { text: "text-gray-500 dark:text-slate-400", bg: "bg-gray-100 dark:bg-slate-700", Icon: XCircle },
};

function getStatusMeta(status) {
  return statusMeta[status] ?? statusMeta.Pending;
}

function formatDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const Comments = (props) => {

  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const [statsRes, commentsRes] = await Promise.all([
        AxiosInstance.get('/dashboard/reader/stat/comments'),
        AxiosInstance.get('/dashboard/reader/comments/'),
      ]);

      setStats({
        total: statsRes.data.total || 0,
        approved: statsRes.data.approved || 0,
        pending: statsRes.data.pending || 0,
      });
      setComments(commentsRes.data);

    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (commentId) => {
    setDeletingId(commentId);
    try {
      AxiosInstance.delete(`/comment/${commentId}`, {
        headers: {
          user_id: props.userdata.user_id,
        }
      })
        .then(() => {
          const removed = comments.find(c => c.id === commentId);
          setComments((prev) => prev.filter(c => c.id !== commentId));
          setStats((prev) => ({
            total: Math.max(0, prev.total - 1),
            approved: removed?.status === 'Approved' ? Math.max(0, prev.approved - 1) : prev.approved,
            pending: removed?.status === 'Pending' ? Math.max(0, prev.pending - 1) : prev.pending,
          }));
          setDeletingId(null);
        })
        .catch((err) => {
          console.log(err);
          setDeletingId(null);
        });
    } catch (error) {
      console.log(error);
      setDeletingId(null);
    }
  };

  const handleViewArticle = (slug) => {
    navigate(`/article/${slug}`);
  };

  const statsData = [
    { label: "Total Comments", value: stats.total, color: "text-[#1E3A5F] dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20", icon: MessageSquare },
    { label: "Approved", value: stats.approved, color: "text-green-700 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/20", icon: CheckCircle },
    { label: "Pending", value: stats.pending, color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20", icon: Clock },
  ];

  return (
    <div className="space-y-8 font-[Inter,system-ui,sans-serif]">

      {/* Header */}
      <div>
        <h1 className="font-[Newsreader,Georgia,serif] text-3xl sm:text-4xl font-black text-gray-900 dark:text-gray-50 mb-2">
          Comments
        </h1>
        <p className="text-gray-500 dark:text-slate-400">
          Your comment activity across articles
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 dark:divide-slate-700 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
        {isLoading
          ? [0, 1, 2].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 animate-pulse">
              <div className="h-8 bg-gray-100 dark:bg-slate-700 rounded w-12 mb-3" />
              <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded w-24" />
            </div>
          ))
          : statsData.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="flex items-center justify-between px-6 sm:px-8 py-6">
                <div>
                  <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 dark:text-slate-500">
                    {stat.label}
                  </p>
                  <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${stat.bg}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
            );
          })}
      </div>

      {/* My Comments */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">My Comments</h2>
          {!isLoading && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              {comments.length} comments
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-5 animate-pulse">
                <div className="h-4 bg-gray-100 dark:bg-slate-700 rounded w-1/3 mb-4" />
                <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded w-full mb-2" />
                <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded w-2/3 mb-4" />
                <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded w-24" />
              </div>
            ))}
          </div>
        ) : comments.length > 0 ? (
          <div className="space-y-3">
            {comments.map((comment) => {
              const { text, bg, Icon } = getStatusMeta(comment.status);
              return (
                <div
                  key={comment.id}
                  className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-5"
                >
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2 truncate">
                    {comment.article_title}
                  </h3>

                  <p className="text-sm text-gray-600 dark:text-slate-300 italic leading-relaxed line-clamp-2 mb-4">
                    "{comment.content}"
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400 dark:text-slate-500">
                        {formatDate(comment.created_at)}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded ${text} ${bg}`}>
                        <Icon className="w-3 h-3" />
                        {comment.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewArticle(comment.article_slug)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded text-[#1E3A5F] dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors duration-150"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View Article
                      </button>
                      <button
                        onClick={() => handleDelete(comment.id)}
                        disabled={deletingId === comment.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors duration-150 disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {deletingId === comment.id ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-gray-300 dark:text-slate-500" />
            </div>
            <p className="text-gray-500 dark:text-slate-400 font-medium">No comments yet</p>
            <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">
              Comments you post on articles will show up here
            </p>
          </div>
        )}
      </div>

    </div>
  );
};

export default Comments;
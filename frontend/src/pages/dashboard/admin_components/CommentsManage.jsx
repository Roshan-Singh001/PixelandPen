import React, { useState, useEffect } from 'react';
import AxiosInstance from '../../../api/axiosInstance';
import {
  Check, UserRound, X, Trash2, MessageSquare, Clock, CheckCircle,
  AlertCircle, Eye, Calendar, RotateCcw, Loader2
} from 'lucide-react';
import { toast } from 'react-toastify';

function formatDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

const CommentsManage = () => {

  const [approvedComments, setApprovedComments] = useState([]);
  const [pendingComments, setPendingComments] = useState([]);
  const [deletedComments, setDeletedComments] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const [approvedRes, pendingRes, deletedRes] = await Promise.allSettled([
        AxiosInstance.get('/dashboard/admin/fetch/comments/approved'),
        AxiosInstance.get('/dashboard/admin/fetch/comments/pending'),
        AxiosInstance.get('/dashboard/admin/fetch/comments/deleted'),
      ]);

      setApprovedComments(approvedRes.status === 'fulfilled' ? (approvedRes.value.data.approved || []) : []);
      setPendingComments(pendingRes.status === 'fulfilled' ? (pendingRes.value.data.pending || []) : []);
      setDeletedComments(deletedRes.status === 'fulfilled' ? (deletedRes.value.data.deleted || []) : []);

      if ([approvedRes, pendingRes, deletedRes].every((r) => r.status === 'rejected')) {
        setLoadError("Couldn't load comments. Please refresh.");
      }
    } catch (error) {
      const status = error.response?.status;
      if (status === 429) {
        toast.error("Too many requests. Please wait a few minutes before trying again.");
      } else {
        console.log(error);
        setLoadError("Couldn't load comments. Please refresh.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = (slug) => {
    window.open(`/view/${slug}`, '_blank', 'noopener,noreferrer');
  };

  const updateCommentStatus = async (comment, newStatus) => {
    const id = comment.id;
    setBusyId(id);

    try {
      await AxiosInstance.post(`/dashboard/admin/comment/status`, { id, status: newStatus });

      const updated = { ...comment, status: newStatus };

      setPendingComments((prev) => prev.filter((c) => c.id !== id));
      setApprovedComments((prev) => prev.filter((c) => c.id !== id));
      setDeletedComments((prev) => prev.filter((c) => c.id !== id));

      if (newStatus === 'Approved') {
        setApprovedComments((prev) => [updated, ...prev]);
      } else if (newStatus === 'Deleted') {
        setDeletedComments((prev) => [updated, ...prev]);
      } else if (newStatus === 'Pending') {
        setPendingComments((prev) => [updated, ...prev]);
      }
    } catch (error) {
      const status = error.response?.status;
      if (status === 429) {
        toast.error("Too many requests. Please wait a few minutes before trying again.");
      } else {
        console.log(error);
        toast.error("Couldn't update comment status. Please try again.");
      }
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget || isDeleting) return;
    const id = deleteTarget.id;

    setIsDeleting(true);
    try {
      await AxiosInstance.delete(`/dashboard/admin/comment/delete`, { data: { id } });
      setPendingComments((prev) => prev.filter((c) => c.id !== id));
      setApprovedComments((prev) => prev.filter((c) => c.id !== id));
      setDeletedComments((prev) => prev.filter((c) => c.id !== id));
      setDeleteTarget(null);
    } catch (error) {
      console.log(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const statsData = [
    { label: "Total Comments", value: pendingComments.length + approvedComments.length + deletedComments.length, color: "text-[#1E3A5F] dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20", icon: MessageSquare },
    { label: "Pending", value: pendingComments.length, color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20", icon: Clock },
    { label: "Approved", value: approvedComments.length, color: "text-green-700 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/20", icon: CheckCircle },
    { label: "Deleted", value: deletedComments.length, color: "text-red-700 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/20", icon: AlertCircle },
  ];

  const CommentCard = ({ comment }) => {
    const busy = busyId === comment.id;
    return (
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-5">
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

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-slate-700">
          <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-slate-500">
            <Calendar className="w-3 h-3" />
            {formatDate(comment.created_at)}
          </span>

          <div className="flex items-center gap-2">
            {comment.status === 'Pending' && (
              <>
                <button
                  onClick={() => updateCommentStatus(comment, 'Approved')}
                  disabled={busy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors duration-150 disabled:opacity-50"
                >
                  {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  Approve
                </button>
                <button
                  onClick={() => updateCommentStatus(comment, 'Deleted')}
                  disabled={busy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors duration-150 disabled:opacity-50"
                >
                  <X className="w-3.5 h-3.5" />
                  Reject
                </button>
              </>
            )}

            {comment.status === 'Approved' && (
              <>
                <button
                  onClick={() => handleView(comment.slug)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded text-[#1E3A5F] dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors duration-150"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Article
                </button>
                <button
                  onClick={() => setDeleteTarget(comment)}
                  disabled={busy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors duration-150 disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </>
            )}

            {comment.status === 'Deleted' && (
              <>
                <button
                  onClick={() => updateCommentStatus(comment, 'Approved')}
                  disabled={busy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors duration-150 disabled:opacity-50"
                >
                  {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                  Restore
                </button>
                <button
                  onClick={() => setDeleteTarget(comment)}
                  disabled={busy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors duration-150 disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const CommentSection = ({ title, comments, icon: Icon, emptyLabel, badgeColor }) => (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">{title}</h2>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${badgeColor}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {comments.length}
        </span>
      </div>

      {comments.length > 0 ? (
        <div className="space-y-3">
          {comments.map((comment) => (
            <CommentCard key={comment.id} comment={comment} />
          ))}
        </div>
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

  if (isLoading) {
    return (
      <div className="space-y-8 font-[Inter,system-ui,sans-serif]">
        <div>
          <h1 className="font-[Newsreader,Georgia,serif] text-3xl sm:text-4xl font-black text-gray-900 dark:text-gray-50 mb-2">
            Comments Management
          </h1>
          <p className="text-gray-500 dark:text-slate-400">Manage and moderate user comments across all articles</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 animate-pulse">
              <div className="h-8 bg-gray-100 dark:bg-slate-700 rounded w-12 mb-3" />
              <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded w-20" />
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
          Comments Management
        </h1>
        <p className="text-gray-500 dark:text-slate-400">
          Manage and moderate user comments across all articles
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
              <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 dark:text-slate-500">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <CommentSection
        title="Pending Comments"
        comments={pendingComments}
        icon={Clock}
        emptyLabel="No pending comments — all comments have been reviewed"
        badgeColor="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400"
      />

      <CommentSection
        title="Approved Comments"
        comments={approvedComments}
        icon={CheckCircle}
        emptyLabel="No approved comments yet"
        badgeColor="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
      />

      <CommentSection
        title="Deleted Comments"
        comments={deletedComments}
        icon={AlertCircle}
        emptyLabel="No deleted comments"
        badgeColor="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
      />

      {/* Delete confirm modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => !isDeleting && setDeleteTarget(null)}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Delete Comment</h3>
            </div>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-5">
              Permanently delete this comment by <span className="font-semibold text-gray-700 dark:text-gray-200">{deleteTarget.username}</span>? This cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors duration-150 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors duration-150 disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                {isDeleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CommentsManage;
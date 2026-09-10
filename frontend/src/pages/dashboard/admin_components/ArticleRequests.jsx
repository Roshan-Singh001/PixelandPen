import React, { useState, useEffect } from 'react';
import {
  CheckCircle, XCircle, Eye, FileText, Trash2, X, Star, Calendar,
  AlertCircle, Loader2, Tag
} from 'lucide-react';
import AxiosInstance from '../../../api/axiosInstance';

function formatDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

const ArticleRequests = () => {

  const [pendingArticles, setPendingArticles] = useState([]);
  const [rejectedArticles, setRejectedArticles] = useState([]);
  const [approvedArticles, setApprovedArticles] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isRender, setRender] = useState(1);

  const [busyId, setBusyId] = useState(null);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRender]);

  const fetchData = async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const [pendingRes, rejectedRes, approvedRes] = await Promise.allSettled([
        AxiosInstance.get('/dashboard/admin/fetch/article/pending'),
        AxiosInstance.get('/dashboard/admin/fetch/article/rejected'),
        AxiosInstance.get('/dashboard/admin/fetch/article/published'),
      ]);

      setPendingArticles(pendingRes.status === 'fulfilled' ? (pendingRes.value.data.pending || []) : []);
      setRejectedArticles(rejectedRes.status === 'fulfilled' ? (rejectedRes.value.data.rejected || []) : []);
      setApprovedArticles(approvedRes.status === 'fulfilled' ? (approvedRes.value.data.published || []) : []);

      if ([pendingRes, rejectedRes, approvedRes].every(r => r.status === 'rejected')) {
        setLoadError("Couldn't load articles. Please refresh.");
      }
    } catch (error) {
      console.log(error);
      setLoadError("Couldn't load articles. Please refresh.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = (slug) => {
    window.open(`/preview/${slug}`, '_blank', 'noopener,noreferrer');
  };

  const handleView = (slug) => {
    window.open(`/view/${slug}`, '_blank', 'noopener,noreferrer');
  };

  const handleApprove = async (article) => {
    setBusyId(article.review_id);
    try {
      const date = new Date().toISOString().slice(0, 19).replace('T', ' ');
      await AxiosInstance.post('/dashboard/admin/article/approve', {
        slug: article.slug,
        cont_id: article.cont_id,
        review_id: article.review_id,
        author: article.author,
        publish_At: date,
      });
      setRender((r) => r + 1);
    } catch (error) {
      console.log(error);
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = (article) => {
    setSelectedArticle(article);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (!rejectReason.trim() || isRejecting) return;
    setIsRejecting(true);
    try {
      await AxiosInstance.post('/dashboard/admin/article/reject', {
        slug: selectedArticle.slug,
        cont_id: selectedArticle.cont_id,
        review_id: selectedArticle.review_id,
        rejectReason: rejectReason,
        rejectAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
      });
      setRender((r) => r + 1);
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedArticle(null);
    } catch (error) {
      console.log(error);
    } finally {
      setIsRejecting(false);
    }
  };

  const handleFeatured = async (article) => {
    setBusyId(article.article_id);
    try {
      await AxiosInstance.post('/dashboard/admin/article/feature', {
        slug: article.slug,
        article_id: article.article_id,
        is_featured: !article.is_featured,
      });
      setRender((r) => r + 1);
    } catch (error) {
      console.log(error);
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget || isDeleting) return;
    setIsDeleting(true);
    try {
      await AxiosInstance.delete('/dashboard/admin/article/delete', {
        data: {
          slug: deleteTarget.slug,
          article_id: deleteTarget.article_id,
          cont_id: deleteTarget.cont_id,
          review_id: deleteTarget.review_id,
        }
      });
      setRender((r) => r + 1);
      setDeleteTarget(null);
    } catch (error) {
      console.log(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const statsData = [
    { label: "Pending", value: pendingArticles.length, color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20", icon: FileText },
    { label: "Published", value: approvedArticles.length, color: "text-green-700 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/20", icon: CheckCircle },
    { label: "Rejected", value: rejectedArticles.length, color: "text-red-700 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/20", icon: XCircle },
  ];

  if (isLoading) {
    return (
      <div className="space-y-8 font-[Inter,system-ui,sans-serif]">
        <div>
          <h1 className="font-[Newsreader,Georgia,serif] text-3xl sm:text-4xl font-black text-gray-900 dark:text-gray-50 mb-2">
            Article Management
          </h1>
          <p className="text-gray-500 dark:text-slate-400">Manage article submissions and publications</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 animate-pulse">
              <div className="h-8 bg-gray-100 dark:bg-slate-700 rounded w-12 mb-3" />
              <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded w-20" />
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
      <div>
        <h1 className="font-[Newsreader,Georgia,serif] text-3xl sm:text-4xl font-black text-gray-900 dark:text-gray-50 mb-2">
          Article Management
        </h1>
        <p className="text-gray-500 dark:text-slate-400">Manage article submissions and publications</p>
      </div>

      {loadError && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-300">{loadError}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-gray-200 dark:bg-slate-700 rounded-xl overflow-hidden">
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

      {/* Pending Review */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">Pending Review</h2>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            {pendingArticles.length} awaiting review
          </span>
        </div>

        {pendingArticles.length > 0 ? (
          <div className="space-y-3">
            {pendingArticles.map((article) => (
              <div key={article.review_id} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate mb-1.5">{article.title}</h3>
                    <div className="flex items-center gap-2.5 text-xs text-gray-400 dark:text-slate-500">
                      <span>By {article.author}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Submitted {formatDate(article.created_at)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handlePreview(article.slug)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded text-[#1E3A5F] dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors duration-150"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Preview
                    </button>
                    <button
                      onClick={() => handleApprove(article)}
                      disabled={busyId === article.review_id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors duration-150 disabled:opacity-50"
                    >
                      {busyId === article.review_id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(article)}
                      disabled={busyId === article.review_id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors duration-150 disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center py-14 text-center">
            <div className="w-12 h-12 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center mb-3">
              <FileText className="w-5 h-5 text-gray-300 dark:text-slate-500" />
            </div>
            <p className="text-sm text-gray-400 dark:text-slate-500">No pending requests</p>
          </div>
        )}
      </div>

      {/* Rejected */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">Rejected Articles</h2>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            {rejectedArticles.length}
          </span>
        </div>

        {rejectedArticles.length > 0 ? (
          <div className="space-y-3">
            {rejectedArticles.map((article) => (
              <div key={article.review_id} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-1.5">{article.title}</h3>
                <div className="flex items-center gap-2.5 text-xs text-gray-400 dark:text-slate-500 mb-3">
                  <span>By {article.author}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Rejected {formatDate(article.reject_at)}
                  </span>
                </div>
                <div className="px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 border-l-2 border-red-300 dark:border-red-700">
                  <p className="text-xs text-red-700 dark:text-red-300">
                    <span className="font-semibold">Reason: </span>
                    {article.reject_reason}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center py-14 text-center">
            <div className="w-12 h-12 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center mb-3">
              <XCircle className="w-5 h-5 text-gray-300 dark:text-slate-500" />
            </div>
            <p className="text-sm text-gray-400 dark:text-slate-500">No rejected articles</p>
          </div>
        )}
      </div>

      {/* Published */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">Published Articles</h2>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            {approvedArticles.length}
          </span>
        </div>

        {approvedArticles.length > 0 ? (
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-slate-700">
                    <th className="px-5 py-3 text-left text-[11px] font-semibold tracking-widest uppercase text-gray-400 dark:text-slate-500">Article</th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold tracking-widest uppercase text-gray-400 dark:text-slate-500">Category</th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold tracking-widest uppercase text-gray-400 dark:text-slate-500">Author</th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold tracking-widest uppercase text-gray-400 dark:text-slate-500">Published</th>
                    <th className="px-5 py-3 text-right text-[11px] font-semibold tracking-widest uppercase text-gray-400 dark:text-slate-500">Views</th>
                    <th className="px-5 py-3 text-right text-[11px] font-semibold tracking-widest uppercase text-gray-400 dark:text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                  {approvedArticles.map((article) => (
                    <tr key={article.article_id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors duration-100">
                      <td className="px-5 py-4 font-medium text-gray-800 dark:text-gray-100 max-w-xs truncate">{article.title}</td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-blue-50 dark:bg-blue-900/20 text-[#1E3A5F] dark:text-blue-400">
                          <Tag className="w-3 h-3" />
                          {article.category}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-600 dark:text-slate-300">{article.author}</td>
                      <td className="px-5 py-4 text-gray-500 dark:text-slate-400">{formatDate(article.publish_at)}</td>
                      <td className="px-5 py-4 text-right font-medium text-gray-800 dark:text-gray-100">{(article.views ?? 0).toLocaleString()}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            title="View"
                            onClick={() => handleView(article.slug)}
                            className="p-1.5 rounded text-gray-400 dark:text-slate-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-[#1E3A5F] dark:hover:text-blue-400 transition-colors duration-100"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            title={article.is_featured ? 'Remove as Featured' : 'Set as Featured'}
                            onClick={() => handleFeatured(article)}
                            disabled={busyId === article.article_id}
                            className={`p-1.5 rounded transition-colors duration-100 disabled:opacity-50 ${
                              article.is_featured
                                ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20'
                                : 'text-gray-400 dark:text-slate-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-600 dark:hover:text-amber-400'
                            }`}
                          >
                            <Star className={`w-4 h-4 ${article.is_featured ? 'fill-current' : ''}`} />
                          </button>
                          <button
                            title="Delete"
                            onClick={() => setDeleteTarget(article)}
                            className="p-1.5 rounded text-gray-400 dark:text-slate-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
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
            <p className="text-sm text-gray-400 dark:text-slate-500">No articles published yet</p>
          </div>
        )}
      </div>

      {/* Reject modal */}
      {showRejectModal && (
        <div
          className="!m-0 fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => !isRejecting && setShowRejectModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Reject Article</h3>
              <button
                onClick={() => setShowRejectModal(false)}
                disabled={isRejecting}
                className="p-1 rounded text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-600 dark:hover:text-slate-300 transition-colors duration-100 disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
              You're about to reject <span className="font-semibold text-gray-700 dark:text-gray-200">"{selectedArticle?.title}"</span> by {selectedArticle?.author}.
            </p>

            <label className="block text-xs font-semibold tracking-wide uppercase text-gray-400 dark:text-slate-500 mb-1.5">
              Reason for rejection *
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              placeholder="Please provide a clear reason for rejecting this article..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:border-red-400"
            />

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setShowRejectModal(false)}
                disabled={isRejecting}
                className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors duration-150 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                disabled={!rejectReason.trim() || isRejecting}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRejecting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {isRejecting ? "Rejecting…" : "Reject Article"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteTarget && (
        <div
          className="!m-0 fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
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
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Delete Article</h3>
            </div>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-5">
              Permanently delete <span className="font-semibold text-gray-700 dark:text-gray-200">"{deleteTarget.title}"</span>? This cannot be undone.
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

export default ArticleRequests;
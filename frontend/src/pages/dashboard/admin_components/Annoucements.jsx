import React, { useState, useEffect } from 'react';
import AxiosInstance from '../../../api/axiosInstance';
import {
  Megaphone, Plus, Calendar, Users, Eye, Edit3, Trash2, Save, X,
  AlertCircle, Check, Send, FileText, Loader2
} from 'lucide-react';

const AUDIENCE_META = {
  All: { label: "All Users", icon: Users, color: "text-[#1E3A5F] dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20" },
  Contributors: { label: "Contributors Only", icon: Edit3, color: "text-purple-700 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-900/20" },
  Readers: { label: "Readers Only", icon: Eye, color: "text-orange-700 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-900/20" },
};

const EMPTY_FORM = { title: '', content: '', audience: 'All', status: 'Draft' };

function formatDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

const Announcements = () => {

  const [draftAnnounce, setDraftAnnounce] = useState([]);
  const [publishAnnounce, setPublishAnnounce] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const [draftRes, publishedRes] = await Promise.allSettled([
        AxiosInstance.get('/dashboard/admin/fetch/announcement/draft'),
        AxiosInstance.get('/dashboard/admin/fetch/announcement/published'),
      ]);

      setDraftAnnounce(draftRes.status === 'fulfilled' ? (draftRes.value.data.drafts || []) : []);
      setPublishAnnounce(publishedRes.status === 'fulfilled' ? (publishedRes.value.data.published || []) : []);

      if (draftRes.status === 'rejected' && publishedRes.status === 'rejected') {
        setLoadError("Couldn't load announcements. Please refresh.");
      }
    } catch (error) {
      console.log(error);
      setLoadError("Couldn't load announcements. Please refresh.");
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const openCreateModal = () => {
    setEditingAnnouncement(null);
    setFormData(EMPTY_FORM);
    setFormError("");
    setShowModal(true);
  };

  const openEditModal = (announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      audience: announcement.audience,
      status: announcement.status,
    });
    setFormError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (isSaving) return;
    setShowModal(false);
    setEditingAnnouncement(null);
    setFormData(EMPTY_FORM);
    setFormError("");
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      setFormError("Please fill in the title and content.");
      return;
    }

    setIsSaving(true);
    setFormError("");

    try {
      if (editingAnnouncement) {
        const res = await AxiosInstance.post('/dashboard/admin/announcement/edit', {
          announce_id: editingAnnouncement.id,
          announce: formData,
        });

        const updated = { ...editingAnnouncement, ...formData, ...(res.data?.announce || {}) };
        const wasPublished = editingAnnouncement.status === 'Published';
        const isPublished = formData.status === 'Published';

        if (wasPublished && !isPublished) {
          setPublishAnnounce((prev) => prev.filter((a) => a.id !== editingAnnouncement.id));
          setDraftAnnounce((prev) => [updated, ...prev]);
        } else if (!wasPublished && isPublished) {
          setDraftAnnounce((prev) => prev.filter((a) => a.id !== editingAnnouncement.id));
          setPublishAnnounce((prev) => [updated, ...prev]);
        } else if (isPublished) {
          setPublishAnnounce((prev) => prev.map((a) => a.id === editingAnnouncement.id ? updated : a));
        } else {
          setDraftAnnounce((prev) => prev.map((a) => a.id === editingAnnouncement.id ? updated : a));
        }

        showNotification("Announcement updated successfully");
      } else {
        const res = await AxiosInstance.post('/dashboard/admin/announcement/add', {
          announce: formData,
        });

        const created = res.data?.announce || { ...formData, id: res.data?.id ?? `temp-${Date.now()}`, created_at: new Date().toISOString(), published_at: new Date().toISOString() };

        if (formData.status === 'Published') {
          setPublishAnnounce((prev) => [created, ...prev]);
        } else {
          setDraftAnnounce((prev) => [created, ...prev]);
        }

        showNotification("Announcement created successfully");
      }

      closeModal();
    } catch (error) {
      console.log(error);
      setFormError(editingAnnouncement ? "Couldn't update this announcement." : "Couldn't create this announcement.");
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget || isDeleting) return;
    setIsDeleting(true);
    try {
      await AxiosInstance.delete('/dashboard/admin/announcement/delete', {
        data: { announce_id: deleteTarget.id },
      });
      setDraftAnnounce((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      setPublishAnnounce((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      setDeleteTarget(null);
      showNotification("Announcement deleted successfully");
    } catch (error) {
      console.log(error);
      showNotification("Failed to delete announcement", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const statsData = [
    { label: "Published", value: publishAnnounce.length, color: "text-green-700 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/20", icon: Send },
    { label: "Drafts", value: draftAnnounce.length, color: "text-gray-500 dark:text-slate-400", bg: "bg-gray-100 dark:bg-slate-700", icon: FileText },
  ];

  if (isLoading) {
    return (
      <div className="space-y-8 font-[Inter,system-ui,sans-serif]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-[Newsreader,Georgia,serif] text-3xl sm:text-4xl font-black text-gray-900 dark:text-gray-50 mb-2">
              Announcements
            </h1>
            <p className="text-gray-500 dark:text-slate-400">Create and manage platform announcements</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[0, 1].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 animate-pulse">
              <div className="h-8 bg-gray-100 dark:bg-slate-700 rounded w-12 mb-3" />
              <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded w-20" />
            </div>
          ))}
        </div>
        {[0, 1].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-5 animate-pulse">
            <div className="h-4 bg-gray-100 dark:bg-slate-700 rounded w-1/3 mb-3" />
            <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 font-[Inter,system-ui,sans-serif]">

      {/* Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-[60] flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-lg text-sm font-medium ${
          notification.type === 'success'
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
        }`}>
          {notification.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-[Newsreader,Georgia,serif] text-3xl sm:text-4xl font-black text-gray-900 dark:text-gray-50 mb-2">
            Announcements
          </h1>
          <p className="text-gray-500 dark:text-slate-400">Create and manage platform announcements</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-sm font-semibold rounded-lg text-white bg-[#1E3A5F] hover:bg-[#16304d] transition-colors duration-150 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Create Announcement
        </button>
      </div>

      {loadError && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-300">{loadError}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-gray-200 dark:bg-slate-700 rounded-xl overflow-hidden">
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

      {/* Drafts */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">Draft Announcements</h2>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
            {draftAnnounce.length}
          </span>
        </div>

        {draftAnnounce.length > 0 ? (
          <div className="space-y-3">
            {draftAnnounce.map((announcement) => {
              const audience = AUDIENCE_META[announcement.audience] || AUDIENCE_META.All;
              const AudienceIcon = audience.icon;
              const busy = deleteTarget?.id === announcement.id && isDeleting;
              return (
                <div key={announcement.id} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-1.5">{announcement.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed line-clamp-2 mb-3">{announcement.content}</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-slate-500">
                          <Calendar className="w-3 h-3" />
                          {formatDate(announcement.created_at)}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400">
                          <FileText className="w-3 h-3" />
                          Draft
                        </span>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded ${audience.bg} ${audience.color}`}>
                          <AudienceIcon className="w-3 h-3" />
                          {audience.label}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => openEditModal(announcement)}
                        className="p-2 rounded-lg text-[#1E3A5F] dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors duration-150"
                        title="Edit"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(announcement)}
                        disabled={busy}
                        className="p-2 rounded-lg text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors duration-150 disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center py-14 text-center">
            <div className="w-12 h-12 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center mb-3">
              <Megaphone className="w-5 h-5 text-gray-300 dark:text-slate-500" />
            </div>
            <p className="text-sm text-gray-400 dark:text-slate-500">No draft announcements</p>
          </div>
        )}
      </div>

      {/* Published */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">Published Announcements</h2>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            {publishAnnounce.length}
          </span>
        </div>

        {publishAnnounce.length > 0 ? (
          <div className="space-y-3">
            {publishAnnounce.map((announcement) => {
              const audience = AUDIENCE_META[announcement.audience] || AUDIENCE_META.All;
              const AudienceIcon = audience.icon;
              const busy = deleteTarget?.id === announcement.id && isDeleting;
              return (
                <div key={announcement.id} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-1.5">{announcement.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed line-clamp-2 mb-3">{announcement.content}</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-slate-500">
                          <Calendar className="w-3 h-3" />
                          {formatDate(announcement.published_at)}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400">
                          <Send className="w-3 h-3" />
                          Published
                        </span>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded ${audience.bg} ${audience.color}`}>
                          <AudienceIcon className="w-3 h-3" />
                          {audience.label}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setDeleteTarget(announcement)}
                        disabled={busy}
                        className="p-2 rounded-lg text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors duration-150 disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center py-14 text-center">
            <div className="w-12 h-12 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center mb-3">
              <Megaphone className="w-5 h-5 text-gray-300 dark:text-slate-500" />
            </div>
            <p className="text-sm text-gray-400 dark:text-slate-500">No announcements found</p>
          </div>
        )}
      </div>

      {/* Create / Edit modal */}
      {showModal && (
        <div
          className="!m-0 fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                {editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
              </h3>
              <button
                onClick={closeModal}
                disabled={isSaving}
                className="p-1 rounded text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-600 dark:hover:text-slate-300 transition-colors duration-100 disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold tracking-wide uppercase text-gray-400 dark:text-slate-500 mb-1.5">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter announcement title"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 dark:focus:ring-blue-500/30 focus:border-[#1E3A5F] dark:focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold tracking-wide uppercase text-gray-400 dark:text-slate-500 mb-1.5">
                  Content *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                  rows={6}
                  placeholder="Write your announcement content here..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 dark:focus:ring-blue-500/30 focus:border-[#1E3A5F] dark:focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold tracking-wide uppercase text-gray-400 dark:text-slate-500 mb-1.5">
                    Audience
                  </label>
                  <select
                    value={formData.audience}
                    onChange={(e) => setFormData((prev) => ({ ...prev, audience: e.target.value }))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 dark:focus:ring-blue-500/30 focus:border-[#1E3A5F] dark:focus:border-blue-500"
                  >
                    <option value="All">All Users</option>
                    <option value="Contributors">Contributors Only</option>
                    <option value="Readers">Readers Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold tracking-wide uppercase text-gray-400 dark:text-slate-500 mb-1.5">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 dark:focus:ring-blue-500/30 focus:border-[#1E3A5F] dark:focus:border-blue-500"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Published">Publish Now</option>
                  </select>
                </div>
              </div>

              {formError && (
                <p className="text-xs font-medium text-red-600 dark:text-red-400">{formError}</p>
              )}
            </div>

            <div className="flex gap-2 px-6 pb-6">
              <button
                onClick={closeModal}
                disabled={isSaving}
                className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors duration-150 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSaving}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-lg text-white bg-[#1E3A5F] hover:bg-[#16304d] transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isSaving ? "Saving…" : editingAnnouncement ? "Update Announcement" : "Create Announcement"}
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
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Delete Announcement</h3>
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

export default Announcements;
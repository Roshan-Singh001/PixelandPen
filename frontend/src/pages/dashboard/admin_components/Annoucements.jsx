import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Megaphone, Plus, Search, Filter, Calendar, Users, Eye, Edit3, 
  Trash2, Save, X, AlertCircle, Check, ChevronDown, Send, 
  Clock, Target, FileText, Settings
} from 'lucide-react';

import PixelPenLoader from "../../../components/PixelPenLoader";

const AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,
  headers: { "X-Custom-Header": "foobar" },
  withCredentials: true,
});

const Announcements = () => {
  const [draftAnnounce, setDraftAnnounce] = useState([]);
  const [publishAnnounce, setPublishAnnounce] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isRender, setRender] = useState(1);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isfirstloading, setIsFirstLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    audience: 'All',
    status: 'Draft'
  });

  useEffect(() => {
    setIsFirstLoading(true);
    const fetchData = async()=>{
        try {
          const response1 = await AxiosInstance.get('/dashboard/admin/fetch/announcement/draft');
          setDraftAnnounce(response1.data.drafts);

          const response2 = await AxiosInstance.get('/dashboard/admin/fetch/announcement/published');
          setPublishAnnounce(response2.data.published);
          
        } 
        catch (error) {
          console.log(error);
          
        }
    }
    fetchData();
    setIsFirstLoading(false);
    
  }, [isRender]);

  if (isfirstloading) return <PixelPenLoader/>

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }
    setIsLoading(true);
    try {
      await AxiosInstance.post('/dashboard/admin/announcement/add',{
        announce: formData
      });

      resetForm();
      setRender(isRender+1);
    } catch (error) {
      showNotification('Failed to save announcement', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async(announce_id)=>{
    if (!formData.title.trim() || !formData.content.trim()) {
        showNotification('Please fill in all required fields', 'error');
        return;
      }
      setIsLoading(true);
      try {
        await AxiosInstance.post('/dashboard/admin/announcement/edit',{
          announce_id: announce_id,
          announce: formData
        });
  
        resetForm();
        setRender(isRender+1);
      } catch (error) {
        showNotification('Failed to save announcement', 'error');
      } finally {
        setIsLoading(false);
      }

  }

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      audience: announcement.audience,
      status: announcement.status
    });
    setShowModal(true);
  };

  const handleDelete = async (announce_id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      setIsLoading(true);
      try {
        await AxiosInstance.delete('/dashboard/admin/announcement/delete',{
            data: {
                announce_id: announce_id,
            }
          });
        showNotification('Announcement deleted successfully');
        setRender(isRender+1);
      } catch (error) {
        showNotification('Failed to delete announcement', 'error');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      audience: 'All',
      status: 'Draft'
    });
    setEditingAnnouncement(null);
    setShowModal(false);
  };

  const getStatusBadge = (status) => {
    const badges = {
      Published: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      Draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };
    return badges[status] || badges.Draft;
  };

  const getAudienceBadge = (audience) => {
    const badges = {
      Contributors: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      Readers: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      All: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400'
    };
    return badges[audience] || badges.All;
  };

  const getAudienceIcon = (audience) => {
    switch(audience) {
      case 'Contributors': return <Edit3 className="w-3 h-3" />;
      case 'Readers': return <Eye className="w-3 h-3" />;
      case 'All': return <Users className="w-3 h-3" />;
      default: return <Users className="w-3 h-3" />;
    }
  };

  return (
    <div className="min-h-screen p-2">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-3 ${
          notification.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
            : 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
        }`}>
          {notification.type === 'success' ? 
            <Check className="w-5 h-5" /> : 
            <AlertCircle className="w-5 h-5" />
          }
          {notification.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">

            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Announcements
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Create and manage platform announcements
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col lg:flex-row gap-4 justify-between">
            {/* Create Button */}
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Announcement
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Published</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {publishAnnounce.length}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                <Send className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Drafts</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {draftAnnounce.length}
                </p>
              </div>
              <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full">
                <FileText className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Draft Announcements List */}
        <section className='mb-8'>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Draft Announcements ({draftAnnounce.length})
            </h2>
          </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="">
            {draftAnnounce.map((announcement) => (
              <div key={announcement.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {announcement.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                          {announcement.content}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-500 dark:text-gray-400">
                              {new Date(announcement.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(announcement.status)}`}>
                            <FileText className="w-3 h-3" />
                            {announcement.status.charAt(0).toUpperCase() + announcement.status.slice(1)}
                          </span>
                          
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getAudienceBadge(announcement.audience)}`}>
                            {getAudienceIcon(announcement.audience)}
                            {announcement.audience === 'All' ? 'All Users' : announcement.audience.charAt(0).toUpperCase() + announcement.audience.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(announcement)}
                      className="p-2 text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(announcement.id)}
                      className="p-2 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {draftAnnounce.length === 0 && (
              <div className="p-12 text-center">
                <Megaphone className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No draft announcements found
                </h3>
              </div>
            )}
          </div>
        </div>
        </section>

        {/* Published Announcements List     */}
        <section className='mb-8'>
        <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Published Announcements ({publishAnnounce.length})
            </h2>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="">
            {publishAnnounce.map((announcement) => (
              <div key={announcement.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {announcement.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                          {announcement.content}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-500 dark:text-gray-400">
                              {new Date(announcement.published_at).toLocaleDateString()}
                            </span>
                          </div>
                          
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(announcement.status)}`}>
                            <Send className="w-3 h-3" />
                            {announcement.status.charAt(0).toUpperCase() + announcement.status.slice(1)}
                          </span>
                          
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getAudienceBadge(announcement.audience)}`}>
                            {getAudienceIcon(announcement.audience)}
                            {announcement.audience === 'Both' ? 'All Users' : announcement.audience.charAt(0).toUpperCase() + announcement.audience.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDelete(announcement.id)}
                      className="p-2 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {publishAnnounce.length === 0 && (
              <div className="p-12 text-center">
                <Megaphone className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No announcements found
                </h3>
              </div>
            )}
          </div>
        </div>

        </section>

      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl h-[80vh] sm:h-[90vh]  overflow-scroll">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter announcement title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Content *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({...prev, content: e.target.value}))}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Write your announcement content here..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Audience
                    </label>
                    <select
                      value={formData.audience}
                      onChange={(e) => setFormData(prev => ({...prev, audience: e.target.value}))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="All">All Users</option>
                      <option value="Contributors">Contributors Only</option>
                      <option value="Readers">Readers Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({...prev, status: e.target.value}))}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Publish Now</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={editingAnnouncement? ()=>handleUpdate(editingAnnouncement.id) : handleSubmit}
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {editingAnnouncement ? 'Update' : 'Create'} Announcement
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Announcements;
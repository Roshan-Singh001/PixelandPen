import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye, FileText, Trash2, X, StarsIcon } from 'lucide-react';
import axios from 'axios';

import PixelPenLoader from "../../../components/PixelPenLoader";

const AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,
  headers: { "X-Custom-Header": "foobar" },
  withCredentials: true,
});

const ArticleRequests = () => {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isloading, setLoading] = useState(true);
  const [isRender, setRender] = useState(1);
  const [pendingArticles, setPendingArticles] = useState([]);
  const [rejectedArticles, setRejectedArticles] = useState([]);
  const [approvedArticles, setApprovedArticles] = useState([]);

  useEffect(() => {
    const fetchData =  async()=>{
      try {
        const response1 = await AxiosInstance.get('/dashboard/admin/fetch/article/pending');
        setPendingArticles(response1.data.pending);

        const response2 = await AxiosInstance.get('/dashboard/admin/fetch/article/rejected');
        setRejectedArticles(response2.data.rejected);

        const response3 = await AxiosInstance.get('/dashboard/admin/fetch/article/published');
        setApprovedArticles(response3.data.published);
      } catch (error) {
        console.log(error);
        
      }
    }
    fetchData();
    setLoading(false);
  }, [isRender]);

  if (isloading) return <PixelPenLoader/>

  const handlePreview = (slug)=>{
    window.open(`/preview/${slug}`, '_blank');
  }

  const handleView = (slug)=>{
    window.open(`/view/${slug}`, '_blank');
  }

  const handleDelete = async(article)=>{
    try {
      await AxiosInstance.delete('/dashboard/admin/article/delete', {
        data: {
          slug: article.slug,
          article_id: article.article_id,
          cont_id: article.cont_id,
          review_id: article.review_id,
        }
      });
      setRender(isRender+1);
    } catch (error) {
      console.log(error);
    }
  }

  const handleFeatured = async(slug,article_id,is_featured)=>{
    try {
      await AxiosInstance.post('/dashboard/admin/article/feature', {
          slug: slug,
          article_id: article_id,
          is_featured: is_featured?false:true
      });
      setRender(isRender+1);
    } catch (error) {
      console.log(error)
      
    }
  }

  const handleApprove = async (article) => {
    try {
      const date = new Date().toISOString().slice(0, 19).replace('T', ' ');
      await AxiosInstance.post('/dashboard/admin/article/approve',{
        slug: article.slug,
        cont_id: article.cont_id,
        review_id: article.review_id,
        author: article.author,
        publish_At: date
      });
      setRender(isRender+1);

      
    } catch (error) {
      console.log(error);
      
    }
  }
  
  const handleReject = async (article) => {
    setSelectedArticle(article);
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    console.log(`Rejecting article: ${selectedArticle.title} with reason: ${rejectReason}`);

    try {
      await AxiosInstance.post('/dashboard/admin/article/reject',{
        slug: selectedArticle.slug,
        cont_id: selectedArticle.cont_id,
        review_id: selectedArticle.review_id,
        rejectReason: rejectReason,
        rejectAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
      });
      setRender(isRender+1);
      
    } catch (error) {
      console.log(error);
      
    }

    setShowRejectModal(false);
    setRejectReason('');
    setSelectedArticle(null);
  };


  const StatusBadge = ({ status, count }) => (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-sky-500/10 to-blue-500/10 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800">
      <div className="w-2 h-2 rounded-full bg-sky-500"></div>
      {status} ({count})
    </div>
  );

  return (
    <div className="min-h-screen p-2">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 dark:from-sky-400 dark:to-blue-400 bg-clip-text text-transparent mb-2">
            Article Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Manage article submissions and publications</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{pendingArticles.length}</p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                <FileText className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Approved</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{approvedArticles.length}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rejected</p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">{rejectedArticles.length}</p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Pending Articles */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Pending Review</h2>
            <StatusBadge status="Awaiting Review" count={pendingArticles.length} />
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-auto">
            {pendingArticles.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {pendingArticles.map((article) => (
                  <div key={article.review_id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{article.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span>By {article.author}</span>
                          <span>•</span>
                          <span>Submitted {new Date(article.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button onClick={()=>handlePreview(article.slug)} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors">
                          <Eye size={16} />
                          Preview
                        </button>
                        <button onClick={()=> handleApprove(article)} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-lg transition-colors">
                          <CheckCircle size={16} />
                          Approve
                        </button>
                        <button 
                          onClick={() => handleReject(article)}
                          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                        >
                          <XCircle size={16} />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <FileText className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg">No pending requests</p>
              </div>
            )}
          </div>
        </section>

        {/* Rejected Articles */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Rejected Articles</h2>
            <StatusBadge status="Rejected" count={rejectedArticles.length} />
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {rejectedArticles.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {rejectedArticles.map((article) => (
                  <div key={article.review_id} className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{article.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <span>By {article.author}</span>
                      <span>•</span>
                      <span>Rejected {new Date(article.reject_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-sm">
                      <XCircle size={14} />
                      {article.reject_reason}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <XCircle className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg">No rejected articles</p>
              </div>
            )}
          </div>
        </section>

        {/* Approved Articles */}
        <section>
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Published Articles</h2>
        <StatusBadge status="Published" count={approvedArticles.length} />
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Article</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Author</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Published</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Views</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {approvedArticles.length > 0 ? (
                approvedArticles.map((article) => (
                  <tr key={article.article_id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{article.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                        {article.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{article.author}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{new Date(article.publish_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">{article.views?.toLocaleString()}</td>
                    <td className="">
                      <div className="flex items-center gap-1">
                        <button title='View' onClick={()=>handleView(article.slug)} className="inline-flex items-center gap-1 px-2 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors">
                          <Eye size={14} />
                        </button>
                        <button title='Delete' onClick={()=>handleDelete(article)} className="inline-flex items-center gap-1 px-2 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors">
                          <Trash2 size={14} />
                        </button>
                        <button title={article.is_featured?'Remove as Featured':'Set as Featured'} onClick={()=>handleFeatured(article.slug,article.article_id,article.is_featured)} className={`inline-flex items-center gap-1 px-2 py-2 text-sm font-medium text-yellow-600 ${article.is_featured?'bg-yellow-100 dark:bg-yellow-900/70':''} dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 rounded-md transition-colors`}>
                          <StarsIcon size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <FileText className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 text-lg">No articles published yet</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Reject Article</h3>
              <button
                onClick={() => setShowRejectModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                You are about to reject "<strong>{selectedArticle?.title}</strong>" by {selectedArticle?.author}.
              </p>
              
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reason for rejection <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Please provide a clear reason for rejecting this article..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white resize-none"
                rows={4}
                required
              />
            </div>
            
            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                disabled={!rejectReason.trim()}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                Reject Article
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleRequests;
import React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit, FileText, Clock, CheckCircle, XCircle, Trash2, Calendar, Tag } from 'lucide-react';

import PixelPenLoader from '../../../components/PixelPenLoader';

const MyArticles = (props) => {
  const AxiosInstance = axios.create({
      baseURL: import.meta.env.VITE_API_URL,
      timeout: 30000,
      headers: { "X-Custom-Header": "foobar" },
      withCredentials: true,
    });
  const navigate = useNavigate();
  const [draftArticles, setDraftArticles] = useState([]);
  const [pendingArticles, setPendingArticles] = useState([]);
  const [rejectedArticles, setRejectedArticles] = useState([]);
  const [approvedArticles, setApprovedArticles] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      AxiosInstance.get('/article/draft', {
        headers:{
          user_id: props.userdata.user_id,
        }
      })
      .then((res)=>{
        setDraftArticles(res.data);
      })
      .catch((err)=>{
        console.log(err);
      });

      AxiosInstance.get('/article/pending', {
        headers:{
          user_id: props.userdata.user_id,
        }
      })
      .then((res)=>{
        setPendingArticles(res.data);
      })
      .catch((err)=>{
        console.log(err);
      });

      AxiosInstance.get('/article/reject', {
        headers:{
          user_id: props.userdata.user_id,
        }
      })
      .then((res)=>{
        setRejectedArticles(res.data);
      })
      .catch((err)=>{
        console.log(err);
      });

      AxiosInstance.get('/article/approve', {
        headers:{
          user_id: props.userdata.user_id,
        }
      })
      .then((res)=>{
        setApprovedArticles(res.data);
      })
      .catch((err)=>{
        console.log(err);
      });

      setIsLoading(false);

    } catch (error) {
      console.log(error);
    }

  }, []);

  if (isLoading) {
    return <PixelPenLoader/>
    
  }

  

  

  const handleEdit = (slug)=>{
    props.setRefslug(slug);
    props.setMenuOption("Add Article");
  }

  const handlePreview = (slug)=>{
    window.open(`/preview/${slug}`, '_blank');
  }

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300', icon: Clock },
      approved: { color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300', icon: XCircle },
      draft: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300', icon: FileText },
    };
    
    const config = statusConfig[status] || statusConfig.draft;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const ActionButton = ({ onClick, icon: Icon, variant = 'primary', title, size = 'sm' }) => {
    const variants = {
      primary: 'text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20',
      secondary: 'text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50',
      danger: 'text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20',
      success: 'text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20',
    };
    
    const sizeConfig = {
      sm: 'p-2',
      md: 'p-2.5',
    };
    
    return (
      <button
        onClick={onClick}
        title={title}
        className={`${variants[variant]} ${sizeConfig[size]} rounded-lg transition-all duration-200 hover:scale-105`}
      >
        <Icon className="w-4 h-4" />
      </button>
    );
  };

  const ArticleCard = ({ article, status, children }) => (
    <div className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {article.title}
              </h3>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <StatusBadge status={status} />
              {article.pending_date && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Submitted: {new Date(article.pending_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              )}
              {article.updated_at && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Modified: {new Date(article.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              )}
              {article.reject_date && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Rejected: {new Date(article.reject_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              )}
            </div>
            {article.reject_reason && (
              <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border-l-4 border-red-400">
                <p className="text-sm text-red-700 dark:text-red-300">
                  <strong>Reason:</strong> {article.reject_reason}
                </p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 ml-4 opacity-0 group-hover:opacity-100 transition-opacity self-center">
            {children}
          </div>
        </div>
      </div>
    </div>
  );

  const SectionHeader = ({ title, count, icon: Icon }) => (
    <div className="flex items-center gap-3 mb-6">
      <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
        <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        {title}
      </h2>
      <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-sm font-medium">
        {count}
      </span>
    </div>
  );

  const EmptyState = ({ message, icon: Icon }) => (
    <div className="text-center py-12">
      <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
      </div>
      <p className="text-gray-500 dark:text-gray-400 text-lg">{message}</p>
    </div>
  );

  return (
    <div className="min-h-screen p-2">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Articles
          </h1>
        </div>

        {/* Pending Articles */}
        <section className="mb-10">
          <SectionHeader 
            title="Pending Review" 
            count={pendingArticles.length} 
            icon={Clock}
          />
          <div className="space-y-4">
            {pendingArticles.length > 0 ? (
              pendingArticles.map((article) => (
                <ArticleCard key={article.slug} article={article} status="pending">
                  <ActionButton
                    onClick={()=>handlePreview(article.slug)}
                    icon={Eye} 
                    variant="secondary" 
                    title="Preview Article"
                  />
                </ArticleCard>
              ))
            ) : (
              <EmptyState message="No articles pending review" icon={Clock} />
            )}
          </div>
        </section>

        {/* Draft Articles */}
        <section className="mb-10">
          <SectionHeader 
            title="Drafts" 
            count={draftArticles.length} 
            icon={FileText}
          />
          <div className="space-y-4">
            {draftArticles.length > 0 ? (
              draftArticles.map((article) => (
                <ArticleCard key={article.slug} article={article} status="draft">
                  <ActionButton
                    onClick={()=>handleEdit(article.slug)}
                    icon={Edit} 
                    variant="primary" 
                    title="Edit Article"
                  />
                  <ActionButton
                    onClick={()=>handlePreview(article.slug)}
                    icon={Eye} 
                    variant="secondary" 
                    title="Preview Article"
                  />
                </ArticleCard>
              ))
            ) : (
              <EmptyState message="No draft articles" icon={FileText} />
            )}
          </div>
        </section>

        {/* Rejected Articles */}
        <section className="mb-10">
          <SectionHeader 
            title="Rejected" 
            count={rejectedArticles.length} 
            icon={XCircle}
          />
          <div className="space-y-4">
            {rejectedArticles.length > 0 ? (
              rejectedArticles.map((article) => (
                <ArticleCard key={article.slug} article={article} status="rejected">
                  <ActionButton 
                    icon={Edit} 
                    variant="primary" 
                    title="Revise Article"
                  />
                </ArticleCard>
              ))
            ) : (
              <EmptyState message="No rejected articles" icon={XCircle} />
            )}
          </div>
        </section>

        {/* Approved Articles */}
        <section>
          <SectionHeader 
            title="Published Articles" 
            count={approvedArticles.length} 
            icon={CheckCircle}
          />
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Article
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Published
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Views
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {approvedArticles.length > 0 ? (
                    approvedArticles.map((article) => (
                      <tr key={article.slug} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FileText className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-3" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {article.title}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                            <Tag className="w-3 h-3 mr-1" />
                            {article.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(article.approve_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {article.views?.toLocaleString() || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-1">
                            <ActionButton 
                              icon={Eye} 
                              variant="secondary" 
                              title="View Article"
                            />
                            {/* <ActionButton 
                              icon={Trash2} 
                              variant="danger" 
                              title="Delete Article"
                            /> */}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <EmptyState message="No published articles yet" icon={CheckCircle} />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default MyArticles;
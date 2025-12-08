  import React, { useEffect, useState } from 'react';
  import axios from 'axios';
  import { MessageCircle, User, Calendar, FileText, Eye, Heart, Reply, ExternalLink } from 'lucide-react';

  import PixelPenLoader from '../../../components/PixelPenLoader';
  import { useAuth } from '../../../contexts/AuthContext';

  const AxiosInstance = axios.create({
    baseURL: 'http://localhost:3000/',
    withCredentials: true,
    timeout: 3000,
    headers: {'X-Custom-Header': 'foobar'}
  });

  const MyComments = () => {
    const [comments, setComments] = useState([]);
    const {userData} = useAuth();
    
    const [isloading, setIsLoading] = useState(false);
    const [stats, setStats] = useState({ total: 0, thisMonth: 0, thisWeek: 0 });
  
    useEffect(() => {
      setIsLoading(true);
      const fetchComments = async () => {
        try {
          const response = await AxiosInstance.get('/dashboard/contri/fetch/comments', {
            headers:{cont_id: userData.user_id}
          });
          const fetchedComments = response.data.comments || [];
          setComments(fetchedComments);
        } catch (error) {
          console.error('Error fetching comments:', error);
          setComments([]);
        } finally {
          setIsLoading(false);
        }
      };
      fetchComments();

      const now = new Date();
      const thisMonth = comments.filter(comment => {
        const commentDate = new Date(comment.created_at);
        return commentDate.getMonth() === now.getMonth() && commentDate.getFullYear() === now.getFullYear();
      }).length;
      
      const thisWeek = comments.filter(comment => {
        const commentDate = new Date(comment.created_at);
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return commentDate >= weekAgo;
      }).length;
  
      setStats({
        total: comments.length,
        thisMonth,
        thisWeek
      });
    }, []);

    
    if (isloading) return <PixelPenLoader />;

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };
    const handleView = (slug)=>{
    window.open(`/view/${slug}`, '_blank');
  }
  
    const getTimeAgo = (dateString) => {
      const now = new Date();
      const commentDate = new Date(dateString);
      const diffInSeconds = Math.floor((now - commentDate) / 1000);
  
      if (diffInSeconds < 60) return 'Just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
      return formatDate(dateString);
    };
  
    const truncateContent = (content, maxLength = 150) => {
      if (content.length <= maxLength) return content;
      return content.substring(0, maxLength) + '...';
    };
  
    return (
      <div className="min-h-screen p-2">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Comments on Your Posts
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  See what readers are saying about your articles
                </p>
              </div>
            </div>
          </div>
  
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Comments</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <MessageCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>
  
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">This Month</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.thisMonth}</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>
  
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">This Week</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.thisWeek}</p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Heart className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>
          </div>
  
          {/* Comments Section */}
          {comments.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No Comments Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Your posts haven't received any comments yet. Keep creating great content to engage your audience!
                </p>
                
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Comments ({comments.length})
                </h3>
                
              </div>
  
              {comments.map((comment, index) => (
                <div
                  key={comment.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md dark:hover:shadow-xl transition-all duration-200 overflow-hidden group"
                >
                  <div className="p-6">
                    {/* Comment Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                            {comment.username}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {getTimeAgo(comment.created_at)}
                          </p>
                        </div>
                      </div>
                      
                      {/* <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={()=>handleView(comment.slug)} className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                          <ExternalLink className="h-4 w-4" />
                        </button>
                      </div> */}
                    </div>
  
                    {/* Article Reference */}
                    <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border-l-4 border-blue-500">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Article: {comment.article_title}
                        </p>
                      </div>
                    </div>
  
                    {/* Comment Content */}
                    <div className="mb-4">
                      <blockquote className="relative">
                        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed pl-4 italic border-l-2 border-blue-200 dark:border-blue-800">
                          "{truncateContent(comment.content)}"
                        </p>
                      </blockquote>
                    </div>
  
                    {/* Comment Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-center space-x-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5"></div>
                          Published
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Comment #{index + 1}
                        </span>
                      </div>
                      
                      <button onClick={()=>handleView(comment.slug)} className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                        <Eye className="h-4 w-4 mr-1" />
                        View Post
                      </button>
                    </div>
                  </div>
                </div>
              ))}
  
              
            </div>
          )}
        </div>
      </div>
    );
  };
  
  export default MyComments;

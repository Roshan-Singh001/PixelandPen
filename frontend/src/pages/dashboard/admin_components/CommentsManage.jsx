import React, { useState, useEffect } from 'react';
import  axios  from "axios";
import { Check,User, X, Trash2, MessageCircle, Clock, CheckCircle, AlertCircle, Eye } from 'lucide-react';
import PixelPenLoader from "../../../components/PixelPenLoader";

const AxiosInstance = axios.create({
  baseURL: 'http://localhost:3000/',
  withCredentials: true,
  timeout: 3000,
  headers: {'X-Custom-Header': 'foobar'}
});

const CommentsManage = () => {
  const [approvedComments, setApprovedComments] = useState([]);
  const [pendingComments, setPendingComments] = useState([]);
  const [deletedComments, setDeletedComments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const fetchData = async()=>{
      try {
        const response1 = await AxiosInstance.get('/dashboard/admin/fetch/comments/approved');
        setApprovedComments(response1.data.approved);

        const response2 = await AxiosInstance.get('/dashboard/admin/fetch/comments/pending');
        setPendingComments(response2.data.pending);

        const response3 = await AxiosInstance.get('/dashboard/admin/fetch/comments/deleted');
        setDeletedComments(response3.data.deleted);
      } catch (error) {
        console.log(error);
        
      }
    }
    fetchData();
    setIsLoading(false);
    
  }, []);

  if (isLoading) return <PixelPenLoader/> 
  

  const handleView = (slug)=>{
    window.open(`/view/${slug}`, '_blank');
  }
  
  const updateCommentStatus = async (commentId, newStatus) => {
    try {
      await AxiosInstance.post(`/dashboard/admin/comment/status`, {
        id: commentId,
        status: newStatus
      });
      
    } catch (error) {
      console.log(error);
      
    }

  };

  const deleteComment = async (id) =>{
    try {
      await AxiosInstance.delete(`/dashboard/admin/comment/delete`,{
        data: {
          id: id
        }
      })
    } catch (error) {
      console.log(error);
      
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const CommentCard = ({ comment, showActions = true }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-4">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <h3 className="font-medium text-gray-900 dark:text-white">{comment.username}</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Article: <span className="font-medium">{comment.article_title}</span>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            {formatDate(comment.created_at)}
          </p>
        </div>
      </div>
      
      <div className="mb-4">
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          {comment.content}
        </p>
      </div>

      {showActions && (
        <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-100 dark:border-gray-700">
          {comment.status === 'Pending' && (
            <>
              <button
                onClick={() => updateCommentStatus(comment.id, 'Approved')}
                className="inline-flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors"
              >
                <Check className="h-4 w-4 mr-1" />
                Approve
              </button>
              <button
                onClick={() => updateCommentStatus(comment.id, 'Deleted')}
                className="inline-flex items-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors"
              >
                <X className="h-4 w-4 mr-1" />
                Reject
              </button>
            </>
          )}
          
          {comment.status === 'Approved' && (<>
            <button
              onClick={() => deleteComment(comment.id)}
              className="inline-flex items-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </button>
            <button onClick={()=>handleView(comment.slug)} className="inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors">
            <Eye className="h-4 w-4 mr-1" />
            View
          </button>
          </>
          )}
          
          {comment.status === 'Deleted' && (<>
            <button
              onClick={() => updateCommentStatus(comment.id, 'Approved')}
              className="inline-flex items-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors"
              >
              <Check className="h-4 w-4 mr-1" />
              Restore
            </button>
            <button
              onClick={() => deleteComment(comment.id)}
              className="inline-flex items-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </button>

              </>
            
          )}
          
          
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen p-2">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Comments Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and moderate user comments across all articles
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <MessageCircle className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Comments</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingComments.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingComments.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Approved</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{approvedComments.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Deleted</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{deletedComments.length}</p>
              </div>
            </div>
          </div>
        </div>
        

        {/* Comments Sections */}
        <div className="space-y-6">
          {/* Pending Comments */}
          
            <div>
              <div className="flex items-center mb-4">
                
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Pending Comments ({pendingComments.length})
                </h2>
              </div>
              {pendingComments.length > 0 ? (
                pendingComments.map(comment => (
                  <CommentCard key={comment.id} comment={comment} />
                ))
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
                  <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No pending comments</h3>
                  <p className="text-gray-500 dark:text-gray-400">All comments have been reviewed.</p>
                </div>
              )}
            </div>
          

          {/* Approved Comments */}
          
            <div>
              <div className="flex items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Approved Comments ({approvedComments.length})
                </h2>
              </div>
              {approvedComments.length > 0 ? (
                approvedComments.map(comment => (
                  <CommentCard key={comment.id} comment={comment} />
                ))
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
                  <CheckCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No approved comments</h3>
                  <p className="text-gray-500 dark:text-gray-400">No comments have been approved yet.</p>
                </div>
              )}
            </div>
          

          {/* Deleted Comments */}
          
            <div>
              <div className="flex items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Deleted Comments ({deletedComments.length})
                </h2>
              </div>
              {deletedComments.length > 0 ? (
                deletedComments.map(comment => (
                  <CommentCard key={comment.id} comment={comment} />
                ))
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
                  <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No deleted comments</h3>
                  <p className="text-gray-500 dark:text-gray-400">No comments have been deleted.</p>
                </div>
              )}
            </div>
          
        </div>
      </div>
    </div>
  );
};

export default CommentsManage;
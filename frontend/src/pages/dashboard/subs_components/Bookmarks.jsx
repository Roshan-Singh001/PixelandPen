import React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Bookmark, BookmarkX, Eye, Calendar, Tag, User, Clock } from 'lucide-react';

import PixelPenLoader from '../../../components/PixelPenLoader';

const AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,
  headers: { "X-Custom-Header": "foobar" },
  withCredentials: true,
});

const Bookmarks = (props) => {
  
  const navigate = useNavigate();
  const [bookmarkedArticles, setBookmarkedArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = () => {
    setIsLoading(true);
    try {
      AxiosInstance.get('/bookmarks', {
        headers: {
          user_id: props.userdata.user_id,
        }
      })
      .then((res) => {
        setBookmarkedArticles(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setIsLoading(false);
      });
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  const handleRemoveBookmark = (articleSlug) => {
    try {
      AxiosInstance.delete(`/bookmark/${articleSlug}`, {
        headers: {
          user_id: props.userdata.user_id,
        }
      })
      .then((res) => {
        // Remove the article from the local state
        setBookmarkedArticles(bookmarkedArticles.filter(article => article.slug !== articleSlug));
      })
      .catch((err) => {
        console.log(err);
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleViewArticle = (slug) => {
    navigate(`/article/${slug}`);
  };

  if (isLoading) {
    return <PixelPenLoader />;
  }

  const ActionButton = ({ onClick, icon: Icon, variant = 'primary', title, size = 'sm' }) => {
    const variants = {
      primary: 'text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20',
      secondary: 'text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50',
      danger: 'text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20',
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

  const BookmarkCard = ({ article }) => (
    <div className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <Bookmark className="w-5 h-5 text-blue-500 dark:text-blue-400 flex-shrink-0 fill-current" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors cursor-pointer"
                  onClick={() => handleViewArticle(article.slug)}>
                {article.title}
              </h3>
            </div>
            
            {article.excerpt && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                {article.excerpt}
              </p>
            )}
            
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
              {article.category && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                  <Tag className="w-3 h-3 mr-1" />
                  {article.category}
                </span>
              )}
              
              {article.author && (
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {article.author}
                </span>
              )}
              
              {article.published_date && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(article.published_date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
              )}
              
              {article.read_time && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {article.read_time} min read
                </span>
              )}
            </div>
            
            {article.bookmarked_date && (
              <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                Bookmarked on {new Date(article.bookmarked_date).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1 ml-4 opacity-0 group-hover:opacity-100 transition-opacity self-center">
            <ActionButton
              onClick={() => handleViewArticle(article.slug)}
              icon={Eye}
              variant="secondary"
              title="View Article"
            />
            <ActionButton
              onClick={() => handleRemoveBookmark(article.slug)}
              icon={BookmarkX}
              variant="danger"
              title="Remove Bookmark"
            />
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
    <div className="text-center py-16">
      <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-10 h-10 text-blue-500 dark:text-blue-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {message}
      </h3>
      <p className="text-gray-500 dark:text-gray-400">
        Start bookmarking articles to read them later
      </p>
    </div>
  );

  return (
    <div className="min-h-screen p-2">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            My Bookmarks
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your saved articles for later reading
          </p>
        </div>

        {/* Bookmarked Articles */}
        <section>
          <SectionHeader 
            title="Saved Articles" 
            count={bookmarkedArticles.length} 
            icon={Bookmark}
          />
          <div className="space-y-4">
            {bookmarkedArticles.length > 0 ? (
              bookmarkedArticles.map((article) => (
                <BookmarkCard key={article.slug} article={article} />
              ))
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <EmptyState message="No bookmarks yet" icon={Bookmark} />
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Bookmarks;
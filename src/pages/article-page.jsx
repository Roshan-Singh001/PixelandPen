import React, { useState } from 'react';
import { Heart, Share2, BookmarkPlus, MessageCircle, Calendar, User, Facebook, Twitter, Instagram, Printer, Copy, Link2 } from 'lucide-react';

const ArticlePage = () => {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([
    {
      id: 1,
      author: "Alex Johnson",
      content: "Great article! This really helped me understand the concept better.",
      time: "2 hours ago",
      likes: 5
    },
    {
      id: 2,
      author: "Sarah Chen",
      content: "Thanks for sharing this. The examples are particularly useful.",
      time: "5 hours ago",
      likes: 3
    }
  ]);

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleComment = () => {
    if (comment.trim()) {
      const newComment = {
        id: comments.length + 1,
        author: "You",
        content: comment,
        time: "Just now",
        likes: 0
      };
      setComments([newComment, ...comments]);
      setComment('');
    }
  };

  const handleShare = () => {
    setShowShareMenu(!showShareMenu);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
      {/* Header Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="text-xl font-bold text-slate-800 dark:text-white">
            Building Modern Web Applications with React and Advanced State Management
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleLike}
                className={`p-2 rounded-full transition-all duration-200 ${
                  isLiked 
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' 
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              </button>
              <button 
                onClick={handleBookmark}
                className={`p-2 rounded-full transition-all duration-200 ${
                  isBookmarked 
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <BookmarkPlus className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
              <div className="relative">
                <button 
                  onClick={handleShare}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                {showShareMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-10">
                    <button className="w-full px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center space-x-2">
                      <Facebook className="w-4 h-4" />
                      <span>Facebook</span>
                    </button>
                    <button className="w-full px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center space-x-2">
                      <Twitter className="w-4 h-4" />
                      <span>Twitter</span>
                    </button>
                    <button className="w-full px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center space-x-2">
                      <Link2 className="w-4 h-4" />
                      <span>Copy Link</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Article Section */}
        <article className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl dark:shadow-2xl overflow-hidden transition-all duration-300">
          {/* Hero Image */}
          <div className="relative h-96 bg-gradient-to-r from-blue-600 to-purple-600 overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-white/20 backdrop-blur-sm text-white border border-white/30">
                  Technology
                </span>
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-white/20 backdrop-blur-sm text-white border border-white/30">
                  Programming
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                Building Modern Web Applications with React and Advanced State Management
              </h1>
            </div>
          </div>

          <div className="p-8">
            {/* Author Info */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Roshan Singh</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Senior Frontend Developer</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">November 7, 2024</span>
              </div>
            </div>

            {/* Article Content */}
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                Modern web development has evolved significantly over the past few years, with React leading the charge in creating dynamic, interactive user interfaces. In this comprehensive guide, we'll explore advanced patterns and best practices for building scalable applications.
              </p>

              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">
                Understanding Component Architecture
              </h2>
              
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                Component-based architecture is the foundation of modern React applications. By breaking down complex UIs into smaller, reusable components, we can create maintainable and scalable codebases that stand the test of time.
              </p>

              <div className="my-8 p-6 bg-slate-50 dark:bg-slate-700 rounded-xl border-l-4 border-blue-500">
                <p className="text-slate-700 dark:text-slate-300 italic">
                  "The key to successful React development lies in thinking in components and understanding the unidirectional data flow."
                </p>
              </div>

              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">
                State Management Best Practices
              </h2>
              
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                Effective state management is crucial for building robust applications. Whether you're using React's built-in state management or external libraries like Redux or Zustand, understanding the principles of state management will help you create better user experiences.
              </p>

              {/* Engagement Stats */}
              <div className="flex items-center justify-between mt-12 pt-6 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
                    <span className="text-slate-600 dark:text-slate-400">{isLiked ? '2.4K' : '2.3K'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="w-5 h-5 text-slate-400" />
                    <span className="text-slate-600 dark:text-slate-400">{comments.length}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => window.print()}
                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors"
                  >
                    <Printer className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* Comments Section */}
        <section className="mt-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl dark:shadow-2xl overflow-hidden">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
              Comments ({comments.length})
            </h2>

            {/* Comment Form */}
            <div className="mb-8">
              <div className="mb-4">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full p-4 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
                  placeholder="Share your thoughts..."
                  rows="4"
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleComment}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!comment.trim()}
                >
                  Post Comment
                </button>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="border-b border-slate-200 dark:border-slate-700 pb-6 last:border-b-0">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold text-slate-900 dark:text-white">{comment.author}</h4>
                        <span className="text-sm text-slate-500 dark:text-slate-400">{comment.time}</span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{comment.content}</p>
                      <div className="flex items-center space-x-4 mt-3">
                        <button className="flex items-center space-x-1 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                          <Heart className="w-4 h-4" />
                          <span className="text-sm">{comment.likes}</span>
                        </button>
                        <button className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm">
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {comments.length === 0 && (
              <div className="text-center py-12">
                <MessageCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400">No comments yet. Be the first to share your thoughts!</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ArticlePage;

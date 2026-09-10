import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AxiosInstance from '../api/axiosInstance';
import {
  Heart, Share2, BookmarkPlus, MessageCircle, Calendar, UserRound,
  Printer, Link2, ChevronUp, Tag, FileText, Eye
} from 'lucide-react';
import { FaXTwitter } from "react-icons/fa6";
import { FaFacebook } from "react-icons/fa";
import { renderSlateToHtml } from '../utils/renderSlateToHtml';
import { useAuth } from "../contexts/AuthContext";

function formatDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function parseTags(tags) {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags;
  try {
    const parsed = JSON.parse(tags);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const PreviewArticlePage = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const { loggedIn, userData } = useAuth();

  const [article, setArticle] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(false);
  const [authorPic, setAuthorPic] = useState('');
  const [authorName, setAuthName] = useState('Unknown');

  useEffect(() => {
    if (!loggedIn) {
      navigate("/login");
      return;
    }

    AxiosInstance.get(`/article/preview/${slug}`)
      .then((res) => {
        setArticle(res.data.article);
        setAuthorPic(res.data.authPic);
        setAuthName(res.data.authName);
      })
      .catch((err) => {
        console.error('Error fetching article:', err);
        navigate("/notfound");
      });
  }, [slug, loggedIn]);

  useEffect(() => {
    const handleScroll = () => {
      setIsNavVisible(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!showShareMenu) return;
    const handleClickOutside = () => setShowShareMenu(false);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showShareMenu]);

  if (!loggedIn) return null;

  if (!article) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] dark:bg-slate-900 font-[Inter,system-ui,sans-serif]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
          <div className="w-full h-64 sm:h-80 rounded-xl bg-gray-100 dark:bg-slate-700 animate-pulse" />
          <div className="space-y-3">
            <div className="h-5 bg-gray-100 dark:bg-slate-700 rounded w-24 animate-pulse" />
            <div className="h-9 bg-gray-100 dark:bg-slate-700 rounded w-3/4 animate-pulse" />
            <div className="h-9 bg-gray-100 dark:bg-slate-700 rounded w-1/2 animate-pulse" />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gray-100 dark:bg-slate-700 animate-pulse" />
            <div className="space-y-2">
              <div className="h-3.5 bg-gray-100 dark:bg-slate-700 rounded w-28 animate-pulse" />
              <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded w-20 animate-pulse" />
            </div>
          </div>
          <div className="space-y-3 pt-4">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-4 bg-gray-100 dark:bg-slate-700 rounded animate-pulse" style={{ width: `${85 - i * 5}%` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const post = article[0];
  const categories = Array.isArray(post.category) ? post.category : [];
  const tags = parseTags(post.tags);

  const handleLike = () => setIsLiked((prev) => !prev);
  const handleBookmark = () => setIsBookmarked((prev) => !prev);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch (error) {
      console.log(error);
    }
    setShowShareMenu(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-slate-900 font-[Inter,system-ui,sans-serif]">

      {/* Preview banner */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-2">
          <Eye className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
          <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
            Preview mode — this article hasn't been published yet. Likes, bookmarks, and comments aren't saved here.
          </p>
        </div>
      </div>

      {/* Sticky nav */}
      <nav className={`fixed top-9 left-0 right-0 z-50 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-b border-gray-200 dark:border-slate-700 transition-all duration-200 ${
        isNavVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
      }`}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <button
            onClick={scrollToTop}
            className="text-sm font-semibold text-gray-800 dark:text-gray-100 hover:text-[#1E3A5F] dark:hover:text-blue-400 transition-colors duration-100 truncate text-left"
          >
            {post.title}
          </button>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleLike}
              className={`p-2 rounded-lg transition-colors duration-150 ${
                isLiked ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20' : 'text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleBookmark}
              className={`p-2 rounded-lg transition-colors duration-150 ${
                isBookmarked ? 'text-[#1E3A5F] dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              <BookmarkPlus className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setShowShareMenu((v) => !v); }}
                className="p-2 rounded-lg text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors duration-150"
              >
                <Share2 className="w-4 h-4" />
              </button>
              {showShareMenu && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg py-1 z-10"
                >
                  <button disabled className="w-full px-3.5 py-2 text-left text-xs font-medium text-gray-300 dark:text-slate-600 flex items-center gap-2 cursor-not-allowed">
                    <FaFacebook className="w-3.5 h-3.5" />
                    Facebook
                  </button>
                  <button disabled className="w-full px-3.5 py-2 text-left text-xs font-medium text-gray-300 dark:text-slate-600 flex items-center gap-2 cursor-not-allowed">
                    <FaXTwitter className="w-3.5 h-3.5" />
                    X (Twitter)
                  </button>
                  <button onClick={handleCopyLink} className="w-full px-3.5 py-2 text-left text-xs font-medium text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 flex items-center gap-2 transition-colors duration-100">
                    <Link2 className="w-3.5 h-3.5" />
                    Copy Link
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={scrollToTop}
              className="p-2 rounded-lg text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors duration-150 hidden sm:block"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        {/* Hero image */}
        <div className="w-full h-64 sm:h-80 lg:h-96 rounded-xl overflow-hidden bg-gray-100 dark:bg-slate-800 mb-8">
          {post.thumbnail_url ? (
            <img src={post.thumbnail_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FileText className="w-10 h-10 text-gray-300 dark:text-slate-500" />
            </div>
          )}
        </div>

        {/* Categories + title */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {categories.map((cat) => (
              <span
                key={cat}
                className="inline-block px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide rounded bg-blue-50 dark:bg-blue-900/20 text-[#1E3A5F] dark:text-blue-400"
              >
                {cat}
              </span>
            ))}
          </div>
        )}

        <h1 className="font-[Newsreader,Georgia,serif] text-3xl sm:text-4xl lg:text-[2.75rem] font-black leading-tight text-gray-900 dark:text-gray-50 mb-6">
          {post.title}
        </h1>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Author info */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-6 mb-8 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            {authorPic ? (
              <img src={authorPic} alt="" className="w-11 h-11 rounded-full object-cover bg-gray-100 dark:bg-slate-700 shrink-0" />
            ) : (
              <div className="w-11 h-11 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                <UserRound className="w-5 h-5 text-gray-300 dark:text-slate-500" />
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{authorName}</p>
              <p className="text-xs text-gray-400 dark:text-slate-500">Contributor</p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-slate-500">
            <Calendar className="w-3.5 h-3.5" />
            Last updated {formatDate(post.updated_at)}
          </span>
        </div>

        {/* Article body */}
        <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none prose-headings:font-[Newsreader,Georgia,serif]">
          {renderSlateToHtml(post.content || [])}
        </div>

        {/* Engagement bar */}
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <button
              onClick={handleLike}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors duration-150 ${
                isLiked ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20' : 'text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              {(post.likes || 0) + (isLiked ? 1 : 0)}
            </button>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-700">
              <MessageCircle className="w-4 h-4" />
              0
            </span>
          </div>
          <button
            onClick={() => window.print()}
            className="p-2 rounded-lg text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors duration-150"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>

        {/* Comments */}
        <section className="mt-10 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 sm:p-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-2">
            Comments
          </h2>
          <p className="text-xs text-gray-400 dark:text-slate-500 mb-6">
            Comments open once this article is published.
          </p>

          <div className="mb-8">
            <textarea
              disabled
              rows={4}
              placeholder="Comments aren't available in preview"
              className="w-full px-4 py-3 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-gray-400 dark:text-slate-500 resize-none cursor-not-allowed"
            />
            <div className="flex justify-end mt-3">
              <button
                disabled
                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold rounded-lg text-white bg-gray-300 dark:bg-slate-700 cursor-not-allowed"
              >
                Post Comment
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center mb-3">
              <MessageCircle className="w-5 h-5 text-gray-300 dark:text-slate-500" />
            </div>
            <p className="text-sm text-gray-400 dark:text-slate-500">No comments yet. Be the first to share your thoughts!</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default PreviewArticlePage;
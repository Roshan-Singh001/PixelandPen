import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import AxiosInstance from '../../api/axiosInstance';
import {
  Heart, Share2, BookmarkPlus, MessageCircle, Calendar, UserRound,
  Printer, Link2, ChevronUp, Tag, FileText
} from 'lucide-react';
import { FaXTwitter } from "react-icons/fa6";
import { FaFacebook } from "react-icons/fa";
import { renderSlateToHtml } from '../../utils/renderSlateToHtml';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from '../../contexts/AuthContext';

function formatDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatCommentDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
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

const ArticlePage = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const SITE_URL = import.meta.env.VITE_SITE_URL;
  const { loggedIn, userData } = useAuth();

  const [article, setArticle] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [comment, setComment] = useState('');
  const [isNavVisible, setIsNavVisible] = useState(false);
  const [authorPic, setAuthorPic] = useState('');
  const [authorName, setAuthName] = useState('Unknown');
  const [comments, setComments] = useState([]);
  const [likesCount, setLikesCount] = useState(0);

  const [isLiking, setIsLiking] = useState(false);
  const [isMarking, setIsMarking] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);

  useEffect(() => {
    AxiosInstance.get(`/article/view/${slug}`)
      .then((res) => {
        setArticle(res.data.article);
        setAuthorPic(res.data.authPic);
        setAuthName(res.data.authName);
        setComments(res.data.comments || []);
        setIsLiked(res.data.isLiked);
        setIsBookmarked(res.data.isBookmarked);
        setLikesCount(res.data.article[0].likes || 0);
      })
      .catch((err) => {
        console.error('Error fetching article:', err);
        navigate("/notfound");
      });
  }, [slug]);

  useEffect(() => {
    if (!loggedIn || !article) return;
    const timer = setTimeout(() => {
      AxiosInstance.post('/action/view', {
        article_id: article[0].article_id
      })
        .then((res) => {
          console.log('View recorded:', res.data);
        })
        .catch((err) => {
          console.error('Error recording view:', err);
        });
    }, 10000);

    return () => clearTimeout(timer);
  }, [loggedIn, article]);

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
  const tags = parseTags(post.tags);
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    image: post.thumbnail_url ? [post.thumbnail_url] : [],
    datePublished: post.publish_at,
    dateModified: post?.updated_at || post.publish_at,
    author: {
      "@type": "Person",
      name: post.author
    },
    publisher: {
      "@type": "Organization",
      name: "Pixel & Pen"
    }
  };


  const handleLike = async () => {
    if (isLiking) return;
    if (!loggedIn) {
      toast.error("This action needs log in");
      navigate("/login");
      return;
    }

    setIsLiking(true);
    try {
      await AxiosInstance.post('/action/like', { article_id: post.article_id });
      setIsLiked((prev) => !prev);
      setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
    } catch (error) {
      console.log(error);
    }
    setIsLiking(false);
  };

  const handleBookmark = async () => {
    if (isMarking) return;
    if (!loggedIn) {
      toast.error("This action needs log in");
      navigate("/login");
      return;
    }

    setIsMarking(true);
    try {
      await AxiosInstance.post('/action/bookmark', { article_id: post.article_id });
      setIsBookmarked((prev) => !prev);
    } catch (error) {
      console.log(error);
    }
    setIsMarking(false);
  };

  const handleComment = async () => {
    if (!loggedIn) {
      toast.error("This action needs log in");
      navigate("/login");
      return;
    }
    if (!comment.trim() || isCommenting) return;

    setIsCommenting(true);
    try {
      const res = await AxiosInstance.post(`/action/comment/`, {
        article_id: post.article_id,
        article_title: post.title,
        content: comment,
      });

      setComments((prev) => [
        ...prev,
        {
          id: res.data?.id ?? `local-${Date.now()}`,
          username: userData.userName,
          content: comment,
          created_at: new Date().toISOString(),
        },
      ]);
      setComment('');
    } catch (error) {
      console.log(error);
      toast.error("Cannot comment yet");
    }
    setIsCommenting(false);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied");
    } catch (error) {
      console.log(error);
    }
    setShowShareMenu(false);
  };

  const handleShareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank', 'noopener,noreferrer');
    setShowShareMenu(false);
  };

  const handleShareTwitter = () => {
    window.open(`https://x.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(post.title)}`, '_blank', 'noopener,noreferrer');
    setShowShareMenu(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-slate-900 font-[Inter,system-ui,sans-serif]">

      <Helmet>
        <title>{post.title} | Pixel & Pen</title>

        <meta
          name="description"
          content={post.description}
        />

        <link
          rel="canonical"
          href={`${SITE_URL}/view/${post.slug}`}
        />

        {/* Open Graph */}
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.description} />
        <meta property="og:image" content={post.thumbnail_url} />
        <meta
          property="og:url"
          content={`${SITE_URL}/view/${post.slug}`}
        />
        <meta property="og:type" content="article" />

        {/* Twitter / X */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.description} />
        <meta name="twitter:image" content={post.thumbnail_url} />

        <script type="application/ld+json">
          {JSON.stringify(articleSchema)}
        </script>
      </Helmet>

      {/* Sticky nav */}
      <nav className={`fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-b border-gray-200 dark:border-slate-700 transition-all duration-200 ${isNavVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
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
              disabled={isLiking}
              className={`p-2 rounded-lg transition-colors duration-150 ${isLiked ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20' : 'text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={handleBookmark}
              disabled={isMarking}
              className={`p-2 rounded-lg transition-colors duration-150 ${isBookmarked ? 'text-[#1E3A5F] dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-700'
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
                  <button onClick={handleShareFacebook} className="w-full px-3.5 py-2 text-left text-xs font-medium text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 flex items-center gap-2 transition-colors duration-100">
                    <FaFacebook className="w-3.5 h-3.5" />
                    Facebook
                  </button>
                  <button onClick={handleShareTwitter} className="w-full px-3.5 py-2 text-left text-xs font-medium text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 flex items-center gap-2 transition-colors duration-100">
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
            <img src={post.thumbnail_url} alt={post.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FileText className="w-10 h-10 text-gray-300 dark:text-slate-500" />
            </div>
          )}
        </div>

        {/* Category + title */}
        {(post.category || post.category_id) && (
          <span className="inline-block px-2.5 py-1 mb-3 text-[11px] font-semibold uppercase tracking-wide rounded bg-blue-50 dark:bg-blue-900/20 text-[#1E3A5F] dark:text-blue-400">
            {post.category || post.category_id}
          </span>
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
              <img src={authorPic} alt={authorName} className="w-11 h-11 rounded-full object-cover bg-gray-100 dark:bg-slate-700 shrink-0" />
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
            {formatDate(post.publish_at)}
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
              disabled={isLiking}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors duration-150 ${isLiked ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20' : 'text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600'
                }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              {likesCount}
            </button>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-700">
              <MessageCircle className="w-4 h-4" />
              {comments.length}
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
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-6">
            Comments ({comments.length})
          </h2>

          <div className="mb-8">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Share your thoughts..."
              className="w-full px-4 py-3 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 dark:focus:ring-blue-500/30 focus:border-[#1E3A5F] dark:focus:border-blue-500"
            />
            <div className="flex justify-end mt-3">
              <button
                onClick={handleComment}
                disabled={!comment.trim() || isCommenting}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold rounded-lg text-white bg-[#1E3A5F] hover:bg-[#16304d] transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCommenting ? "Posting…" : "Post Comment"}
              </button>
            </div>
          </div>

          {comments.length > 0 ? (
            <div className="space-y-5">
              {comments.map((c) => (
                <div key={c.id ?? `${c.username}-${c.created_at}`} className="flex items-start gap-3 pb-5 border-b border-gray-100 dark:border-slate-700 last:border-0 last:pb-0">
                  <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                    <img src={c.profile_pic} alt={c.username} className="w-full h-full object-cover rounded-full" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{c.username}</p>
                      <span className="text-xs text-gray-400 dark:text-slate-500">{formatCommentDate(c.created_at)}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center mb-3">
                <MessageCircle className="w-5 h-5 text-gray-300 dark:text-slate-500" />
              </div>
              <p className="text-sm text-gray-400 dark:text-slate-500">No comments yet. Be the first to share your thoughts.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default ArticlePage;
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Heart, Share2, BookmarkPlus, MessageCircle, Calendar, User, Printer, Copy, Link2, ChevronUp } from 'lucide-react';
import { FaXTwitter } from "react-icons/fa6";
import { FaFacebook } from "react-icons/fa";
import { renderSlateToHtml } from '../utils/renderSlateToHtml';
import { useNavigate } from 'react-router-dom';
import {toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from '../contexts/AuthContext';

const AxiosInstance = axios.create({
      baseURL: 'http://localhost:3000/',
      withCredentials: true,
      timeout: 3000,
      headers: {'X-Custom-Header': 'foobar'}
    });

const ArticlePage = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const { loggedIn, userData} = useAuth();
  const [isExist, setIsExist] = useState(false);
  const [article, setArticle] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [comment, setComment] = useState('');
  const [isNavVisible, setIsNavVisible] = useState(false);
  const [featuredImage, setFeaturedImage] = useState(null);
  const [authorPic, setAuthorPic] = useState('');
  const [authorName, setAuthName] = useState('Unknown');
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const articleInfo = ()=>{AxiosInstance.get(`/article/view/${slug}`,{
      headers: { user_id: loggedIn ? userData.user_id : null }
    })
    .then((res) => {
      setArticle(res.data.article);
      setFeaturedImage(res.data.article[0].thumbnail_url);
      setAuthorPic(res.data.authPic);
      setAuthName(res.data.authName);
      setComments(res.data.comments);
      setIsLiked(res.data.isLiked);
      setIsExist(true);
    })
    .catch((err) => { 
      console.error('Error fetching article:', err);
      navigate("/notfound");
    });
  }

  const info = async()=>{
    if(!loggedIn){
      toast.error(`This action needs log in`);
      navigate("/login");
      return;
    }
    if (userData.userRole != 'Contributor') {
      try {
        const response = await AxiosInstance.get(`/action/islike/article/`, { headers: { 'user_id': userData.user_id, 'article_id': article[0].article_id } })
        setIsLiked(response.data.isLike);
        
      } catch (error) {
        console.log(error);
        
      }
    }
  }
  articleInfo();
  info();

  }, [slug]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsNavVisible(scrollPosition > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Article Section Skeleton */}
        <article className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl dark:shadow-2xl overflow-hidden">
          
          {/* Hero Image Skeleton */}
          <div className="relative h-64 sm:h-80 lg:h-96 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%] article_load_gradient overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute bottom-4 left-4 right-4">
              {/* Category Tags Skeleton */}
              <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
                {[...Array(3)].map((_, i) => (
                  <div 
                    key={i} 
                    className="h-6 w-16 bg-white/20 backdrop-blur-sm rounded-full animate-pulse"
                    style={{animationDelay: `${i * 0.1}s`}}
                  ></div>
                ))}
              </div>
              
              {/* Title Skeleton */}
              <div className="space-y-2">
                <div className="h-8 sm:h-10 lg:h-12 bg-white/30 backdrop-blur-sm rounded-lg animate-pulse"></div>
                <div className="h-8 sm:h-10 lg:h-12 bg-white/30 backdrop-blur-sm rounded-lg w-3/4 animate-pulse" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
  
          <div className="p-4 sm:p-6 lg:p-8">
            {/* Author Info Skeleton */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-slate-200 dark:border-slate-700 space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%] article_load_gradient flex-shrink-0"></div>
                <div>
                  <div className="h-5 w-24 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%] article_load_gradient rounded mb-2"></div>
                  <div className="h-4 w-32 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%] article_load_gradient rounded"></div>
                </div>
              </div>
              <div className="flex items-center space-x-2 ml-13 sm:ml-0">
                <div className="w-4 h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%] article_load_gradient rounded"></div>
                <div className="h-4 w-24 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%] article_load_gradient rounded"></div>
              </div>
            </div>
  
            {/* Article Content Skeleton */}
            <div className="prose prose-sm sm:prose-base lg:prose-lg dark:prose-invert max-w-none">
              
              {/* H1 Skeleton - Matches HeadingOneElement */}
              <div className="mb-6 mt-8">
                <div className="h-8 sm:h-10 lg:h-12 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%] article_load_gradient rounded-lg"></div>
                <div className="h-8 sm:h-10 lg:h-12 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%] article_load_gradient rounded-lg w-2/3 mt-2" style={{animationDelay: '0.1s'}}></div>
              </div>
  
              {/* Paragraph Skeletons */}
              <div className="space-y-4 mb-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <div className="h-4 sm:h-5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%] article_load_gradient rounded" style={{animationDelay: `${i * 0.1}s`}}></div>
                    <div className="h-4 sm:h-5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%] article_load_gradient rounded w-5/6" style={{animationDelay: `${i * 0.15}s`}}></div>
                    <div className="h-4 sm:h-5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%] article_load_gradient rounded w-4/6" style={{animationDelay: `${i * 0.2}s`}}></div>
                  </div>
                ))}
              </div>
  
              {/* H2 Skeleton - Matches HeadingTwoElement */}
              <div className="mb-5 mt-8">
                <div className="h-6 sm:h-8 lg:h-10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%] article_load_gradient rounded-lg pb-2"></div>
                <div className="h-0.5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%] article_load_gradient rounded mt-2"></div>
              </div>
  
              {/* More Paragraph Skeletons */}
              <div className="space-y-4 mb-6">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <div className="h-4 sm:h-5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%] article_load_gradient rounded" style={{animationDelay: `${i * 0.1}s`}}></div>
                    <div className="h-4 sm:h-5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%] article_load_gradient rounded w-4/5" style={{animationDelay: `${i * 0.15}s`}}></div>
                  </div>
                ))}
              </div>
  
              {/* BlockQuote Skeleton - Matches BlockQuoteElement */}
              <div className="my-6 sm:my-8 p-4 sm:p-6 bg-slate-50 dark:bg-slate-700 rounded-xl border-l-4 border-blue-500">
                <div className="space-y-3">
                  <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-600 dark:via-gray-500 dark:to-gray-600 bg-[length:200%_100%] article_load_gradient rounded"></div>
                  <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-600 dark:via-gray-500 dark:to-gray-600 bg-[length:200%_100%] article_load_gradient rounded w-3/4"></div>
                  <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-600 dark:via-gray-500 dark:to-gray-600 bg-[length:200%_100%] article_load_gradient rounded w-1/2"></div>
                </div>
              </div>
  
              {/* H3 Skeleton - Matches HeadingThreeElement */}
              <div className="mb-4 mt-6">
                <div className="h-6 sm:h-7 lg:h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%] article_load_gradient rounded-lg w-2/3"></div>
              </div>
  
              {/* List Skeleton - Matches BulletListElement */}
              <div className="space-y-2 pl-6 my-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="h-4 sm:h-5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%] article_load_gradient rounded" style={{animationDelay: `${i * 0.1}s`}}></div>
                    </div>
                  </div>
                ))}
              </div>
  
              {/* Code Block Skeleton */}
              <div className="my-6 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                </div>
                <div className="bg-gray-900 dark:bg-gray-950 p-4">
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-4 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 bg-[length:200%_100%] article_load_gradient rounded" style={{width: `${Math.random() * 40 + 60}%`, animationDelay: `${i * 0.1}s`}}></div>
                    ))}
                  </div>
                </div>
              </div>
  
              {/* Final Paragraphs */}
              <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <div className="h-4 sm:h-5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%] article_load_gradient rounded" style={{animationDelay: `${i * 0.1}s`}}></div>
                    <div className="h-4 sm:h-5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%] article_load_gradient rounded w-3/4" style={{animationDelay: `${i * 0.15}s`}}></div>
                  </div>
                ))}
              </div>
  
              {/* Engagement Stats Skeleton */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-8 sm:mt-12 pt-4 sm:pt-6 border-t border-slate-200 dark:border-slate-700 space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4 sm:space-x-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%] article_load_gradient rounded"></div>
                    <div className="h-4 w-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%] article_load_gradient rounded"></div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%] article_load_gradient rounded"></div>
                    <div className="h-4 w-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%] article_load_gradient rounded"></div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%] article_load_gradient rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </article>
  
        {/* Comments Section Skeleton */}
        <section className="mt-6 sm:mt-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl dark:shadow-2xl overflow-hidden">
          <div className="p-4 sm:p-6 lg:p-8">
            {/* Comments Header */}
            <div className="flex items-center space-x-2 mb-4 sm:mb-6">
              <div className="h-6 sm:h-8 w-32 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%] article_load_gradient rounded"></div>
              <div className="h-6 sm:h-8 w-12 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%] article_load_gradient rounded"></div>
            </div>
  
            {/* Comment Form Skeleton */}
            <div className="mb-6 sm:mb-8">
              <div className="mb-4">
                <div className="w-full h-24 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%] article_load_gradient rounded-xl"></div>
              </div>
              <div className="flex justify-end">
                <div className="h-10 w-32 bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200 dark:from-blue-700 dark:via-blue-600 dark:to-blue-700 bg-[length:200%_100%] article_load_gradient rounded-xl"></div>
              </div>
            </div>
  
            {/* Comments List Skeleton */}
            <div className="space-y-4 sm:space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="border-b border-slate-200 dark:border-slate-700 pb-4 sm:pb-6 last:border-b-0">
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-green-200 via-blue-200 to-green-200 dark:from-green-700 dark:via-blue-700 dark:to-green-700 bg-[length:200%_100%] article_load_gradient flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="h-4 w-20 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%] article_load_gradient rounded"></div>
                        <div className="h-3 w-16 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%] article_load_gradient rounded"></div>
                      </div>
                      <div className="space-y-2 mb-3">
                        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%] article_load_gradient rounded"></div>
                        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%] article_load_gradient rounded w-3/4"></div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%] article_load_gradient rounded"></div>
                          <div className="h-3 w-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%] article_load_gradient rounded"></div>
                        </div>
                        <div className="h-3 w-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%] article_load_gradient rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  const handleLike = () => {
    try {
      const res = AxiosInstance.post('/action/like',{
        article_id: article[0].article_id,
        user_id: userData.user_id,
        like: isLiked
      })
      setIsLiked(!isLiked);
    } catch (error) {
      
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleComment = async() => {
    if(!loggedIn){
      toast.error(`This action needs log in`);
      navigate("/login");
      return;
    }

    if (comment.trim()) {
      try {
        await AxiosInstance.post(`/action/comment/`, {
          article_id: article[0].article_id,
          article_title: article[0].title,
          user_id: userData.user_id,
          userRole: userData.userRole,
          content: comment,
          username: userData.userName
        });
        setComment('');
      } catch (error) {
        console.log(error);
        toast.error(`Cannot comment yet`);
      }
      
    }
  };

  const handleShare = () => {
    setShowShareMenu(!showShareMenu);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (isExist &&
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
      {/* Sticky Header Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700 transition-all duration-300 ${
        isNavVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <button 
              onClick={scrollToTop}
              className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 truncate pr-4 flex-1 text-left"
            >
              {article[0].title}
            </button>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button 
                onClick={handleLike}
                className={`p-2 rounded-full transition-all duration-200 ${
                  isLiked 
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' 
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isLiked ? 'fill-current' : ''}`} />
              </button>
              <button 
                onClick={handleBookmark}
                className={`p-2 rounded-full transition-all duration-200 ${
                  isBookmarked 
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <BookmarkPlus className={`w-4 h-4 sm:w-5 sm:h-5 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
              <div className="relative">
                <button 
                  onClick={handleShare}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                >
                  <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                {showShareMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-10">
                    <button className="w-full px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center space-x-2">
                      
                      <FaFacebook className="w-4 h-4" />
                      <span>Facebook</span>
                    </button>
                    <button className="w-full px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center space-x-2">
                      <FaXTwitter className="w-4 h-4" />
                      <span>Twitter</span>
                    </button>
                    <button className="w-full px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center space-x-2">
                      <Link2 className="w-4 h-4" />
                      <span>Copy Link</span>
                    </button>
                  </div>
                )}
              </div>
              <button 
                onClick={scrollToTop}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors hidden sm:block"
              >
                <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Article Section */}
        <article className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl dark:shadow-2xl overflow-hidden transition-all duration-300">
          {/* Hero Image */}
          <div className="relative h-64 sm:h-80 lg:h-96 bg-gradient-to-r from-blue-600 to-purple-600 overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="">
            {featuredImage ? (
              <>
                <img 
                  src={featuredImage} 
                  alt="Featured article image"
                  className="w-full h-[100vh] object-cover"
                />
                <div className="absolute inset-0 bg-black/30"></div>
              </>
            ) : (
              <>
                <div className="w-full h-full bg-gradient-to-r from-blue-600 to-purple-600"></div>
                <div className="absolute inset-0 bg-black/20"></div>
              </>
            )}
              <div className="absolute bottom-4 left-4 right-4 ">
              <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
                {(article[0].category).map((cat)=>{
                  return (<span key={cat} className="px-2 sm:px-3 py-1 text-xs font-semibold rounded-full bg-white/20 backdrop-blur-sm text-white border border-white/30">
                  {cat}
                </span>)})}
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
                {article[0].title}
              </h1>
            </div>
          </div>
          </div>
          

          <div className="p-4 sm:p-6 lg:p-8">
            {/* Author Info */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-slate-200 dark:border-slate-700 space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                {authorPic==''?<User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />: 
                  <>
                    <img
                    src={authorPic}
                    alt="Author Pic"
                    className="w-full h-full rounded-full object-cover transition-shadow"
                    />
                  
                  </>}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{authorName}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Contributor</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 ml-13 sm:ml-0">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{new Date(article[0].publish_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>

            {/* Article Content */}
            <div className="prose prose-sm sm:prose-base lg:prose-lg dark:prose-invert max-w-none">
              <div>{renderSlateToHtml(article[0].content || [])}</div>
              

              {/* Engagement Stats */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-8 sm:mt-12 pt-4 sm:pt-6 border-t border-slate-200 dark:border-slate-700 space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4 sm:space-x-6">
                  <div className="flex items-center space-x-2">
                    <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
                    <span className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">{article[0].likes}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                    <span className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">{comments.length}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => window.print()}
                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors"
                  >
                    <Printer className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* Comments Section */}
        <section className="mt-6 sm:mt-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl dark:shadow-2xl overflow-hidden">
          <div className="p-4 sm:p-6 lg:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-6">
              Comments ({comments.length})
            </h2>

            {/* Comment Form */}
            <div className="mb-6 sm:mb-8">
              <div className="mb-4">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full p-3 sm:p-4 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200 text-sm sm:text-base"
                  placeholder="Share your thoughts..."
                  rows="4"
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleComment}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  disabled={!comment.trim()}
                >
                  Post Comment
                </button>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-4 sm:space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="border-b border-slate-200 dark:border-slate-700 pb-4 sm:pb-6 last:border-b-0">
                  <div className="flex items-start space-x-3 sm:space-x-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 mb-2">
                        <h4 className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">{comment.username}</h4>
                        <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">{new Date(comment.created_at).toLocaleDateString('en-US', {year: 'numeric',month: 'short',day: 'numeric',hour: '2-digit',minute: '2-digit'})}</span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base">{comment.content}</p>
                      <div className="flex items-center space-x-4 mt-2 sm:mt-3">
                        
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {comments.length === 0 && (
              <div className="text-center py-8 sm:py-12">
                <MessageCircle className="w-10 h-10 sm:w-12 sm:h-12 text-slate-400 mx-auto mb-3 sm:mb-4" />
                <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">No comments yet. Be the first to share your thoughts!</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ArticlePage;
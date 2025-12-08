import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { 
  User, MapPin, Calendar, Users, Heart, Eye, Share2, 
  ExternalLink, BookOpen, TrendingUp, Clock, Star, MessageCircle,
  Award, Target, Zap, Filter, Search, ChevronRight,
  Globe, Mail, Phone
} from 'lucide-react';
import { FaXTwitter  } from 'react-icons/fa6';
import { FaGithub, FaLinkedin, FaFacebook   } from "react-icons/fa";
import {toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import PixelPenLoader from '../components/PixelPenLoader';
import { useAuth } from '../contexts/AuthContext';

const AxiosInstance = axios.create({
  baseURL: "http://localhost:3000/",
  timeout: 30000,
  headers: { "X-Custom-Header": "foobar" },
  withCredentials: true,
});
const ProfilePage = () => {
  const { slug } = useParams();
  const { loggedIn, userData} = useAuth();
  const navigate = useNavigate();
  const [contributor, setContributor] = useState(null);
  const [articles, setArticles] = useState([]);
  const [popularArticles, setPopularArticles] = useState([]);
  const [mostLikedArticles, setMostLikedArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');
  const [isFollowing, setIsFollowing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    const fetchContributorData = async () => {
      setIsLoading(true);
      try {
        const response1 = await AxiosInstance.get(`/profile/cont/${slug}`);
        setContributor(response1.data.profileInfo);
        setArticles(response1.data.articleInfo);
        setPopularArticles(response1.data.popularArticles);
        setMostLikedArticles(response1.data.likeArticles);
  
        if (userData.userRole === 'Reader') {
          let user_id = userData.user_id;
          let cont_id = response1.data.profileInfo.cont_id;
          try {
            const response2 = await AxiosInstance.get(`/action/isfollow/cont/`, {
                headers: {cont_id: cont_id,
                user_id: user_id
              }
            });
            setIsFollowing(response2.data.isFollow);
          } catch (error) {
            console.log(error);
          }
        }
      } catch (error) {
        console.log(error);
      }
      setIsLoading(false);
    };
  
    fetchContributorData();
  }, [slug, userData]);
  

  const handleView = (article_slug)=>{
    window.open(`/view/${article_slug}`, '_blank');
  }

  const handleFollow = async() => {
    if(!loggedIn){
      toast.error(`This action needs log in`);
      navigate("/login");
      return;
    }
    else if(userData.userRole != 'Reader'){
      console.log(userData);
      toast.error(`You can't perform this action`);
      return;
    }

    try {
      const newFollowState = !isFollowing;
      setIsFollowing(newFollowState);
        await AxiosInstance.post(`/action/follow/cont/`, {
            cont_id: contributor.cont_id,
            user_id: userData.user_id,
            follow: newFollowState
          }
        );

      setContributor((prev) => ({
          ...prev,
          followers: newFollowState?prev.followers + 1:prev.followers - 1,
      }));
      
    } catch (error) {
      console.log(error);
      toast.error("Failed to update follow status");
      
    }
  };

const filterList = (list) =>
  list.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
let sortedArticles = [];
switch (sortBy) {
  case "popular":
    sortedArticles = filterList(popularArticles);
    break;
  case "likes":
    sortedArticles = filterList(mostLikedArticles);
    break;
  case "recent":
  default:
    sortedArticles = filterList(articles);
    break;
}

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getSocialIcon = (platform) => {
    const icons = {
      github: FaGithub,
      linkedin: FaLinkedin,
      twitter: FaXTwitter,
      facebook: FaFacebook
    };
    return icons[platform] || ExternalLink;
  };

  if (isLoading) {
    return (
      <PixelPenLoader/>
    );
  }

  if (!contributor) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Contributor Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400">The contributor you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Profile Image */}
            <div className="relative">
              <img
                src={contributor.profile_pic}
                alt={contributor.username}
                className="w-32 h-32 lg:w-40 lg:h-40 rounded-full border-4 border-white shadow-2xl object-cover"
              />
              <div className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-2">
                {contributor.username}
              </h1>
              <p className="text-xl text-blue-100 mb-4 max-w-2xl">
                {contributor.bio}
              </p>
              
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-blue-100">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span>{contributor.city}, {contributor.country}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>Joined {formatDate(contributor.created_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>{formatNumber(contributor.followers)} followers</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4">
              <button
                onClick={handleFollow}
                className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  isFollowing
                    ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    : 'bg-white text-blue-600 hover:bg-blue-50'
                }`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
              <button className="px-8 py-3 border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-600 transition-all duration-200 flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Share Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'about', label: 'About', icon: User },
              { id: 'articles', label: 'All Articles', icon: BookOpen },
              { id: 'popular', label: 'Popular', icon: TrendingUp }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-8">
              {/* Bio */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">About</h2>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {contributor.bio}
                </p>
              </div>

              {/* Expertise */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Award className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  Expertise & Skills
                </h2>
                <div className="flex flex-wrap gap-3">
                  {contributor.expertise.map((skill, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded-full text-sm font-medium border border-blue-200 dark:border-blue-800"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Popular Articles Preview */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Star className="w-6 h-6 text-yellow-500" />
                    Popular Articles
                  </h2>
                  <button
                    onClick={() => setActiveTab('popular')}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-1"
                  >
                    View All
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-4">
                  {popularArticles.length >0 ?popularArticles.map((article) => (
                    <div key={article.article_id} className="flex gap-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer">
                      <img
                        src={article.thumbnail_url}
                        alt={article.title}
                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1">
                          {article.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {formatNumber(article.views)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            {formatNumber(article.likes)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )): <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No articles found</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {searchTerm ? 'Try adjusting your search terms' : 'This contributor hasn\'t published any articles yet'}
                  </p>
                </div>}

                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Stats */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Statistics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Articles Published</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{articles.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Views</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatNumber(articles.reduce((sum, article) => sum + article.views, 0))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Likes</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatNumber(articles.reduce((sum, article) => sum + article.likes, 0))}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Followers</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatNumber(contributor.followers)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Connect</h3>
                <div className="space-y-3">
                  {Object.entries(contributor.links).map(([platform, url]) => {
                    const Icon = getSocialIcon(platform);
                    return (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                      >
                        <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                        <span className="text-gray-700 dark:text-gray-300 capitalize group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          {platform}
                        </span>
                        <ExternalLink className="w-4 h-4 text-gray-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <Mail className="w-5 h-5" />
                    <span className="text-sm">{contributor.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <Globe className="w-5 h-5" />
                    <span className="text-sm">{contributor.city}, {contributor.country}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Articles Tab */}
        {(activeTab === 'articles' || activeTab === 'popular') && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex flex-col lg:flex-row gap-4 justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search articles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="recent">Most Recent</option>
                  <option value="popular">Most Popular</option>
                  <option value="likes">Most Liked</option>
                </select>
              </div>
            </div>

            {/* Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedArticles.map((article) => (
                <article key={article.article_id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-200 group cursor-pointer">
                  <div className="relative">
                    <img
                      src={article.thumbnail_url}
                      alt={article.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
                        {article.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                      {article.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {formatNumber(article.views)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {formatNumber(article.likes)}
                        </span>
                        
                      </div>
                      
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(article.publish_at)}
                      </span>
                      <button onClick={()=>handleView(article.slug)} className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm flex items-center gap-1">
                        Read More
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {sortedArticles.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No articles found</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm ? 'Try adjusting your search terms' : 'This contributor hasn\'t published any articles yet'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
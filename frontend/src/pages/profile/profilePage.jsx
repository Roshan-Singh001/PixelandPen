import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AxiosInstance from '../../api/axiosInstance';
import {
  UserRound, MapPin, Calendar, Users, Heart, Eye, Share2,
  ExternalLink, BookOpen, TrendingUp, Award, Search,
  ChevronRight, Globe, Mail, FileText, Tag
} from 'lucide-react';
import { FaXTwitter } from 'react-icons/fa6';
import { FaGithub, FaLinkedin, FaFacebook } from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useAuth } from '../../contexts/AuthContext';

const TABS = [
  { id: 'about', label: 'About', icon: UserRound },
  { id: 'articles', label: 'All Articles', icon: BookOpen },
  { id: 'popular', label: 'Popular', icon: TrendingUp },
];

const linkIcons = {
  github: FaGithub,
  linkedin: FaLinkedin,
  twitter: FaXTwitter,
  facebook: FaFacebook,
};

function formatDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatNumber(num) {
  const n = num || 0;
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}

function locationLabel(city, country) {
  if (city && country) return `${city}, ${country}`;
  if (city) return city;
  if (country) return country;
  return "";
}

const ProfilePage = () => {
  const { slug } = useParams();
  const { loggedIn, userData } = useAuth();
  const navigate = useNavigate();

  const [contributor, setContributor] = useState(null);
  const [articles, setArticles] = useState([]);
  const [popularArticles, setPopularArticles] = useState([]);
  const [mostLikedArticles, setMostLikedArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [activeTab, setActiveTab] = useState('about');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    const fetchContributorData = async () => {
      setIsLoading(true);
      setNotFound(false);
      try {
        const response1 = await AxiosInstance.get(`/profile/cont/${slug}`);
        setContributor(response1.data.profileInfo);
        setArticles(response1.data.articleInfo || []);
        setPopularArticles(response1.data.popularArticles || []);
        setMostLikedArticles(response1.data.likeArticles || []);

        if (userData && userData.userRole === 'Reader') {
          const cont_id = response1.data.profileInfo.cont_id;
          try {
            const response2 = await AxiosInstance.get(`/action/isfollow/cont/`, {
              headers: { cont_id },
            });
            setIsFollowing(response2.data.isFollow);
          } catch (error) {
            console.log(error);
          }
        }
      } catch (error) {
        console.log(error);
        setNotFound(true);
      }
      setIsLoading(false);
    };

    fetchContributorData();
  }, [slug, userData]);

  const handleView = (article_slug) => {
    window.open(`/view/${article_slug}`, '_blank', 'noopener,noreferrer');
  };

  const handleTabChange = (id) => {
    setActiveTab(id);
    if (id === 'popular') setSortBy('popular');
    if (id === 'articles') setSortBy('recent');
  };

  const handleFollow = async () => {
    if (!loggedIn) {
      toast.error(`This action needs log in`);
      navigate("/login");
      return;
    }
    if (userData?.userRole !== 'Reader') {
      toast.error(`You can't perform this action`);
      return;
    }

    const previousFollowing = isFollowing;
    const newFollowState = !isFollowing;

    setFollowBusy(true);
    setIsFollowing(newFollowState);
    setContributor((prev) => ({
      ...prev,
      followers: newFollowState ? prev.followers + 1 : Math.max(0, prev.followers - 1),
    }));

    try {
      await AxiosInstance.post(`/action/follow/cont/`, {
        cont_id: contributor.cont_id,
        follow: newFollowState,
      });
    } catch (error) {
      console.log(error);
      setIsFollowing(previousFollowing);
      setContributor((prev) => ({
        ...prev,
        followers: previousFollowing ? prev.followers + 1 : Math.max(0, prev.followers - 1),
      }));
      toast.error("Failed to update follow status");
    } finally {
      setFollowBusy(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: contributor?.username, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Profile link copied");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const filterList = (list) =>
    list.filter(article =>
      article.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.description?.toLowerCase().includes(searchTerm.toLowerCase())
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

  const totalViews = articles.reduce((sum, article) => sum + (article.views || 0), 0);
  const totalLikes = articles.reduce((sum, article) => sum + (article.likes || 0), 0);

  const expertise = contributor?.expertise || [];
  const links = contributor?.links || {};

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] dark:bg-slate-900 font-[Inter,system-ui,sans-serif]">
        <div className="bg-[#1E3A5F] p-8 sm:p-12">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center gap-6 animate-pulse">
            <div className="w-28 h-28 rounded-full bg-white/10 shrink-0" />
            <div className="flex-1 space-y-3 w-full">
              <div className="h-6 bg-white/10 rounded w-48 mx-auto sm:mx-0" />
              <div className="h-4 bg-white/10 rounded w-64 mx-auto sm:mx-0" />
            </div>
          </div>
        </div>
        <div className="max-w-5xl mx-auto p-6 space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 h-24 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (notFound || !contributor) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] dark:bg-slate-900 flex items-center justify-center font-[Inter,system-ui,sans-serif]">
        <div className="text-center">
          <div className="w-16 h-16 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl flex items-center justify-center mx-auto mb-4">
            <UserRound className="w-7 h-7 text-gray-300 dark:text-slate-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Contributor Not Found</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400">The contributor you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-slate-900 font-[Inter,system-ui,sans-serif]">

      {/* Hero */}
      <div className="bg-[#1E3A5F] relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,.12) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="relative shrink-0">
              {contributor.profile_pic ? (
                <img
                  src={contributor.profile_pic}
                  alt=""
                  className="w-28 h-28 lg:w-32 lg:h-32 rounded-full object-cover border-4 border-white/20"
                />
              ) : (
                <div className="w-28 h-28 lg:w-32 lg:h-32 rounded-full bg-white/10 border-4 border-white/20 flex items-center justify-center">
                  <UserRound className="w-12 h-12 text-white/50" />
                </div>
              )}
            </div>

            <div className="flex-1 text-center lg:text-left">
              <h1 className="font-[Newsreader,Georgia,serif] text-3xl lg:text-4xl font-black text-white mb-2">
                {contributor.username || "Anonymous"}
              </h1>
              <p className="text-white/60 mb-4 max-w-2xl leading-relaxed">
                {contributor.bio || "This contributor hasn't added a bio yet."}
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 text-sm text-white/50">
                {locationLabel(contributor.city, contributor.country) && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {locationLabel(contributor.city, contributor.country)}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  Joined {formatDate(contributor.created_at)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  {formatNumber(contributor.followers)} followers
                </span>
              </div>
            </div>

            <div className="flex flex-row lg:flex-col gap-2.5 shrink-0">
              <button
                onClick={handleFollow}
                disabled={followBusy}
                className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors duration-150 disabled:opacity-60 ${
                  isFollowing
                    ? 'bg-white/10 text-white hover:bg-white/20'
                    : 'bg-white text-[#1E3A5F] hover:bg-blue-50'
                }`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
              <button
                onClick={handleShare}
                className="px-6 py-2.5 rounded-lg text-sm font-semibold border border-white/20 text-white hover:bg-white/10 transition-colors duration-150 flex items-center justify-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <nav className="flex overflow-x-auto">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => handleTabChange(id)}
                className={`flex items-center gap-1.5 py-4 px-4 border-b-2 text-sm font-semibold whitespace-nowrap transition-colors duration-150 ${
                  activeTab === id
                    ? 'border-[#1E3A5F] dark:border-blue-400 text-[#1E3A5F] dark:text-blue-400'
                    : 'border-transparent text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* About */}
        {activeTab === 'about' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">

              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6">
                <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">About</h2>
                <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed">
                  {contributor.bio || "This contributor hasn't added a bio yet."}
                </p>
              </div>

              {expertise.length > 0 && (
                <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6">
                  <div className="flex items-center gap-2.5 mb-4">
                    <Award className="w-4 h-4 text-[#1E3A5F] dark:text-blue-400" />
                    <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Expertise & Skills</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {expertise.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 text-xs font-medium rounded-full bg-blue-50 dark:bg-blue-900/20 text-[#1E3A5F] dark:text-blue-400"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-700">
                  <div className="flex items-center gap-2.5">
                    <TrendingUp className="w-4 h-4 text-[#1E3A5F] dark:text-blue-400" />
                    <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Popular Articles</h2>
                  </div>
                  <button
                    onClick={() => handleTabChange('popular')}
                    className="text-xs font-semibold text-[#1E3A5F] dark:text-blue-400 flex items-center gap-1 hover:underline"
                  >
                    View All
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="p-3">
                  {popularArticles.length > 0 ? (
                    <div className="space-y-1">
                      {popularArticles.slice(0, 5).map((article) => (
                        <button
                          key={article.article_id}
                          onClick={() => handleView(article.slug)}
                          className="w-full flex gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors duration-100 text-left"
                        >
                          {article.thumbnail_url ? (
                            <img
                              src={article.thumbnail_url}
                              alt=""
                              className="w-16 h-16 rounded-lg object-cover shrink-0 bg-gray-100 dark:bg-slate-700"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                              <FileText className="w-5 h-5 text-gray-300 dark:text-slate-500" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 line-clamp-2 mb-1">
                              {article.title}
                            </h3>
                            <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-slate-500">
                              <span className="flex items-center gap-1">
                                <Eye className="w-3.5 h-3.5" />
                                {formatNumber(article.views)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Heart className="w-3.5 h-3.5" />
                                {formatNumber(article.likes)}
                              </span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center mb-3">
                        <BookOpen className="w-5 h-5 text-gray-300 dark:text-slate-500" />
                      </div>
                      <p className="text-sm text-gray-400 dark:text-slate-500">
                        This contributor hasn't published any articles yet
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">

              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-4">Statistics</h3>
                <div className="space-y-3">
                  {[
                    { label: "Articles Published", value: articles.length },
                    { label: "Total Views", value: formatNumber(totalViews) },
                    { label: "Total Likes", value: formatNumber(totalLikes) },
                    { label: "Followers", value: formatNumber(contributor.followers) },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-slate-400">{row.label}</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-50">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {Object.keys(links).length > 0 && (
                <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-4">Connect</h3>
                  <div className="space-y-1">
                    {Object.entries(links).map(([platform, url]) => {
                      if (!url) return null;
                      const Icon = linkIcons[platform] || ExternalLink;
                      return (
                        <a
                        
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors duration-100"
                        >
                          <Icon className="w-4 h-4 text-gray-400 dark:text-slate-500 group-hover:text-[#1E3A5F] dark:group-hover:text-blue-400" />
                          <span className="text-sm text-gray-600 dark:text-slate-300 capitalize group-hover:text-[#1E3A5F] dark:group-hover:text-blue-400">
                            {platform}
                          </span>
                          <ExternalLink className="w-3.5 h-3.5 text-gray-300 dark:text-slate-500 ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-100" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-4">Contact</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-slate-400">
                    <Mail className="w-4 h-4 shrink-0" />
                    <span className="truncate">{contributor.email}</span>
                  </div>
                  {locationLabel(contributor.city, contributor.country) && (
                    <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-slate-400">
                      <Globe className="w-4 h-4 shrink-0" />
                      <span>{locationLabel(contributor.city, contributor.country)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Articles / Popular */}
        {(activeTab === 'articles' || activeTab === 'popular') && (
          <div className="space-y-6">

            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-5">
              <div className="flex flex-col sm:flex-row gap-3 justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search articles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 dark:focus:ring-blue-500/30 focus:border-[#1E3A5F] dark:focus:border-blue-500"
                  />
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 dark:focus:ring-blue-500/30 focus:border-[#1E3A5F] dark:focus:border-blue-500"
                >
                  <option value="recent">Most Recent</option>
                  <option value="popular">Most Popular</option>
                  <option value="likes">Most Liked</option>
                </select>
              </div>
            </div>

            {sortedArticles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {sortedArticles.map((article) => (
                  <div
                    key={article.article_id}
                    className="group bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden hover:shadow-sm transition-shadow duration-150 flex flex-col"
                  >
                    <button
                      onClick={() => handleView(article.slug)}
                      className="relative block w-full h-40 shrink-0 bg-gray-100 dark:bg-slate-700 overflow-hidden"
                    >
                      {article.thumbnail_url ? (
                        <img
                          src={article.thumbnail_url}
                          alt=""
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FileText className="w-8 h-8 text-gray-300 dark:text-slate-500" />
                        </div>
                      )}
                      {article.category_name && (
                        <span className="absolute top-3 left-3 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide rounded bg-[#1E3A5F]/90 text-white">
                          {article.category_name}
                        </span>
                      )}
                    </button>

                    <div className="p-5 flex-1 flex flex-col">
                      <h3
                        onClick={() => handleView(article.slug)}
                        className="text-sm font-semibold text-gray-800 dark:text-gray-100 line-clamp-2 mb-2 cursor-pointer hover:text-[#1E3A5F] dark:hover:text-blue-400 transition-colors duration-100"
                      >
                        {article.title}
                      </h3>
                      {article.description && (
                        <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-2 mb-4">
                          {article.description}
                        </p>
                      )}

                      <div className="mt-auto pt-4 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-slate-500">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" />
                            {formatNumber(article.views)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-3.5 h-3.5" />
                            {formatNumber(article.likes)}
                          </span>
                        </div>
                        <span className="text-[11px] text-gray-400 dark:text-slate-500">
                          {formatDate(article.publish_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center py-20 text-center">
                <div className="w-14 h-14 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-gray-300 dark:text-slate-500" />
                </div>
                <p className="text-gray-500 dark:text-slate-400 font-medium">No articles found</p>
                <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">
                  {searchTerm ? 'Try adjusting your search terms' : "This contributor hasn't published any articles yet"}
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
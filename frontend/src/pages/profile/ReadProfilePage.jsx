import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  UserRound, MessageSquare, Users, Heart, FileText,
  ExternalLink, Eye, UserMinus, Tag
} from 'lucide-react';
import AxiosInstance from '../../api/axiosInstance';

function memberSince(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function formatDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const TABS = [
  { key: 'likes', label: 'Liked Articles', icon: Heart },
  { key: 'following', label: 'Following', icon: Users },
  { key: 'comments', label: 'Comments', icon: MessageSquare },
];

const ReadProfilePage = () => {

  const { slug } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");

  const [stats, setStats] = useState({ comments: 0, following: 0, likes: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('likes');
  const [tabData, setTabData] = useState({ likes: null, following: null, comments: null });
  const [tabLoading, setTabLoading] = useState(false);
  const [tabError, setTabError] = useState("");

  useEffect(() => {
    fetchProfile();

  }, [slug]);

  useEffect(() => {
    if (tabData[activeTab] !== null) return;
    fetchTab(activeTab);
  }, [activeTab, slug]);

  const fetchProfile = () => {
    setProfileLoading(true);
    setStatsLoading(true);
    setProfileError("");
    AxiosInstance.get(`/profile/reader/${slug.toLowerCase()}`)
      .then((res) => {
        setProfile(res.data.profileInfo);
        setProfileLoading(false);

        setStats({
          comments: res.data.totalComments || 0,
          following: res.data.totalFollowing || 0,
          likes: res.data.totalLikes || 0,
        });
        setStatsLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setProfileError(err.response?.status === 404 ? "This profile doesn't exist." : "Couldn't load this profile.");
        setProfileLoading(false);
        setStatsLoading(false);
      });
  };

  const fetchTab = (tab) => {
    setTabLoading(true);
    setTabError("");
    AxiosInstance.get(`/profile/reader/${slug.toLowerCase()}/${tab.toLowerCase()}`)
      .then((res) => {
        setTabData((prev) => ({ ...prev, [tab]: res.data }));
        setTabLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setTabError("Couldn't load this section.");
        setTabLoading(false);
      });
  };

  const handleViewArticle = (articleSlug) => {
    window.open(`/article/view/${articleSlug}`, '_blank', 'noopener,noreferrer');
  };

  const handleViewContributor = (contSlug) => {
    window.open(`/profile/cont/${contSlug}`, '_blank', 'noopener,noreferrer');
  };

  const statsData = [
    { label: "Comments", value: stats.comments, color: "text-[#1E3A5F] dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20", icon: MessageSquare },
    { label: "Following", value: stats.following, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20", icon: Users },
    { label: "Likes", value: stats.likes, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-900/20", icon: Heart },
  ];

  if (profileLoading) {
    return (
      <div className="space-y-8 font-[Inter,system-ui,sans-serif] mx-auto">
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-8 sm:p-10 flex flex-col items-center animate-pulse">
          <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-slate-700 mb-4" />
          <div className="h-5 bg-gray-100 dark:bg-slate-700 rounded w-40 mb-3" />
          <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded w-56 mb-2" />
          <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded w-32" />
        </div>
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="space-y-8 font-[Inter,system-ui,sans-serif] max-w-3xl mx-auto my-20">
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center mb-4">
            <UserRound className="w-6 h-6 text-gray-300 dark:text-slate-500" />
          </div>
          <p className="text-gray-500 dark:text-slate-400 font-medium">{profileError || "Something went wrong."}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 text-xs font-semibold rounded-lg text-white bg-[#1E3A5F] hover:bg-[#16304d] transition-colors duration-150"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-[Inter,system-ui,sans-serif] mx-auto my-20 max-w-4xl">

      {/* Profile card */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-8 sm:p-10 flex flex-col items-center text-center">
        {profile.profile_pic ? (
          <img
            src={profile.profile_pic}
            alt=""
            className="w-24 h-24 rounded-full object-cover bg-gray-100 dark:bg-slate-700 mb-4"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center mb-4">
            <UserRound className="w-10 h-10 text-gray-300 dark:text-slate-500" />
          </div>
        )}

        <h1 className="font-[Newsreader,Georgia,serif] text-2xl sm:text-3xl font-black text-gray-900 dark:text-gray-50">
          {profile.username}
        </h1>

        {profile.bio && (
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-2 max-w-md leading-relaxed">
            {profile.bio}
          </p>
        )}

        <p className="text-xs text-gray-400 dark:text-slate-500 mt-4">
          Member since {memberSince(profile.created_at)}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 divide-x divide-gray-100 dark:divide-slate-700 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
        {statsLoading
          ? [0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col items-center justify-center px-4 py-6 animate-pulse">
              <div className="h-7 bg-gray-100 dark:bg-slate-700 rounded w-10 mb-2" />
              <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded w-16" />
            </div>
          ))
          : statsData.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="flex flex-col items-center justify-center px-4 py-6 text-center">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${stat.bg}`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-[11px] font-semibold tracking-widest uppercase text-gray-400 dark:text-slate-500 mt-0.5">
                  {stat.label}
                </p>
              </div>
            );
          })}
      </div>

      {/* Tabs */}
      <div>
        <div className="flex border-b border-gray-200 dark:border-slate-700 mb-5 overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors duration-150 ${
                  isActive
                    ? "border-[#1E3A5F] dark:border-blue-400 text-[#1E3A5F] dark:text-blue-400"
                    : "border-transparent text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        {tabLoading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-5 flex items-center gap-4 animate-pulse">
                <div className="w-14 h-14 rounded-lg bg-gray-100 dark:bg-slate-700 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="h-4 bg-gray-100 dark:bg-slate-700 rounded w-2/3 mb-2" />
                  <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : tabError ? (
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center py-14 text-center">
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-3">{tabError}</p>
            <button
              onClick={() => fetchTab(activeTab)}
              className="px-4 py-2 text-xs font-semibold rounded-lg text-white bg-[#1E3A5F] hover:bg-[#16304d] transition-colors duration-150"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {activeTab === 'likes' && (
              <LikesTab items={tabData.likes || []} onViewArticle={handleViewArticle} />
            )}
            {activeTab === 'following' && (
              <FollowingTab items={tabData.following || []} onViewContributor={handleViewContributor} />
            )}
            {activeTab === 'comments' && (
              <CommentsTab items={tabData.comments || []} onViewArticle={handleViewArticle} />
            )}
          </>
        )}
      </div>

    </div>
  );
};

const EmptyTab = ({ icon: Icon, label }) => (
  <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center py-16 text-center">
    <div className="w-12 h-12 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center mb-3">
      <Icon className="w-5 h-5 text-gray-300 dark:text-slate-500" />
    </div>
    <p className="text-sm text-gray-400 dark:text-slate-500">{label}</p>
  </div>
);

const LikesTab = ({ items, onViewArticle }) => {
  if (items.length === 0) return <EmptyTab icon={Heart} label="No liked articles yet" />;

  return (
    <div className="space-y-2">
      {items.map((article) => (
        <button
          key={article.slug}
          onClick={() => onViewArticle(article.slug)}
          className="group w-full flex items-center gap-4 px-5 py-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors duration-100 text-left"
        >
          {article.thumbnail_url ? (
            <img src={article.thumbnail_url} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0 bg-gray-100 dark:bg-slate-700" />
          ) : (
            <div className="w-14 h-14 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-gray-300 dark:text-slate-500" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate group-hover:text-[#1E3A5F] dark:group-hover:text-blue-400 transition-colors duration-100">
              {article.title}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-slate-500 mt-1">
              {article.category_name && (
                <span className="inline-flex items-center gap-1"><Tag className="w-3 h-3" />{article.category_name}</span>
              )}
              {article.category_name && article.author && <span>·</span>}
              {article.author && <span>{article.author}</span>}
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-gray-300 dark:text-slate-500 group-hover:text-gray-500 dark:group-hover:text-slate-300 shrink-0" />
        </button>
      ))}
    </div>
  );
};

const FollowingTab = ({ items, onViewContributor }) => {
  if (items.length === 0) return <EmptyTab icon={Users} label="Not following anyone yet" />;

  return (
    <div className="space-y-2">
      {items.map((author) => (
        <div
          key={author.cont_id}
          className="flex items-center gap-4 px-5 py-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl"
        >
          {author.profile_pic ? (
            <img src={author.profile_pic} alt="" className="w-12 h-12 rounded-full object-cover shrink-0 bg-gray-100 dark:bg-slate-700" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
              <UserRound className="w-5 h-5 text-gray-300 dark:text-slate-500" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{author.username}</p>
            {author.bio && (
              <p className="text-xs text-gray-400 dark:text-slate-500 truncate mt-0.5">{author.bio}</p>
            )}
          </div>
          <button
            onClick={() => onViewContributor(author.username)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded text-[#1E3A5F] dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors duration-150 shrink-0"
          >
            <Eye className="w-3.5 h-3.5" />
            View Profile
          </button>
        </div>
      ))}
    </div>
  );
};

const CommentsTab = ({ items, onViewArticle }) => {
  if (items.length === 0) return <EmptyTab icon={MessageSquare} label="No comments yet" />;

  return (
    <div className="space-y-2">
      {items.map((comment) => (
        <button
          key={comment.id}
          onClick={() => onViewArticle(comment.article_slug)}
          className="group w-full text-left px-5 py-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors duration-100"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 truncate mb-1.5">
                {comment.article_title}
              </p>
              <p className="text-sm text-gray-700 dark:text-slate-300 italic leading-relaxed line-clamp-2">
                "{comment.content}"
              </p>
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-2">{formatDate(comment.created_at)}</p>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-300 dark:text-slate-500 group-hover:text-gray-500 dark:group-hover:text-slate-300 shrink-0 mt-0.5" />
          </div>
        </button>
      ))}
    </div>
  );
};

export default ReadProfilePage;
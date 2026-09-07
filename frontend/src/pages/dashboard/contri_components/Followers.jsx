import React, { useState, useEffect, useRef } from 'react';
import AxiosInstance from '../../../api/axiosInstance';
import {
  Search, UserRound, Users, X, BookOpen, Bookmark, Calendar, ExternalLink, Loader2
} from 'lucide-react';

const PAGE_SIZE = 15;

function timeAgo(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `Followed you ${diffDay}d ago`;
  if (diffWeek < 5) return `Followed you ${diffWeek}w ago`;
  if (diffMonth < 12) return `Followed you ${diffMonth}mo ago`;
  return `Followed you on ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
}

function memberSince(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

const Followers = () => {

  const [followers, setFollowers] = useState([]);
  const [totalFollowers, setTotalFollowers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const debounceRef = useRef(null);

  const [selectedFollower, setSelectedFollower] = useState(null);
  const [followerStats, setFollowerStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState("");

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchTerm(searchInput.trim());
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [searchInput]);

  useEffect(() => {
    fetchFollowers();
  }, [searchTerm]);

  const fetchFollowers = () => {

    AxiosInstance.get('/dashboard/contri/followers', {
    })
      .then((res) => {
        console.log(res.data.followers);
        const rows = res.data.followers;
        setTotalFollowers(res.data.followers ? res.data.followers.length : 0);
        setFollowers(rows);
      })
      .catch((err) => {
        console.log(err);
        if (reset) setLoadError("Couldn't load your followers. Please refresh.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const openFollower = (follower) => {
    setSelectedFollower(follower);
    setFollowerStats(null);
    setStatsError("");
    setStatsLoading(true);

    AxiosInstance.get(`/dashboard/contri/follower/stat/${follower.username}`)
      .then((res) => {
        console.log(res.data);
        setFollowerStats({
          articlesRead: res.data[0].articles_read || 0,
          bookmarks: res.data[0].bookmarks_added || 0,
          created_at: res.data[0].created_at || follower.created_at,
        });
        setStatsLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setStatsError("Couldn't load this reader's activity.");
        setStatsLoading(false);
      });
  };

  const closeFollowerModal = () => {
    setSelectedFollower(null);
    setFollowerStats(null);
    setStatsError("");
  };

  const handleViewFullProfile = () => {
    window.open(`/profile/reader/${selectedFollower.username}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-8 font-[Inter,system-ui,sans-serif]">

      {/* Header */}
      <div>
        <h1 className="font-[Newsreader,Georgia,serif] text-3xl sm:text-4xl font-black text-gray-900 dark:text-gray-50 mb-2">
          Followers
        </h1>
        <p className="text-gray-500 dark:text-slate-400">
          People who follow your work
        </p>
      </div>

      {/* Total + Search */}
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-[#1E3A5F] dark:text-blue-400" />
          </div>
          <div>
            {isLoading ? (
              <div className="h-7 bg-gray-100 dark:bg-slate-700 rounded w-20 animate-pulse mb-1" />
            ) : (
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">{totalFollowers.toLocaleString()}</p>
            )}
            <p className="text-[11px] font-semibold tracking-widest uppercase text-gray-400 dark:text-slate-500">Followers</p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search followers..."
            className="w-full pl-10 pr-3 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 dark:focus:ring-blue-500/30 focus:border-[#1E3A5F] dark:focus:border-blue-500"
          />
        </div>
      </div>

      {/* Followers list */}
      <div>
        {isLoading ? (
          <div className="space-y-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4 flex items-center gap-4 animate-pulse">
                <div className="w-11 h-11 rounded-full bg-gray-100 dark:bg-slate-700 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="h-4 bg-gray-100 dark:bg-slate-700 rounded w-32 mb-2" />
                  <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : loadError ? (
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">{loadError}</p>
            <button
              onClick={() => fetchFollowers(true)}
              className="px-4 py-2 text-xs font-semibold rounded-lg text-white bg-[#1E3A5F] hover:bg-[#16304d] transition-colors duration-150"
            >
              Retry
            </button>
          </div>
        ) : followers.length > 0 ? (
          <>
            <div className="space-y-2">
              {followers.map((follower) => (
                <button
                  key={follower.reader_id}
                  onClick={() => openFollower(follower)}
                  className="w-full flex items-center gap-4 px-4 py-3.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors duration-100 text-left"
                >
                  {follower.profile_pic ? (
                    <img
                      src={follower.profile_pic}
                      alt=""
                      className="w-11 h-11 rounded-full object-cover shrink-0 bg-gray-100 dark:bg-slate-700"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                      <UserRound className="w-5 h-5 text-gray-300 dark:text-slate-500" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{follower.username}</p>
                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{timeAgo(follower.created_at)}</p>
                  </div>
                </button>
              ))}
            </div>

          </>
        ) : (
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-gray-300 dark:text-slate-500" />
            </div>
            <p className="text-gray-500 dark:text-slate-400 font-medium">
              {searchTerm ? "No followers match your search" : "No followers yet"}
            </p>
            {!searchTerm && (
              <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">
                Readers who follow you will show up here
              </p>
            )}
          </div>
        )}
      </div>

      {/* Follower modal */}

      {selectedFollower && (
        <div
          className="!m-0 fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={closeFollowerModal}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-sm p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeFollowerModal}
              className="absolute top-4 right-4 p-1 rounded text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-600 dark:hover:text-slate-300 transition-colors duration-100"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center text-center">
              {selectedFollower.profile_pic ? (
                <img
                  src={selectedFollower.profile_pic}
                  alt=""
                  className="w-20 h-20 rounded-full object-cover bg-gray-100 dark:bg-slate-700 mb-3"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center mb-3">
                  <UserRound className="w-8 h-8 text-gray-300 dark:text-slate-500" />
                </div>
              )}

              <h3 className="text-base font-bold text-gray-900 dark:text-gray-50">
                @{selectedFollower.username}
              </h3>

              <span className="inline-block mt-2 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide rounded bg-blue-50 dark:bg-blue-900/20 text-[#1E3A5F] dark:text-blue-400">
                Reader
              </span>
            </div>

            <div className="mt-5">
              {statsLoading ? (
                <div className="grid grid-cols-2 gap-3">
                  {[0, 1].map((i) => (
                    <div key={i} className="bg-gray-50 dark:bg-slate-900 rounded-lg p-4 animate-pulse">
                      <div className="h-6 bg-gray-100 dark:bg-slate-700 rounded w-10 mb-2" />
                      <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded w-16" />
                    </div>
                  ))}
                </div>
              ) : statsError ? (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500 dark:text-slate-400 mb-3">{statsError}</p>
                  <button
                    onClick={() => openFollower(selectedFollower)}
                    className="px-4 py-2 text-xs font-semibold rounded-lg text-white bg-[#1E3A5F] hover:bg-[#16304d] transition-colors duration-150"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-4">
                      <div className="inline-flex p-2 rounded mb-2 bg-blue-50 dark:bg-blue-900/20">
                        <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{followerStats.articlesRead}</p>
                      <p className="text-[10px] font-semibold tracking-wide uppercase text-gray-400 dark:text-slate-500 mt-0.5">Articles Read</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-4">
                      <div className="inline-flex p-2 rounded mb-2 bg-purple-50 dark:bg-purple-900/20">
                        <Bookmark className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{followerStats.bookmarks}</p>
                      <p className="text-[10px] font-semibold tracking-wide uppercase text-gray-400 dark:text-slate-500 mt-0.5">Bookmarks</p>
                    </div>
                  </div>

                  <p className="flex items-center justify-center gap-1.5 text-xs text-gray-400 dark:text-slate-500 mt-4">
                    <Calendar className="w-3.5 h-3.5" />
                    Member since {memberSince(followerStats.created_at)}
                  </p>
                </>
              )}
            </div>

            <button
              onClick={handleViewFullProfile}
              className="w-full mt-5 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-lg text-white bg-[#1E3A5F] hover:bg-[#16304d] transition-colors duration-150"
            >
              <ExternalLink className="w-4 h-4" />
              View Full Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Followers;
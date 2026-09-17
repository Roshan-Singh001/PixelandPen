import { useState, useEffect } from 'react';
import { Users, UserRound, UserMinus, ExternalLink, FileText } from 'lucide-react';
import AxiosInstance from '../../../api/axiosInstance';
import { toast } from 'react-toastify';

const Following = () => {
  const [authors, setAuthors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unfollowingId, setUnfollowingId] = useState(null);

  useEffect(() => {
    fetchFollowing();
  }, []);

  const fetchFollowing = () => {
    setIsLoading(true);
    try {
      AxiosInstance.get('/dashboard/reader/following')
        .then((res) => {
          setAuthors(res.data);
          setIsLoading(false);
        })
        .catch((err) => {
          const status = err.response?.status;
          if (status === 429) {
            toast.error("Too many requests. Please wait a few minutes before trying again.");
          } else {
            console.log(err);
            toast.error("Failed to fetch following authors. Please try again later.");
          }
          setIsLoading(false);
        });
    } catch (error) {
      const status = error.response?.status;
      if (status === 429) {
        toast.error("Too many requests. Please wait a few minutes before trying again.");
      } else {
        console.log(error);
        toast.error("Failed to fetch following authors. Please try again later.");
      }
      setIsLoading(false);
    }
  };

  const handleUnfollow = (cont_id) => {
    setUnfollowingId(cont_id);
    try {
      AxiosInstance.delete(`/dashboard/reader/follow/${cont_id}`)
        .then(() => {
          setAuthors((prev) => prev.filter(author => author.cont_id !== cont_id));
          setUnfollowingId(null);
        })
        .catch((err) => {
          const status = err.response?.status;
          if (status === 429) {
            toast.error("Too many requests. Please wait a few minutes before trying again.");
          } else {
            console.log(err);
            toast.error("Failed to unfollow author. Please try again later.");
          }
          setUnfollowingId(null);
        });
    } catch (error) {
      const status = error.response?.status;
      if (status === 429) {
        toast.error("Too many requests. Please wait a few minutes before trying again.");
      } else {
        console.log(error);
        toast.error("Failed to unfollow author. Please try again later.");
      }
      setUnfollowingId(null);
    }
  };

  const handleViewProfile = (slug) => {
    window.open(`/profile/cont/${slug}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-8 font-[Inter,system-ui,sans-serif]">

      {/* Header */}
      <div>
        <h1 className="font-[Newsreader,Georgia,serif] text-3xl sm:text-4xl font-black text-gray-900 dark:text-gray-50 mb-2">
          Following
        </h1>
        <p className="text-gray-500 dark:text-slate-400">
          Authors you follow
        </p>
      </div>

      {/* Authors You Follow */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">Authors You Follow</h2>
          {!isLoading && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">
              <Users className="w-3 h-3" />
              {authors.length} {authors.length === 1 ? "Author" : "Authors"}
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-5 flex items-center gap-4 animate-pulse">
                <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-slate-700 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="h-4 bg-gray-100 dark:bg-slate-700 rounded w-40 mb-2" />
                  <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded w-56 mb-2" />
                  <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : authors.length > 0 ? (
          <div className="space-y-3">
            {authors.map((author) => (
              <div
                key={author.cont_id}
                className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                {/* Avatar + info */}
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {author.profile_pic ? (
                    <img
                      src={author.profile_pic}
                      alt=""
                      className="w-14 h-14 rounded-full object-cover shrink-0 bg-gray-100 dark:bg-slate-700"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                      <UserRound className="w-6 h-6 text-gray-300 dark:text-slate-500" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                      {author.username}
                    </h3>
                    {author.bio && (
                      <p className="text-xs text-gray-400 dark:text-slate-500 truncate mt-0.5">
                        {author.bio}
                      </p>
                    )}
                    <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-slate-500 mt-1">
                      <FileText className="w-3 h-3" />
                      {author.article_count ?? 0} Articles
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 sm:pl-4">
                  <button
                    onClick={() => handleViewProfile(author.username)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded text-[#1E3A5F] dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors duration-150"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    View Profile
                  </button>
                  <button
                    onClick={() => handleUnfollow(author.cont_id)}
                    disabled={unfollowingId === author.cont_id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors duration-150 disabled:opacity-50"
                  >
                    <UserMinus className="w-3.5 h-3.5" />
                    {unfollowingId === author.cont_id ? "Removing…" : "Unfollow"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-gray-300 dark:text-slate-500" />
            </div>
            <p className="text-gray-500 dark:text-slate-400 font-medium">You're not following anyone yet</p>
            <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">
              Authors you follow will show up here
            </p>
          </div>
        )}
      </div>

    </div>
  );
};

export default Following;
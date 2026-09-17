import { useState, useEffect, useRef } from 'react';
import {
  BookOpen, Bookmark, Heart, Users, UserRound, Camera,
  Pencil, X, Check, Loader2
} from 'lucide-react';
import AxiosInstance from '../../../api/axiosInstance';
import { toast } from 'react-toastify';

function memberSince(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

const ReadProfile = () => {

  const fileInputRef = useRef(null);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");

  const [stats, setStats] = useState({ reads: 0, bookmarks: 0, likes: 0, following: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ username: "", bio: "" });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  function fetchProfile() {
    setProfileLoading(true);
    setProfileError("");
    try {
      AxiosInstance.get('/dashboard/reader/profile')
        .then((res) => {
          setProfile(res.data.profile);
          setProfileLoading(false);
        })
        .catch((err) => {
          console.log(err);
          const status = err.response?.status;
          if (status === 429) {
            toast.error("Too many requests. Please wait a few minutes before trying again.");
          } else {
            setProfileError("Couldn't load your profile. Please refresh.");
          }
          setProfileLoading(false);
        });
    } catch (error) {
      console.log(error);
      const status = error.response?.status;
      if (status === 429) {
        toast.error("Too many requests. Please wait a few minutes before trying again.");
      } else {
        setProfileError("Couldn't load your profile. Please refresh.");
      }
      setProfileLoading(false);
    }
  }

  async function fetchStats() {
    setStatsLoading(true);
    try {
      const [likesRes, bookmarksRes, readsRes, followingRes] = await Promise.allSettled([
        AxiosInstance.get('/dashboard/reader/stat/likes'),
        AxiosInstance.get('/dashboard/reader/stat/bookmarks'),
        AxiosInstance.get('/dashboard/reader/stat/reads/total'),
        AxiosInstance.get('/dashboard/reader/stat/following'),
      ]);

      setStats({
        reads: readsRes.status === 'fulfilled' ? (readsRes.value.data.total_reads || 0) : 0,
        bookmarks: bookmarksRes.status === 'fulfilled' ? (bookmarksRes.value.data.total_bookmarks || 0) : 0,
        likes: likesRes.status === 'fulfilled' ? (likesRes.value.data.total_likes || 0) : 0,
        following: followingRes.status === 'fulfilled' ? (followingRes.value.data.total_following || 0) : 0,
      });
    } catch (error) {
      const status = error.response?.status;
      if (status === 429) {
        toast.error("Too many requests. Please wait a few minutes before trying again.");
      }
      else{
        toast.error("Couldn't load your stats. Please refresh.");
      }
    } finally {
      setStatsLoading(false);
    }
  }

  const statsData = [
    { label: "Reads", value: stats.reads, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20", icon: BookOpen },
    { label: "Bookmarks", value: stats.bookmarks, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-900/20", icon: Bookmark },
    { label: "Likes", value: stats.likes, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-900/20", icon: Heart },
    { label: "Following", value: stats.following, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20", icon: Users },
  ];

  const startEditing = () => {
    setForm({ username: profile.username, bio: profile.bio || "" });
    setImageFile(null);
    setImagePreview(null);
    setSaveError("");
    setIsEditing(true);
  };

  const cancelEditing = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setIsEditing(false);
    setImageFile(null);
    setImagePreview(null);
    setSaveError("");
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const getProfileChanges = () => {
    const trimmedUsername = form.username.trim();
    const trimmedBio = form.bio.trim();
    return {
      trimmedUsername,
      trimmedBio,
      usernameChanged: trimmedUsername !== profile.username,
      bioChanged: trimmedBio !== (profile.bio || ""),
      imageChanged: Boolean(imageFile),
    };
  };

  const handleSaveProfile = () => {
    const { trimmedUsername, trimmedBio, usernameChanged, bioChanged, imageChanged } = getProfileChanges();

    if (!trimmedUsername) {
      setSaveError("Username can't be empty.");
      return;
    }

    if (!usernameChanged && !bioChanged && !imageChanged) {
      setIsEditing(false);
      return;
    }

    setSaving(true);
    setSaveError("");

    let request;

    if (imageChanged) {
      const payload = new FormData();
      if (usernameChanged) payload.append('username', trimmedUsername);
      if (bioChanged) payload.append('bio', trimmedBio);
      payload.append('profile_pic', imageFile);
      request = AxiosInstance.put('/dashboard/reader/profile/update', payload);
    } else {
      const payload = {};
      if (usernameChanged) payload.username = trimmedUsername;
      if (bioChanged) payload.bio = trimmedBio;
      request = AxiosInstance.put('/dashboard/reader/profile/update', payload);
    }

    try {
      request
        .then((res) => {
          setProfile((prev) => ({
            ...prev,
            username: res.data.username ?? (usernameChanged ? trimmedUsername : prev.username),
            bio: res.data.bio ?? (bioChanged ? trimmedBio : prev.bio),
            profile_pic: res.data.profile_pic ?? prev.profile_pic,
          }));
          if (imagePreview) URL.revokeObjectURL(imagePreview);
          setIsEditing(false);
          setImageFile(null);
          setImagePreview(null);
          setSaving(false);
          toast.success("Profile updated successfully!");
        })
        .catch((err) => {
          const status = err.response?.status;
          if (status === 429) {
            toast.error("Too many requests. Please wait a few minutes before trying again.");
          } else {
            setSaveError(err.response?.data?.message || "Couldn't save changes. Try again.");
          }
          setSaving(false);
        });
    } catch (error) {
      console.log(error);
      setSaveError("Couldn't save changes. Try again.");
      setSaving(false);
    }
  };

  const displayedPic = imagePreview || profile?.profile_pic;

  if (profileLoading) {
    return (
      <div className="space-y-8 font-[Inter,system-ui,sans-serif]">
        <div>
          <h1 className="font-[Newsreader,Georgia,serif] text-3xl sm:text-4xl font-black text-gray-900 dark:text-gray-50 mb-2">
            Profile
          </h1>
          <p className="text-gray-500 dark:text-slate-400">Manage your account information</p>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 sm:p-8 animate-pulse">
          <div className="flex flex-col sm:flex-row sm:items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-slate-700 shrink-0 mx-auto sm:mx-0" />
            <div className="flex-1 space-y-3 w-full">
              <div className="h-5 bg-gray-100 dark:bg-slate-700 rounded w-40" />
              <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded w-56" />
              <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded w-full" />
              <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded w-32" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="space-y-8 font-[Inter,system-ui,sans-serif]">
        <div>
          <h1 className="font-[Newsreader,Georgia,serif] text-3xl sm:text-4xl font-black text-gray-900 dark:text-gray-50 mb-2">
            Profile
          </h1>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">{profileError || "Something went wrong."}</p>
          <button
            onClick={fetchProfile}
            className="px-4 py-2 text-xs font-semibold rounded-lg text-white bg-[#1E3A5F] hover:bg-[#16304d] transition-colors duration-150"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const activeChanges = isEditing ? getProfileChanges() : null;
  const hasChanges = activeChanges
    ? activeChanges.usernameChanged || activeChanges.bioChanged || activeChanges.imageChanged
    : false;

  return (
    <div className="space-y-8 font-[Inter,system-ui,sans-serif]">

      <div>
        <h1 className="font-[Newsreader,Georgia,serif] text-3xl sm:text-4xl font-black text-gray-900 dark:text-gray-50 mb-2">
          Profile
        </h1>
        <p className="text-gray-500 dark:text-slate-400">
          Manage your account information
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-start gap-6">

          <div className="flex sm:block justify-center">
            <div className="relative w-24 h-24 shrink-0">
              {displayedPic ? (
                <img
                  src={displayedPic}
                  alt=""
                  className="w-24 h-24 rounded-full object-cover bg-gray-100 dark:bg-slate-700"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
                  <UserRound className="w-10 h-10 text-gray-300 dark:text-slate-500" />
                </div>
              )}

              {isEditing && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-150"
                  title="Change photo"
                >
                  <Camera className="w-6 h-6 text-white" />
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
              />
            </div>
          </div>

          <div className="flex-1 min-w-0 text-center sm:text-left">

            {!isEditing ? (
              <>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">
                  {profile.username}
                </h2>
                <p className="text-sm text-gray-400 dark:text-slate-500 mt-0.5">
                  @{profile.username} · {profile.email}
                </p>
                <p className="text-sm text-gray-600 dark:text-slate-300 mt-3 leading-relaxed">
                  {profile.bio || <span className="text-gray-400 dark:text-slate-500 italic">No bio yet.</span>}
                </p>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-3">
                  Member since {memberSince(profile.created_at)}
                </p>
              </>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold tracking-wide uppercase text-gray-400 dark:text-slate-500 mb-1.5 text-left">
                    Username
                  </label>
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 dark:focus:ring-blue-500/30 focus:border-[#1E3A5F] dark:focus:border-blue-500"
                    maxLength={100}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold tracking-wide uppercase text-gray-400 dark:text-slate-500 mb-1.5 text-left">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50 text-gray-400 dark:text-slate-500 cursor-not-allowed"
                  />
                  <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-1 text-left">
                    Contact support to change your email address.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold tracking-wide uppercase text-gray-400 dark:text-slate-500 mb-1.5 text-left">
                    Bio
                  </label>
                  <textarea
                    value={form.bio}
                    onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                    rows={3}
                    maxLength={255}
                    placeholder="Tell us a bit about yourself..."
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 dark:focus:ring-blue-500/30 focus:border-[#1E3A5F] dark:focus:border-blue-500 resize-none"
                  />
                  <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-1 text-right">
                    {form.bio.length}/255
                  </p>
                </div>

                {saveError && (
                  <p className="text-xs font-medium text-red-600 dark:text-red-400 text-left">{saveError}</p>
                )}
              </div>
            )}
          </div>

          <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0 justify-center">
            {!isEditing ? (
              <button
                onClick={startEditing}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg text-[#1E3A5F] dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors duration-150"
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={cancelEditing}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors duration-150 disabled:opacity-50"
                >
                  <X className="w-3.5 h-3.5" />
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={saving || !hasChanges}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg text-white bg-[#1E3A5F] hover:bg-[#16304d] transition-colors duration-150 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-4">Activity</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-gray-200 dark:bg-slate-700 rounded-xl overflow-hidden">
          {statsLoading
            ? [0, 1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-slate-800 p-6 animate-pulse">
                <div className="w-10 h-10 bg-gray-100 dark:bg-slate-700 rounded mb-4" />
                <div className="h-8 bg-gray-100 dark:bg-slate-700 rounded w-10 mb-2" />
                <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded w-16" />
              </div>
            ))
            : statsData.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="bg-white dark:bg-slate-800 p-6">
                  <div className={`inline-flex p-2.5 rounded mb-4 ${stat.bg}`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <p className="text-3xl font-semibold text-gray-900 dark:text-gray-50">{stat.value}</p>
                  <p className="text-[11px] font-semibold tracking-widest uppercase text-gray-400 dark:text-slate-500 mt-1">
                    {stat.label}
                  </p>
                </div>
              );
            })}
        </div>
      </div>

    </div>
  );
};

export default ReadProfile;
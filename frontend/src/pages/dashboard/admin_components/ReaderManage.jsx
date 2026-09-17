import React, { useState, useEffect, useMemo, useRef } from 'react';
import AxiosInstance from '../../../api/axiosInstance';
import {
    Users, UserPlus, Heart, Bookmark, Search, ChevronDown, Eye,
    MoreHorizontal, Trash2, X, UserRound, Calendar, Mail, MessageSquare,
    FileText, AlertCircle, Loader2, ExternalLink
} from 'lucide-react';
import { toast } from 'react-toastify';

const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'most_articles', label: 'Most Articles' },
    { value: 'most_likes', label: 'Most Likes' },
];

function formatDate(dateString) {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatFullDate(dateString) {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function formatNumber(num) {
    const n = num || 0;
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toLocaleString();
}

const ReaderManage = () => {

    const [stats, setStats] = useState({ total: 0, newReaders: 0, totalLikes: 0, totalBookmarks: 0 });
    const [statsLoading, setStatsLoading] = useState(true);

    const [readers, setReaders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("newest");

    const [openMenuId, setOpenMenuId] = useState(null);
    const menuRef = useRef(null);

    const [selectedReader, setSelectedReader] = useState(null);
    const [readerDetail, setReaderDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState("");

    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchStats();
        fetchReaders();
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchStats = async () => {
        setStatsLoading(true);
        try {
            const [readerRes, newRes, likesRes, bookmarksRes] = await Promise.allSettled([
                AxiosInstance.get('/dashboard/admin/stat/readers/'),
                AxiosInstance.get('/dashboard/admin/stat/readers/new'),
                AxiosInstance.get('/dashboard/admin/stat/likes'),
                AxiosInstance.get('/dashboard/admin/stat/bookmarks'),
            ]);
            setStats({
                readerRes: readerRes.value?.data?.total_r || 0,
                newReaders: newRes.value?.data?.total_new_readers || 0,
                totalLikes: likesRes.value?.data?.total_likes || 0,
                totalBookmarks: bookmarksRes.value?.data?.total_bookmarks || 0,
            });
            
        } catch (error) {
            const status = error.response?.status;
            if (status === 429) {
                toast.error("Too many requests. Please wait a few minutes before trying again.");
            } else {
                console.error(error);
                toast.error("Couldn't load stats. Please refresh.");
            }
            setStatsLoading(false);
        }
        finally{
            setStatsLoading(false);
        }
    };

    const fetchReaders = () => {
        setIsLoading(true);
        setLoadError("");

        AxiosInstance.get('/dashboard/admin/fetch/reader/list')
            .then((res) => {
                setReaders(res.data.readers || []);
            })
            .catch((err) => {
                const status = err.response?.status;
                if (status === 429) {
                    toast.error("Too many requests. Please wait a few minutes before trying again.");
                } else {
                    console.error(err);
                    setLoadError("Couldn't load readers. Please refresh.");
                }
            })
            .finally(() => setIsLoading(false));
    };

    const visibleReaders = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();

        let list = readers;
        if (term) {
            list = list.filter((r) =>
                r.username?.toLowerCase().includes(term) || r.email?.toLowerCase().includes(term)
            );
        }

        const sorted = [...list];
        switch (sortBy) {
            case 'oldest':
                sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
                break;
            case 'most_articles':
                sorted.sort((a, b) => (b.articles_viewed ?? 0) - (a.articles_viewed ?? 0));
                break;
            case 'most_likes':
                sorted.sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0));
                break;
            case 'newest':
            default:
                sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                break;
        }
        return sorted;
    }, [readers, searchTerm, sortBy]);

    const openReaderDetail = (reader) => {
        setOpenMenuId(null);
        setSelectedReader(reader);
        setReaderDetail(null);
        setDetailError("");
        setDetailLoading(true);

        AxiosInstance.get(`/dashboard/admin/fetch/reader/detail/${reader.sub_id}`)
            .then((res) => {
                setReaderDetail({
                    articlesViewed: reader.total_view || 0,
                    liked: reader.total_like || 0,
                    bookmarked: res.data.bookmarked || 0,
                    comments: res.data.comments || 0,
                    recentArticles: res.data.recent_articles || [],
                    recentComments: res.data.recent_comments || [],
                });
            })
            .catch((err) => {
                const status = err.response?.status;
                if (status === 429) {
                    toast.error("Too many requests. Please wait a few minutes before trying again.");
                } else {
                    console.error(err);
                    setDetailError("Couldn't load this reader's activity.");
                }
            })
            .finally(() => setDetailLoading(false));
    };

    const closeDetailModal = () => {
        setSelectedReader(null);
        setReaderDetail(null);
        setDetailError("");
    };

    const confirmDelete = async () => {
        if (!deleteTarget || isDeleting) return;
        setIsDeleting(true);
        try {
            await AxiosInstance.post('/dashboard/admin/reader/delete', { sub_id: deleteTarget.sub_id });
            setReaders((prev) => prev.filter((r) => r.sub_id !== deleteTarget.sub_id));
            setStats((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
            setDeleteTarget(null);
        } catch (error) {
            const status = error.response?.status;
            if (status === 429) {
                toast.error("Too many requests. Please wait a few minutes before trying again.");
            } else {
                console.error(error);
                toast.error("Couldn't delete this reader. Please try again.");
            }
        } finally {
            setIsDeleting(false);
        }
    };

    const statsData = [
        { label: "Total Readers", value: stats.readerRes, color: "text-[#1E3A5F] dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20", icon: Users },
        { label: "New Readers (30d)", value: stats.newReaders, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20", icon: UserPlus },
        { label: "Total Likes", value: stats.totalLikes, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-900/20", icon: Heart },
        { label: "Total Bookmarks", value: stats.totalBookmarks, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-900/20", icon: Bookmark },
    ];

    return (
        <div className="space-y-8 font-[Inter,system-ui,sans-serif]">

            {/* Header */}
            <div>
                <h1 className="font-[Newsreader,Georgia,serif] text-3xl sm:text-4xl font-black text-gray-900 dark:text-gray-50 mb-2">
                    Reader Management
                </h1>
                <p className="text-gray-500 dark:text-slate-400">
                    View and manage all reader accounts on the platform
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-gray-200 dark:bg-slate-700 rounded-xl overflow-hidden">
                {statsLoading
                    ? [0, 1, 2, 3].map((i) => (
                        <div key={i} className="bg-white dark:bg-slate-800 p-6 animate-pulse">
                            <div className="w-10 h-10 bg-gray-100 dark:bg-slate-700 rounded mb-4" />
                            <div className="h-8 bg-gray-100 dark:bg-slate-700 rounded w-16 mb-2" />
                            <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded w-20" />
                        </div>
                    ))
                    : statsData.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <div key={stat.label} className="bg-white dark:bg-slate-800 p-6">
                                <div className={`inline-flex p-2.5 rounded mb-4 ${stat.bg}`}>
                                    <Icon className={`w-5 h-5 ${stat.color}`} />
                                </div>
                                <p className={`text-3xl font-semibold ${stat.color}`}>{formatNumber(stat.value)}</p>
                                <p className="text-[11px] font-semibold tracking-widest uppercase text-gray-400 dark:text-slate-500 mt-1">
                                    {stat.label}
                                </p>
                            </div>
                        );
                    })}
            </div>

            {/* Search + Sort */}
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-5">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search readers..."
                            className="w-full pl-10 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 dark:focus:ring-blue-500/30 focus:border-[#1E3A5F] dark:focus:border-blue-500"
                        />
                    </div>
                    <div className="relative shrink-0 w-full sm:w-48">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full appearance-none pl-3 pr-8 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]/30 dark:focus:ring-blue-500/30"
                        >
                            {SORT_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Readers table */}
            <div>
                <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">All Readers</h2>
                    {!isLoading && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            {visibleReaders.length} {searchTerm ? "matching" : "total"}
                        </span>
                    )}
                </div>

                {isLoading ? (
                    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl divide-y divide-gray-100 dark:divide-slate-700">
                        {[0, 1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse">
                                <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-slate-700 shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3.5 bg-gray-100 dark:bg-slate-700 rounded w-32" />
                                    <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded w-48" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : loadError ? (
                    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center py-16 text-center">
                        <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">{loadError}</p>
                        <button
                            onClick={fetchReaders}
                            className="px-4 py-2 text-xs font-semibold rounded-lg text-white bg-[#1E3A5F] hover:bg-[#16304d] transition-colors duration-150"
                        >
                            Retry
                        </button>
                    </div>
                ) : visibleReaders.length > 0 ? (
                    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl">
                        <div>
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-slate-700">
                                        <th className="px-5 py-3 text-left text-[11px] font-semibold tracking-widest uppercase text-gray-400 dark:text-slate-500">Username</th>
                                        <th className="px-5 py-3 text-left text-[11px] font-semibold tracking-widest uppercase text-gray-400 dark:text-slate-500">Email</th>
                                        <th className="px-5 py-3 text-right text-[11px] font-semibold tracking-widest uppercase text-gray-400 dark:text-slate-500">Articles</th>
                                        <th className="px-5 py-3 text-right text-[11px] font-semibold tracking-widest uppercase text-gray-400 dark:text-slate-500">Likes</th>
                                        <th className="px-5 py-3 text-left text-[11px] font-semibold tracking-widest uppercase text-gray-400 dark:text-slate-500">Joined</th>
                                        <th className="px-5 py-3 text-right text-[11px] font-semibold tracking-widest uppercase text-gray-400 dark:text-slate-500">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                                    {visibleReaders.map((reader) => (
                                        <tr key={reader.sub_id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors duration-100">
                                            <td className="px-5 py-3.5">
                                                <button
                                                    onClick={() => openReaderDetail(reader)}
                                                    className="flex items-center gap-2.5 text-left"
                                                >
                                                    {reader.profile_pic ? (
                                                        <img src={reader.profile_pic} alt="" className="w-8 h-8 rounded-full object-cover bg-gray-100 dark:bg-slate-700 shrink-0" />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                                                            <UserRound className="w-4 h-4 text-gray-300 dark:text-slate-500" />
                                                        </div>
                                                    )}
                                                    <span className="font-medium text-gray-800 dark:text-gray-100 hover:text-[#1E3A5F] dark:hover:text-blue-400 transition-colors duration-100 truncate">
                                                        {reader.username}
                                                    </span>
                                                </button>
                                            </td>
                                            <td className="px-5 py-3.5 text-gray-500 dark:text-slate-400 truncate max-w-[220px]">{reader.email}</td>
                                            <td className="px-5 py-3.5 text-right text-gray-700 dark:text-slate-300">{reader.total_view ?? 0}</td>
                                            <td className="px-5 py-3.5 text-right text-gray-700 dark:text-slate-300">{reader.total_like ?? 0}</td>
                                            <td className="px-5 py-3.5 text-gray-500 dark:text-slate-400 whitespace-nowrap">{formatDate(reader.created_at)}</td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center justify-end gap-1 relative">
                                                    <button
                                                        onClick={() => openReaderDetail(reader)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded text-[#1E3A5F] dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors duration-150"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                        View
                                                    </button>
                                                    <button
                                                        onClick={() => setOpenMenuId(openMenuId === reader.sub_id ? null : reader.sub_id)}
                                                        className="p-1.5 rounded text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-600 dark:hover:text-slate-300 transition-colors duration-100"
                                                    >
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </button>

                                                    {openMenuId === reader.sub_id && (
                                                        <div
                                                            ref={menuRef}
                                                            className="absolute right-0 top-full mt-1.5 w-44 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg z-10 py-1"
                                                        >
                                                            <button
                                                                onClick={() => { setOpenMenuId(null); setDeleteTarget(reader); }}
                                                                className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-100"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                                Delete Reader
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center mb-3">
                            <Users className="w-5 h-5 text-gray-300 dark:text-slate-500" />
                        </div>
                        <p className="text-sm text-gray-400 dark:text-slate-500">
                            {searchTerm ? "No readers match your search" : "No readers yet"}
                        </p>
                    </div>
                )}
            </div>

            {/* Reader detail modal */}
            {selectedReader && (
                <div
                    className="!m-0 fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={closeDetailModal}
                >
                    <div
                        className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-700">
                            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Reader Profile</h3>
                            <button
                                onClick={closeDetailModal}
                                className="p-1 rounded text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-600 dark:hover:text-slate-300 transition-colors duration-100"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Identity */}
                            <div className="flex items-center gap-4 mb-6">
                                {selectedReader.profile_pic ? (
                                    <img src={selectedReader.profile_pic} alt="" className="w-16 h-16 rounded-full object-cover bg-gray-100 dark:bg-slate-700 shrink-0" />
                                ) : (
                                    <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                                        <UserRound className="w-7 h-7 text-gray-300 dark:text-slate-500" />
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <h4 className="text-base font-bold text-gray-900 dark:text-gray-50 truncate">{selectedReader.username}</h4>
                                    <p className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-slate-500 mt-1 truncate">
                                        <Mail className="w-3 h-3 shrink-0" />
                                        {selectedReader.email}
                                    </p>
                                    <p className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                                        <Calendar className="w-3 h-3 shrink-0" />
                                        Joined {formatFullDate(selectedReader.created_at)}
                                    </p>
                                </div>
                            </div>

                            {detailLoading ? (
                                <div className="grid grid-cols-2 gap-3 mb-6">
                                    {[0, 1, 2, 3].map((i) => (
                                        <div key={i} className="bg-gray-50 dark:bg-slate-900 rounded-lg p-4 animate-pulse">
                                            <div className="h-6 bg-gray-100 dark:bg-slate-700 rounded w-10 mb-2" />
                                            <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded w-20" />
                                        </div>
                                    ))}
                                </div>
                            ) : detailError ? (
                                <div className="text-center py-6">
                                    <p className="text-sm text-gray-500 dark:text-slate-400 mb-3">{detailError}</p>
                                    <button
                                        onClick={() => openReaderDetail(selectedReader)}
                                        className="px-4 py-2 text-xs font-semibold rounded-lg text-white bg-[#1E3A5F] hover:bg-[#16304d] transition-colors duration-150"
                                    >
                                        Retry
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {/* Activity stats */}
                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-4">
                                            <div className="inline-flex p-2 rounded mb-2 bg-blue-50 dark:bg-blue-900/20">
                                                <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{readerDetail.articlesViewed}</p>
                                            <p className="text-[10px] font-semibold tracking-wide uppercase text-gray-400 dark:text-slate-500 mt-0.5">Articles Viewed</p>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-4">
                                            <div className="inline-flex p-2 rounded mb-2 bg-rose-50 dark:bg-rose-900/20">
                                                <Heart className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                                            </div>
                                            <p className="text-xl font-bold text-rose-600 dark:text-rose-400">{readerDetail.liked}</p>
                                            <p className="text-[10px] font-semibold tracking-wide uppercase text-gray-400 dark:text-slate-500 mt-0.5">Liked</p>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-4">
                                            <div className="inline-flex p-2 rounded mb-2 bg-purple-50 dark:bg-purple-900/20">
                                                <Bookmark className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{readerDetail.bookmarked}</p>
                                            <p className="text-[10px] font-semibold tracking-wide uppercase text-gray-400 dark:text-slate-500 mt-0.5">Bookmarked</p>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-4">
                                            <div className="inline-flex p-2 rounded mb-2 bg-emerald-50 dark:bg-emerald-900/20">
                                                <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{readerDetail.comments}</p>
                                            <p className="text-[10px] font-semibold tracking-wide uppercase text-gray-400 dark:text-slate-500 mt-0.5">Comments</p>
                                        </div>
                                    </div>

                                    {/* Recently Viewed Articles */}
                                    <div className="mb-6">
                                        <h5 className="text-xs font-semibold tracking-widest uppercase text-gray-400 dark:text-slate-500 mb-2.5">
                                            Recently Viewed Articles
                                        </h5>
                                        {readerDetail.recentArticles.length > 0 ? (
                                            <div className="space-y-1">
                                                {readerDetail.recentArticles.map((article) => (
                                                    <button
                                                        key={article.article_id}
                                                        onClick={() => window.open(`/view/${article.slug}`, '_blank', 'noopener,noreferrer')}
                                                        className="group w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors duration-100 text-left"
                                                    >
                                                        <FileText className="w-3.5 h-3.5 text-gray-300 dark:text-slate-500 shrink-0" />
                                                        <span className="text-sm text-gray-700 dark:text-slate-300 truncate flex-1 group-hover:text-[#1E3A5F] dark:group-hover:text-blue-400 transition-colors duration-100">
                                                            {article.title}
                                                        </span>
                                                        <ExternalLink className="w-3 h-3 text-gray-300 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity duration-100 shrink-0" />
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-400 dark:text-slate-500 px-3">No articles viewed yet</p>
                                        )}
                                    </div>

                                    {/* Recent Comments */}
                                    <div>
                                        <h5 className="text-xs font-semibold tracking-widest uppercase text-gray-400 dark:text-slate-500 mb-2.5">
                                            Recent Comments
                                        </h5>
                                        {readerDetail.recentComments.length > 0 ? (
                                            <div className="space-y-2">
                                                {readerDetail.recentComments.map((comment) => (
                                                    <div key={comment.id} className="px-3 py-2 rounded-lg bg-gray-50 dark:bg-slate-900">
                                                        <p className="text-sm text-gray-600 dark:text-slate-300 italic line-clamp-2">
                                                            "{comment.content}"
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-400 dark:text-slate-500 px-3">No comments yet</p>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Delete confirm modal */}
            {deleteTarget && (
                <div
                    className="!m-0 fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={() => !isDeleting && setDeleteTarget(null)}
                >
                    <div
                        className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-sm p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center shrink-0">
                                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Delete Reader?</h3>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-slate-400 mb-5 leading-relaxed">
                            This will permanently delete <span className="font-semibold text-gray-700 dark:text-gray-200">{deleteTarget.username}</span> and their account data, including their likes, bookmarks, comments, and reading activity. This action cannot be undone.
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors duration-150 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={isDeleting}
                                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors duration-150 disabled:opacity-50"
                            >
                                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                {isDeleting ? "Deleting…" : "Delete Reader"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ReaderManage;
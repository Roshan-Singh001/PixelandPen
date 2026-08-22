import AxiosInstance from "../../../api/axiosInstance";

import { TrendingUp, BookOpen, Heart, Bookmark, XCircle, FileText, Megaphone, Calendar, ExternalLink } from "lucide-react";

const STAT_ACCENTS = [
    { bg: "bg-blue-50 dark:bg-blue-900/20", icon: "text-blue-700 dark:text-blue-400" },
    { bg: "bg-rose-50 dark:bg-rose-900/20", icon: "text-rose-600 dark:text-rose-400" },
    { bg: "bg-amber-50 dark:bg-amber-900/20", icon: "text-amber-700 dark:text-amber-400" },
];

const DashboardOverview = ({ userData, announcements, statsData, recentArticles }) => {

    const statsData2 = [
        { title: "Articles Read", value: statsData?.articlesRead || 0, icon: BookOpen },
        { title: "Liked Articles", value: statsData?.likedArticles || 0, icon: Heart },
        { title: "Saved Articles", value: statsData?.savedArticles || 0, icon: Bookmark },
    ];

    return (
        <div className="space-y-5 font-[Inter,system-ui,sans-serif]">

            {/* Welcome banner */}
            <div className="bg-[#1E3A5F] p-6 sm:p-8 relative overflow-hidden">
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        backgroundImage: "radial-gradient(circle, rgba(255,255,255,.12) 1px, transparent 1px)",
                        backgroundSize: "28px 28px",
                    }}
                />
                <div className="relative z-10 flex items-center justify-between gap-4">
                    <div>
                        <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-white/40 mb-2">
                            Reader panel
                        </p>
                        <h1 className="font-[Newsreader,Georgia,serif] text-2xl sm:text-3xl font-black leading-tight text-white mb-1">
                            Welcome back, {userData.userName}.
                        </h1>
                        <p className="text-sm text-white/50">
                            Ready to explore amazing content today.
                        </p>
                    </div>
                    <div className="hidden md:flex w-14 h-14 bg-white/10 rounded items-center justify-center">
                        <TrendingUp className="w-7 h-7 text-white/60" />
                    </div>
                </div>
            </div>


            {/* Stat cards — mosaic */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-gray-200 dark:bg-slate-700">
                {statsData2.map((stat, index) => {
                    const Icon = stat.icon;
                    const accent = STAT_ACCENTS[index] ?? STAT_ACCENTS[0];
                    return (
                        <div key={index} className="bg-white dark:bg-slate-800 p-6 hover:shadow-sm transition-shadow duration-150">
                            <div className={`inline-flex p-2.5 rounded mb-4 ${accent.bg}`}>
                                <Icon className={`w-5 h-5 ${accent.icon}`} />
                            </div>
                            <p className="text-[11px] font-semibold tracking-widest uppercase text-gray-400 dark:text-slate-500 mb-1">
                                {stat.title}
                            </p>
                            <p className="text-3xl font-semibold text-gray-900 dark:text-gray-50">
                                {stat.value}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* Recently Published Articles */}
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-200 dark:border-slate-700">
                    <FileText className="w-4 h-4 text-[#1E3A5F] dark:text-blue-400" />
                    <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Recently Published</h2>
                </div>
                <div className="p-6">
                    {recentArticles.length > 0 ? (
                        <div className="space-y-2">
                            {recentArticles.map((article) => {
                                return (
                                    <a
                                        key={article.title}
                                        href={article.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group flex items-center justify-between px-4 py-3 border border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors duration-100"
                                    >
                                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate mr-4">
                                            {article.title}
                                        </p>
                                        <ExternalLink className="w-3.5 h-3.5 text-gray-300 dark:text-slate-500 group-hover:text-gray-500 dark:group-hover:text-slate-300 transition-colors duration-100 shrink-0" />
                                    </a>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <div className="w-10 h-10 bg-gray-100 dark:bg-slate-700 rounded flex items-center justify-center mb-3">
                                <XCircle className="w-5 h-5 text-gray-300 dark:text-slate-500" />
                            </div>
                            <p className="text-sm text-gray-400 dark:text-slate-500">No Articles</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Announcements */}
            {announcements.length > 0 && (
                <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                    <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-200 dark:border-slate-700">
                        <Megaphone className="w-4 h-4 text-[#1E3A5F] dark:text-blue-400" />
                        <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Announcements</h2>
                    </div>
                    <div className="p-6 space-y-2">
                        {announcements.map((announcement) => (
                            <div
                                key={announcement.id}
                                className="px-4 py-4 border border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors duration-100"
                            >
                                <h3 className="text-sm font-medium text-gray-800 dark:text-gray-100 mb-1.5">
                                    {announcement.title}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-slate-400 mb-2">
                                    {announcement.content}
                                </p>
                                <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-slate-500">
                                    <Calendar className="w-3.5 h-3.5" />
                                    Posted on {new Date(announcement.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

        </div>
    )
}

export default DashboardOverview
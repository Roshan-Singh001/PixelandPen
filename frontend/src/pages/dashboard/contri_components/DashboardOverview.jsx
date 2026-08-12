import React from 'react'
import axios from 'axios';

import { TrendingUp, Clock, XCircle, CheckCircle, Ban, FileText, Megaphone, Calendar } from "lucide-react";

const AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 30000,
    headers: { "X-Custom-Header": "foobar" },
    withCredentials: true,
});

const DashboardOverview = ({ userData, status, announcements, statsData, recentArticles, rejectReason }) => {
    const handleReject = async () => {
        try {
            await AxiosInstance.post('/dashboard/contri/resend');
            setIsRender(isRender + 1);

        } catch (error) {
            console.log(error);

        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved': return 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
            case 'Pending': return 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20';
            case 'Rejected': return 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
            default: return 'text-gray-500 bg-gray-100 dark:bg-slate-700';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved': return CheckCircle;
            case 'pending': return Clock;
            case 'rejected': return XCircle;
            default: return FileText;
        }
    };

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
                            Contributor panel
                        </p>
                        <h1 className="font-[Newsreader,Georgia,serif] text-2xl sm:text-3xl font-black leading-tight text-white mb-1">
                            Welcome back, {userData.userName}.
                        </h1>
                        <p className="text-sm text-white/50">
                            Ready to create amazing content today.
                        </p>
                    </div>
                    <div className="hidden md:flex w-14 h-14 bg-white/10 rounded items-center justify-center">
                        <TrendingUp className="w-7 h-7 text-white/60" />
                    </div>
                </div>
            </div>

            {/* Status alerts */}
            {status === 'Pending' && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-2.5 rounded bg-amber-100 dark:bg-amber-800/40 text-amber-700 dark:text-amber-400">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded bg-amber-100 dark:bg-amber-800/40 text-amber-700 dark:text-amber-400 mb-3">
                                Pending
                            </span>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
                                Application Under Review
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4 leading-relaxed">
                                You are not approved by the admins yet. Kindly complete the profile to expedite the review process.
                            </p>
                            <button
                                onClick={() => setMenuOption('Profile')}
                                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded bg-amber-100 dark:bg-amber-800/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-700 hover:bg-amber-100/70 dark:hover:bg-amber-800/60 transition-colors duration-150"
                            >
                                Complete Profile
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {status === 'Rejected' && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-2.5 rounded bg-red-100 dark:bg-red-800/40 text-red-700 dark:text-red-400">
                            <XCircle className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded bg-red-100 dark:bg-red-800/40 text-red-700 dark:text-red-400 mb-3">
                                Rejected
                            </span>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
                                Application Rejected
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-slate-400 mb-1 leading-relaxed">
                                Reject Reason: {rejectReason}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4 leading-relaxed">
                                You can resend the request after fixing the problem.
                            </p>
                            <button
                                onClick={() => handleReject()}
                                className="inline-flex items-center px-4 py-2 text-sm font-semibold rounded bg-red-100 dark:bg-red-800/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-700 hover:bg-red-100/70 dark:hover:bg-red-800/60 transition-colors duration-150"
                            >
                                Review Again
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {status === 'Block' && (
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-2.5 rounded bg-orange-100 dark:bg-orange-800/40 text-orange-600 dark:text-orange-400">
                            <Ban className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded bg-orange-100 dark:bg-orange-800/40 text-orange-600 dark:text-orange-400 mb-3">
                                Blocked
                            </span>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
                                Account Temporarily Suspended
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed">
                                You are temporarily blocked by the admins. This action is under review and may be lifted after further evaluation.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Stat cards — mosaic */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-gray-200 dark:bg-slate-700">
                {statsData.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="bg-white dark:bg-slate-800 p-6 hover:shadow-sm transition-shadow duration-150">
                            <div className={`inline-flex p-2.5 rounded mb-4 bg-${stat.color}-50 dark:bg-${stat.color}-900/20`}>
                                <Icon className={`w-5 h-5 text-${stat.color}-700 dark:text-${stat.color}-400`} />
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

            {/* Articles Section */}
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-200 dark:border-slate-700">
                    <FileText className="w-4 h-4 text-[#1E3A5F] dark:text-blue-400" />
                    <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Recent Articles</h2>
                </div>
                <div className="p-6">
                    {recentArticles.length > 0 ? (
                        <div className="space-y-2">
                            {recentArticles.map((article) => {
                                const StatusIcon = getStatusIcon(article.article_status);
                                return (
                                    <div
                                        key={article.title}
                                        className="flex items-center justify-between px-4 py-3 border border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors duration-100"
                                    >
                                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate mr-4">
                                            {article.title}
                                        </p>
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded ${getStatusColor(article.article_status)}`}>
                                            <StatusIcon className="w-3 h-3" />
                                            {article.article_status}
                                        </span>
                                    </div>
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
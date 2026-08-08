import React from 'react'
import axios from 'axios';

import { TrendingUp, Clock, XCircle, Ban, FileText, Megaphone, Calendar } from "lucide-react";

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
            case 'Approved': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
            case 'Pending': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
            case 'Rejected': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
            default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
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
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl p-8 text-white shadow-xl">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">
                            Welcome back, {userData.userName}! 👋
                        </h1>
                        <p className="text-blue-100 text-lg">
                            Ready to create amazing content today?
                        </p>
                    </div>
                    <div className="hidden md:block">
                        <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <TrendingUp className="w-16 h-16 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {status === 'Pending' && (
                <div className="relative overflow-hidden rounded-xl border-2 border-amber-300 dark:border-amber-600 bg-gradient-to-br from-amber-50 to-yellow-100 dark:from-amber-900/20 dark:to-yellow-900/30 p-6 shadow-lg backdrop-blur-sm duration-300 hover:shadow-xl">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-5">
                        <div className="absolute inset-0" style={{
                            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                            backgroundSize: '20px 20px'
                        }}></div>
                    </div>

                    {/* Animated pulse */}
                    <div className="absolute -top-1 -left-1 -right-1 -bottom-1 rounded-xl opacity-20 ">
                        <div className="w-full h-full rounded-xl bg-amber-400"></div>
                    </div>

                    <div className="relative flex items-start space-x-4">
                        {/* Status Icon */}
                        <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-800/40 text-amber-600 dark:text-amber-400 shadow-md">
                            <Clock className="w-6 h-6" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            {/* Status Badge */}
                            <div className="flex items-center space-x-2 mb-3">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-amber-100 dark:bg-amber-800/40 text-amber-600 dark:text-amber-400 shadow-sm">
                                    Pending
                                </span>
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce"></div>
                                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                            </div>

                            {/* Title */}
                            <h3 className="text-xl font-bold text-amber-800 dark:text-amber-200 mb-2">
                                Application Under Review
                            </h3>

                            {/* Message */}
                            <p className="text-amber-800 dark:text-amber-200 opacity-80 leading-relaxed mb-4">
                                You are not approved by the admins yet. Kindly complete the profile to expedite the review process.
                            </p>

                            {/* Action Button */}
                            <button onClick={() => setMenuOption('Profile')} className="inline-flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 hover:shadow-md active:scale-95 bg-amber-100 dark:bg-amber-800/40 text-amber-600 dark:text-amber-400 border border-amber-300 dark:border-amber-600">
                                Complete Profile
                                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {status === 'Rejected' && (
                <div className="relative overflow-hidden rounded-xl border-2 border-red-300 dark:border-red-600 bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-900/20 dark:to-rose-900/30 p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-5">
                        <div className="absolute inset-0" style={{
                            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                            backgroundSize: '20px 20px'
                        }}></div>
                    </div>

                    <div className="relative flex items-start space-x-4">
                        {/* Status Icon */}
                        <div className="p-3 rounded-full bg-red-100 dark:bg-red-800/40 text-red-600 dark:text-red-400 shadow-md">
                            <XCircle className="w-6 h-6" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            {/* Status Badge */}
                            <div className="flex items-center space-x-2 mb-3">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 dark:bg-red-800/40 text-red-600 dark:text-red-400 shadow-sm">
                                    Rejected
                                </span>
                            </div>

                            {/* Title */}
                            <h3 className="text-xl font-bold text-red-800 dark:text-red-200 mb-2">
                                Application Rejected
                            </h3>

                            {/* Message */}
                            <p className="text-red-800 dark:text-red-200 opacity-80 leading-relaxed mb-4">
                                Reject Reason: {rejectReason}
                            </p>
                            <p className="text-red-800 dark:text-red-200 opacity-80 leading-relaxed mb-4">
                                You can resend the request after fixing the problem.
                            </p>

                            <button onClick={() => handleReject()} className="bg-red-400 hover:bg-red-600 p-2 rounded-lg dark:bg-red-600 dark:hover:bg-red-800">Review Again</button>

                        </div>
                    </div>
                </div>
            )}

            {status === 'Block' && (
                <div className="relative overflow-hidden rounded-xl border-2 border-orange-400 dark:border-orange-600 bg-gradient-to-br from-orange-50 to-red-100 dark:from-orange-900/20 dark:to-red-900/30 p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-5">
                        <div className="absolute inset-0" style={{
                            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                            backgroundSize: '20px 20px'
                        }}></div>
                    </div>

                    <div className="relative flex items-start space-x-4">
                        {/* Status Icon */}
                        <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-800/40 text-orange-600 dark:text-orange-400 shadow-md">
                            <Ban className="w-6 h-6" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            {/* Status Badge */}
                            <div className="flex items-center space-x-2 mb-3">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-orange-100 dark:bg-orange-800/40 text-orange-600 dark:text-orange-400 shadow-sm">
                                    Blocked
                                </span>
                            </div>

                            {/* Title */}
                            <h3 className="text-xl font-bold text-orange-800 dark:text-orange-200 mb-2">
                                Account Temporarily Suspended
                            </h3>

                            {/* Message */}
                            <p className="text-orange-800 dark:text-orange-200 opacity-80 leading-relaxed mb-4">
                                You are temporarily blocked by the admins. This action is under review and may be lifted after further evaluation.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsData.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/20`}>
                                    <Icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                                </div>
                            </div>
                            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">
                                {stat.title}
                            </h3>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                {stat.value}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* Articles Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        Recent Articles
                    </h2>
                </div>
                <div className="p-6 space-y-4">
                    {recentArticles.length > 0 ? (recentArticles.map((article) => {
                        const StatusIcon = getStatusIcon(article.article_status);
                        return (
                            <div
                                key={article.title}
                                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                            >
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-1">
                                        {article.title}
                                    </h3>
                                </div>
                                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(article.article_status)}`}>
                                    <StatusIcon className="w-4 h-4" />
                                    {article.article_status}
                                </div>
                            </div>
                        );
                    })) : (
                        <>
                            <div className="text-center py-12">
                                <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                    <XCircle className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                                </div>
                                <p className="text-gray-500 dark:text-gray-400 text-lg">No Articles</p>
                            </div>

                        </>)}
                </div>
            </div>

            {/* Announcements */}
            {announcements.length > 0 && <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Megaphone className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                        Announcements
                    </h2>
                </div>
                <div className="p-6 space-y-4">
                    {announcements.map((announcement) => {
                        return (
                            <div
                                key={announcement.id}
                                className="p-5 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">
                                            {announcement.title}
                                        </h3>
                                        <p className="text-gray-700 dark:text-gray-300 mb-3">
                                            {announcement.content}
                                        </p>
                                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                            <Calendar className="w-4 h-4" />
                                            Posted on {new Date(announcement.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>}

        </div>
    )
}

export default DashboardOverview
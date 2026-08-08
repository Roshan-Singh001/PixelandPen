import React from 'react'

import { ShieldCheck, FileText, Users, XCircle, CheckCircle, Clock } from "lucide-react";

const statusMeta = {
    approved: { text: "text-green-700 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/20", Icon: CheckCircle },
    pending: { text: "text-amber-700 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20", Icon: Clock },
    rejected: { text: "text-red-700 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/20", Icon: XCircle },
};

function getStatusMeta(status = "") {
    return statusMeta[status.toLowerCase()] ?? {
        text: "text-gray-500", bg: "bg-gray-100 dark:bg-gray-700", Icon: FileText,
    };
}

const STAT_ACCENTS = [
    { bg: "bg-blue-50 dark:bg-blue-900/20", icon: "text-blue-700 dark:text-blue-400" },
    { bg: "bg-green-50 dark:bg-green-900/20", icon: "text-green-700 dark:text-green-400" },
    { bg: "bg-orange-50 dark:bg-orange-900/20", icon: "text-orange-600 dark:text-orange-400" },
    { bg: "bg-amber-50 dark:bg-amber-900/20", icon: "text-amber-700 dark:text-amber-400" },
];

const DashboardOverview = ({ userData, statsData, articleRequests, contributorRequests }) => (
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
                        Admin panel
                    </p>
                    <h1 className="font-[Newsreader,Georgia,serif] text-2xl sm:text-3xl font-black leading-tight text-white mb-1">
                        Welcome back, {userData?.userName}.
                    </h1>
                    <p className="text-sm text-white/50">
                        Monitor, manage, and lead your platform with confidence.
                    </p>
                </div>
                <div className="hidden md:flex w-14 h-14 bg-white/10 rounded items-center justify-center  ">
                    <ShieldCheck className="w-7 h-7 text-white/60" />
                </div>
            </div>
        </div>

        {/* Stat cards — gap-px mosaic */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-gray-200 dark:bg-slate-700">
            {statsData.length > 0
                ? statsData.map((stat, i) => (
                    <StatCard
                        key={i}
                        title={stat.title}
                        value={stat.value}
                        Icon={stat.icon}
                        accent={STAT_ACCENTS[i] ?? STAT_ACCENTS[0]}
                    />
                ))
                : /* Skeleton placeholders while loading */
                [0, 1, 2, 3].map(i => (
                    <div key={i} className="bg-white dark:bg-slate-800 p-6 animate-pulse">
                        <div className="w-10 h-10 bg-gray-100 dark:bg-slate-700 rounded mb-4" />
                        <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded w-2/3 mb-3" />
                        <div className="h-8 bg-gray-100 dark:bg-slate-700 rounded w-1/3" />
                    </div>
                ))
            }
        </div>

        {/* Recent articles */}
        <SectionCard title="Recent Articles" Icon={FileText}>
            {articleRequests.length > 0 ? (
                <div className="space-y-2">
                    {articleRequests.map(article => (
                        <div
                            key={article.slug}
                            className="flex items-center justify-between px-4 py-3 border border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors duration-100"
                        >
                            <div className="min-w-0 flex-1 mr-4">
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{article.title}</p>
                                <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">by {article.author}</p>
                            </div>
                            <StatusBadge status={article.status} />
                        </div>
                    ))}
                </div>
            ) : (
                <EmptyState label="articles" />
            )}
        </SectionCard>

        {/* Recent contributors */}
        <SectionCard title="Recent Contributors" Icon={Users}>
            {contributorRequests.length > 0 ? (
                <div className="space-y-2">
                    {contributorRequests.map(cont => (
                        <div
                            key={cont.cont_id}
                            className="flex items-center justify-between px-4 py-3 border border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors duration-100"
                        >
                            <div className="min-w-0 flex-1 mr-4">
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{cont.username}</p>
                                <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{cont.email}</p>
                            </div>
                            <StatusBadge status={cont.status} />
                        </div>
                    ))}
                </div>
            ) : (
                <EmptyState label="contributors" />
            )}
        </SectionCard>

    </div>
);

const StatCard = ({ title, value, Icon, accent }) => (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-6 hover:shadow-sm transition-shadow duration-150">
        <div className={`inline-flex p-2.5 rounded mb-4 ${accent.bg}`}>
            <Icon className={`w-5 h-5 ${accent.icon}`} />
        </div>
        <p className="text-[11px] font-semibold tracking-widest uppercase text-gray-400 dark:text-slate-500 mb-1">{title}</p>
        <p className="text-3xl font-semibold text-gray-900 dark:text-gray-50">{value}</p>
    </div>
);

const SectionCard = ({ title, Icon, children }) => (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
        <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-200 dark:border-slate-700">
            <Icon className="w-4 h-4 text-[#1E3A5F] dark:text-blue-400  " />
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">{title}</h2>
        </div>
        <div className="p-6">{children}</div>
    </div>
);

const StatusBadge = ({ status }) => {
    const { text, bg, Icon } = getStatusMeta(status);
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded   ${text} ${bg}`}>
            <Icon className="w-3 h-3" />
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
};

const EmptyState = ({ label }) => (
    <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="w-10 h-10 bg-gray-100 dark:bg-slate-700 rounded flex items-center justify-center mb-3">
            <XCircle className="w-5 h-5 text-gray-300 dark:text-slate-500" />
        </div>
        <p className="text-sm text-gray-400 dark:text-slate-500">No {label} yet</p>
    </div>
);

export default DashboardOverview
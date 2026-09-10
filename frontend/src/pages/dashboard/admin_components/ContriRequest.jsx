import React, { useState, useEffect } from 'react';
import AxiosInstance from '../../../api/axiosInstance';
import {
  UserPlus, XCircle, CheckCircle, Eye, X, UserRound, Calendar,
  Mail, Shield, ShieldOff, MapPin, Trash2, AlertCircle, Loader2
} from 'lucide-react';
import { FaXTwitter } from 'react-icons/fa6';
import { FaGithub, FaLinkedin, FaFacebook } from 'react-icons/fa';

function formatDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

const ContriRequest = () => {

  const [pendingContributors, setPendingContributors] = useState([]);
  const [approvedContributors, setApprovedContributors] = useState([]);
  const [rejectedContributors, setRejectedContributors] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionId, setActionId] = useState(null);

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedContributor, setSelectedContributor] = useState(null);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const [p, a, r] = await Promise.allSettled([
        AxiosInstance.get('/dashboard/admin/fetch/cont/pending'),
        AxiosInstance.get('/dashboard/admin/fetch/cont/approved'),
        AxiosInstance.get('/dashboard/admin/fetch/cont/rejected'),
      ]);

      setPendingContributors(p.status === 'fulfilled' ? (p.value.data.pending ?? []) : []);
      setApprovedContributors(a.status === 'fulfilled' ? (a.value.data.approved ?? []) : []);
      setRejectedContributors(r.status === 'fulfilled' ? (r.value.data.rejected ?? []) : []);

      if ([p, a, r].every((x) => x.status === 'rejected')) {
        setLoadError("Couldn't load contributors. Please refresh.");
      }
    } catch (err) {
      console.error(err);
      setLoadError("Couldn't load contributors. Please refresh.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (contributor) => {
    const cont_id = contributor.cont_id;
    setActionId(cont_id);
    setPendingContributors((prev) => prev.filter((c) => c.cont_id !== cont_id));
    setApprovedContributors((prev) => [{ ...contributor, status: 'Approved' }, ...prev]);

    try {
      await AxiosInstance.post('/dashboard/admin/cont/approve', { cont_id });
    } catch (err) {
      console.error(err);
      setApprovedContributors((prev) => prev.filter((c) => c.cont_id !== cont_id));
      setPendingContributors((prev) => [contributor, ...prev]);
    } finally {
      setActionId(null);
    }
  };

  const openRejectModal = (contributor) => {
    setRejectTarget(contributor);
    setRejectReason('');
    setRejectError('');
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (!rejectReason.trim() || !rejectTarget || isRejecting) return;

    const contributor = rejectTarget;
    const reason = rejectReason.trim();

    setIsRejecting(true);
    setRejectError('');
    try {
      await AxiosInstance.post('/dashboard/admin/cont/reject', {
        cont_id: contributor.cont_id,
        reject_reason: reason,
      });
      setPendingContributors((prev) => prev.filter((c) => c.cont_id !== contributor.cont_id));
      setRejectedContributors((prev) => [{ ...contributor, status: 'Rejected', reject_reason: reason }, ...prev]);
      setShowRejectModal(false);
      setRejectReason('');
      setRejectTarget(null);
    } catch (err) {
      console.error(err);
      setRejectError("Couldn't reject this application. Try again.");
    } finally {
      setIsRejecting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget || isDeleting) return;
    const contributor = deleteTarget;

    setIsDeleting(true);
    try {
      await AxiosInstance.post('/dashboard/admin/cont/delete', { cont_id: contributor.cont_id });
      setRejectedContributors((prev) => prev.filter((c) => c.cont_id !== contributor.cont_id));
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleUserStatus = async (contributor) => {
    const cont_id = contributor.cont_id;
    const nextStatus = contributor.status === 'Approved' ? 'Block' : 'Approved';

    setActionId(cont_id);
    setApprovedContributors((prev) => prev.map((c) => c.cont_id === cont_id ? { ...c, status: nextStatus } : c));

    try {
      await AxiosInstance.post('/dashboard/admin/cont/status', { cont_id, set_status: nextStatus });
    } catch (err) {
      console.error(err);
      setApprovedContributors((prev) => prev.map((c) => c.cont_id === cont_id ? { ...c, status: contributor.status } : c));
    } finally {
      setActionId(null);
    }
  };

  const handleViewDetails = (contributor) => {
    setSelectedContributor(contributor);
    setShowDetailModal(true);
  };

  const statsData = [
    { label: "Pending", value: pendingContributors.length, color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20", icon: UserRound },
    { label: "Active", value: approvedContributors.length, color: "text-green-700 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/20", icon: CheckCircle },
    { label: "Rejected", value: rejectedContributors.length, color: "text-red-700 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/20", icon: XCircle },
  ];

  if (isLoading) {
    return (
      <div className="space-y-8 font-[Inter,system-ui,sans-serif]">
        <div>
          <h1 className="font-[Newsreader,Georgia,serif] text-3xl sm:text-4xl font-black text-gray-900 dark:text-gray-50 mb-2">
            Contributor Management
          </h1>
          <p className="text-gray-500 dark:text-slate-400">Manage contributor applications and memberships</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 dark:divide-slate-700 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center justify-between px-6 sm:px-8 py-6 animate-pulse">
              <div>
                <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded w-16 mb-3" />
                <div className="h-8 bg-gray-100 dark:bg-slate-700 rounded w-10" />
              </div>
              <div className="w-11 h-11 rounded-lg bg-gray-100 dark:bg-slate-700" />
            </div>
          ))}
        </div>
        {[0, 1].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-5 animate-pulse">
            <div className="h-4 bg-gray-100 dark:bg-slate-700 rounded w-1/3 mb-3" />
            <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded w-1/4" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 font-[Inter,system-ui,sans-serif]">

      {/* Header */}
      <div>
        <h1 className="font-[Newsreader,Georgia,serif] text-3xl sm:text-4xl font-black text-gray-900 dark:text-gray-50 mb-2">
          Contributor Management
        </h1>
        <p className="text-gray-500 dark:text-slate-400">
          Manage contributor applications and memberships
        </p>
      </div>

      {loadError && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-300">{loadError}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 dark:divide-slate-700 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
        {statsData.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="flex items-center justify-between px-6 sm:px-8 py-6">
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 dark:text-slate-500 mb-2">
                  {stat.label}
                </p>
                <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
              <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${stat.bg}`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Pending Applications */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">Pending Applications</h2>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            {pendingContributors.length} awaiting review
          </span>
        </div>

        {pendingContributors.length > 0 ? (
          <div className="space-y-3">
            {pendingContributors.map((contributor) => {
              const busy = actionId === contributor.cont_id;
              return (
                <div key={contributor.cont_id} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {contributor.profile_pic ? (
                        <img src={contributor.profile_pic} alt="" className="w-11 h-11 rounded-full object-cover bg-gray-100 dark:bg-slate-700 shrink-0" />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                          <UserRound className="w-5 h-5 text-gray-300 dark:text-slate-500" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-1 truncate">
                          {contributor.username}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400 dark:text-slate-500 mb-2">
                          <span className="flex items-center gap-1 min-w-0">
                            <Mail className="w-3 h-3 shrink-0" />
                            <span className="truncate">{contributor.email}</span>
                          </span>
                          <span>Applied {formatDate(contributor.created_at)}</span>
                        </div>
                        {contributor.expertise?.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {contributor.expertise.slice(0, 3).map((skill) => (
                              <span key={skill} className="px-2 py-0.5 text-[11px] font-medium rounded bg-blue-50 dark:bg-blue-900/20 text-[#1E3A5F] dark:text-blue-400">
                                {skill}
                              </span>
                            ))}
                            {contributor.expertise.length > 3 && (
                              <span className="px-2 py-0.5 text-[11px] font-medium rounded bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400">
                                +{contributor.expertise.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleViewDetails(contributor)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded text-[#1E3A5F] dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors duration-150"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Details
                      </button>
                      <button
                        onClick={() => handleApprove(contributor)}
                        disabled={busy}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors duration-150 disabled:opacity-50"
                      >
                        {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                        Approve
                      </button>
                      <button
                        onClick={() => openRejectModal(contributor)}
                        disabled={busy}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors duration-150 disabled:opacity-50"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center py-14 text-center">
            <div className="w-12 h-12 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center mb-3">
              <UserRound className="w-5 h-5 text-gray-300 dark:text-slate-500" />
            </div>
            <p className="text-sm text-gray-400 dark:text-slate-500">No pending applications</p>
          </div>
        )}
      </div>

      {/* Rejected Applications */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">Rejected Applications</h2>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            {rejectedContributors.length}
          </span>
        </div>

        {rejectedContributors.length > 0 ? (
          <div className="space-y-3">
            {rejectedContributors.map((contributor) => {
              const busy = actionId === contributor.cont_id;
              return (
                <div key={contributor.cont_id} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    {contributor.profile_pic ? (
                      <img src={contributor.profile_pic} alt="" className="w-9 h-9 rounded-full object-cover bg-gray-100 dark:bg-slate-700 shrink-0" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                        <UserRound className="w-4 h-4 text-gray-300 dark:text-slate-500" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{contributor.username}</h3>
                      <p className="text-xs text-gray-400 dark:text-slate-500 truncate">{contributor.email}</p>
                    </div>
                  </div>

                  <div className="px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 border-l-2 border-red-300 dark:border-red-700 mb-3">
                    <p className="text-xs text-red-700 dark:text-red-300">
                      <span className="font-semibold">Reason: </span>
                      {contributor.reject_reason}
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => setDeleteTarget(contributor)}
                      disabled={busy}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors duration-150 disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete Account
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center py-14 text-center">
            <div className="w-12 h-12 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center mb-3">
              <XCircle className="w-5 h-5 text-gray-300 dark:text-slate-500" />
            </div>
            <p className="text-sm text-gray-400 dark:text-slate-500">No rejected applications</p>
          </div>
        )}
      </div>

      {/* Active Contributors */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">Active Contributors</h2>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            {approvedContributors.length}
          </span>
        </div>

        {approvedContributors.length > 0 ? (
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-slate-700">
                    <th className="px-5 py-3 text-left text-[11px] font-semibold tracking-widest uppercase text-gray-400 dark:text-slate-500">Contributor</th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold tracking-widest uppercase text-gray-400 dark:text-slate-500">Email</th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold tracking-widest uppercase text-gray-400 dark:text-slate-500">Joined</th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold tracking-widest uppercase text-gray-400 dark:text-slate-500">Status</th>
                    <th className="px-5 py-3 text-right text-[11px] font-semibold tracking-widest uppercase text-gray-400 dark:text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                  {approvedContributors.map((contributor) => {
                    const busy = actionId === contributor.cont_id;
                    const isApproved = contributor.status === 'Approved';
                    return (
                      <tr key={contributor.cont_id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors duration-100">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            {contributor.profile_pic ? (
                              <img src={contributor.profile_pic} alt="" className="w-7 h-7 rounded-full object-cover bg-gray-100 dark:bg-slate-700 shrink-0" />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                                <UserRound className="w-3.5 h-3.5 text-gray-300 dark:text-slate-500" />
                              </div>
                            )}
                            <span className="font-medium text-gray-800 dark:text-gray-100 truncate">{contributor.username}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-gray-500 dark:text-slate-400 truncate max-w-[200px]">{contributor.email}</td>
                        <td className="px-5 py-3.5 text-gray-500 dark:text-slate-400 whitespace-nowrap">{formatDate(contributor.created_at)}</td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded ${
                            isApproved
                              ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                              : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                          }`}>
                            {isApproved ? "Active" : "Blocked"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex justify-end">
                            <button
                              onClick={() => toggleUserStatus(contributor)}
                              disabled={busy}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded transition-colors duration-150 disabled:opacity-50 ${
                                isApproved
                                  ? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40"
                                  : "text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40"
                              }`}
                            >
                              {busy ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : isApproved ? (
                                <Shield className="w-3.5 h-3.5" />
                              ) : (
                                <ShieldOff className="w-3.5 h-3.5" />
                              )}
                              {isApproved ? "Block" : "Unblock"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center py-14 text-center">
            <div className="w-12 h-12 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center mb-3">
              <CheckCircle className="w-5 h-5 text-gray-300 dark:text-slate-500" />
            </div>
            <p className="text-sm text-gray-400 dark:text-slate-500">No active contributors</p>
          </div>
        )}
      </div>

      {/* Detail modal */}
      {showDetailModal && selectedContributor && (
        <div
          className="!m-0 fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Contributor Details</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1 rounded text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-600 dark:hover:text-slate-300 transition-colors duration-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-start gap-5 mb-6">
                {selectedContributor.profile_pic ? (
                  <img src={selectedContributor.profile_pic} alt="" className="w-20 h-20 rounded-full object-cover bg-gray-100 dark:bg-slate-700 shrink-0" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                    <UserRound className="w-8 h-8 text-gray-300 dark:text-slate-500" />
                  </div>
                )}
                <div className="min-w-0">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-gray-50 mb-2 truncate">
                    {selectedContributor.username}
                  </h4>
                  <div className="space-y-1.5 text-sm text-gray-500 dark:text-slate-400">
                    <div className="flex items-center gap-2 min-w-0">
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{selectedContributor.email}</span>
                    </div>
                    {selectedContributor.dob && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <span>Born {formatDate(selectedContributor.dob)}</span>
                      </div>
                    )}
                    {(selectedContributor.city || selectedContributor.country) && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          {selectedContributor.city}
                          {selectedContributor.city && selectedContributor.country ? ", " : ""}
                          {selectedContributor.country}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selectedContributor.bio && (
                <div className="mb-6">
                  <h5 className="text-xs font-semibold tracking-widest uppercase text-gray-400 dark:text-slate-500 mb-2">Bio</h5>
                  <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">{selectedContributor.bio}</p>
                </div>
              )}

              {selectedContributor.expertise?.length > 0 && (
                <div className="mb-6">
                  <h5 className="text-xs font-semibold tracking-widest uppercase text-gray-400 dark:text-slate-500 mb-2">Expertise</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedContributor.expertise.map((skill) => (
                      <span key={skill} className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-50 dark:bg-blue-900/20 text-[#1E3A5F] dark:text-blue-400">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedContributor.links && Object.keys(selectedContributor.links).length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedContributor.links.linkedin && (
                    <a href={selectedContributor.links.linkedin} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2.5 text-sm rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors duration-100">
                      <FaLinkedin className="w-4 h-4" /> LinkedIn Profile
                    </a>
                  )}
                  {selectedContributor.links.twitter && (
                    <a href={selectedContributor.links.twitter} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2.5 text-sm rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors duration-100">
                      <FaXTwitter className="w-4 h-4" /> X (Twitter) Profile
                    </a>
                  )}
                  {selectedContributor.links.facebook && (
                    <a href={selectedContributor.links.facebook} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2.5 text-sm rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors duration-100">
                      <FaFacebook className="w-4 h-4" /> Facebook Profile
                    </a>
                  )}
                  {selectedContributor.links.github && (
                    <a href={selectedContributor.links.github} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2.5 text-sm rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors duration-100">
                      <FaGithub className="w-4 h-4" /> GitHub Profile
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject modal */}
      {showRejectModal && rejectTarget && (
        <div
          className="!m-0 fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => !isRejecting && setShowRejectModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Reject Application</h3>
              <button
                onClick={() => setShowRejectModal(false)}
                disabled={isRejecting}
                className="p-1 rounded text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-600 dark:hover:text-slate-300 transition-colors duration-100 disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3 mb-5">
              {rejectTarget.profile_pic ? (
                <img src={rejectTarget.profile_pic} alt="" className="w-9 h-9 rounded-full object-cover bg-gray-100 dark:bg-slate-700 shrink-0" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                  <UserRound className="w-4 h-4 text-gray-300 dark:text-slate-500" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs text-gray-400 dark:text-slate-500">You're about to reject the application from</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{rejectTarget.username}</p>
              </div>
            </div>

            <label className="block text-xs font-semibold tracking-wide uppercase text-gray-400 dark:text-slate-500 mb-1.5">
              Reason for rejection *
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              placeholder="Provide a clear reason for rejecting this application..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:border-red-400"
            />

            {rejectError && <p className="text-xs font-medium text-red-600 dark:text-red-400 mt-2">{rejectError}</p>}

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setShowRejectModal(false)}
                disabled={isRejecting}
                className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors duration-150 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                disabled={!rejectReason.trim() || isRejecting}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRejecting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {isRejecting ? "Rejecting…" : "Reject Application"}
              </button>
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
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Delete Account</h3>
            </div>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-5">
              Permanently delete <span className="font-semibold text-gray-700 dark:text-gray-200">{deleteTarget.username}</span>'s rejected application and account? This cannot be undone.
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
                {isDeleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ContriRequest;
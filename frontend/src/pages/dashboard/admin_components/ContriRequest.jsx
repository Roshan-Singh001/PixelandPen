import React, { useState, useEffect } from 'react';
import AxiosInstance from '../../../api/axiosInstance';
import {
  UserPlus, XCircle, CheckCircle, Eye, X, User, Calendar,
  Mail, Shield, ShieldOff, MapPin, Trash2,
} from 'lucide-react';
import { FaXTwitter } from 'react-icons/fa6';
import { FaGithub, FaLinkedin, FaFacebook } from 'react-icons/fa';
import userSimbol from '../../../assets/images/userSimbol.png';
import PixelPenLoader from '../../../components/PixelPenLoader';


/* ─── Shared bits ─────────────────────────────────────────────────────────── */
const StatusPill = ({ label, count, tone }) => {
  const tones = {
    amber: "bg-[#F59E0B]/10 dark:bg-[#F59E0B]/15 text-[#D97706] dark:text-[#F59E0B]",
    green: "bg-[#16A34A]/10 dark:bg-[#22C55E]/15 text-[#16A34A] dark:text-[#22C55E]",
    red: "bg-[#DC2626]/10 dark:bg-[#EF4444]/15 text-[#DC2626] dark:text-[#EF4444]",
  };
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 text-sm font-semibold rounded ${tones[tone]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label} ({count})
    </span>
  );
};

const StatCard = ({ label, value, Icon, tone }) => {
  const tones = {
    amber: { bg: "bg-[#F59E0B]/10 dark:bg-[#F59E0B]/15", val: "text-[#D97706] dark:text-[#F59E0B]" },
    green: { bg: "bg-[#16A34A]/10 dark:bg-[#22C55E]/15", val: "text-[#16A34A] dark:text-[#22C55E]" },
    red: { bg: "bg-[#DC2626]/10 dark:bg-[#EF4444]/15", val: "text-[#DC2626] dark:text-[#EF4444]" },
  };
  const t = tones[tone];
  return (
    <div className="bg-white dark:bg-[#162033] p-6 flex items-center justify-between">
      <div>
        <p className="text-[11px] font-semibold tracking-widest uppercase text-[#6B7280] dark:text-[#AAB4C5] mb-1">{label}</p>
        <p className={`text-3xl font-semibold ${t.val}`}>{value}</p>
      </div>
      <div className={`p-3 rounded ${t.bg}`}>
        <Icon className={`w-5 h-5 ${t.val}`} />
      </div>
    </div>
  );
};

const SectionHeader = ({ title, badge }) => (
  <div className="flex flex-wrap items-center gap-3 mb-4">
    <h2 className="text-xl font-semibold text-[#1F2937] dark:text-[#F8FAFC]">{title}</h2>
    {badge}
  </div>
);

const EmptyState = ({ Icon, label }) => (
  <div className="py-14 text-center">
    <div className="w-12 h-12 bg-[#FAFAF8] dark:bg-white/5 rounded flex items-center justify-center mx-auto mb-3">
      <Icon className="w-6 h-6 text-[#6B7280] dark:text-[#AAB4C5]" />
    </div>
    <p className="text-sm text-[#6B7280] dark:text-[#AAB4C5]">{label}</p>
  </div>
);

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

/* ─── Main ────────────────────────────────────────────────────────────────── */
const ContriRequest = () => {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedContributor, setSelectedContributor] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [actionId, setActionId] = useState(null); // BUG FIX: per-row pending state instead of nothing

  const [pendingContributors, setPendingContributors] = useState([]);
  const [approvedContributors, setApprovedContributors] = useState([]);
  const [rejectedContributors, setRejectedContributors] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [p, a, r] = await Promise.all([
          AxiosInstance.get('/dashboard/admin/fetch/cont/pending'),
          AxiosInstance.get('/dashboard/admin/fetch/cont/approved'),
          AxiosInstance.get('/dashboard/admin/fetch/cont/rejected'),
        ]);
        if (cancelled) return;
        setPendingContributors(p.data.pending ?? []);
        setApprovedContributors(a.data.approved ?? []);
        setRejectedContributors(r.data.rejected ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, [refreshKey]);

  const refresh = () => setRefreshKey(k => k + 1);

  const handleApprove = async (cont_id) => {
    setActionId(cont_id);
    try {
      await AxiosInstance.post('/dashboard/admin/cont/approve', { cont_id });
      refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (cont_id) => {
    setActionId(cont_id);
    try {
      await AxiosInstance.post('/dashboard/admin/cont/delete', { cont_id });
      refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setActionId(null);
    }
  };

  const handleReject = (contributor) => {
    setSelectedContributor(contributor);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleViewDetails = (contributor) => {
    setSelectedContributor(contributor);
    setShowDetailModal(true);
  };

  const confirmReject = async () => {
    if (!rejectReason.trim() || !selectedContributor) return; // BUG FIX: guard against empty submit
    try {
      await AxiosInstance.post('/dashboard/admin/cont/reject', {
        cont_id: selectedContributor.cont_id,
        reject_reason: rejectReason,
      });
      refresh();
    } catch (err) {
      console.error(err);
    }
    setShowRejectModal(false);
    setRejectReason('');
    setSelectedContributor(null);
  };

  const toggleUserStatus = async (cont_id, currentStatus) => {
    setActionId(cont_id);
    try {
      await AxiosInstance.post('/dashboard/admin/cont/status', {
        cont_id,
        set_status: currentStatus === 'Approved' ? 'Block' : 'Approved',
      });
      refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setActionId(null);
    }
  };

  if (isLoading) return <PixelPenLoader />;

  return (
    <div className="font-['Inter',sans-serif]">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-[Newsreader,Georgia,serif] text-4xl font-extrabold text-[#1F2937] dark:text-[#F8FAFC] mb-1">
          Contributor Management
        </h1>
        <p className="text-[#6B7280] dark:text-[#AAB4C5]">
          Manage contributor applications and memberships
        </p>
      </div>

      {/* Stat cards */}
      <div className="mb-8 grid grid-cols-1 divide-y divide-[#E5E7EB] overflow-hidden rounded-xl border border-[#E5E7EB] bg-white sm:grid-cols-3 sm:divide-x sm:divide-y-0 dark:divide-[#243247] dark:border-[#243247] dark:bg-[#162033]">
        <StatCard label="Pending" value={pendingContributors.length} Icon={User} tone="amber" />
        <StatCard label="Active" value={approvedContributors.length} Icon={CheckCircle} tone="green" />
        <StatCard label="Rejected" value={rejectedContributors.length} Icon={XCircle} tone="red" />
      </div>

      {/* Pending applications */}
      <section className="mb-8">
        <SectionHeader
          title="Pending Applications"
          badge={<StatusPill label="Awaiting review" count={pendingContributors.length} tone="amber" />}
        />
        <div className="bg-white dark:bg-[#162033] border border-[#E5E7EB] dark:border-[#243247]">
          {pendingContributors.length > 0 ? (
            <div className="divide-y divide-[#E5E7EB] dark:divide-[#243247]">
              {pendingContributors.map((contributor) => {
                const busy = actionId === contributor.cont_id;
                return (
                  <div key={contributor.cont_id} className="p-5 hover:bg-[#1E3A5F]/[0.03] dark:hover:bg-white/[0.03] transition-colors duration-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <img
                          src={contributor.profile_pic || userSimbol}
                          alt={contributor.username}
                          className="w-11 h-11 rounded-full object-cover border border-[#E5E7EB] dark:border-[#243247] flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-[#1F2937] dark:text-[#F8FAFC] mb-1 truncate">
                            {contributor.username}
                          </h3>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#6B7280] dark:text-[#AAB4C5] mb-2">
                            <span className="flex items-center gap-1 min-w-0">
                              <Mail size={12} className="flex-shrink-0" />
                              <span className="truncate">{contributor.email}</span>
                            </span>
                            <span>Applied {fmtDate(contributor.created_at)}</span>
                          </div>
                          {contributor.expertise?.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {contributor.expertise.slice(0, 3).map((skill) => (
                                <span key={skill} className="px-2 py-0.5 bg-[#1E3A5F]/10 text-[#1E3A5F] dark:bg-[#4F8EF7]/15 dark:text-[#4F8EF7] text-[11px] rounded">
                                  {skill}
                                </span>
                              ))}
                              {contributor.expertise.length > 3 && (
                                <span className="px-2 py-0.5 bg-[#E5E7EB]/60 dark:bg-white/5 text-[#6B7280] dark:text-[#AAB4C5] text-[11px] rounded">
                                  +{contributor.expertise.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleViewDetails(contributor)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#1E3A5F] dark:text-[#4F8EF7] bg-[#1E3A5F]/10 dark:bg-[#4F8EF7]/10 hover:bg-[#1E3A5F]/15 dark:hover:bg-[#4F8EF7]/20 rounded transition-colors"
                        >
                          <Eye size={14} /> Details
                        </button>
                        <button
                          onClick={() => handleApprove(contributor.cont_id)}
                          disabled={busy}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#16A34A] dark:text-[#22C55E] bg-[#16A34A]/10 dark:bg-[#22C55E]/10 hover:bg-[#16A34A]/15 dark:hover:bg-[#22C55E]/20 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
                        >
                          <UserPlus size={14} /> {busy ? "…" : "Approve"}
                        </button>
                        <button
                          onClick={() => handleReject(contributor)}
                          disabled={busy}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#DC2626] dark:text-[#EF4444] bg-[#DC2626]/10 dark:bg-[#EF4444]/10 hover:bg-[#DC2626]/15 dark:hover:bg-[#EF4444]/20 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
                        >
                          <XCircle size={14} /> Reject
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState Icon={User} label="No pending applications" />
          )}
        </div>
      </section>

      {/* Rejected applications */}
      <section className="mb-8">
        <SectionHeader
          title="Rejected Applications"
          badge={<StatusPill label="Rejected" count={rejectedContributors.length} tone="red" />}
        />
        <div className="bg-white dark:bg-[#162033] border border-[#E5E7EB] dark:border-[#243247]">
          {rejectedContributors.length > 0 ? (
            <div className="divide-y divide-[#E5E7EB] dark:divide-[#243247]">
              {rejectedContributors.map((contributor) => {
                const busy = actionId === contributor.cont_id;
                return (
                  <div key={contributor.cont_id} className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={contributor.profile_pic || userSimbol}
                        alt={contributor.username}
                        className="w-9 h-9 rounded-full object-cover border border-[#E5E7EB] dark:border-[#243247] flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-[#1F2937] dark:text-[#F8FAFC] truncate">{contributor.username}</h3>
                        <p className="text-xs text-[#6B7280] dark:text-[#AAB4C5] truncate">{contributor.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 mb-3">
                      <XCircle size={14} className="text-[#DC2626] dark:text-[#EF4444] mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-[#DC2626] dark:text-[#EF4444] font-medium">{contributor.reject_reason}</p>
                    </div>
                    <div className="flex justify-end">
                      <button
                        title="Delete account"
                        onClick={() => handleDelete(contributor.cont_id)}
                        disabled={busy}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#DC2626] dark:text-[#EF4444] hover:bg-[#DC2626]/10 dark:hover:bg-[#EF4444]/10 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
                      >
                        <Trash2 size={13} /> {busy ? "Deleting…" : "Delete Account"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState Icon={XCircle} label="No rejected applications" />
          )}
        </div>
      </section>

      {/* Active contributors */}
      <section>
        <SectionHeader
          title="Active Contributors"
          badge={<StatusPill label="Contributors" count={approvedContributors.length} tone="green" />}
        />
        <div className="bg-white dark:bg-[#162033] border border-[#E5E7EB] dark:border-[#243247] overflow-x-auto">
          {approvedContributors.length > 0 ? (
            <table className="min-w-full divide-y divide-[#E5E7EB] dark:divide-[#243247]">
              <thead className="bg-[#FAFAF8] dark:bg-white/[0.02]">
                <tr>
                  {["Contributor", "Email", "Joined", "Status", "Actions"].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-[#6B7280] dark:text-[#AAB4C5] uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB] dark:divide-[#243247]">
                {approvedContributors.map((contributor) => {
                  const busy = actionId === contributor.cont_id;
                  const isApproved = contributor.status === 'Approved';
                  return (
                    <tr key={contributor.cont_id} className="hover:bg-[#1E3A5F]/[0.03] dark:hover:bg-white/[0.03] transition-colors duration-100">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={contributor.profile_pic || userSimbol}
                            alt={contributor.username}
                            className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                          />
                          <span className="text-sm font-medium text-[#1F2937] dark:text-[#F8FAFC] truncate">{contributor.username}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-[#6B7280] dark:text-[#AAB4C5] truncate max-w-[200px]">{contributor.email}</td>
                      <td className="px-5 py-3 text-sm text-[#6B7280] dark:text-[#AAB4C5] whitespace-nowrap">{fmtDate(contributor.created_at)}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${isApproved
                            ? "bg-[#16A34A]/10 dark:bg-[#22C55E]/15 text-[#16A34A] dark:text-[#22C55E]"
                            : "bg-[#DC2626]/10 dark:bg-[#EF4444]/15 text-[#DC2626] dark:text-[#EF4444]"
                          }`}>
                          {isApproved ? "Active" : "Blocked"}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <button
                          onClick={() => toggleUserStatus(contributor.cont_id, contributor.status)}
                          disabled={busy}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isApproved
                              ? "text-[#DC2626] dark:text-[#EF4444] hover:bg-[#DC2626]/10 dark:hover:bg-[#EF4444]/10"
                              : "text-[#16A34A] dark:text-[#22C55E] hover:bg-[#16A34A]/10 dark:hover:bg-[#22C55E]/10"
                            }`}
                        >
                          {isApproved ? <Shield size={13} /> : <ShieldOff size={13} />}
                          {busy ? "…" : isApproved ? "Block" : "Unblock"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <EmptyState Icon={CheckCircle} label="No active contributors" />
          )}
        </div>
      </section>

      {/* ── Detail Modal ─────────────────────────────────────────────────── */}
      {showDetailModal && selectedContributor && (
        <div
          className="fixed inset-0 bg-[#1F2937]/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className="bg-white dark:bg-[#162033] max-w-2xl w-full border border-[#E5E7EB] dark:border-[#243247] max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()} // BUG FIX: clicking inside modal no longer closes it
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] dark:border-[#243247]">
              <h3 className="text-base font-semibold text-[#1F2937] dark:text-[#F8FAFC]">Contributor Details</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-[#6B7280] hover:text-[#1F2937] dark:text-[#AAB4C5] dark:hover:text-[#F8FAFC] transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {/* Profile header */}
              <div className="flex items-start gap-5 mb-6">
                <img
                  src={selectedContributor.profile_pic || userSimbol}
                  alt={selectedContributor.username}
                  className="w-20 h-20 rounded-full object-cover border border-[#E5E7EB] dark:border-[#243247] flex-shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="text-xl font-semibold text-[#1F2937] dark:text-[#F8FAFC] mb-2 truncate">
                    {selectedContributor.username}
                  </h4>
                  <div className="space-y-1.5 text-sm text-[#6B7280] dark:text-[#AAB4C5]">
                    <div className="flex items-center gap-2 min-w-0">
                      <Mail size={14} className="flex-shrink-0" />
                      <span className="truncate">{selectedContributor.email}</span>
                    </div>
                    {selectedContributor.dob && (
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="flex-shrink-0" />
                        <span>Born {new Date(selectedContributor.dob).toLocaleDateString()}</span>
                      </div>
                    )}
                    {(selectedContributor.city || selectedContributor.country) && (
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="flex-shrink-0" />
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

              {/* Bio */}
              {selectedContributor.bio && (
                <div className="mb-6">
                  <h5 className="text-xs font-semibold tracking-widest uppercase text-[#6B7280] dark:text-[#AAB4C5] mb-2">Bio</h5>
                  <p className="text-sm text-[#1F2937] dark:text-[#F8FAFC] leading-relaxed">{selectedContributor.bio}</p>
                </div>
              )}

              {/* Expertise */}
              {selectedContributor.expertise?.length > 0 && (
                <div className="mb-6">
                  <h5 className="text-xs font-semibold tracking-widest uppercase text-[#6B7280] dark:text-[#AAB4C5] mb-2">Expertise</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedContributor.expertise.map((skill) => (
                      <span key={skill} className="px-2.5 py-1 bg-[#1E3A5F]/10 text-[#1E3A5F] dark:bg-[#4F8EF7]/15 dark:text-[#4F8EF7] text-xs rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Links */}
              {selectedContributor.links && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedContributor.links.linkedin && (
                    <a href={selectedContributor.links.linkedin} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2.5 bg-[#FAFAF8] dark:bg-white/5 text-[#1F2937] dark:text-[#F8FAFC] text-sm rounded hover:bg-[#1E3A5F]/5 dark:hover:bg-white/10 transition-colors">
                      <FaLinkedin size={15} /> LinkedIn Profile
                    </a>
                  )}
                  {selectedContributor.links.twitter && (
                    <a href={selectedContributor.links.twitter} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2.5 bg-[#FAFAF8] dark:bg-white/5 text-[#1F2937] dark:text-[#F8FAFC] text-sm rounded hover:bg-[#1E3A5F]/5 dark:hover:bg-white/10 transition-colors">
                      <FaXTwitter size={15} /> X (Twitter) Profile
                    </a>
                  )}
                  {selectedContributor.links.facebook && (
                    <a href={selectedContributor.links.facebook} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2.5 bg-[#FAFAF8] dark:bg-white/5 text-[#1F2937] dark:text-[#F8FAFC] text-sm rounded hover:bg-[#1E3A5F]/5 dark:hover:bg-white/10 transition-colors">
                      <FaFacebook size={15} /> Facebook Profile
                    </a>
                  )}
                  {selectedContributor.links.github && (
                    <a href={selectedContributor.links.github} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2.5 bg-[#FAFAF8] dark:bg-white/5 text-[#1F2937] dark:text-[#F8FAFC] text-sm rounded hover:bg-[#1E3A5F]/5 dark:hover:bg-white/10 transition-colors">
                      <FaGithub size={15} /> GitHub Profile
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Reject Modal ─────────────────────────────────────────────────── */}
      {showRejectModal && selectedContributor && (
        <div
          className="fixed inset-0 bg-[#1F2937]/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setShowRejectModal(false)}
        >
          <div
            className="bg-white dark:bg-[#162033] max-w-md w-full border border-[#E5E7EB] dark:border-[#243247]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB] dark:border-[#243247]">
              <h3 className="text-base font-semibold text-[#1F2937] dark:text-[#F8FAFC]">Reject Application</h3>
              <button
                onClick={() => setShowRejectModal(false)}
                className="text-[#6B7280] hover:text-[#1F2937] dark:text-[#AAB4C5] dark:hover:text-[#F8FAFC] transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <img
                  src={selectedContributor.profile_pic || userSimbol}
                  alt={selectedContributor.username}
                  className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs text-[#6B7280] dark:text-[#AAB4C5]">You are about to reject the application from</p>
                  <p className="text-sm font-semibold text-[#1F2937] dark:text-[#F8FAFC] truncate">{selectedContributor.username}</p>
                </div>
              </div>

              <label className="block text-xs font-medium text-[#1F2937] dark:text-[#F8FAFC] mb-1.5">
                Reason for rejection <span className="text-[#DC2626] dark:text-[#EF4444]">*</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Provide a clear reason for rejecting this application…"
                rows={4}
                className="w-full px-3 py-2.5 text-sm bg-white dark:bg-[#0B1220] text-[#1F2937] dark:text-[#F8FAFC] border border-[#E5E7EB] dark:border-[#243247] rounded resize-none focus:outline-none focus:border-[#DC2626] dark:focus:border-[#EF4444] focus:ring-2 focus:ring-[#DC2626]/10 dark:focus:ring-[#EF4444]/10 placeholder-[#6B7280]/60 dark:placeholder-[#AAB4C5]/50"
              />
            </div>

            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-[#1F2937] dark:text-[#F8FAFC] bg-[#E5E7EB]/60 dark:bg-white/5 hover:bg-[#E5E7EB] dark:hover:bg-white/10 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                disabled={!rejectReason.trim()}
                className="flex-1 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-white bg-[#DC2626] dark:bg-[#EF4444] hover:bg-[#DC2626]/90 dark:hover:bg-[#EF4444]/90 disabled:bg-[#DC2626]/30 dark:disabled:bg-[#EF4444]/30 disabled:cursor-not-allowed rounded transition-colors"
              >
                Reject Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContriRequest;
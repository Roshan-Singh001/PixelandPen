import React, { useState } from 'react';
import { UserPlus, XCircle, CheckCircle, Eye, X, User, Calendar, Mail, FileText, Shield, ShieldOff, MapPin, Award } from 'lucide-react';

const ContriRequest = () => {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedContributor, setSelectedContributor] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const pendingContributors = [
    { 
      id: 1, 
      name: 'Roshan Singh', 
      email: 'roshan@example.com',
      profilePhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      dob: '1990-05-15',
      bio: 'Full-stack developer with 5+ years of experience in React, Node.js, and cloud technologies. Passionate about writing technical articles and sharing knowledge with the developer community.',
      location: 'Mumbai, India',
      linkedin: 'https://linkedin.com/in/roshansingh',
      github: 'https://github.com/roshansingh',
      appliedDate: '2025-08-01',
      expertise: ['React', 'Node.js', 'AWS', 'MongoDB']
    },
    { 
      id: 2, 
      name: 'Suraj Kumar', 
      email: 'suraj@example.com',
      profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      dob: '1992-08-22',
      bio: 'DevOps engineer specializing in container orchestration and CI/CD pipelines. Love to write about cloud infrastructure and automation best practices.',
      location: 'Bangalore, India',
      linkedin: 'https://linkedin.com/in/surajkumar',
      github: 'https://github.com/surajkumar',
      appliedDate: '2025-08-02',
      expertise: ['Docker', 'Kubernetes', 'Jenkins', 'Terraform']
    },
  ];

  const approvedContributors = [
    { 
      id: 3, 
      name: 'ABC Developer', 
      email: 'abc@example.com', 
      joined: '2025-04-10', 
      articles: 45,
      profilePhoto: 'https://images.unsplash.com/photo-1494790108755-2616b9c955cc?w=150&h=150&fit=crop&crop=face',
      status: 'active',
      lastArticle: '2025-07-28',
      expertise: ['JavaScript', 'Python', 'Machine Learning']
    },
    { 
      id: 4, 
      name: 'ZCV Writer', 
      email: 'zcv@example.com', 
      joined: '2025-03-21', 
      articles: 67,
      profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      status: 'blocked',
      lastArticle: '2025-07-15',
      expertise: ['Data Science', 'AI', 'Analytics']
    },
  ];

  const rejectedContributors = [
    { 
      id: 5, 
      name: 'DOL Smith', 
      email: 'dol@example.com', 
      reason: 'Incomplete profile - Missing portfolio links and writing samples',
      rejectedDate: '2025-07-25',
      profilePhoto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
    },
  ];

  const handleReject = (contributor) => {
    setSelectedContributor(contributor);
    setShowRejectModal(true);
  };

  const handleViewDetails = (contributor) => {
    setSelectedContributor(contributor);
    setShowDetailModal(true);
  };

  const confirmReject = () => {
    console.log(`Rejecting contributor: ${selectedContributor.name} with reason: ${rejectReason}`);
    setShowRejectModal(false);
    setRejectReason('');
    setSelectedContributor(null);
  };

  const toggleUserStatus = (userId, currentStatus) => {
    console.log(`Toggling status for user ${userId} from ${currentStatus}`);
    // Here you would implement the actual status toggle logic
  };

  const StatusBadge = ({ status, count }) => (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
      <div className="w-2 h-2 rounded-full bg-purple-500"></div>
      {status} ({count})
    </div>
  );

  return (
    <div className="min-h-screen p-2">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-2">
            Contributor Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">Manage contributor applications and memberships</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{pendingContributors.length}</p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                <User className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {approvedContributors.filter(c => c.status === 'active').length}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rejected</p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">{rejectedContributors.length}</p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Pending Contributors */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Pending Applications</h2>
            <StatusBadge status="Awaiting Review" count={pendingContributors.length} />
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-auto">
            {pendingContributors.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {pendingContributors.map((contributor) => (
                  <div key={contributor.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <img 
                          src={contributor.profilePhoto} 
                          alt={contributor.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                        />
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{contributor.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <span className="flex items-center gap-1">
                              <Mail size={14} />
                              {contributor.email}
                            </span>
                            <span>•</span>
                            <span>Applied {contributor.appliedDate}</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {contributor.expertise?.slice(0, 3).map((skill) => (
                              <span key={skill} className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full">
                                {skill}
                              </span>
                            ))}
                            {contributor.expertise?.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                                +{contributor.expertise.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button 
                          onClick={() => handleViewDetails(contributor)}
                          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                        >
                          <Eye size={16} />
                          Details
                        </button>
                        <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-lg transition-colors">
                          <UserPlus size={16} />
                          Approve
                        </button>
                        <button 
                          onClick={() => handleReject(contributor)}
                          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                        >
                          <XCircle size={16} />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <User className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg">No pending applications</p>
              </div>
            )}
          </div>
        </section>

        {/* Rejected Contributors */}
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Rejected Applications</h2>
            <StatusBadge status="Rejected" count={rejectedContributors.length} />
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-auto">
            {rejectedContributors.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {rejectedContributors.map((contributor) => (
                  <div key={contributor.id} className="p-6">
                    <div className="flex items-center gap-4 mb-3">
                      <img 
                        src={contributor.profilePhoto} 
                        alt={contributor.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{contributor.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{contributor.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <XCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-red-600 dark:text-red-400 font-medium">{contributor.reason}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Rejected on {contributor.rejectedDate}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <XCircle className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg">No rejected applications</p>
              </div>
            )}
          </div>
        </section>

        {/* Approved Contributors */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Active Contributors</h2>
            <StatusBadge status="Contributors" count={approvedContributors.length} />
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-auto">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contributor</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Articles</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {approvedContributors.map((contributor) => (
                    <tr key={contributor.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={contributor.profilePhoto} 
                            alt={contributor.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{contributor.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{contributor.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{contributor.joined}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <FileText size={14} className="text-gray-400" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{contributor.articles}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          contributor.status === 'active' 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                        }`}>
                          {contributor.status === 'active' ? 'Active' : 'Blocked'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => toggleUserStatus(contributor.id, contributor.status)}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                              contributor.status === 'active'
                                ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30'
                                : 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30'
                            }`}
                          >
                            {contributor.status === 'active' ? (
                              <>
                                <Shield size={14} />
                                Block
                              </>
                            ) : (
                              <>
                                <ShieldOff size={14} />
                                Unblock
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      {/* Contributor Detail Modal */}
      {showDetailModal && selectedContributor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Contributor Details</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              {/* Profile Header */}
              <div className="flex items-start gap-6 mb-6">
                <img 
                  src={selectedContributor.profilePhoto} 
                  alt={selectedContributor.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 dark:border-gray-600"
                />
                <div className="flex-1">
                  <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{selectedContributor.name}</h4>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Mail size={16} />
                      <span>{selectedContributor.email}</span>
                    </div>
                    {selectedContributor.dob && (
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span>Born {new Date(selectedContributor.dob).toLocaleDateString()}</span>
                      </div>
                    )}
                    {selectedContributor.location && (
                      <div className="flex items-center gap-2">
                        <MapPin size={16} />
                        <span>{selectedContributor.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bio */}
              {selectedContributor.bio && (
                <div className="mb-6">
                  <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Bio</h5>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{selectedContributor.bio}</p>
                </div>
              )}

              {/* Expertise */}
              {selectedContributor.expertise && (
                <div className="mb-6">
                  <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Expertise</h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedContributor.expertise.map((skill) => (
                      <span key={skill} className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Links */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedContributor.linkedin && (
                  <a 
                    href={selectedContributor.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                  >
                    <Award size={16} />
                    LinkedIn Profile
                  </a>
                )}
                {selectedContributor.github && (
                  <a 
                    href={selectedContributor.github} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Award size={16} />
                    GitHub Profile
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedContributor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Reject Application</h3>
              <button
                onClick={() => setShowRejectModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src={selectedContributor.profilePhoto} 
                  alt={selectedContributor.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    You are about to reject the application from
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {selectedContributor.name}
                  </p>
                </div>
              </div>
              
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reason for rejection <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Please provide a clear reason for rejecting this application..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white resize-none"
                rows={4}
                required
              />
            </div>
            
            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                disabled={!rejectReason.trim()}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed rounded-lg transition-colors"
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
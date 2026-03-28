import React, { useState, useEffect } from 'react';
import { candidateProfileAPI } from '../utils/api';
import MainLayout from '../components/MainLayout';
import Card from '../components/Card';
import Button from '../components/Button';
import Loading from '../components/Loading';
import Alert from '../components/Alert';
import Modal from '../components/Modal';

export default function AdminCandidates() {
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);
    const [filter, setFilter] = useState('all');
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        fetchCandidates();
    }, []);

    const fetchCandidates = async () => {
        try {
            const response = await candidateProfileAPI.pending();
            setCandidates(response.data.data || []);
        } catch (error) {
            setAlert({
                type: 'error',
                title: 'Error',
                message: 'Failed to load candidates',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (candidateId) => {
        try {
            await candidateProfileAPI.approve(candidateId);
            setAlert({
                type: 'success',
                title: 'Candidate Approved',
                message: 'Candidate profile has been approved',
            });
            fetchCandidates();
        } catch (error) {
            setAlert({
                type: 'error',
                title: 'Error',
                message: 'Failed to approve candidate',
            });
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            setAlert({
                type: 'error',
                title: 'Error',
                message: 'Please provide a rejection reason',
            });
            return;
        }

        try {
            await candidateProfileAPI.reject(selectedCandidate._id, {
                reason: rejectionReason,
            });
            setAlert({
                type: 'success',
                title: 'Candidate Rejected',
                message: 'Candidate has been notified of rejection',
            });
            setShowRejectModal(false);
            setRejectionReason('');
            fetchCandidates();
        } catch (error) {
            setAlert({
                type: 'error',
                title: 'Error',
                message: 'Failed to reject candidate',
            });
        }
    };

    if (loading) return <Loading fullScreen />;

    const filteredCandidates =
        filter === 'all'
            ? candidates
            : candidates.filter((c) => c.status === filter);

    const statusStats = {
        pending: candidates.filter((c) => c.status === 'pending').length,
        approved: candidates.filter((c) => c.status === 'approved').length,
        rejected: candidates.filter((c) => c.status === 'rejected').length,
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-8 text-white shadow-lg">
                    <h1 className="text-3xl font-bold mb-2">👨‍💼 Candidate Management</h1>
                    <p className="text-purple-100">Review and approve candidate profiles</p>
                </div>

                {/* Alert */}
                {alert && (
                    <Alert
                        type={alert.type}
                        title={alert.title}
                        message={alert.message}
                        onClose={() => setAlert(null)}
                    />
                )}

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-l-4 border-yellow-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 font-medium">Pending</p>
                                <p className="text-4xl font-bold text-yellow-600 mt-1">{statusStats.pending}</p>
                            </div>
                            <div className="text-5xl">⏳</div>
                        </div>
                    </Card>
                    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 font-medium">Approved</p>
                                <p className="text-4xl font-bold text-green-600 mt-1">{statusStats.approved}</p>
                            </div>
                            <div className="text-5xl">✅</div>
                        </div>
                    </Card>
                    <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-l-4 border-red-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 font-medium">Rejected</p>
                                <p className="text-4xl font-bold text-red-600 mt-1">{statusStats.rejected}</p>
                            </div>
                            <div className="text-5xl">❌</div>
                        </div>
                    </Card>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-3 flex-wrap">
                    {['all', 'pending', 'approved', 'rejected'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${filter === status
                                ? 'bg-purple-600 text-white shadow-lg'
                                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                                }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Candidates Cards */}
                {filteredCandidates.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredCandidates.map((candidate) => (
                            <CandidateCard
                                key={candidate._id}
                                candidate={candidate}
                                onApprove={() => handleApprove(candidate._id)}
                                onReject={() => {
                                    setSelectedCandidate(candidate);
                                    setShowRejectModal(true);
                                }}
                            />
                        ))}
                    </div>
                ) : (
                    <Card className="text-center py-12">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">No Candidates Found</h3>
                        <p className="text-gray-600">No candidates match your filter</p>
                    </Card>
                )}

                {/* Reject Modal */}
                <Modal
                    isOpen={showRejectModal}
                    onClose={() => {
                        setShowRejectModal(false);
                        setSelectedCandidate(null);
                        setRejectionReason('');
                    }}
                    title="Reject Candidate"
                >
                    <div className="space-y-4">
                        <p className="text-gray-600">
                            Rejecting <strong>{selectedCandidate?.candidateName}</strong> ({selectedCandidate?.party})
                        </p>
                        <div>
                            <label className="block text-gray-700 font-medium text-sm mb-2">
                                Rejection Reason
                            </label>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Provide a reason for rejection..."
                                rows="4"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                            />
                        </div>
                        <div className="flex gap-3 pt-4">
                            <Button onClick={handleReject} variant="danger" className="flex-1">
                                Reject
                            </Button>
                            <Button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setSelectedCandidate(null);
                                    setRejectionReason('');
                                }}
                                variant="secondary"
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </Modal>
            </div>
        </MainLayout>
    );
}

function CandidateCard({ candidate, onApprove, onReject }) {
    const statusColor = {
        pending: 'bg-yellow-100 text-yellow-800',
        approved: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800',
    };

    return (
        <Card className="hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-xl font-bold text-gray-800">{candidate.candidateName}</h3>
                    <p className="text-sm text-gray-600 mt-1">Party: {candidate.party}</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${statusColor[candidate.status]}`}>
                        {candidate.status.toUpperCase()}
                    </span>
                </div>
            </div>

            <div className="space-y-2 mb-6 text-sm text-gray-600">
                {candidate.description && (
                    <p>
                        <span className="font-medium">📝 Description:</span> {candidate.description?.substring(0, 100)}...
                    </p>
                )}
                {candidate.voterIdDocument && (
                    <p>
                        <span className="font-medium">📄 Has Voter ID Document:</span> ✓
                    </p>
                )}
            </div>

            {candidate.status === 'pending' && (
                <div className="flex gap-2">
                    <Button onClick={onApprove} className="flex-1">
                        Approve
                    </Button>
                    <Button onClick={onReject} variant="danger" className="flex-1">
                        Reject
                    </Button>
                </div>
            )}

            {candidate.status === 'rejected' && candidate.rejectionReason && (
                <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded text-sm text-red-800">
                    <p className="font-medium">Reason:</p>
                    <p>{candidate.rejectionReason}</p>
                </div>
            )}
        </Card>
    );
}

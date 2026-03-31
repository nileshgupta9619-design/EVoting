import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { electionAPI, candidateProfileAPI } from '../utils/api';
import MainLayout from '../components/MainLayout';
import Card from '../components/Card';
import Button from '../components/Button';
import Loading from '../components/Loading';
import Alert from '../components/Alert';
import Modal from '../components/Modal';
import { toast } from 'react-toastify';

export default function AdminElectionCandidate() {
    const { electionId } = useParams();
    const navigate = useNavigate();
    const [election, setElection] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchElectionAndCandidates();
    }, [electionId]);

    const fetchElectionAndCandidates = async () => {
        try {
            setLoading(true);
            // const [electionRes, candidatesRes] = await Promise.all([
            //     electionAPI.get(electionId),
            //     electionAPI.candidates(electionId),
            // ]);

            // setElection(electionRes.data.data || electionRes.data);

            // // Handle different response structures
            // let candidatesData = [];
            // if (candidatesRes.data.data) {
            //     candidatesData = Array.isArray(candidatesRes.data.data) ? candidatesRes.data.data : [candidatesRes.data.data];
            // } else if (candidatesRes.data.candidates) {
            //     candidatesData = Array.isArray(candidatesRes.data.candidates) ? candidatesRes.data.candidates : [candidatesRes.data.candidates];
            // } else if (Array.isArray(candidatesRes.data)) {
            //     candidatesData = candidatesRes.data;
            // } else if (candidatesRes.data && typeof candidatesRes.data === 'object') {
            //     candidatesData = [candidatesRes.data];
            // }

            const candidateRes = await electionAPI.candidates(electionId)
            setCandidates(candidateRes.data.data || []);
            // console.log(candidateRes.data)
            const electionRes = await electionAPI.get(electionId);
            console.log(electionRes.data.data);
            setElection(electionRes.data.data)
        } catch (error) {
            console.error('Error fetching data:', error);
            setAlert({
                type: 'error',
                title: 'Error',
                message: error.response?.data?.message || 'Failed to load election data',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleApprovCandidate = async (candidateId) => {
        try {
            setActionLoading(true);
            await candidateProfileAPI.approve(candidateId);
            setAlert({
                type: 'success',
                title: 'Approved',
                message: 'Candidate has been approved successfully',
            });
            toast.success('Candidate approved successfully');
            setShowDetailModal(false);
            setSelectedCandidate(null);
            fetchElectionAndCandidates();
        } catch (error) {
            setAlert({
                type: 'error',
                title: 'Error',
                message: error.response?.data?.message || 'Failed to approve candidate',
            });
        } finally {
            setActionLoading(false);
        }
    };

    const handleRejectCandidate = async (candidateId) => {
        const reason = prompt('Please enter reason for rejection:');
        if (!reason) return;

        try {
            setActionLoading(true);
            await candidateProfileAPI.reject(candidateId, { reason });
            setAlert({
                type: 'success',
                title: 'Rejected',
                message: 'Candidate has been rejected',
            });
            toast.success('Candidate rejected successfully');
            setShowDetailModal(false);
            setSelectedCandidate(null);
            fetchElectionAndCandidates();
        } catch (error) {
            setAlert({
                type: 'error',
                title: 'Error',
                message: error.response?.data?.message || 'Failed to reject candidate',
            });
        } finally {
            setActionLoading(false);
        }
    };

    const handleViewDetails = (candidate) => {
        setSelectedCandidate(candidate);
        setShowDetailModal(true);
    };

    if (loading) return <Loading fullScreen />;

    const getStatusColor = (status) => {
        switch ((status || 'pending').toLowerCase()) {
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <button
                            onClick={() => navigate('/admin/elections')}
                            className="text-blue-600 hover:text-blue-800 font-medium mb-2 flex items-center gap-1"
                        >
                            ← Back to Elections
                        </button>
                        <h1 className="text-4xl font-bold text-gray-800">
                            {election?.title} - Candidates
                        </h1>
                        <p className="text-gray-600 mt-2">{election?.description}</p>
                    </div>
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

                {/* Election Info */}
                {/* <Card className="bg-gradient-to-r from-blue-50 to-cyan-50">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-gray-600 text-sm font-medium">Status</p>
                            <p className="text-xl font-bold text-blue-600 mt-1">
                                {election?.isActive ? '🔴 Active' : '⏸️ Inactive'}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-600 text-sm font-medium">Start Date</p>
                            <p className="text-xl font-bold text-blue-600 mt-1">
                                {election?.startDate
                                    ? new Date(election.startDate).toLocaleDateString()
                                    : 'Not set'}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-600 text-sm font-medium">End Date</p>
                            <p className="text-xl font-bold text-blue-600 mt-1">
                                {election?.endDate
                                    ? new Date(election.endDate).toLocaleDateString()
                                    : 'Not set'}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-600 text-sm font-medium">Total Candidates</p>
                            <p className="text-xl font-bold text-blue-600 mt-1">{candidates.length}</p>
                        </div>
                    </div>
                </Card> */}

                {/* Candidates Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 font-medium">Approved</p>
                                <p className="text-4xl font-bold text-green-600 mt-1">
                                    {candidates.filter((c) => (c?.status || '').toLowerCase() === 'approved').length}
                                </p>
                            </div>
                            <div className="text-5xl">✅</div>
                        </div>
                    </Card>
                    <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-l-4 border-yellow-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 font-medium">Pending</p>
                                <p className="text-4xl font-bold text-yellow-600 mt-1">
                                    {candidates.filter((c) => (c?.status || '').toLowerCase() === 'pending').length}
                                </p>
                            </div>
                            <div className="text-5xl">⏳</div>
                        </div>
                    </Card>
                    <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-l-4 border-red-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 font-medium">Rejected</p>
                                <p className="text-4xl font-bold text-red-600 mt-1">
                                    {candidates.filter((c) => (c?.status || '').toLowerCase() === 'rejected').length}
                                </p>
                            </div>
                            <div className="text-5xl">❌</div>
                        </div>
                    </Card>
                </div>

                {/* Candidates List */}
                {candidates.length > 0 ? (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-gray-800">Candidates List</h2>
                        <div className="grid grid-cols-1 gap-4">
                            {candidates.map((candidate) => (
                                <CandidateCard
                                    key={candidate._id}
                                    candidate={candidate}
                                    onViewDetails={() => handleViewDetails(candidate)}
                                    statusColor={getStatusColor(candidate.status)}
                                />
                            ))}
                        </div>
                    </div>
                ) : (
                    <Card className="text-center py-12">
                        <div className="text-6xl mb-4">👥</div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">No Candidates</h3>
                        <p className="text-gray-600">No candidates have registered for this election yet</p>
                    </Card>
                )}

                {/* Candidate Detail Modal */}
                <Modal
                    isOpen={showDetailModal}
                    onClose={() => {
                        setShowDetailModal(false);
                        setSelectedCandidate(null);
                    }}
                    title="Candidate Details"
                    size="large"
                >
                    {selectedCandidate && (
                        <div className="space-y-6">
                            {/* Candidate Header */}
                            <div className="flex items-start gap-6">
                                <img
                                    src={selectedCandidate.profileImage}
                                    alt={selectedCandidate.candidateName}
                                    className="w-20 h-20 rounded-lg object-cover"
                                />
                                {selectedCandidate?.profilePhotoUrl && (
                                    <div className="flex-shrink-0">
                                        <img
                                            src={selectedCandidate.profilePhotoUrl}
                                            alt={selectedCandidate?.candidateName || 'Candidate'}
                                            className="w-32 h-32 rounded-lg object-cover border-2 border-gray-300"
                                        />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <h2 className="text-3xl font-bold text-gray-800">
                                        {selectedCandidate?.candidateName || 'Unknown Candidate'}
                                    </h2>

                                    <p className="text-lg text-gray-600 mt-2">{selectedCandidate?.party || 'N/A'}</p>
                                    <p className="text-lg text-gray-600 mt-2">{selectedCandidate?.description || 'N/A'}</p>
                                    <div className="mt-4 flex items-center gap-3">
                                        <span
                                            className={`px-4 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                                selectedCandidate?.status
                                            )}`}
                                        >
                                            {selectedCandidate?.status?.toUpperCase() || 'PENDING'}
                                        </span>
                                        <span className="text-sm text-gray-600">
                                            Applied on{' '}
                                            {selectedCandidate?.createdAt
                                                ? new Date(selectedCandidate.createdAt).toLocaleDateString()
                                                : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Candidate Information */}
                            <div className="border-t border-gray-200 pt-4">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">Personal Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-gray-600 font-medium text-sm">Name</p>
                                        <p className="text-gray-800 mt-1">{selectedCandidate?.candidateName || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 font-medium text-sm">Vote Count</p>
                                        <p className="text-gray-800 mt-1">{selectedCandidate?.voteCount || 'N/A'}</p>
                                    </div>

                                </div>
                            </div>

                            {/* Biography */}
                            {selectedCandidate?.biography && (
                                <div className="border-t border-gray-200 pt-4">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4">Biography</h3>
                                    <p className="text-gray-700 leading-relaxed">{selectedCandidate.biography}</p>
                                </div>
                            )}

                            {/* Platform */}
                            {selectedCandidate?.platform && (
                                <div className="border-t border-gray-200 pt-4">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4">Platform/Manifesto</h3>
                                    <p className="text-gray-700 leading-relaxed">{selectedCandidate.platform}</p>
                                </div>
                            )}

                            {/* Rejection Reason */}
                            {selectedCandidate?.status === 'rejected' &&
                                selectedCandidate?.rejectionReason && (
                                    <div className="border-t border-gray-200 pt-4">
                                        <h3 className="text-lg font-bold text-red-600 mb-4">Rejection Reason</h3>
                                        <p className="text-gray-700 leading-relaxed">
                                            {selectedCandidate.rejectionReason}
                                        </p>
                                    </div>
                                )}

                            {/* Action Buttons */}
                            <div className="border-t border-gray-200 pt-4 flex gap-3">
                                {selectedCandidate?.status === 'pending' && (
                                    <>
                                        <Button
                                            onClick={() =>
                                                handleApprovCandidate(selectedCandidate?._id)
                                            }
                                            loading={actionLoading}
                                            disabled={actionLoading}
                                            className="flex-1"
                                        >
                                            ✅ Approve Candidate
                                        </Button>
                                        <Button
                                            onClick={() =>
                                                handleRejectCandidate(selectedCandidate?._id)
                                            }
                                            variant="danger"
                                            loading={actionLoading}
                                            disabled={actionLoading}
                                            className="flex-1"
                                        >
                                            ❌ Reject Candidate
                                        </Button>
                                    </>
                                )}
                                <Button
                                    onClick={() => {
                                        setShowDetailModal(false);
                                        setSelectedCandidate(null);
                                    }}
                                    variant="secondary"
                                    className="flex-1"
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                    )}
                </Modal>
            </div>
        </MainLayout>
    );
}

function CandidateCard({ candidate, onViewDetails, statusColor }) {
    const candidateName = candidate?.candidateName || 'Unknown Candidate';
    const initials = candidateName
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase() || 'N/A';

    return (
        <Card className="border-l-4 border-blue-500 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                    {candidate?.profileImage ? (
                        <img
                            src={candidate.profileImage}
                            alt={candidateName}
                            className="w-20 h-20 rounded-lg object-cover"
                        />
                    ) : (
                        <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xl">
                            {initials}
                        </div>
                    )}
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800">{candidateName}</h3>
                        <p className="text-gray-600 mt-1">{candidate?.party || 'N/A'}</p>
                        <div className="flex items-center gap-3 mt-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                                {candidate?.status?.toUpperCase() || 'PENDING'}
                            </span>
                            {/* <span className="text-sm text-gray-500">
                                📧 {candidate?.party || 'N/A'}
                            </span> */}
                        </div>
                    </div>
                </div>
                <Button onClick={onViewDetails} variant="outline" className="!px-4">
                    View Details →
                </Button>
            </div>
        </Card>
    );
}
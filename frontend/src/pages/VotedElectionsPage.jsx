import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../utils/api';
import MainLayout from '../components/MainLayout';
import Card from '../components/Card';
import Loading from '../components/Loading';
import Alert from '../components/Alert';
import Modal from '../components/Modal';

export default function VotedElectionsPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [votedElections, setVotedElections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedElection, setSelectedElection] = useState(null);
    const [detailedView, setDetailedView] = useState(null);
    const [alert, setAlert] = useState(null);

    useEffect(() => {
        fetchVotedElections();
    }, []);

    const fetchVotedElections = async () => {
        try {
            const response = await userAPI.getVotedElections();
            setVotedElections(response.data.data || []);
        } catch (error) {
            setAlert({
                type: 'error',
                title: 'Error',
                message: error.response?.data?.message || 'Failed to load voted elections',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (electionId) => {
        try {
            const response = await userAPI.getVotedElectionDetails(electionId);
            setDetailedView(response.data.data);
        } catch (error) {
            setAlert({
                type: 'error',
                title: 'Error',
                message: 'Failed to load election details',
            });
        }
    };

    const closeDetailedView = () => {
        setDetailedView(null);
    };

    if (loading) return <Loading fullScreen />;

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-8 text-white shadow-lg">
                    <h1 className="text-4xl font-bold mb-2">🗳️ Your Voting History</h1>
                    <p className="text-purple-100 text-lg">View all elections you voted in and your choices</p>
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

                {/* Voted Elections List */}
                {votedElections.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                        {votedElections.map((election) => (
                            <Card
                                key={election.electionId}
                                className="hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => handleViewDetails(election.electionId)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                                            {election.electionTitle}
                                        </h3>
                                        <p className="text-gray-600 mb-3">
                                            {election.electionDescription}
                                        </p>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                                            <div>
                                                <p className="text-sm text-gray-500 font-medium">Total Votes</p>
                                                <p className="text-lg font-bold text-blue-600">
                                                    {election.totalVotes}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 font-medium">Candidates</p>
                                                <p className="text-lg font-bold text-green-600">
                                                    {election.candidates.length}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 font-medium">Vote Type</p>
                                                <p className="text-lg font-bold text-purple-600">
                                                    Participated
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 font-medium">Voted On</p>
                                                <p className="text-sm font-semibold text-gray-700">
                                                    {new Date(election.votedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Your Vote Display */}
                                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 mb-3">
                                            <p className="text-xs font-semibold text-gray-600 mb-2">YOUR VOTE:</p>
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-full bg-purple-200 flex items-center justify-center">
                                                    <span className="text-xl">✓</span>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-800">
                                                        {election.candidates.find(c => c.isVotedBy)?.candidateName || 'Unknown'}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {election.candidates.find(c => c.isVotedBy)?.party}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Election Dates */}
                                        <div className="flex gap-4 text-sm text-gray-500">
                                            <span>
                                                Start: {new Date(election.startDate).toLocaleDateString()}
                                            </span>
                                            <span>
                                                End: {new Date(election.endDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="ml-4 flex flex-col gap-2">
                                        <button
                                            onClick={() => handleViewDetails(election.electionId)}
                                            className="whitespace-nowrap px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                                        >
                                            View Details
                                        </button>
                                        <button
                                            onClick={() => {
                                                const data = `Receipt Code: ${election.receiptCode}`;
                                                navigator.clipboard.writeText(data);
                                                setAlert({
                                                    type: 'success',
                                                    title: 'Copied',
                                                    message: 'Receipt code copied to clipboard',
                                                });
                                            }}
                                            className="whitespace-nowrap px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold text-sm"
                                        >
                                            Copy Receipt
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100">
                        <div className="text-6xl mb-4">🗳️</div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">No Voting History</h3>
                        <p className="text-gray-600">You haven't voted in any elections yet</p>
                    </Card>
                )}
            </div>

            {/* Detailed View Modal */}
            {detailedView && (
                <Modal isOpen={!!detailedView} onClose={closeDetailedView}>
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 flex justify-between items-center sticky top-0">
                            <div>
                                <h2 className="text-2xl font-bold">{detailedView.electionTitle}</h2>
                                <p className="text-purple-100 mb-2">{detailedView.electionDescription}</p>
                                <p className="text-sm text-purple-200">Receipt: {detailedView.receiptCode}</p>
                            </div>
                            <button
                                onClick={closeDetailedView}
                                className="text-2xl hover:text-purple-100 transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6">
                            {/* Election Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 font-medium mb-1">Total Votes</p>
                                    <p className="text-2xl font-bold text-blue-600">{detailedView.totalVotes}</p>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 font-medium mb-1">Election Status</p>
                                    <p className="text-lg font-bold text-green-600">
                                        {detailedView.isActive ? 'Active' : 'Completed'}
                                    </p>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 font-medium mb-1">Voted On</p>
                                    <p className="text-sm font-semibold">
                                        {new Date(detailedView.votedAt).toLocaleString()}
                                    </p>
                                </div>
                                <div className="bg-orange-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 font-medium mb-1">Total Candidates</p>
                                    <p className="text-2xl font-bold text-orange-600">{detailedView.allCandidates.length}</p>
                                </div>
                            </div>

                            {/* Your Vote */}
                            {detailedView.yourVote && (
                                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 p-6 rounded-lg">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4">✓ Your Vote</h3>
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-full bg-purple-200 flex items-center justify-center text-3xl">
                                            ✓
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-gray-800 mb-1">
                                                {detailedView.yourVote.candidateName}
                                            </p>
                                            <p className="text-lg text-gray-600 mb-2">
                                                {detailedView.yourVote.party}
                                            </p>
                                            <p className="text-sm text-gray-500 mb-2">
                                                {detailedView.yourVote.description}
                                            </p>
                                            <div className="flex gap-4">
                                                <div>
                                                    <p className="text-xs text-gray-500">Total Votes Received</p>
                                                    <p className="text-xl font-bold text-purple-600">
                                                        {detailedView.yourVote.voteCount}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* All Candidates */}
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-4">All Candidates</h3>
                                <div className="grid grid-cols-1 gap-3">
                                    {detailedView.allCandidates.map((candidate) => (
                                        <div
                                            key={candidate.candidateId}
                                            className={`p-4 rounded-lg border-2 ${candidate.isYourVote
                                                    ? 'bg-purple-50 border-purple-400'
                                                    : 'bg-gray-50 border-gray-200'
                                                }`}
                                        >
                                            <div className="flex items-start gap-4">
                                                {candidate.profileImage && (
                                                    <img
                                                        src={candidate.profileImage}
                                                        alt={candidate.candidateName}
                                                        className="w-12 h-12 rounded-full object-cover"
                                                    />
                                                )}
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-bold text-gray-800 text-lg">
                                                                {candidate.candidateName}
                                                                {candidate.isYourVote && (
                                                                    <span className="ml-2 text-purple-600">✓</span>
                                                                )}
                                                            </p>
                                                            <p className="text-sm text-gray-600">{candidate.party}</p>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {candidate.description}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-xs text-gray-500 font-medium">Votes</p>
                                                            <p className="text-2xl font-bold text-gray-800">
                                                                {candidate.voteCount}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Close Button */}
                            <div className="flex gap-3 pt-4 border-t">
                                <button
                                    onClick={closeDetailedView}
                                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}
        </MainLayout>
    );
}

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { electionAPI, votingAPI } from '../utils/api';
import MainLayout from '../components/MainLayout';
import Card from '../components/Card';
import Button from '../components/Button';
import Loading from '../components/Loading';
import Alert from '../components/Alert';
import CandidateDetailsModal from '../components/CandidateDetailsModal';

export default function VotingPage() {
    const { electionId } = useParams();
    const navigate = useNavigate();
    const [election, setElection] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [selectedCandidateForModal, setSelectedCandidateForModal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [alert, setAlert] = useState(null);
    const [hasVoted, setHasVoted] = useState(false);
    const [voteReceipt, setVoteReceipt] = useState(null);

    useEffect(() => {
        fetchData();
    }, [electionId]);

    const fetchData = async () => {
        try {
            const electionResponse = await electionAPI.get(electionId);
            setElection(electionResponse.data.data);

            const candidatesResponse = await electionAPI.candidates(electionId);
            setCandidates(candidatesResponse.data.data || []);

            const hasVotedResponse = await votingAPI.hasVotedInElection(electionId);
            if (hasVotedResponse.data.data?.hasVoted) {
                setHasVoted(true);
                setAlert({
                    type: 'warning',
                    title: 'Already Voted',
                    message: 'You have already voted in this election',
                });
            }
        } catch (error) {
            setAlert({
                type: 'error',
                title: 'Error',
                message: error.response?.data?.message || 'Failed to load election',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleVote = async () => {
        if (!selectedCandidate) {
            setAlert({
                type: 'error',
                title: 'Selection Required',
                message: 'Please select a candidate',
            });
            return;
        }

        setSubmitting(true);
        try {
            const response = await votingAPI.voteInElection(electionId, selectedCandidate);

            // Show receipt before redirecting
            setVoteReceipt({
                receiptCode: response.data.data?.receiptCode,
                candidateName: candidates.find(c => c._id === selectedCandidate)?.candidateName || 'Unknown',
                election: election?.title,
            });

            setAlert({
                type: 'success',
                title: 'Vote Submitted',
                message: 'Your vote has been successfully recorded',
            });
        } catch (error) {
            setAlert({
                type: 'error',
                title: 'Vote Failed',
                message: error.response?.data?.message || 'Failed to submit vote',
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Loading fullScreen />;

    if (hasVoted) {
        return (
            <MainLayout>
                <Card className="text-center py-12">
                    <div className="text-6xl mb-4">✅</div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">You've Already Voted</h2>
                    <p className="text-gray-600 mb-6">Thank you for participating in this election</p>
                    <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
                </Card>
            </MainLayout>
        );
    }

    // Show receipt modal after voting
    if (voteReceipt) {
        return (
            <MainLayout>
                <div className="max-w-2xl mx-auto space-y-6">
                    {/* Receipt Card */}
                    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-500">
                        <div className="text-center space-y-6">
                            {/* Success Icon */}
                            <div className="text-6xl">✅</div>

                            {/* Success Message */}
                            <div>
                                <h1 className="text-4xl font-bold text-green-800 mb-2">Vote Recorded!</h1>
                                <p className="text-green-700">Your vote has been securely recorded and encrypted.</p>
                            </div>

                            {/* Receipt Details */}
                            <div className="bg-white rounded-lg p-6 border-2 border-green-200 text-left space-y-4">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">Receipt Code (save for verification)</p>
                                    <p className="text-2xl font-mono font-bold text-green-700 mt-1 break-all">{voteReceipt.receiptCode}</p>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(voteReceipt.receiptCode);
                                            alert('Receipt code copied!');
                                        }}
                                        className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                                    >
                                        📋 Copy Receipt Code
                                    </button>
                                </div>

                                <div className="border-t border-gray-200 pt-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-gray-600 text-sm">Election</p>
                                            <p className="font-semibold text-gray-800">{voteReceipt.election}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600 text-sm">Time</p>
                                            <p className="font-semibold text-gray-800">{new Date().toLocaleTimeString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Info Box */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-800">
                                    <strong>💡 Save your receipt code</strong> - You can use it later to verify your vote was counted correctly.
                                </p>
                            </div>

                            {/* Next Button */}
                            <Button
                                onClick={() => navigate('/dashboard')}
                                className="w-full text-lg py-3 mt-6"
                            >
                                Continue to Dashboard
                            </Button>
                        </div>
                    </Card>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Election Info */}
                <Card className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                    <h1 className="text-3xl font-bold mb-2">{election?.title}</h1>
                    <p className="text-blue-100">{election?.description}</p>
                </Card>

                {/* Alert */}
                {alert && (
                    <Alert
                        type={alert.type}
                        title={alert.title}
                        message={alert.message}
                        onClose={() => setAlert(null)}
                    />
                )}

                {/* Candidates Selection */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">🗳️ Select Your Candidate</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {candidates.map((candidate) => (
                            <CandidateOption
                                key={candidate._id}
                                candidate={candidate}
                                isSelected={selectedCandidate === candidate._id}
                                onSelect={() => setSelectedCandidate(candidate._id)}
                                onViewDetails={() => setSelectedCandidateForModal(candidate)}
                            />
                        ))}
                    </div>
                </div>

                {candidates.length === 0 && (
                    <Card className="text-center py-8">
                        <p className="text-gray-600">No candidates available for this election</p>
                    </Card>
                )}

                {/* Vote Button */}
                {candidates.length > 0 && (
                    <div className="flex gap-4">
                        <Button
                            onClick={handleVote}
                            loading={submitting}
                            disabled={!selectedCandidate || submitting}
                            className="flex-1 text-lg py-3"
                        >
                            Submit Vote
                        </Button>
                        <Button
                            onClick={() => navigate('/dashboard')}
                            variant="secondary"
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                    </div>
                )}
            </div>

            {/* Candidate Details Modal */}
            <CandidateDetailsModal
                isOpen={!!selectedCandidateForModal}
                onClose={() => setSelectedCandidateForModal(null)}
                candidate={selectedCandidateForModal}
                onVote={handleVote}
            />
        </MainLayout>
    );
}

function CandidateOption({ candidate, isSelected, onSelect, onViewDetails }) {
    return (
        <div
            className={`p-4 rounded-lg border-2 transition-all duration-200 ${isSelected
                ? 'border-blue-600 bg-blue-50 shadow-lg'
                : 'border-gray-300 hover:border-blue-400 bg-white hover:shadow-md'
                }`}
        >
            <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="flex-shrink-0">
                    {candidate.profileImage ? (
                        <img
                            src={candidate.profileImage}
                            alt={candidate.candidateName}
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-300"
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                            {(candidate.candidateName || candidate.partyName)?.charAt(0).toUpperCase() || 'I'}
                        </div>
                    )}
                </div>

                {/* Candidate Info */}
                <div className="flex-1">
                    <h3 className="font-bold text-gray-800">
                        {candidate.candidateName || candidate.partyName}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                        🏛️ {candidate.party || candidate.partyName}
                    </p>
                    {candidate.description && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                            {candidate.description}
                        </p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                            📊 {candidate.voteCount || 0} votes
                        </span>
                    </div>
                </div>

                {/* Selection Indicator */}
                {isSelected && (
                    <div className="text-2xl text-blue-600">✓</div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200">
                <button
                    onClick={onViewDetails}
                    className="flex-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 rounded transition"
                >
                    ℹ️ View Details
                </button>
                <button
                    onClick={onSelect}
                    className={`flex-1 px-3 py-2 text-sm rounded transition font-medium ${isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-blue-100 hover:bg-blue-200 text-blue-800'
                        }`}
                >
                    {isSelected ? '✓ Selected' : 'Select'}
                </button>
            </div>
        </div>
    );
}

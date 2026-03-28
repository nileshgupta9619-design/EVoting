import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { electionAPI, votingAPI } from '../utils/api';
import MainLayout from '../components/MainLayout';
import Card from '../components/Card';
import Button from '../components/Button';
import Loading from '../components/Loading';
import Alert from '../components/Alert';

export default function VotingPage() {
    const { electionId } = useParams();
    const navigate = useNavigate();
    const [election, setElection] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [alert, setAlert] = useState(null);
    const [hasVoted, setHasVoted] = useState(false);

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
            await votingAPI.voteInElection(electionId, selectedCandidate);
            setAlert({
                type: 'success',
                title: 'Vote Submitted',
                message: 'Your vote has been successfully recorded',
            });
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);
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
        </MainLayout>
    );
}

function CandidateOption({ candidate, isSelected, onSelect }) {
    return (
        <button
            onClick={onSelect}
            className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${isSelected
                    ? 'border-blue-600 bg-blue-50 shadow-lg'
                    : 'border-gray-300 hover:border-blue-400 bg-white hover:shadow-md'
                }`}
        >
            <div className="flex items-start">
                <div className="mr-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                        {candidate.partyName?.charAt(0).toUpperCase() || 'I'}
                    </div>
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-gray-800">{candidate.partyName || 'Independent'}</h3>
                    <p className="text-sm text-gray-600 mt-1">{candidate.bio?.substring(0, 100)}...</p>
                    {candidate.platform && (
                        <p className="text-sm text-blue-600 font-medium mt-2">Platform: {candidate.platform}</p>
                    )}
                </div>
                {isSelected && (
                    <div className="ml-2 text-2xl">✓</div>
                )}
            </div>
        </button>
    );
}

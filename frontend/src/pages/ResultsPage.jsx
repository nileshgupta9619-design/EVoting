import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { electionAPI, votingAPI } from '../utils/api';
import MainLayout from '../components/MainLayout';
import Card from '../components/Card';
import Button from '../components/Button';
import Loading from '../components/Loading';
import Alert from '../components/Alert';

export default function ResultsPage() {
    const { electionId } = useParams();
    const navigate = useNavigate();
    const [election, setElection] = useState(null);
    const [results, setResults] = useState(null);
    const [receipt, setReceipt] = useState(null);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);

    useEffect(() => {
        fetchData();
    }, [electionId]);

    const fetchData = async () => {
        try {
            const electionResponse = await electionAPI.get(electionId);
            setElection(electionResponse.data.data);

            const resultsResponse = await votingAPI.getElectionResults(electionId);
            // Backend returns: { election: {}, totalVotes: num, candidateCount: num, results: [] }
            setResults(resultsResponse.data.data);

            try {
                const receiptResponse = await votingAPI.getUserVoteReceipt(electionId);
                setReceipt(receiptResponse.data.data);
            } catch (error) {
                // User may not have voted
            }
        } catch (error) {
            setAlert({
                type: 'error',
                title: 'Error',
                message: 'Failed to load results',
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loading fullScreen />;

    // Extract data from results object
    const resultsArray = results?.results || [];
    const totalVotes = results?.totalVotes || 0;
    const maxVotes = resultsArray.length > 0 ? Math.max(...resultsArray.map((r) => r.voteCount || 0)) : 0;
    const winner = resultsArray.length > 0 ? resultsArray[0] : null;

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-8 text-white shadow-lg">
                    <h1 className="text-4xl font-bold mb-2">📊 Election Results</h1>
                    <p className="text-purple-100 text-lg">{election?.title}</p>
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

                {/* Vote Receipt */}
                {receipt && (
                    <Card className="border-l-4 border-green-500 bg-gradient-to-r from-green-50 to-emerald-50">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-green-800 mb-2">🎟️ Your Vote Receipt</h3>
                                <p className="text-green-700 mb-2">Receipt Code: <code className="bg-white px-3 py-1 rounded font-mono font-bold text-green-800">{receipt.receiptCode}</code></p>
                                <p className="text-green-700 text-sm">
                                    ✓ Your vote has been securely recorded. Use this receipt code to verify your vote.
                                </p>
                            </div>
                            <Button
                                onClick={() => navigate('/receipt')}
                                className="bg-green-600 hover:bg-green-700 text-white whitespace-nowrap ml-4"
                            >
                                View Receipt →
                            </Button>
                        </div>
                    </Card>
                )}

                {/* Election Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-gradient-to-br from-blue-50 to-cyan-50">
                        <p className="text-gray-600 font-medium text-sm mb-2">📅 Election Dates</p>
                        <p className="text-sm text-gray-700 mb-1">
                            Start: <span className="font-bold">{new Date(election?.startDate).toLocaleDateString()}</span>
                        </p>
                        <p className="text-sm text-gray-700">
                            End: <span className="font-bold">{new Date(election?.endDate).toLocaleDateString()}</span>
                        </p>
                    </Card>
                    <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
                        <p className="text-gray-600 font-medium text-sm mb-2">ℹ️ Election Info</p>
                        <p className="text-sm text-gray-700 mb-1">
                            Status: <span className="font-bold capitalize">{election?.isActive ? '🟢 Active' : '⚫ Completed'}</span>
                        </p>
                        <p className="text-sm text-gray-700">
                            Description: <span className="text-gray-600">{election?.description || 'N/A'}</span>
                        </p>
                    </Card>
                </div>

                {/* Results Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-l-4 border-blue-500">
                        <p className="text-gray-600 font-medium text-sm">Total Votes</p>
                        <p className="text-3xl font-bold text-blue-600 mt-1">{totalVotes}</p>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-l-4 border-green-500">
                        <p className="text-gray-600 font-medium text-sm">Candidates</p>
                        <p className="text-3xl font-bold text-green-600 mt-1">{results?.length || 0}</p>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-l-4 border-purple-500">
                        <p className="text-gray-600 font-medium text-sm">Leading Votes</p>
                        <p className="text-3xl font-bold text-purple-600 mt-1">{maxVotes}</p>
                    </Card>

                    <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-l-4 border-orange-500">
                        <p className="text-gray-600 font-medium text-sm">Vote Rate</p>
                        <p className="text-3xl font-bold text-orange-600 mt-1">
                            {resultsArray?.length > 0 ? (totalVotes / resultsArray.length).toFixed(0) : 0}
                        </p>
                    </Card>
                </div>

                {/* Winner Section */}
                {winner && (
                    <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300">
                        <div className="flex items-center gap-4">
                            <div className="text-6xl">🏆</div>
                            <div>
                                <p className="text-gray-600 font-medium text-sm">LEADING CANDIDATE</p>
                                <h3 className="text-3xl font-bold text-gray-800 mb-1">
                                    {winner?.name || 'Unknown'}
                                </h3>
                                <p className="text-gray-700 mb-2">
                                    Party: <span className="font-bold text-orange-600">{winner?.party || 'N/A'}</span>
                                </p>
                                <p className="text-lg text-gray-800">
                                    <span className="font-bold text-orange-600">{winner.voteCount}</span> votes
                                    <span className="text-gray-600 ml-2">({totalVotes > 0 ? ((winner.voteCount / totalVotes) * 100).toFixed(1) : 0}%)</span>
                                </p>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Results Chart */}
                <Card>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 Complete Vote Distribution</h2>

                    {resultsArray && resultsArray.length > 0 ? (
                        <div className="space-y-4">
                            {resultsArray
                                .sort((a, b) => b.voteCount - a.voteCount)
                                .map((result, index) => (
                                    <ResultBar
                                        key={result.id || index}
                                        rank={index + 1}
                                        candidate={result}
                                        votes={result.voteCount}
                                        maxVotes={maxVotes}
                                        percentage={totalVotes > 0 ? ((result.voteCount / totalVotes) * 100).toFixed(1) : 0}
                                        totalVotes={totalVotes}
                                    />
                                ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-600 py-12">No votes recorded yet</p>
                    )}
                </Card>

                {/* Navigation Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                        onClick={() => navigate('/dashboard')}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        ← Back to Dashboard
                    </Button>
                    <Button
                        onClick={() => navigate('/voted-elections')}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                        📋 View Voting History
                    </Button>
                    <Button
                        onClick={() => navigate('/receipt')}
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                        🎟️ View My Receipt
                    </Button>
                </div>
            </div>
        </MainLayout>
    );
}

function ResultBar({ rank, candidate, votes, maxVotes, percentage, totalVotes }) {
    const barWidthPercent = maxVotes > 0 ? (votes / maxVotes) * 100 : 0;
    const medals = ['🥇', '🥈', '🥉'];
    const candidateName = candidate.name || 'Unknown';
    const partyName = candidate.party || 'N/A';

    // Color gradient based on rank
    const gradients = [
        'from-yellow-500 to-orange-500',
        'from-gray-400 to-gray-500',
        'from-orange-600 to-amber-700',
        'from-blue-400 to-blue-600',
        'from-purple-400 to-pink-500'
    ];

    const gradient = gradients[rank - 1] || gradients[3];

    return (
        <div className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="space-y-3">
                {/* Header */}
                <div className="flex justify-between items-start gap-4">
                    <div className="flex items-start gap-3 flex-1">
                        <span className="text-3xl">{medals[rank - 1] || `#${rank}`}</span>
                        <div className="flex-1">
                            <h4 className="font-bold text-lg text-gray-800">{candidateName}</h4>
                            <p className="text-sm text-gray-600">{partyName}</p>
                        </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                        <p className="font-bold text-2xl text-gray-800">{votes}</p>
                        <p className="text-sm font-semibold text-gray-600">{percentage}%</p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                    <div className="w-full bg-gray-300 rounded-full h-4 overflow-hidden">
                        <div
                            className={`bg-gradient-to-r ${gradient} h-full rounded-full transition-all duration-500 shadow-md`}
                            style={{ width: `${barWidthPercent}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>{votes} out of {totalVotes} votes</span>
                        <span>{totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(2) : 0}% of total</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

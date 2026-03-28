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
            setResults(resultsResponse.data.data || []);

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

    const maxVotes = Math.max(...(results?.map((r) => r.voteCount) || [0]));
    const totalVotes = results?.reduce((sum, r) => sum + r.voteCount, 0) || 0;

    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Election Info */}
                <Card className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                    <h1 className="text-3xl font-bold mb-2">{election?.title} - Results</h1>
                    <p className="text-purple-100">Status: <span className="font-bold capitalize">{election?.status}</span></p>
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

                {/* Vote Receipt */}
                {receipt && (
                    <Card className="border-l-4 border-green-500 bg-green-50">
                        <h3 className="text-lg font-bold text-green-800 mb-2">🎟️ Your Vote Receipt</h3>
                        <p className="text-green-700">Receipt ID: <code className="bg-white px-2 py-1 rounded">{receipt.receiptId}</code></p>
                        <p className="text-green-700 mt-2 text-sm">
                            You can use this ID to verify your vote on the verification page
                        </p>
                    </Card>
                )}

                {/* Results Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-l-4 border-blue-500">
                        <p className="text-gray-600 font-medium">Total Votes</p>
                        <p className="text-4xl font-bold text-blue-600 mt-1">{totalVotes}</p>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-l-4 border-green-500">
                        <p className="text-gray-600 font-medium">Candidates</p>
                        <p className="text-4xl font-bold text-green-600 mt-1">{results?.length || 0}</p>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-l-4 border-purple-500">
                        <p className="text-gray-600 font-medium">Leading Votes</p>
                        <p className="text-4xl font-bold text-purple-600 mt-1">{maxVotes}</p>
                    </Card>
                </div>

                {/* Results Chart */}
                <Card>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Vote Distribution</h2>

                    {results && results.length > 0 ? (
                        <div className="space-y-4">
                            {results
                                .sort((a, b) => b.voteCount - a.voteCount)
                                .map((result, index) => (
                                    <ResultBar
                                        key={result._id || index}
                                        rank={index + 1}
                                        name={result.candidateProfile?.partyName || 'Unknown'}
                                        votes={result.voteCount}
                                        maxVotes={maxVotes}
                                        percentage={totalVotes > 0 ? ((result.voteCount / totalVotes) * 100).toFixed(1) : 0}
                                    />
                                ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-600 py-8">No votes recorded yet</p>
                    )}
                </Card>

                {/* Navigation */}
                <Button onClick={() => navigate('/dashboard')} variant="outline" className="w-full">
                    Back to Dashboard
                </Button>
            </div>
        </MainLayout>
    );
}

function ResultBar({ rank, name, votes, maxVotes, percentage }) {
    const barWidthPercent = (votes / maxVotes) * 100;
    const medals = ['🥇', '🥈', '🥉'];

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <span className="text-2xl">{medals[rank - 1] || `#${rank}`}</span>
                    <h4 className="font-bold text-gray-800">{name}</h4>
                </div>
                <div className="text-right">
                    <p className="font-bold text-lg text-gray-800">{votes} votes</p>
                    <p className="text-sm text-gray-600">{percentage}%</p>
                </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${barWidthPercent}%` }}
                ></div>
            </div>
        </div>
    );
}

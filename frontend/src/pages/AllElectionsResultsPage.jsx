import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { electionAPI } from '../utils/api';
import MainLayout from '../components/MainLayout';
import Card from '../components/Card';
import Button from '../components/Button';
import Loading from '../components/Loading';
import Alert from '../components/Alert';

export default function AllElectionsResultsPage() {
    const navigate = useNavigate();
    const [allResults, setAllResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);
    const [expandedElection, setExpandedElection] = useState(null);

    useEffect(() => {
        fetchAllResults();
    }, []);

    const fetchAllResults = async () => {
        try {
            const response = await electionAPI.getAllResults();
            setAllResults(response.data.data || []);
        } catch (error) {
            setAlert({
                type: 'error',
                title: 'Error',
                message: error.response?.data?.message || 'Failed to load election results',
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loading fullScreen />;

    const activeElectionsCount = allResults.filter(e => e.election.isActive).length;
    const completedElectionsCount = allResults.filter(e => !e.election.isActive).length;
    const totalVotesAllElections = allResults.reduce((sum, e) => sum + e.totalVotes, 0);

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg p-8 text-white shadow-lg">
                    <h1 className="text-4xl font-bold mb-2">📊 All Elections Results Dashboard</h1>
                    <p className="text-indigo-100 text-lg">Complete overview of all elections</p>
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

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-l-4 border-blue-500">
                        <p className="text-gray-600 font-medium text-sm">Total Elections</p>
                        <p className="text-4xl font-bold text-blue-600 mt-2">{allResults.length}</p>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-l-4 border-green-500">
                        <p className="text-gray-600 font-medium text-sm">Active Elections</p>
                        <p className="text-4xl font-bold text-green-600 mt-2">{activeElectionsCount}</p>
                    </Card>

                    <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-l-4 border-orange-500">
                        <p className="text-gray-600 font-medium text-sm">Completed Elections</p>
                        <p className="text-4xl font-bold text-orange-600 mt-2">{completedElectionsCount}</p>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-l-4 border-purple-500">
                        <p className="text-gray-600 font-medium text-sm">Total Votes Cast</p>
                        <p className="text-4xl font-bold text-purple-600 mt-2">{totalVotesAllElections.toLocaleString()}</p>
                    </Card>
                </div>

                {/* Elections List */}
                {allResults.length > 0 ? (
                    <div className="space-y-4">
                        {allResults.map((electionResult, index) => (
                            <Card
                                key={electionResult.election.id || index}
                                className="hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => setExpandedElection(
                                    expandedElection === index ? null : index
                                )}
                            >
                                {/* Election Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold text-gray-800 mb-1">
                                            {index + 1}. {electionResult.election.title}
                                        </h3>
                                        <p className="text-gray-600 text-sm">{electionResult.election.description}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`px-4 py-2 rounded-full font-semibold text-sm ${electionResult.election.isActive
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {electionResult.election.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Quick Stats */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 py-4 border-t border-b">
                                    <div className="text-center">
                                        <p className="text-sm text-gray-600">Total Votes</p>
                                        <p className="text-2xl font-bold text-gray-800">{electionResult.totalVotes}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm text-gray-600">Candidates</p>
                                        <p className="text-2xl font-bold text-gray-800">{electionResult.candidateCount}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm text-gray-600">Avg Votes/Candidate</p>
                                        <p className="text-2xl font-bold text-gray-800">
                                            {electionResult.candidateCount > 0
                                                ? (electionResult.totalVotes / electionResult.candidateCount).toFixed(0)
                                                : 0}
                                        </p>
                                    </div>
                                </div>

                                {/* Election Dates */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4 text-sm">
                                    <div>
                                        <p className="text-gray-600">Start Date</p>
                                        <p className="font-semibold text-gray-800">
                                            {new Date(electionResult.election.startDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">End Date</p>
                                        <p className="font-semibold text-gray-800">
                                            {new Date(electionResult.election.endDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                {/* Expanded Results */}
                                {expandedElection === index && (
                                    <div className="mt-6 pt-6 border-t">
                                        <h4 className="text-lg font-bold text-gray-800 mb-4">🗳️ Vote Distribution</h4>
                                        <div className="space-y-3">
                                            {electionResult.results.map((result, candIndex) => {
                                                const progressWidth = electionResult.totalVotes > 0
                                                    ? (result.voteCount / electionResult.totalVotes) * 100
                                                    : 0;

                                                const medals = ['🥇', '🥈', '🥉'];
                                                const gradients = [
                                                    'from-yellow-500 to-orange-500',
                                                    'from-gray-400 to-gray-500',
                                                    'from-orange-600 to-amber-700',
                                                    'from-blue-400 to-blue-600',
                                                    'from-purple-400 to-pink-500'
                                                ];
                                                const gradient = gradients[candIndex] || gradients[3];

                                                return (
                                                    <div key={result.id || candIndex} className="space-y-1">
                                                        <div className="flex justify-between items-center">
                                                            <div>
                                                                <span className="text-2xl mr-2">
                                                                    {medals[candIndex] || `#${candIndex + 1}`}
                                                                </span>
                                                                <span className="font-semibold text-gray-800">
                                                                    {result.name}
                                                                </span>
                                                                <span className="text-sm text-gray-600 ml-2">
                                                                    ({result.party})
                                                                </span>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className="font-bold text-gray-800">
                                                                    {result.voteCount}
                                                                </span>
                                                                <span className="text-gray-600 ml-2">
                                                                    {result.percentage}%
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
                                                            <div
                                                                className={`bg-gradient-to-r ${gradient} h-full rounded-full transition-all duration-500`}
                                                                style={{ width: `${progressWidth}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="mt-4 pt-4 border-t flex gap-2">
                                    <Button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/results/${electionResult.election.id}`);
                                        }}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        📊 Detailed Results
                                    </Button>
                                    <Button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setExpandedElection(
                                                expandedElection === index ? null : index
                                            );
                                        }}
                                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white"
                                    >
                                        {expandedElection === index ? 'Collapse' : 'View Results'}
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="text-center py-12">
                        <p className="text-4xl mb-4">📭</p>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">No Elections Found</h3>
                        <p className="text-gray-600">No elections with results are available at the moment.</p>
                    </Card>
                )}

                {/* Navigation Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                        onClick={() => navigate('/dashboard')}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        ← Back to Dashboard
                    </Button>
                    <Button
                        onClick={() => navigate('/elections')}
                        className="bg-green-600 hover:bg-green-700 text-white"
                    >
                        🗳️ View Active Elections
                    </Button>
                    <Button
                        onClick={() => navigate('/voted-elections')}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                        📋 My Voting History
                    </Button>
                </div>
            </div>
        </MainLayout>
    );
}

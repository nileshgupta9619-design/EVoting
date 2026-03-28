import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { electionAPI } from '../utils/api';
import MainLayout from '../components/MainLayout';
import Card from '../components/Card';
import Button from '../components/Button';
import Loading from '../components/Loading';
import Alert from '../components/Alert';

export default function ElectionsPage() {
    const navigate = useNavigate();
    const [elections, setElections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchElections();
    }, []);

    const fetchElections = async () => {
        try {
            const response = await electionAPI.list();
            setElections(response.data.data || []);
        } catch (error) {
            setAlert({
                type: 'error',
                title: 'Error',
                message: 'Failed to load elections',
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loading fullScreen />;

    const filteredElections =
        filter === 'all'
            ? elections
            : elections.filter((e) => e.status === filter);

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-8 text-white shadow-lg">
                    <h1 className="text-4xl font-bold mb-2">📋 All Elections</h1>
                    <p className="text-blue-100">Browse and participate in available elections</p>
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

                {/* Filter Tabs */}
                <div className="flex gap-3 flex-wrap">
                    {['all', 'upcoming', 'active', 'completed'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${filter === status
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                                }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Elections Grid */}
                {filteredElections.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredElections.map((election) => (
                            <ElectionCard
                                key={election._id}
                                election={election}
                                onVote={() => navigate(`/vote/${election._id}`)}
                                onResults={() => navigate(`/results/${election._id}`)}
                                onViewDetails={() => navigate(`/election/${election._id}`)}
                            />
                        ))}
                    </div>
                ) : (
                    <Card className="text-center py-12">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">No Elections Found</h3>
                        <p className="text-gray-600">No elections match your filter</p>
                    </Card>
                )}
            </div>
        </MainLayout>
    );
}

function ElectionCard({ election, onVote, onResults, onViewDetails }) {
    const startDate = new Date(election.startDate).toLocaleDateString();
    const endDate = new Date(election.endDate).toLocaleDateString();
    const daysRemaining = Math.ceil(
        (new Date(election.endDate) - new Date()) / (1000 * 60 * 60 * 24)
    );

    const statusBadgeColor = {
        active: 'bg-green-100 text-green-800',
        upcoming: 'bg-blue-100 text-blue-800',
        completed: 'bg-gray-100 text-gray-800',
    };

    return (
        <Card className="hover:shadow-xl transition-all duration-300 flex flex-col">
            {/* Status Badge */}
            <div className="flex items-start justify-between mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusBadgeColor[election.status]}`}>
                    {election.status.toUpperCase()}
                </span>
                {daysRemaining > 0 && election.status !== 'completed' && (
                    <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded">
                        {daysRemaining}d remaining
                    </span>
                )}
            </div>

            {/* Content */}
            <h3 className="text-xl font-bold text-gray-800 mb-2">{election.title}</h3>
            <p className="text-gray-600 text-sm mb-4 flex-1">{election.description}</p>

            {/* Details */}
            <div className="space-y-2 text-sm text-gray-600 mb-4 border-t pt-3">
                <p>
                    <span className="font-medium">📅 Start:</span> {startDate}
                </p>
                <p>
                    <span className="font-medium">📅 End:</span> {endDate}
                </p>
                <p>
                    <span className="font-medium">👥 Candidate Count:</span> {election.candidates?.length || 0}
                </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-auto">
                {election.status === 'active' && (
                    <>
                        <Button onClick={onVote} className="flex-1" size="sm">
                            Vote
                        </Button>
                        <Button onClick={onResults} variant="outline" className="flex-1" size="sm">
                            Results
                        </Button>
                    </>
                )}
                {election.status === 'completed' && (
                    <Button onClick={onResults} className="w-full" size="sm">
                        View Results
                    </Button>
                )}
                {election.status === 'upcoming' && (
                    <Button disabled className="w-full" size="sm">
                        Coming Soon
                    </Button>
                )}
            </div>
        </Card>
    );
}

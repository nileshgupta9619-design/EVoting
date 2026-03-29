import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { electionAPI } from '../utils/api';
import MainLayout from '../components/MainLayout';
import Card from '../components/Card';
import Button from '../components/Button';
import Loading from '../components/Loading';
import Alert from '../components/Alert';

export default function VotePage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [elections, setElections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);

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

    const getElectionStatus = (election) => {
        const now = new Date();
        const startDate = election.startDate ? new Date(election.startDate) : null;
        const endDate = election.endDate ? new Date(election.endDate) : null;

        if (!startDate || !endDate) {
            return 'draft';
        }

        if (now < startDate) {
            return 'upcoming';
        }

        if (now >= startDate && now <= endDate && election.isActive) {
            return 'active';
        }

        if (now > endDate || !election.isActive) {
            return 'completed';
        }

        return 'draft';
    };

    const activeElections = elections.filter((e) => getElectionStatus(e) === 'active');

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Welcome Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-8 text-white shadow-lg">
                    <h1 className="text-4xl font-bold mb-2">Welcome, {user?.fullName || user?.name}! 👋</h1>
                    <p className="text-blue-100 text-lg">Cast vote for the active Election</p>
                </div>

                {/* Alert Messages */}
                {alert && (
                    <Alert
                        type={alert.type}
                        title={alert.title}
                        message={alert.message}
                        onClose={() => setAlert(null)}
                    />
                )}

              

                {/* Active Elections */}
                {activeElections.length > 0 && (
                    <section>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">🗳️ Active Elections</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {activeElections.map((election) => (
                                <ElectionCard
                                    key={election._id}
                                    election={election}
                                    status="active"
                                    onVote={() => navigate(`/vote/${election._id}`)}
                                />
                            ))}
                        </div>
                    </section>
                )}


                {/* Empty State */}
                {elections.length === 0 && (
                    <Card className="text-center py-12">
                        <div className="text-6xl mb-4">🗳️</div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">No Elections Available</h3>
                        <p className="text-gray-600">Check back later for upcoming elections</p>
                    </Card>
                )}
            </div>

        </MainLayout>
    );
}

function ElectionCard({ election, status, onVote, onResults, disabled = false }) {
    const startDate = election.startDate ? new Date(election.startDate).toLocaleDateString() : 'Not set';
    const endDate = election.endDate ? new Date(election.endDate).toLocaleDateString() : 'Not set';

    return (
        <Card className="hover:shadow-xl transition-shadow duration-300">
            <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-800">{election.title}</h3>
                <p className="text-gray-600 text-sm mt-1">{election.description}</p>
            </div>

            <div className="space-y-2 text-sm text-gray-600 mb-6">
                <p>
                    <span className="font-medium">📅 Start:</span> {startDate}
                </p>
                <p>
                    <span className="font-medium">📅 End:</span> {endDate}
                </p>
                <p>
                    <span className="font-medium">👥 Candidates:</span> {election.candidates?.length || 0}
                </p>
            </div>

            {status === 'active' && (
                <Button onClick={onVote} className="w-full">
                    Vote Now
                </Button>
            )}
            {status === 'completed' && (
                <Button onClick={onResults} variant="outline" className="w-full">
                    View Results
                </Button>
            )}
            {status === 'upcoming' && (
                <Button disabled className="w-full lg:opacity-50">
                    Coming Soon
                </Button>
            )}
        </Card>
    );
}

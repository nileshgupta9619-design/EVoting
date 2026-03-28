import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { candidateProfileAPI, electionAPI } from '../utils/api';
import MainLayout from '../components/MainLayout';
import Card from '../components/Card';
import Button from '../components/Button';
import Loading from '../components/Loading';
import Alert from '../components/Alert';

export default function CandidateDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [elections, setElections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const profileResponse = await candidateProfileAPI.myProfile();
            setProfile(profileResponse.data.data);

            const electionsResponse = await electionAPI.list();
            setElections(electionsResponse.data.data || []);
        } catch (error) {
            if (error.response?.status === 404) {
                // No profile yet
                setAlert({
                    type: 'warning',
                    title: 'Incomplete Profile',
                    message: 'Please complete your candidate profile',
                });
            } else {
                setAlert({
                    type: 'error',
                    title: 'Error',
                    message: 'Failed to load data',
                });
            }
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

    const approvedElections = elections.filter(
        (e) => profile?.elections?.includes(e._id)
    );

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Welcome Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-8 text-white shadow-lg">
                    <h1 className="text-4xl font-bold mb-2">Welcome, {user?.fullName || user?.name}! 👨‍💼</h1>
                    <p className="text-indigo-100 text-lg">Your candidate dashboard</p>
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

                {!profile && (
                    <Card className="bg-yellow-50 border-l-4 border-yellow-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-yellow-900">Complete Your Profile</h3>
                                <p className="text-yellow-800 mt-1">
                                    You need to complete your candidate profile to participate in elections.
                                </p>
                            </div>
                            <Button onClick={() => navigate('/candidate/profile')} variant="primary">
                                Complete Now
                            </Button>
                        </div>
                    </Card>
                )}

                {profile && (
                    <>
                        {/* Profile Summary */}
                        <Card className="border-l-4 border-indigo-500">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold text-gray-800">{profile.candidateName}</h3>
                                    <p className="text-gray-700 font-medium">Party: {profile.party}</p>
                                    <p className="text-gray-600 mt-1">{profile.description}</p>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                                            {profile.status || 'pending'}
                                        </span>
                                    </div>
                                </div>
                                <Button
                                    onClick={() => navigate('/candidate/profile')}
                                    variant="outline"
                                    size="sm"
                                >
                                    Edit Profile
                                </Button>
                            </div>
                        </Card>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-l-4 border-blue-500">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 font-medium">Approved Elections</p>
                                        <p className="text-4xl font-bold text-blue-600 mt-1">{approvedElections.length}</p>
                                    </div>
                                    <div className="text-5xl">📋</div>
                                </div>
                            </Card>

                            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-l-4 border-green-500">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 font-medium">Profile Status</p>
                                        <p className="text-2xl font-bold text-green-600 mt-1 capitalize">{profile.status}</p>
                                    </div>
                                    <div className="text-5xl">✓</div>
                                </div>
                            </Card>

                            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-l-4 border-purple-500">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 font-medium">Total Elections</p>
                                        <p className="text-4xl font-bold text-purple-600 mt-1">{elections.length}</p>
                                    </div>
                                    <div className="text-5xl">🗳️</div>
                                </div>
                            </Card>
                        </div>

                        {/* Participating Elections */}
                        {approvedElections.length > 0 && (
                            <section>
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">📋 Approved Elections</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {approvedElections.map((election) => (
                                        <ElectionParticipationCard
                                            key={election._id}
                                            election={election}
                                            status={getElectionStatus(election)}
                                            onViewResults={() => navigate(`/candidate/results/${election._id}`)}
                                        />
                                    ))}
                                </div>
                            </section>
                        )}

                        {approvedElections.length === 0 && (
                            <Card className="text-center py-12">
                                <div className="text-6xl mb-4">🔍</div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">No Approved Elections</h3>
                                <p className="text-gray-600">Waiting for admin approval in elections</p>
                            </Card>
                        )}
                    </>
                )}
            </div>
        </MainLayout>
    );
}

function ElectionParticipationCard({ election, status, onViewResults }) {
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
                    <span className="font-medium">Status:</span>{' '}
                    <span className={`capitalize font-medium ${status === 'active' ? 'text-green-600' :
                        status === 'completed' ? 'text-blue-600' : 'text-gray-600'
                        }`}>
                        {status}
                    </span>
                </p>
            </div>

            <div className="flex gap-2">
                {status === 'completed' && (
                    <Button onClick={onViewResults} className="flex-1">
                        View Results
                    </Button>
                )}
                {status === 'active' && (
                    <Button disabled className="flex-1">
                        Voting In Progress
                    </Button>
                )}
                {status === 'upcoming' && (
                    <Button disabled className="flex-1">
                        Coming Soon
                    </Button>
                )}
            </div>
        </Card>
    );
}

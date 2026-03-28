import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminAPI, electionAPI } from '../utils/api';
import MainLayout from '../components/MainLayout';
import Card from '../components/Card';
import Button from '../components/Button';
import Loading from '../components/Loading';
import Alert from '../components/Alert';

export default function AdminDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalUsers: 0,
        pendingRegistrations: 0,
        totalElections: 0,
        activeElections: 0,
        totalVotes: 0,
    });
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);
    const [recentUsers, setRecentUsers] = useState([]);
    const [recentElections, setRecentElections] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Fetch users
            const usersResponse = await adminAPI.getUsers();
            const allUsers = usersResponse.data.data || [];

            // Fetch pending registrations
            const pendingResponse = await adminAPI.getPendingRegistrations();
            const pending = pendingResponse.data.data || [];

            // Fetch elections
            const electionsResponse = await electionAPI.list();
            const allElections = electionsResponse.data.data || [];
            const activeElections = allElections.filter((e) => e.status === 'active');

            // Calculate stats
            const totalVotes = allElections.reduce((sum, e) => {
                return sum + (e.candidates?.reduce((s, c) => s + (c.voteCount || 0), 0) || 0);
            }, 0);

            setStats({
                totalUsers: allUsers.length,
                pendingRegistrations: pending.length,
                totalElections: allElections.length,
                activeElections: activeElections.length,
                totalVotes: totalVotes,
            });

            setRecentUsers(allUsers.slice(-5).reverse());
            setRecentElections(allElections.slice(-5).reverse());
        } catch (error) {
            setAlert({
                type: 'error',
                title: 'Error',
                message: 'Failed to load dashboard data',
            });
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loading fullScreen />;

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Welcome Header */}
                <div className="bg-gradient-to-r from-gradient-1 via-gradient-2 to-gradient-3 rounded-lg p-8 text-white shadow-lg bg-gradient-to-r from-red-600 to-orange-600">
                    <h1 className="text-4xl font-bold mb-2">Admin Dashboard 👨‍💼</h1>
                    <p className="text-red-100 text-lg">System Overview & Management</p>
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

                {/* Key Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <StatCard
                        label="Total Users"
                        value={stats.totalUsers}
                        icon="👥"
                        color="bg-blue-50"
                        borderColor="border-blue-500"
                    />
                    <StatCard
                        label="Pending Approvals"
                        value={stats.pendingRegistrations}
                        icon="⏳"
                        color="bg-yellow-50"
                        borderColor="border-yellow-500"
                    />
                    <StatCard
                        label="Total Elections"
                        value={stats.totalElections}
                        icon="📋"
                        color="bg-green-50"
                        borderColor="border-green-500"
                    />
                    <StatCard
                        label="Active Elections"
                        value={stats.activeElections}
                        icon="🔴"
                        color="bg-purple-50"
                        borderColor="border-purple-500"
                    />
                    <StatCard
                        label="Total Votes"
                        value={stats.totalVotes}
                        icon="🗳️"
                        color="bg-pink-50"
                        borderColor="border-pink-500"
                    />
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <ActionCard
                        title="👥 Manage Users"
                        description="Approve or reject user registrations"
                        onClick={() => navigate('/admin/users')}
                    />
                    <ActionCard
                        title="👨‍💼 Manage Candidates"
                        description="Review and approve candidate profiles"
                        onClick={() => navigate('/admin/candidates')}
                    />
                    <ActionCard
                        title="📋 Manage Elections"
                        description="Create and manage elections"
                        onClick={() => navigate('/admin/elections')}
                    />
                    <ActionCard
                        title="📊 View Reports"
                        description="Generate and view system reports"
                        onClick={() => navigate('/admin/reports')}
                    />
                </div>

                {/* Recent Data */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Users */}
                    <Card>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-800">Recent Users</h3>
                            <Button
                                onClick={() => navigate('/admin/users')}
                                variant="ghost"
                                size="sm"
                            >
                                View All →
                            </Button>
                        </div>
                        {recentUsers.length > 0 ? (
                            <div className="space-y-3">
                                {recentUsers.map((user) => (
                                    <div key={user._id} className="flex items-center justify-between p-3 border-b last:border-b-0">
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-800">{user.name}</p>
                                            <p className="text-sm text-gray-600">{user.email}</p>
                                        </div>
                                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${user.approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {user.approved ? 'Approved' : 'Pending'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-600 text-center py-4">No users yet</p>
                        )}
                    </Card>

                    {/* Recent Elections */}
                    <Card>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-800">Recent Elections</h3>
                            <Button
                                onClick={() => navigate('/admin/elections')}
                                variant="ghost"
                                size="sm"
                            >
                                View All →
                            </Button>
                        </div>
                        {recentElections.length > 0 ? (
                            <div className="space-y-3">
                                {recentElections.map((election) => (
                                    <div key={election._id} className="flex items-center justify-between p-3 border-b last:border-b-0">
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-800">{election.title}</p>
                                            <p className="text-sm text-gray-600">{election.candidates?.length || 0} candidates</p>
                                        </div>
                                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${election.status === 'active' ? 'bg-green-100 text-green-800' :
                                                election.status === 'upcoming' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {election.status.toUpperCase()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-600 text-center py-4">No elections yet</p>
                        )}
                    </Card>
                </div>
            </div>
        </MainLayout>
    );
}

function StatCard({ label, value, icon, color, borderColor }) {
    return (
        <Card className={`${color} border-l-4 ${borderColor}`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-600 font-medium text-sm">{label}</p>
                    <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
                </div>
                <div className="text-4xl">{icon}</div>
            </div>
        </Card>
    );
}

function ActionCard({ title, description, onClick }) {
    return (
        <Card
            onClick={onClick}
            className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
        >
            <h4 className="font-bold text-lg text-gray-800 mb-2">{title}</h4>
            <p className="text-gray-600 text-sm mb-4">{description}</p>
            <Button size="sm" variant="ghost" className="text-blue-600">
                Go →
            </Button>
        </Card>
    );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { clearAdmin } from '../store/adminSlice';
import { api, votingAPI } from '../utils/api';
// C: \Users\yg497\OneDrive\Desktop\EVOTING\frontend\src\pages\AdminDashboard.jsx
const AdminDashboard = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { admin, token } = useSelector((state) => state.admin);

    const [activeTab, setActiveTab] = useState('overview');
    const [candidates, setCandidates] = useState([]);
    const [users, setUsers] = useState([]);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalCandidates: 0,
        totalVotes: 0,
        emailVerified: 0,
    });

    // Redirect if not admin
    useEffect(() => {
        if (!token) {
            navigate('/admin/login');
        }
    }, [token, navigate]);

    // Fetch dashboard data
    useEffect(() => {
        if (token) {
            fetchDashboardData();
        }
    }, [token]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Fetch candidates
            const candidatesRes = await votingAPI.getCandidates();
            const candidatesData = candidatesRes.data?.candidates || [];
            setCandidates(candidatesData);

            // Fetch users
            const usersRes = await api.get('/admin/users');
            console.log("usersRes", usersRes);
            
            const usersData = usersRes.data?.users || [];
            setUsers(usersData);

            // Fetch results
            const resultsRes = await votingAPI.getResults();
            const resultsData = resultsRes.data?.results || [];
            setResults(resultsData);

            // Calculate stats
            setStats({
                totalUsers: usersData.length,
                totalCandidates: candidatesData.length,
                totalVotes: resultsData.reduce((sum, r) => sum + (r.voteCount || 0), 0),
                emailVerified: usersData.filter(u => u.isEmailVerified).length,
            });
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        dispatch(clearAdmin());
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
            {/* Header */}
            <header className="bg-slate-800/80 backdrop-blur-xl border-b border-purple-500/20 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">E-Voting Admin</h1>
                            <p className="text-purple-300 text-xs">Control Panel</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-6">
                        <div className="hidden sm:block text-right">
                            <p className="text-white font-medium">{admin?.email}</p>
                            <p className="text-purple-300 text-xs">Administrator</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition border border-red-500/50"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[
                        { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: 'from-blue-500 to-blue-600' },
                        { label: 'Verified Users', value: stats.emailVerified, icon: '✓', color: 'from-green-500 to-green-600' },
                        { label: 'Candidates', value: stats.totalCandidates, icon: '🗳️', color: 'from-purple-500 to-purple-600' },
                        { label: 'Total Votes', value: stats.totalVotes, icon: '📊', color: 'from-orange-500 to-orange-600' },
                    ].map((stat, idx) => (
                        <div key={idx} className="bg-slate-700/50 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6 hover:border-purple-500/40 transition">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-300 text-sm font-medium mb-1">{stat.label}</p>
                                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                                </div>
                                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center text-2xl`}>
                                    {stat.icon}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="bg-slate-700/50 backdrop-blur-xl border border-purple-500/20 rounded-xl overflow-hidden">
                    {/* Tab Navigation */}
                    <div className="flex border-b border-purple-500/20">
                        {['overview', 'candidates', 'users', 'results'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-4 px-6 font-medium capitalize transition text-center ${activeTab === tab
                                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white border-b-2 border-purple-400'
                                        : 'text-purple-300 hover:text-purple-100'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin">
                                    <svg className="w-12 h-12 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Overview Tab */}
                                {activeTab === 'overview' && (
                                    <div className="space-y-6">
                                        <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            {/* <div className="bg-slate-600/50 p-6 rounded-lg border border-purple-500/20">
                                                <h3 className="text-lg font-semibold text-white mb-4">System Status</h3>
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-purple-300">Database</span>
                                                        <span className="text-green-400 font-semibold">✓ Connected</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-purple-300">Email Service</span>
                                                        <span className="text-green-400 font-semibold">✓ Active</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-purple-300">API Server</span>
                                                        <span className="text-green-400 font-semibold">✓ Running</span>
                                                    </div>
                                                </div>
                                            </div> */}
                                            <div className="bg-slate-600/50 p-6 rounded-lg border border-purple-500/20">
                                                <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                                                <div className="space-y-2">
                                                    <button onClick={() => setActiveTab('candidates')} className="w-full text-left px-4 py-2 bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 rounded transition">
                                                        + Add New Candidate
                                                    </button>
                                                    <button onClick={() => setActiveTab('users')} className="w-full text-left px-4 py-2 bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 rounded transition">
                                                        View All Users
                                                    </button>
                                                    <button onClick={() => setActiveTab('results')} className="w-full text-left px-4 py-2 bg-green-600/30 hover:bg-green-600/50 text-green-200 rounded transition">
                                                        View Results
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Candidates Tab */}
                                {activeTab === 'candidates' && (
                                    <div>
                                        <div className="flex justify-between items-center mb-6">
                                            <h2 className="text-2xl font-bold text-white">Manage Candidates</h2>
                                            <button className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition">
                                                + Add Candidate
                                            </button>
                                        </div>
                                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {candidates.map((candidate) => (
                                                <div key={candidate._id} className="bg-slate-600/50 p-6 rounded-lg border border-purple-500/20 hover:border-purple-500/40 transition">
                                                    <h3 className="text-lg font-semibold text-white mb-2">{candidate.name}</h3>
                                                    <p className="text-purple-300 text-sm mb-4">{candidate.party}</p>
                                                    <p className="text-slate-300 text-xs mb-6 line-clamp-3">{candidate.description}</p>
                                                    <div className="flex gap-2">
                                                        <button className="flex-1 px-3 py-2 bg-blue-600/50 hover:bg-blue-600/70 text-blue-200 rounded text-sm transition">
                                                            Edit
                                                        </button>
                                                        <button className="flex-1 px-3 py-2 bg-red-600/50 hover:bg-red-600/70 text-red-200 rounded text-sm transition">
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Users Tab */}
                                {activeTab === 'users' && (
                                    <div>
                                        <h2 className="text-2xl font-bold text-white mb-6">Registered Users</h2>
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b border-purple-500/20">
                                                        <th className="px-6 py-3 text-left text-purple-300 font-semibold">Name</th>
                                                        <th className="px-6 py-3 text-left text-purple-300 font-semibold">Email</th>
                                                        <th className="px-6 py-3 text-left text-purple-300 font-semibold">Phone</th>
                                                        <th className="px-6 py-3 text-left text-purple-300 font-semibold">Verified</th>
                                                        <th className="px-6 py-3 text-left text-purple-300 font-semibold">Voted</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {users.map((user) => (
                                                        <tr key={user._id} className="border-b border-purple-500/10 hover:bg-purple-600/10 transition">
                                                            <td className="px-6 py-4 text-white">{user.fullName}</td>
                                                            <td className="px-6 py-4 text-purple-300">{user.email}</td>
                                                            <td className="px-6 py-4 text-slate-300">{user.phone}</td>
                                                            <td className="px-6 py-4">
                                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.isEmailVerified ? 'bg-green-500/30 text-green-300' : 'bg-red-500/30 text-red-300'}`}>
                                                                    {user.isEmailVerified ? '✓ Yes' : '✗ No'}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.hasVoted ? 'bg-blue-500/30 text-blue-300' : 'bg-slate-500/30 text-slate-300'}`}>
                                                                    {user.hasVoted ? '✓ Yes' : '✗ No'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Results Tab */}
                                {activeTab === 'results' && (
                                    <div>
                                        <h2 className="text-2xl font-bold text-white mb-6">Voting Results</h2>
                                        <div className="space-y-4">
                                            {results.map((result, idx) => (
                                                <div key={idx} className="bg-slate-600/50 p-6 rounded-lg border border-purple-500/20">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <h3 className="text-lg font-semibold text-white">{result.name}</h3>
                                                        <span className="text-2xl font-bold text-purple-400">
                                                            {result.voteCount} votes
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
                                                        <div
                                                            className="bg-gradient-to-r from-purple-500 to-blue-500 h-full rounded-full transition-all duration-500"
                                                            style={{ width: `${result.percentage}%` }}
                                                        ></div>
                                                    </div>
                                                    <p className="text-purple-300 text-sm mt-2">
                                                        {result.percentage}% of total votes
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { clearAdmin } from '../store/adminSlice';
import { api, votingAPI, candidateProfileAPI, electionAPI, adminAPI } from '../utils/api';
// C: \Users\yg497\OneDrive\Desktop\EVOTING\frontend\src\pages\AdminDashboard.jsx
const AdminDashboard = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { admin, token } = useSelector((state) => state.admin);

    const [activeTab, setActiveTab] = useState('overview');
    const [candidates, setCandidates] = useState([]);
    const [pendingProfiles, setPendingProfiles] = useState([]);
    const [pendingRegistrations, setPendingRegistrations] = useState([]);
    const [users, setUsers] = useState([]);
    const [results, setResults] = useState([]);
    const [elections, setElections] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalCandidates: 0,
        totalVotes: 0,
        emailVerified: 0,
        pendingRegistrations: 0,
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
            // Fetch pending registrations
            const pendingRegRes = await adminAPI.getPendingRegistrations();
            const pendingRegData = pendingRegRes.data?.users || [];
            setPendingRegistrations(pendingRegData);

            // Fetch candidates (approved profiles)
            // Use approved candidate profiles for each election
            const candidatesRes = await candidateProfileAPI.approved();
            const candidatesData = candidatesRes.data?.profiles || [];
            setCandidates(candidatesData);

            // Fetch pending candidate profiles
            const pendingRes = await candidateProfileAPI.pending();
            const pendingData = pendingRes.data?.profiles || [];
            setPendingProfiles(pendingData);

            // Fetch users
            const usersRes = await adminAPI.getUsers();
            const usersData = usersRes.data?.users || [];
            setUsers(usersData);

            // Fetch elections
            const electionsRes = await electionAPI.list();
            const electionsData = electionsRes.data?.elections || [];
            setElections(electionsData);

            // Fetch results (legacy)
            const resultsRes = await votingAPI.getResultsLegacy();
            const resultsData = resultsRes.data?.results || [];
            setResults(resultsData);

            // Fetch logs
            const logsRes = await adminAPI.getLogs();
            const logsData = logsRes.data?.logs || [];
            setLogs(logsData);

            // Calculate stats
            setStats({
                totalUsers: usersData.length,
                totalCandidates: candidatesData.length,
                totalVotes: resultsData.reduce((sum, r) => sum + (r.voteCount || 0), 0),
                emailVerified: usersData.filter(u => u.isEmailVerified).length,
                pendingRegistrations: pendingRegData.length,
            });
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const approveProfile = async (profileId) => {
        try {
            await candidateProfileAPI.approve(profileId);
            fetchDashboardData();
        } catch (err) {
            console.error(err);
            alert('Failed to approve profile');
        }
    };

    const rejectProfile = async (profileId) => {
        try {
            const reason = window.prompt('Reason for rejection:');
            if (!reason) return;
            await candidateProfileAPI.reject(profileId, { rejectionReason: reason });
            fetchDashboardData();
        } catch (err) {
            console.error(err);
            alert('Failed to reject profile');
        }
    };

    const startElection = async (id) => {
        try {
            await electionAPI.start(id);
            fetchDashboardData();
        } catch (err) {
            console.error(err);
            alert('Failed to start election');
        }
    };

    const stopElection = async (id) => {
        try {
            await electionAPI.stop(id);
            fetchDashboardData();
        } catch (err) {
            console.error(err);
            alert('Failed to stop election');
        }
    };

    const approveUser = async (userId) => {
        try {
            await adminAPI.approveUser(userId);
            fetchDashboardData();
        } catch (err) {
            console.error(err);
            alert('Failed to approve user');
        }
    };

    const assignElection = async (userId) => {
        try {
            const electionId = window.prompt('Enter election id to assign:');
            if (!electionId) return;
            await adminAPI.assignElectionToUser(userId, { electionId });
            fetchDashboardData();
        } catch (err) {
            console.error(err);
            alert('Failed to assign election');
        }
    };

    const approveRegistration = async (userId) => {
        try {
            await adminAPI.approveRegistration(userId);
            alert('Registration approved successfully');
            fetchDashboardData();
        } catch (err) {
            console.error(err);
            alert('Failed to approve registration');
        }
    };

    const rejectRegistration = async (userId) => {
        try {
            const reason = window.prompt('Reason for rejection:');
            if (!reason) return;
            await adminAPI.rejectRegistration(userId, { reason });
            alert('Registration rejected successfully');
            fetchDashboardData();
        } catch (err) {
            console.error(err);
            alert('Failed to reject registration');
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                    {[
                        { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: 'from-blue-500 to-blue-600' },
                        { label: 'Pending Registrations', value: stats.pendingRegistrations, icon: '⏳', color: 'from-yellow-500 to-yellow-600' },
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
                    <div className="flex border-b border-purple-500/20 overflow-x-auto">
                        {['overview', 'registrations', 'candidates', 'requests', 'users', 'elections', 'results', 'reports', 'monitoring', 'logs'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`py-4 px-6 font-medium capitalize transition text-center whitespace-nowrap ${activeTab === tab
                                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white border-b-2 border-purple-400'
                                    : 'text-purple-300 hover:text-purple-100'
                                    }`}
                            >
                                {tab === 'registrations' ? `Registrations (${stats.pendingRegistrations})` : tab}
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
                                                    <button onClick={() => setActiveTab('registrations')} className="w-full text-left px-4 py-2 bg-yellow-600/30 hover:bg-yellow-600/50 text-yellow-200 rounded transition">
                                                        👤 Review Pending Registrations
                                                    </button>
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

                                {/* Pending Registrations Tab */}
                                {activeTab === 'registrations' && (
                                    <div>
                                        <h2 className="text-2xl font-bold text-white mb-6">Pending User Registrations</h2>
                                        {pendingRegistrations.length === 0 ? (
                                            <div className="text-center py-12">
                                                <p className="text-slate-300 text-lg">No pending registrations</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {pendingRegistrations.map((user) => (
                                                    <div key={user._id} className="bg-slate-600/50 border border-purple-500/20 rounded-lg overflow-hidden">
                                                        <div className="p-6">
                                                            <div className="grid md:grid-cols-2 gap-6">
                                                                {/* User Info */}
                                                                <div>
                                                                    <h3 className="text-lg font-semibold text-white mb-3">User Information</h3>
                                                                    <div className="space-y-2 text-sm">
                                                                        <div>
                                                                            <span className="text-purple-300">Name:</span>
                                                                            <span className="ml-2 text-white">{user.fullName}</span>
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-purple-300">Email:</span>
                                                                            <span className="ml-2 text-white">{user.email}</span>
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-purple-300">Phone:</span>
                                                                            <span className="ml-2 text-white">{user.phone}</span>
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-purple-300">Email Verified:</span>
                                                                            <span className={`ml-2 font-semibold ${user.isEmailVerified ? 'text-green-400' : 'text-red-400'}`}>
                                                                                {user.isEmailVerified ? '✓ Yes' : '✗ No'}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Government ID Info */}
                                                                <div>
                                                                    <h3 className="text-lg font-semibold text-white mb-3">Government ID</h3>
                                                                    <div className="space-y-2 text-sm">
                                                                        <div>
                                                                            <span className="text-purple-300">ID Type:</span>
                                                                            <span className="ml-2 text-white capitalize">{user.governmentIdType}</span>
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-purple-300">ID Number:</span>
                                                                            <span className="ml-2 text-white">{user.governmentIdNumber}</span>
                                                                        </div>
                                                                        <div className="mt-4">
                                                                            <p className="text-purple-300 text-xs mb-2">ID Document:</p>
                                                                            {user.governmentIdDocument && (
                                                                                <div className="border border-purple-500/30 rounded p-2 bg-slate-700/40">
                                                                                    {user.governmentIdDocument.startsWith('data:') ? (
                                                                                        <img
                                                                                            src={user.governmentIdDocument}
                                                                                            alt="ID Document"
                                                                                            className="w-full h-32 object-cover rounded"
                                                                                        />
                                                                                    ) : (
                                                                                        <a href={user.governmentIdDocument} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                                                                                            View Document
                                                                                        </a>
                                                                                    )}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Action Buttons */}
                                                            <div className="mt-6 flex gap-3 pt-4 border-t border-purple-500/20">
                                                                <button
                                                                    onClick={() => approveRegistration(user._id)}
                                                                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg transition"
                                                                >
                                                                    ✓ Approve Registration
                                                                </button>
                                                                <button
                                                                    onClick={() => rejectRegistration(user._id)}
                                                                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-lg transition"
                                                                >
                                                                    ✗ Reject Registration
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
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

                                {/* Requests Tab */}
                                {activeTab === 'requests' && (
                                    <div>
                                        <div className="flex justify-between items-center mb-6">
                                            <h2 className="text-2xl font-bold text-white">Pending Candidate Requests</h2>
                                        </div>
                                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {pendingProfiles.map((p) => (
                                                <div key={p._id} className="bg-slate-600/50 p-6 rounded-lg border border-purple-500/20">
                                                    <h3 className="text-lg font-semibold text-white mb-2">{p.candidateName}</h3>
                                                    <p className="text-purple-300 text-sm mb-2">Party: {p.party}</p>
                                                    <p className="text-slate-300 text-xs mb-4">Submitted by: {p.userId?.fullName} ({p.userId?.email})</p>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => approveProfile(p._id)} className="flex-1 px-3 py-2 bg-green-600/50 hover:bg-green-600/70 text-green-200 rounded text-sm transition">Approve</button>
                                                        <button onClick={() => rejectProfile(p._id)} className="flex-1 px-3 py-2 bg-red-600/50 hover:bg-red-600/70 text-red-200 rounded text-sm transition">Reject</button>
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
                                                            <td className="px-6 py-4">
                                                                {!user.isApproved ? (
                                                                    <button onClick={() => approveUser(user._id)} className="px-3 py-1 bg-green-600/40 text-green-200 rounded text-sm">Approve</button>
                                                                ) : (
                                                                    <button onClick={() => assignElection(user._id)} className="px-3 py-1 bg-blue-600/40 text-blue-200 rounded text-sm">Assign Election</button>
                                                                )}
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

                                {/* Elections Tab */}
                                {activeTab === 'elections' && (
                                    <div>
                                        <h2 className="text-2xl font-bold text-white mb-6">Elections</h2>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            {elections.map((el) => (
                                                <div key={el._id} className="bg-slate-600/50 p-4 rounded-lg border border-purple-500/20">
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <h3 className="text-white font-semibold">{el.title}</h3>
                                                            <p className="text-purple-300 text-sm">{el.description}</p>
                                                        </div>
                                                        <div className="space-x-2">
                                                            <span className={`px-3 py-1 rounded-full text-sm ${el.isActive ? 'bg-green-600/30 text-green-200' : 'bg-red-600/30 text-red-200'}`}>{el.isActive ? 'Active' : 'Inactive'}</span>
                                                            {el.isActive ? (
                                                                <button onClick={() => stopElection(el._id)} className="px-4 py-2 bg-red-600/40 text-red-200 rounded">Stop</button>
                                                            ) : (
                                                                <button onClick={() => startElection(el._id)} className="px-4 py-2 bg-green-600/40 text-green-200 rounded">Start</button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Logs Tab */}
                                {activeTab === 'logs' && (
                                    <div>
                                        <h2 className="text-2xl font-bold text-white mb-6">Audit Logs</h2>
                                        <div className="space-y-3">
                                            {logs.map((log) => (
                                                <div key={log._id} className="bg-slate-600/50 p-3 rounded border border-purple-500/10">
                                                    <div className="flex justify-between">
                                                        <div>
                                                            <p className="text-white font-medium">{log.action}</p>
                                                            <p className="text-purple-300 text-sm">By: {log.adminId?.fullName} ({log.adminId?.email})</p>
                                                        </div>
                                                        <div className="text-sm text-slate-300">{new Date(log.createdAt).toLocaleString()}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Reports Tab */}
                                {activeTab === 'reports' && (
                                    <div>
                                        <h2 className="text-2xl font-bold text-white mb-6">Election Reports</h2>
                                        <ReportsTab elections={elections} />
                                    </div>
                                )}

                                {/* Monitoring Tab */}
                                {activeTab === 'monitoring' && (
                                    <div>
                                        <h2 className="text-2xl font-bold text-white mb-6">Real-Time Monitoring</h2>
                                        <MonitoringTab elections={elections} />
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

// Reports Tab Component
const ReportsTab = ({ elections }) => {
    const [selectedElection, setSelectedElection] = useState(null);
    const [reportData, setReportData] = useState(null);
    const [systemStats, setSystemStats] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchElectionReport = async (electionId) => {
        setLoading(true);
        try {
            const response = await adminAPI.getElectionReports(electionId);
            setReportData(response.data);
            setSelectedElection(electionId);
        } catch (error) {
            console.error('Failed to load report:', error);
            alert('Failed to load report');
        } finally {
            setLoading(false);
        }
    };

    const fetchSystemStats = async () => {
        setLoading(true);
        try {
            const response = await adminAPI.getSystemStatistics();
            setSystemStats(response.data.statistics);
            setReportData(null);
            setSelectedElection(null);
        } catch (error) {
            console.error('Failed to load system stats:', error);
            alert('Failed to load statistics');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <p className="text-slate-300">Loading...</p>;

    return (
        <div className="space-y-6">
            <div className="bg-slate-600/50 p-4 rounded-lg border border-purple-500/20">
                <h3 className="text-white font-semibold mb-3">Select Report Type</h3>
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={fetchSystemStats}
                        className="px-4 py-2 bg-blue-600/40 hover:bg-blue-600/60 text-blue-200 rounded transition"
                    >
                        System Statistics
                    </button>
                    {elections.map((el) => (
                        <button
                            key={el._id}
                            onClick={() => fetchElectionReport(el._id)}
                            className="px-4 py-2 bg-purple-600/40 hover:bg-purple-600/60 text-purple-200 rounded transition"
                        >
                            {el.name} Report
                        </button>
                    ))}
                </div>
            </div>

            {systemStats && (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">System-Wide Statistics</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-slate-600/50 p-4 rounded border border-purple-500/20">
                            <p className="text-purple-300 mb-2">Total Users</p>
                            <p className="text-3xl font-bold text-white">{systemStats.users?.total || 0}</p>
                        </div>
                        <div className="bg-slate-600/50 p-4 rounded border border-purple-500/20">
                            <p className="text-purple-300 mb-2">Approved Users</p>
                            <p className="text-3xl font-bold text-green-400">{systemStats.users?.approved || 0}</p>
                        </div>
                        <div className="bg-slate-600/50 p-4 rounded border border-purple-500/20">
                            <p className="text-purple-300 mb-2">Active Elections</p>
                            <p className="text-3xl font-bold text-orange-400">{systemStats.elections?.active || 0}</p>
                        </div>
                        <div className="bg-slate-600/50 p-4 rounded border border-purple-500/20">
                            <p className="text-purple-300 mb-2">Total Audit Records</p>
                            <p className="text-3xl font-bold text-blue-400">{systemStats.auditLog?.totalRecords || 0}</p>
                        </div>
                    </div>
                    <div className="bg-slate-600/50 p-4 rounded border border-purple-500/20">
                        <h4 className="text-white font-semibold mb-3">Registration Status</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-purple-300">Pending</span>
                                <span className="text-yellow-400 font-semibold">{systemStats.registrations?.pending || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-purple-300">Approved</span>
                                <span className="text-green-400 font-semibold">{systemStats.registrations?.approved || 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-purple-300">Rejected</span>
                                <span className="text-red-400 font-semibold">{systemStats.registrations?.rejected || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {reportData && (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Election: {reportData.election?.name}</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-slate-600/50 p-4 rounded border border-purple-500/20">
                            <p className="text-purple-300 mb-2">Total Votes Cast</p>
                            <p className="text-3xl font-bold text-white">{reportData.voteStatistics?.totalVotes || 0}</p>
                        </div>
                        <div className="bg-slate-600/50 p-4 rounded border border-purple-500/20">
                            <p className="text-purple-300 mb-2">Total Candidates</p>
                            <p className="text-3xl font-bold text-white">{reportData.voteStatistics?.candidatesCount || 0}</p>
                        </div>
                    </div>
                    <div className="bg-slate-600/50 p-4 rounded border border-purple-500/20">
                        <h4 className="text-white font-semibold mb-3">Candidate Results</h4>
                        <div className="space-y-2">
                            {reportData.voteStatistics?.candidates.map((cand, idx) => (
                                <div key={idx} className="flex justify-between items-center">
                                    <div>
                                        <p className="text-white font-medium">{cand.name}</p>
                                        <p className="text-slate-400 text-sm">{cand.party}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white font-bold">{cand.voteCount}</p>
                                        <p className="text-purple-300 text-sm">{cand.percentage}%</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Monitoring Tab Component
const MonitoringTab = ({ elections }) => {
    const [selectedElection, setSelectedElection] = useState(null);
    const [monitoringData, setMonitoringData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(true);

    const fetchMonitoringData = async (electionId) => {
        setLoading(true);
        try {
            const response = await adminAPI.getElectionActivityMonitoring(electionId);
            setMonitoringData(response.data);
            setSelectedElection(electionId);
        } catch (error) {
            console.error('Failed to load monitoring data:', error);
            alert('Failed to load monitoring data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!autoRefresh || !selectedElection) return;
        const interval = setInterval(() => {
            fetchMonitoringData(selectedElection);
        }, 5000); // Refresh every 5 seconds

        return () => clearInterval(interval);
    }, [autoRefresh, selectedElection]);

    if (loading && !monitoringData) return <p className="text-slate-300">Loading...</p>;

    return (
        <div className="space-y-6">
            <div className="bg-slate-600/50 p-4 rounded-lg border border-purple-500/20">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-white font-semibold">Select Election to Monitor</h3>
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={autoRefresh}
                            onChange={(e) => setAutoRefresh(e.target.checked)}
                            className="rounded"
                        />
                        <span className="text-purple-300 text-sm">Auto Refresh (5s)</span>
                    </label>
                </div>
                <div className="flex gap-2 flex-wrap">
                    {elections.map((el) => (
                        <button
                            key={el._id}
                            onClick={() => fetchMonitoringData(el._id)}
                            className={`px-4 py-2 rounded transition ${selectedElection === el._id
                                    ? 'bg-green-600/60 text-green-200'
                                    : 'bg-slate-700/40 hover:bg-slate-700/60 text-slate-300'
                                }`}
                        >
                            {el.name}
                        </button>
                    ))}
                </div>
            </div>

            {monitoringData && (
                <div className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-slate-600/50 p-4 rounded border border-purple-500/20">
                            <p className="text-purple-300 mb-2">Total Votes (Live)</p>
                            <p className="text-3xl font-bold text-white">{monitoringData.activity?.totalVotes || 0}</p>
                        </div>
                        <div className="bg-slate-600/50 p-4 rounded border border-purple-500/20">
                            <p className="text-purple-300 mb-2">Pending Registrations</p>
                            <p className="text-3xl font-bold text-yellow-400">{monitoringData.registrationStatus?.pending || 0}</p>
                        </div>
                        <div className="bg-slate-600/50 p-4 rounded border border-purple-500/20">
                            <p className="text-purple-300 mb-2">Approved Users</p>
                            <p className="text-3xl font-bold text-green-400">{monitoringData.registrationStatus?.approved || 0}</p>
                        </div>
                    </div>

                    <div className="bg-slate-600/50 p-4 rounded border border-purple-500/20">
                        <h4 className="text-white font-semibold mb-3">Top Candidates</h4>
                        <div className="space-y-2">
                            {monitoringData.activity?.topCandidates?.map((cand, idx) => (
                                <div key={idx} className="flex justify-between items-center">
                                    <div>
                                        <p className="text-white font-medium">#{idx + 1} {cand.name}</p>
                                        <p className="text-slate-400 text-sm">{cand.party}</p>
                                    </div>
                                    <p className="text-white font-bold text-lg">{cand.voteCount}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-slate-600/50 p-4 rounded border border-purple-500/20">
                        <h4 className="text-white font-semibold mb-3">Recent Votes</h4>
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                            {monitoringData.activity?.recentVotes?.map((vote, idx) => (
                                <div key={idx} className="text-sm text-slate-300">
                                    <span className="font-mono text-purple-300">{vote.receiptCode}</span>
                                    <span className="ml-2 text-slate-500">
                                        {new Date(vote.votedAt).toLocaleTimeString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <p className="text-slate-400 text-sm text-right">
                        Last updated: {new Date(monitoringData.lastUpdated).toLocaleTimeString()}
                        {autoRefresh && ' (Auto-refreshing)'}
                    </p>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;

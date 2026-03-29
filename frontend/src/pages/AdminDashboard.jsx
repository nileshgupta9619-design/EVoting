import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { clearAdmin } from '../store/adminSlice';
import { api, votingAPI, candidateProfileAPI, electionAPI, adminAPI } from '../utils/api';
import AdminHeader from '../components/AdminHeader';
import RegistrationTab from '../components/RegistrationTab';
import CandidateTab from '../components/CandidateTab';
import MonitoringTab from '../components/MonitoringTab';
import ReportTab from '../components/ReportTab';
import RequestTab from '../components/RequestTab';
import ElectionsTab from '../components/ElectionsTab';
import AuditLogTab from '../components/AuditLogTab';
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
            <AdminHeader admin={admin} handleLogout={handleLogout} />
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
                                    <RegistrationTab pendingRegistrations={pendingRegistrations} />
                                )}

                                {/* Candidates Tab */}
                                {activeTab === 'candidates' && (
                                    <CandidateTab candidates={candidates} />
                                )}

                                {/* Requests Tab */}
                                {activeTab === 'requests' && (
                                    <RequestTab pendingProfiles={pendingProfiles} />
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
                                    <ElectionsTab elections={elections} />
                                )}

                                {/* Logs Tab */}
                                {activeTab === 'logs' && (
                                    <AuditLogTab logs={logs} />
                                )}

                                {/* Reports Tab */}
                                {activeTab === 'reports' && (
                                    <div>
                                        <h2 className="text-2xl font-bold text-white mb-6">Election Reports</h2>
                                        <ReportTab elections={elections} />
                                    </div>
                                )}

                                {/* Monitoring Tab */}
                                {activeTab === 'monitoring' && (
                                    <MonitoringTab elections={elections} />
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

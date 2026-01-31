import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { votingAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [activeTab, setActiveTab] = useState('candidates');

    useEffect(() => {
        fetchCandidates();
    }, []);

    const fetchCandidates = async () => {
        try {
            setLoading(true);
            const response = await votingAPI.getCandidates();
            setCandidates(response.data.candidates);
        } catch (error) {
            setError('Failed to load candidates');
        } finally {
            setLoading(false);
        }
    };

    const handleVote = async (candidateId) => {
        if (!window.confirm('Are you sure you want to vote for this candidate?')) {
            return;
        }

        try {
            await votingAPI.vote(candidateId);
            setMessage('Vote cast successfully!');
            setTimeout(() => navigate('/results'), 2000);
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to cast vote');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white">
            <header className="border-b border-purple-500/20 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">E-Voting Dashboard</h1>
                        <p className="text-sm text-purple-300">Secure online voting experience</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="hidden sm:inline text-sm text-slate-200">
                            Welcome, <span className="font-semibold">{user?.fullName}</span>
                        </span>
                        <Link
                            to="/profile"
                            className="px-3 py-2 rounded-lg bg-slate-700/70 border border-purple-500/40 text-sm hover:bg-slate-600 transition"
                        >
                            Profile
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="px-3 py-2 rounded-lg bg-red-500/80 hover:bg-red-600 text-sm font-semibold transition"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-6">
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1">
                        <div className="flex gap-3 mb-4">
                            <button
                                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                                    activeTab === 'candidates'
                                        ? 'bg-gradient-to-r from-purple-600 to-blue-600'
                                        : 'bg-slate-800 hover:bg-slate-700'
                                }`}
                                onClick={() => setActiveTab('candidates')}
                            >
                                Candidates
                            </button>
                            <button
                                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                                    activeTab === 'results'
                                        ? 'bg-gradient-to-r from-purple-600 to-blue-600'
                                        : 'bg-slate-800 hover:bg-slate-700'
                                }`}
                                onClick={() => setActiveTab('results')}
                            >
                                Results
                            </button>
                        </div>

                        {error && (
                            <div className="mb-3 p-3 rounded-lg bg-red-500/10 border border-red-500/40 text-red-200 text-sm">
                                {error}
                            </div>
                        )}
                        {message && (
                            <div className="mb-3 p-3 rounded-lg bg-green-500/10 border border-green-500/40 text-green-200 text-sm">
                                {message}
                            </div>
                        )}

                        {activeTab === 'candidates' && (
                            <div>
                                {loading ? (
                                    <p className="text-slate-300">Loading candidates...</p>
                                ) : user?.hasVoted ? (
                                    <div className="p-4 rounded-xl bg-slate-800/70 border border-purple-500/30 text-purple-100 text-sm">
                                        You have already voted. You can view the live results on the Results tab.
                                    </div>
                                ) : (
                                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                        {candidates.map((candidate) => (
                                            <div
                                                key={candidate._id}
                                                className="rounded-xl bg-slate-800/80 border border-purple-500/20 hover:border-purple-500/40 transition overflow-hidden shadow-lg shadow-purple-900/20"
                                            >
                                                <div className="h-32 bg-gradient-to-br from-purple-600/60 to-blue-600/60 flex items-center justify-center">
                                                    {candidate.image ? (
                                                        <img
                                                            src={candidate.image}
                                                            alt={candidate.name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="text-4xl">🗳️</div>
                                                    )}
                                                </div>
                                                <div className="p-4 space-y-2">
                                                    <h3 className="text-lg font-semibold">{candidate.name}</h3>
                                                    <p className="text-xs uppercase tracking-wide text-purple-300">
                                                        {candidate.party}
                                                    </p>
                                                    <p className="text-xs text-slate-300 line-clamp-3">
                                                        {candidate.description}
                                                    </p>
                                                    <button
                                                        className="mt-3 w-full py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-sm font-semibold"
                                                        onClick={() => handleVote(candidate._id)}
                                                    >
                                                        Vote
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'results' && (
                            <div className="mt-2">
                                <Results />
                            </div>
                        )}
                    </div>

                    <aside className="w-full lg:w-72 space-y-4">
                        <div className="rounded-xl bg-slate-800/80 border border-purple-500/30 p-4">
                            <h2 className="text-sm font-semibold mb-2">Your Voting Status</h2>
                            <p className="text-xs text-slate-300 mb-2">
                                Email:{' '}
                                <span className="font-medium text-purple-200">
                                    {user?.email}
                                </span>
                            </p>
                            <p className="text-xs text-slate-300 mb-2">
                                Email verified:{' '}
                                <span className="font-semibold">
                                    {user?.isEmailVerified ? 'Yes' : 'No'}
                                </span>
                            </p>
                            <p className="text-xs text-slate-300">
                                Voting:{' '}
                                <span className="font-semibold">
                                    {user?.hasVoted ? 'You have already voted' : 'You have not voted yet'}
                                </span>
                            </p>
                        </div>
                        <div className="rounded-xl bg-slate-800/80 border border-blue-500/30 p-4 text-xs text-slate-200">
                            <h3 className="font-semibold mb-1 text-sm">Transparency</h3>
                            <p>Results are calculated in real-time and displayed instantly once votes are cast.</p>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
};

const Results = () => {
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchResults();
    }, []);

    const fetchResults = async () => {
        try {
            setLoading(true);
            const response = await votingAPI.getResults();
            setResults(response.data);
        } catch (error) {
            setError('Failed to load results');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <p>Loading results...</p>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="results-container">
            <h2>Voting Results</h2>
            <p className="total-votes">Total Votes: {results?.totalVotes || 0}</p>
            <div className="results-list">
                {results?.results.map((candidate, index) => (
                    <div key={index} className="result-item">
                        <div className="result-info">
                            <span className="rank">#{index + 1}</span>
                            <div className="candidate-details">
                                <h4>{candidate.name}</h4>
                                <p>{candidate.party}</p>
                            </div>
                        </div>
                        <div className="result-stats">
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{
                                        width: `${candidate.percentage}%`,
                                    }}
                                ></div>
                            </div>
                            <span className="votes">{candidate.voteCount} votes ({candidate.percentage}%)</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;

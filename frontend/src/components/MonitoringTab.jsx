import React, { useState, useEffect } from 'react';
import { adminAPI } from '../utils/api';

const MonitoringTab = ({ elections }) => {
    const [selectedElection, setSelectedElection] = useState(null);
    const [monitoringData, setMonitoringData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(true);

    const fetchMonitoringData = async (electionId, silent = false) => {
        if (!silent) setLoading(true);

        try {
            const response = await adminAPI.getElectionActivityMonitoring(electionId);

            setMonitoringData(response.data.data || {});
            setSelectedElection(electionId);
        } catch (error) {
            console.error('Failed to load monitoring data:', error);
            setMonitoringData({});
        } finally {
            if (!silent) setLoading(false);
        }
    };

    // Auto refresh
    useEffect(() => {
        if (!autoRefresh || !selectedElection) return;

        const interval = setInterval(() => {
            fetchMonitoringData(selectedElection, true); // silent refresh
        }, 5000);

        return () => clearInterval(interval);
    }, [autoRefresh, selectedElection]);

    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-6">📡 Real-Time Monitoring</h2>

            {/* Selection */}
            <div className="bg-slate-600/50 p-4 rounded-lg border border-purple-500/20 mb-6">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-white font-semibold">Select Election</h3>

                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={autoRefresh}
                            onChange={(e) => setAutoRefresh(e.target.checked)}
                        />
                        <span className="text-purple-300 text-sm">Auto Refresh</span>
                    </label>
                </div>

                <div className="flex gap-2 flex-wrap">
                    {elections.map((el) => (
                        <button
                            type="button"   // ✅ FIX: prevent reload
                            key={el._id}
                            disabled={loading}
                            onClick={() => fetchMonitoringData(el._id)}
                            className={`px-4 py-2 rounded disabled:opacity-50 ${selectedElection?.toString() === el._id?.toString()
                                    ? 'bg-green-600 text-white'
                                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                }`}
                        >
                            {el.title}
                        </button>
                    ))}
                </div>
            </div>

            {/* Loading */}
            {loading && !monitoringData && (
                <p className="text-slate-300 text-center">Loading...</p>
            )}

            {/* Monitoring Data */}
            {monitoringData && !loading ? (
                Object.keys(monitoringData).length === 0 ? (
                    <p className="text-slate-400 text-center">
                        No monitoring data available
                    </p>
                ) : (
                    <div className="space-y-4">

                        {/* Stats */}
                        <div className="grid md:grid-cols-3 gap-4">
                            <StatCard label="Total Votes" value={monitoringData.totalVotes} />
                            <StatCard label="Pending Registrations" value={monitoringData.pendingRegistrations} />
                            <StatCard label="Approved Users" value={monitoringData.approvedUsers} />
                        </div>

                        {/* Top Candidates */}
                        {monitoringData.topCandidates?.length > 0 && (
                            <div className="bg-slate-600 p-4 rounded">
                                <h4 className="text-white mb-3">🏆 Top Candidates</h4>

                                {monitoringData.topCandidates.map((c, i) => (
                                    <div key={i} className="flex justify-between py-1">
                                        <span>{c.candidateName}</span>
                                        <span>{c.voteCount}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Recent Votes */}
                        {monitoringData.activity?.recentVotes?.length > 0 && (
                            <div className="bg-slate-600 p-4 rounded">
                                <h4 className="text-white mb-3">🗳️ Recent Votes</h4>

                                {monitoringData.activity.recentVotes.map((vote, i) => (
                                    <div key={i} className="text-sm">
                                        {vote.receiptCode} -{' '}
                                        {new Date(vote.votedAt).toLocaleTimeString()}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Last Updated */}
                        {monitoringData.lastUpdated && (
                            <p className="text-sm text-right text-slate-400">
                                Last updated:{' '}
                                {new Date(monitoringData.lastUpdated).toLocaleTimeString()}
                                {autoRefresh && ' (Auto-refreshing)'}
                            </p>
                        )}
                    </div>
                )
            ) : (
                !loading && (
                    <p className="text-slate-400 text-center">
                        Select an election
                    </p>
                )
            )}
        </div>
    );
};

/* Reusable */
const StatCard = ({ label, value }) => (
    <div className="bg-slate-600 p-4 rounded">
        <p className="text-sm text-slate-300">{label}</p>
        <p className="text-2xl font-bold text-white">{value || 0}</p>
    </div>
);

export default MonitoringTab;
import React, { useState } from 'react';
import { adminAPI } from '../utils/api';

const ReportTab = ({ elections }) => {
    const [selectedElection, setSelectedElection] = useState(null);
    const [reportData, setReportData] = useState(null);
    const [systemStats, setSystemStats] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchElectionReport = async (electionId) => {
        setLoading(true);
        try {
            const response = await adminAPI.getElectionReports(electionId);

            setReportData(response.data.data || {});
            setSystemStats(null);
            setSelectedElection(electionId);
        } catch (error) {
            console.error('Failed to load report:', error);
            setReportData({});
        } finally {
            setLoading(false);
        }
    };

    const fetchSystemStats = async () => {
        setLoading(true);
        try {
            const response = await adminAPI.getSystemStatistics();

            setSystemStats(response.data.data || {});
            setReportData(null);
            setSelectedElection(null);
        } catch (error) {
            console.error('Failed to load system stats:', error);
            setSystemStats({});
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">

            {/* Selection */}
            <div className="bg-slate-600/50 p-4 rounded-lg border border-purple-500/20">
                <h3 className="text-white font-semibold mb-3">📊 Select Report Type</h3>

                <div className="flex gap-2 flex-wrap">
                    <button
                        type="button"
                        onClick={fetchSystemStats}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600/40 hover:bg-blue-600/60 text-blue-200 rounded disabled:opacity-50"
                    >
                        System Statistics
                    </button>

                    {elections.map((el) => (
                        <button
                            type="button"
                            key={el._id}
                            disabled={loading}
                            onClick={() => fetchElectionReport(el._id)}
                            className={`px-4 py-2 rounded disabled:opacity-50 ${selectedElection?.toString() === el._id?.toString()
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-purple-600/40 hover:bg-purple-600/60 text-purple-200'
                                }`}
                        >
                            {el.title}
                        </button>
                    ))}
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <p className="text-slate-300 text-center">Loading...</p>
            )}

            {/* System Stats */}
            {systemStats && !loading && (
                <div className="space-y-4">
                    <h3 className="text-white text-lg font-semibold">📈 System Stats</h3>

                    <div className="grid md:grid-cols-2 gap-4">
                        <StatCard label="Total Users" value={systemStats.totalUsers} />
                        <StatCard label="Approved Users" value={systemStats.approvedUsers} />
                        <StatCard label="Active Elections" value={systemStats.activeElections} />
                        <StatCard label="Total Votes" value={systemStats.totalVotes} />
                    </div>

                    <div className="bg-slate-600/50 p-4 rounded border border-purple-500/20">
                        <h4 className="text-white mb-3">Registration Status</h4>

                        <StatRow label="Pending" value={systemStats.registrations?.pending} />
                        <StatRow label="Approved" value={systemStats.registrations?.approved} />
                        <StatRow label="Rejected" value={systemStats.registrations?.rejected} />
                    </div>
                </div>
            )}

            {/* Election Report */}
            {reportData && !loading && (
                reportData.totalVotes === 0 || !reportData.candidates?.length ? (
                    <div className="text-center text-slate-400 py-6">
                        No report available for this election
                    </div>
                ) : (
                    <div className="space-y-4">
                        <h3 className="text-white text-lg font-semibold">
                            📋 {reportData.electionTitle || 'Election'}
                        </h3>

                        <div className="grid md:grid-cols-2 gap-4">
                            <StatCard label="Total Votes" value={reportData.totalVotes} />
                            <StatCard label="Candidates" value={reportData.candidateCount} />
                        </div>

                        <div className="bg-slate-600/50 p-4 rounded border border-purple-500/20">
                            <h4 className="text-white mb-3">🏆 Candidates</h4>

                            {reportData.candidates.map((c, i) => (
                                <div key={i} className="flex justify-between p-2 bg-slate-700/50 rounded mb-2">
                                    <div>
                                        <p className="text-white">
                                            #{i + 1} {c.candidateName}
                                        </p>
                                        <p className="text-sm text-slate-400">
                                            {c.party}
                                        </p>
                                    </div>
                                    <p className="text-white font-bold">
                                        {c.voteCount}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            )}

            {/* Empty State */}
            {!systemStats && !reportData && !loading && (
                <div className="text-center py-12 text-slate-400">
                    Select a report to view
                </div>
            )}
        </div>
    );
};

/* Reusable Components */

const StatCard = ({ label, value }) => (
    <div className="bg-slate-600/50 p-4 rounded border border-purple-500/20">
        <p className="text-purple-300 mb-2">{label}</p>
        <p className="text-3xl font-bold text-white">{value || 0}</p>
    </div>
);

const StatRow = ({ label, value }) => (
    <div className="flex justify-between mb-2">
        <span className="text-purple-300">{label}</span>
        <span className="text-white font-semibold">{value || 0}</span>
    </div>
);

export default ReportTab;
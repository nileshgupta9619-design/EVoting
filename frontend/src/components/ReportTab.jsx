
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
export default ReportsTab
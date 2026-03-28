
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

        <div>
            <h2 className="text-2xl font-bold text-white mb-6">Real-Time Monitoring</h2>
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
        </div>
    );
};

export default MonitoringTab
// import React, { useEffect, useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { votingAPI, electionAPI } from '../utils/api';
// import { useAuth } from '../context/AuthContext';

// const Dashboard = () => {
//     const navigate = useNavigate();
//     const { user, logout } = useAuth();
//     const [elections, setElections] = useState([]);
//     const [selectedElection, setSelectedElection] = useState(null);
//     const [electionCandidates, setElectionCandidates] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState('');
//     const [message, setMessage] = useState('');
//     const [successMessage, setSuccessMessage] = useState('');
//     const [activeTab, setActiveTab] = useState('elections');
//     const [receiptCode, setReceiptCode] = useState(null);
//     const [showReceiptModal, setShowReceiptModal] = useState(false);

//     useEffect(() => {
//         fetchElections();
//     }, []);

//     const fetchElections = async () => {
//         try {
//             setLoading(true);
//             const response = await electionAPI.list();
//             setElections(response.data.elections);
//         } catch (error) {
//             setError('Failed to load elections');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const fetchElectionCandidates = async (electionId) => {
//         try {
//             const response = await electionAPI.candidates(electionId);
//             setElectionCandidates(response.data.candidates);
//         } catch (error) {
//             setError('Failed to load election candidates');
//         }
//     };

//     const handleElectionSelect = (election) => {
//         setSelectedElection(election);
//         fetchElectionCandidates(election._id);
//         setActiveTab('vote');
//     };

//     const handleVote = async (candidateProfileId) => {
//         if (!selectedElection) {
//             setError('No election selected');
//             return;
//         }

//         if (!window.confirm('Are you sure you want to vote for this candidate?')) {
//             return;
//         }

//         try {
//             const response = await votingAPI.voteInElection(selectedElection._id, candidateProfileId);
//             // Show receipt modal if receipt code is provided
//             if (response.data.receiptCode) {
//                 setReceiptCode(response.data.receiptCode);
//                 setShowReceiptModal(true);
//             }
//             setSuccessMessage(response.data.message || 'Vote cast successfully!');
//             setTimeout(() => navigate('/results'), 3000);
//         } catch (error) {
//             setError(error.response?.data?.message || 'Failed to cast vote');
//         }
//     };

//     const handleLogout = () => {
//         logout();
//         navigate('/login');
//     };

//     const copyReceiptCode = () => {
//         navigator.clipboard.writeText(receiptCode);
//         alert('Receipt code copied to clipboard!');
//     };

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white">
//             <header className="border-b border-purple-500/20 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-40">
//                 <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
//                     <div>
//                         <h1 className="text-2xl font-bold">E-Voting Dashboard</h1>
//                         <p className="text-sm text-purple-300">Secure online voting experience</p>
//                     </div>
//                     <div className="flex items-center gap-4">
//                         <span className="hidden sm:inline text-sm text-slate-200">
//                             Welcome, <span className="font-semibold">{user?.fullName}</span>
//                         </span>
//                         <Link
//                             to="/profile"
//                             className="px-3 py-2 rounded-lg bg-slate-700/70 border border-purple-500/40 text-sm hover:bg-slate-600 transition"
//                         >
//                             Profile
//                         </Link>
//                         <button
//                             onClick={handleLogout}
//                             className="px-3 py-2 rounded-lg bg-red-500/80 hover:bg-red-600 text-sm font-semibold transition"
//                         >
//                             Logout
//                         </button>
//                     </div>
//                 </div>
//             </header>

//             {/* Receipt Modal */}
//             {showReceiptModal && receiptCode && (
//                 <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//                     <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-purple-500/50 max-w-md w-full p-6 shadow-2xl">
//                         <div className="text-center mb-4">
//                             <div className="text-4xl mb-2">✅</div>
//                             <h2 className="text-2xl font-bold">Vote Submitted Successfully!</h2>
//                         </div>

//                         <div className="bg-slate-700/40 rounded-lg p-4 mb-4 border border-purple-500/30">
//                             <p className="text-sm text-slate-300 mb-2">Your Receipt Code</p>
//                             <div className="bg-slate-900 rounded p-3 font-mono text-lg font-bold text-purple-400 break-all">
//                                 {receiptCode}
//                             </div>
//                             <p className="text-xs text-slate-400 mt-2">
//                                 Save this code to verify your vote after the election
//                             </p>
//                         </div>

//                         <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-4 text-sm text-blue-200">
//                             <strong>Important:</strong> Your vote is encrypted and anonymous. Only this receipt code confirms your vote.
//                         </div>

//                         <div className="space-y-2">
//                             <button
//                                 onClick={copyReceiptCode}
//                                 className="w-full py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 font-semibold transition"
//                             >
//                                 Copy Receipt Code
//                             </button>
//                             <button
//                                 onClick={() => setShowReceiptModal(false)}
//                                 className="w-full py-2 rounded-lg bg-slate-700 hover:bg-slate-600 font-semibold transition"
//                             >
//                                 Close
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             <main className="max-w-6xl mx-auto px-4 py-6">
//                 <div className="flex flex-col lg:flex-row gap-6">
//                     <div className="flex-1">
//                         <div className="flex gap-3 mb-4 flex-wrap">
//                             <button
//                                 className={`px-4 py-2 rounded-full text-sm font-medium transition ${activeTab === 'elections'
//                                     ? 'bg-gradient-to-r from-purple-600 to-blue-600'
//                                     : 'bg-slate-800 hover:bg-slate-700'
//                                     }`}
//                                 onClick={() => setActiveTab('elections')}
//                             >
//                                 Elections
//                             </button>
//                             {selectedElection && (
//                                 <button
//                                     className={`px-4 py-2 rounded-full text-sm font-medium transition ${activeTab === 'vote'
//                                         ? 'bg-gradient-to-r from-purple-600 to-blue-600'
//                                         : 'bg-slate-800 hover:bg-slate-700'
//                                         }`}
//                                     onClick={() => setActiveTab('vote')}
//                                 >
//                                     Vote in {selectedElection.title}
//                                 </button>
//                             )}
//                             <button
//                                 className={`px-4 py-2 rounded-full text-sm font-medium transition ${activeTab === 'results'
//                                     ? 'bg-gradient-to-r from-purple-600 to-blue-600'
//                                     : 'bg-slate-800 hover:bg-slate-700'
//                                     }`}
//                                 onClick={() => setActiveTab('results')}
//                             >
//                                 Results
//                             </button>
//                             <button
//                                 className={`px-4 py-2 rounded-full text-sm font-medium transition ${activeTab === 'verify'
//                                     ? 'bg-gradient-to-r from-purple-600 to-blue-600'
//                                     : 'bg-slate-800 hover:bg-slate-700'
//                                     }`}
//                                 onClick={() => setActiveTab('verify')}
//                             >
//                                 Verify Vote
//                             </button>
//                         </div>

//                         {error && (
//                             <div className="mb-3 p-3 rounded-lg bg-red-500/10 border border-red-500/40 text-red-200 text-sm">
//                                 {error}
//                             </div>
//                         )}
//                         {message && (
//                             <div className="mb-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/40 text-blue-200 text-sm">
//                                 {message}
//                             </div>
//                         )}
//                         {successMessage && (
//                             <div className="mb-3 p-3 rounded-lg bg-green-500/10 border border-green-500/40 text-green-200 text-sm">
//                                 {successMessage}
//                             </div>
//                         )}

//                         {activeTab === 'elections' && (
//                             <div>
//                                 {loading ? (
//                                     <p className="text-slate-300">Loading elections...</p>
//                                 ) : (
//                                     <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
//                                         {elections.map((election) => (
//                                             <div
//                                                 key={election._id}
//                                                 className="rounded-xl bg-slate-800/80 border border-purple-500/20 hover:border-purple-500/40 transition overflow-hidden shadow-lg shadow-purple-900/20"
//                                             >
//                                                 <div className="h-32 bg-gradient-to-br from-purple-600/60 to-blue-600/60 flex items-center justify-center">
//                                                     <div className="text-4xl">🗳️</div>
//                                                 </div>
//                                                 <div className="p-4 space-y-2">
//                                                     <h3 className="text-lg font-semibold">{election.title}</h3>
//                                                     <p className="text-xs text-slate-300 line-clamp-3">
//                                                         {election.description}
//                                                     </p>
//                                                     <div className="text-xs text-purple-300">
//                                                         Status: <span className={election.isActive ? 'text-green-400' : 'text-red-400'}>
//                                                             {election.isActive ? 'Active' : 'Inactive'}
//                                                         </span>
//                                                     </div>
//                                                     {election.startDate && (
//                                                         <div className="text-xs text-slate-400">
//                                                             Starts: {new Date(election.startDate).toLocaleDateString()}
//                                                         </div>
//                                                     )}
//                                                     {election.endDate && (
//                                                         <div className="text-xs text-slate-400">
//                                                             Ends: {new Date(election.endDate).toLocaleDateString()}
//                                                         </div>
//                                                     )}
//                                                     <button
//                                                         className="mt-3 w-full py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-sm font-semibold"
//                                                         onClick={() => handleElectionSelect(election)}
//                                                     >
//                                                         Select Election
//                                                     </button>
//                                                 </div>
//                                             </div>
//                                         ))}
//                                     </div>
//                                 )}
//                             </div>
//                         )}

//                         {activeTab === 'vote' && selectedElection && (
//                             <div>
//                                 <div className="mb-4 p-4 rounded-xl bg-slate-800/70 border border-purple-500/30">
//                                     <h3 className="text-lg font-semibold text-white mb-2">{selectedElection.title}</h3>
//                                     <p className="text-sm text-slate-300">{selectedElection.description}</p>
//                                 </div>

//                                 {loading ? (
//                                     <p className="text-slate-300">Loading candidates...</p>
//                                 ) : (
//                                     <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
//                                         {electionCandidates.map((candidate) => (
//                                             <div
//                                                 key={candidate._id}
//                                                 className="rounded-xl bg-slate-800/80 border border-purple-500/20 hover:border-purple-500/40 transition overflow-hidden shadow-lg shadow-purple-900/20"
//                                             >
//                                                 <div className="h-32 bg-gradient-to-br from-purple-600/60 to-blue-600/60 flex items-center justify-center">
//                                                     {candidate.image ? (
//                                                         <img
//                                                             src={candidate.image}
//                                                             alt={candidate.name}
//                                                             className="h-full w-full object-cover"
//                                                         />
//                                                     ) : (
//                                                         <div className="text-4xl">👤</div>
//                                                     )}
//                                                 </div>
//                                                 <div className="p-4 space-y-2">
//                                                     <h3 className="text-lg font-semibold">{candidate.name}</h3>
//                                                     <p className="text-xs uppercase tracking-wide text-purple-300">
//                                                         {candidate.party}
//                                                     </p>
//                                                     <p className="text-xs text-slate-300 line-clamp-3">
//                                                         {candidate.description}
//                                                     </p>
//                                                     <button
//                                                         className="mt-3 w-full py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-sm font-semibold"
//                                                         onClick={() => handleVote(candidate._id)}
//                                                     >
//                                                         Vote
//                                                     </button>
//                                                 </div>
//                                             </div>
//                                         ))}
//                                     </div>
//                                 )}
//                             </div>
//                         )}

//                         {activeTab === 'results' && (
//                             <div className="mt-2">
//                                 <Results />
//                             </div>
//                         )}

//                         {activeTab === 'verify' && (
//                             <div className="mt-2">
//                                 <VerifyVote />
//                             </div>
//                         )}
//                     </div>

//                     <aside className="w-full lg:w-72 space-y-4">
//                         <div className="rounded-xl bg-slate-800/80 border border-purple-500/30 p-4">
//                             <h2 className="text-sm font-semibold mb-2">Your Voting Status</h2>
//                             <p className="text-xs text-slate-300 mb-2">
//                                 Email:{' '}
//                                 <span className="font-medium text-purple-200">
//                                     {user?.email}
//                                 </span>
//                             </p>
//                             <p className="text-xs text-slate-300 mb-2">
//                                 Email verified:{' '}
//                                 <span className="font-semibold">
//                                     {user?.isEmailVerified ? 'Yes' : 'No'}
//                                 </span>
//                             </p>
//                             <p className="text-xs text-slate-300 mb-2">
//                                 Elections voted in:{' '}
//                                 <span className="font-semibold">
//                                     {user?.electionVotes?.length || 0}
//                                 </span>
//                             </p>
//                             {selectedElection && (
//                                 <p className="text-xs text-slate-300">
//                                     Status for {selectedElection.title}:{' '}
//                                     <span className="font-semibold">
//                                         {user?.electionVotes?.some(vote => vote.electionId.toString() === selectedElection._id.toString())
//                                             ? 'Already voted'
//                                             : 'Can vote'
//                                         }
//                                     </span>
//                                 </p>
//                             )}
//                         </div>
//                         <div className="rounded-xl bg-slate-800/80 border border-blue-500/30 p-4 text-xs text-slate-200">
//                             <h3 className="font-semibold mb-1 text-sm">🔒 Transparency & Security</h3>
//                             <ul className="list-disc list-inside space-y-1">
//                                 <li>Your vote is encrypted before storage</li>
//                                 <li>Receipt code is unique and anonymous</li>
//                                 <li>Results update in real-time</li>
//                                 <li>Audit trail tracked for security</li>
//                             </ul>
//                         </div>
//                     </aside>
//                 </div>
//             </main>
//         </div>
//     );
// };
//                             </button >
//                         </div >

//     { error && (
//         <div className="mb-3 p-3 rounded-lg bg-red-500/10 border border-red-500/40 text-red-200 text-sm">
//             {error}
//         </div>
//     )}
// {
//     message && (
//         <div className="mb-3 p-3 rounded-lg bg-green-500/10 border border-green-500/40 text-green-200 text-sm">
//             {message}
//         </div>
//     )
// }

// {
//     activeTab === 'candidates' && (
//         <div>
//             {loading ? (
//                 <p className="text-slate-300">Loading candidates...</p>
//             ) : user?.hasVoted ? (
//                 <div className="p-4 rounded-xl bg-slate-800/70 border border-purple-500/30 text-purple-100 text-sm">
//                     You have already voted. You can view the live results on the Results tab.
//                 </div>
//             ) : (
//                 <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
//                     {candidates.map((candidate) => (
//                         <div
//                             key={candidate._id}
//                             className="rounded-xl bg-slate-800/80 border border-purple-500/20 hover:border-purple-500/40 transition overflow-hidden shadow-lg shadow-purple-900/20"
//                         >
//                             <div className="h-32 bg-gradient-to-br from-purple-600/60 to-blue-600/60 flex items-center justify-center">
//                                 {candidate.image ? (
//                                     <img
//                                         src={candidate.image}
//                                         alt={candidate.name}
//                                         className="h-full w-full object-cover"
//                                     />
//                                 ) : (
//                                     <div className="text-4xl">🗳️</div>
//                                 )}
//                             </div>
//                             <div className="p-4 space-y-2">
//                                 <h3 className="text-lg font-semibold">{candidate.name}</h3>
//                                 <p className="text-xs uppercase tracking-wide text-purple-300">
//                                     {candidate.party}
//                                 </p>
//                                 <p className="text-xs text-slate-300 line-clamp-3">
//                                     {candidate.description}
//                                 </p>
//                                 <button
//                                     className="mt-3 w-full py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-sm font-semibold"
//                                     onClick={() => handleVote(candidate._id)}
//                                 >
//                                     Vote
//                                 </button>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             )}
//         </div>
//     )
// }

// {
//     activeTab === 'results' && (
//         <div className="mt-2">
//             <Results />
//         </div>
//     )
// }
//                     </div >

//     <aside className="w-full lg:w-72 space-y-4">
//         <div className="rounded-xl bg-slate-800/80 border border-purple-500/30 p-4">
//             <h2 className="text-sm font-semibold mb-2">Your Voting Status</h2>
//             <p className="text-xs text-slate-300 mb-2">
//                 Email:{' '}
//                 <span className="font-medium text-purple-200">
//                     {user?.email}
//                 </span>
//             </p>
//             <p className="text-xs text-slate-300 mb-2">
//                 Email verified:{' '}
//                 <span className="font-semibold">
//                     {user?.isEmailVerified ? 'Yes' : 'No'}
//                 </span>
//             </p>
//             <p className="text-xs text-slate-300">
//                 Voting:{' '}
//                 <span className="font-semibold">
//                     {user?.hasVoted ? 'You have already voted' : 'You have not voted yet'}
//                 </span>
//             </p>
//         </div>
//         <div className="rounded-xl bg-slate-800/80 border border-blue-500/30 p-4 text-xs text-slate-200">
//             <h3 className="font-semibold mb-1 text-sm">Transparency</h3>
//             <p>Results are calculated in real-time and displayed instantly once votes are cast.</p>
//         </div>
//     </aside>
//                 </div >
//             </main >
//         </div >
//     );
// };

// const Results = () => {
//     const [elections, setElections] = useState([]);
//     const [selectedElection, setSelectedElection] = useState(null);
//     const [electionResults, setElectionResults] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState('');

//     useEffect(() => {
//         fetchElections();
//     }, []);

//     const fetchElections = async () => {
//         try {
//             setLoading(true);
//             const response = await electionAPI.list();
//             setElections(response.data.elections);
//         } catch (error) {
//             setError('Failed to load elections');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const fetchElectionResults = async (electionId) => {
//         try {
//             const response = await electionAPI.results(electionId);
//             setElectionResults(response.data);
//             setSelectedElection(elections.find(e => e._id === electionId));
//         } catch (error) {
//             setError('Failed to load election results');
//         }
//     };

//     if (loading) return <p className="text-slate-300">Loading results...</p>;
//     if (error) return <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/40 text-red-200 text-sm">{error}</div>;

//     return (
//         <div className="results-container space-y-4">
//             <h2 className="text-xl font-bold mb-4">Election Results</h2>

//             {!selectedElection ? (
//                 <div className="space-y-3">
//                     <p className="text-slate-300 mb-4">Select an election to view results:</p>
//                     {elections.map((election) => (
//                         <div key={election._id} className="bg-slate-800/50 rounded-lg p-4 border border-purple-500/20">
//                             <div className="flex items-center justify-between">
//                                 <div>
//                                     <h3 className="font-semibold">{election.title}</h3>
//                                     <p className="text-sm text-slate-400">{election.description}</p>
//                                     <p className="text-xs text-slate-500">
//                                         Status: {election.isActive ? 'Active' : 'Completed'} |
//                                         Total Votes: {election.totalVotes || 0}
//                                     </p>
//                                 </div>
//                                 <button
//                                     onClick={() => fetchElectionResults(election._id)}
//                                     className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-sm font-semibold rounded"
//                                 >
//                                     View Results
//                                 </button>
//                             </div>
//                         </div>
//                     ))}
//                 </div>
//             ) : (
//                 <div className="space-y-4">
//                     <div className="flex items-center justify-between">
//                         <h3 className="text-lg font-semibold">{selectedElection.title}</h3>
//                         <button
//                             onClick={() => setSelectedElection(null)}
//                             className="px-3 py-1 bg-slate-600 hover:bg-slate-500 text-sm rounded"
//                         >
//                             Back to Elections
//                         </button>
//                     </div>
//                     <p className="text-slate-300">Total Votes: <span className="font-bold text-purple-300">{electionResults?.totalVotes || 0}</span></p>
//                     <div className="results-list space-y-3">
//                         {electionResults?.results?.map((candidate, index) => (
//                             <div key={index} className="result-item bg-slate-800/50 rounded-lg p-4 border border-purple-500/20">
//                                 <div className="flex items-center justify-between mb-2">
//                                     <div className="flex items-center gap-3">
//                                         <span className="text-lg font-bold text-purple-400">#{index + 1}</span>
//                                         <div>
//                                             <h4 className="font-semibold">{candidate.name}</h4>
//                                             <p className="text-xs text-slate-400">{candidate.party}</p>
//                                         </div>
//                                     </div>
//                                     <div className="text-right">
//                                         <p className="font-bold text-purple-300">{candidate.voteCount}</p>
//                                         <p className="text-xs text-slate-400">{candidate.percentage}%</p>
//                                     </div>
//                                 </div>
//                                 <div className="w-full bg-slate-700 rounded-full h-2">
//                                     <div
//                                         className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all"
//                                         style={{ width: `${candidate.percentage}%` }}
//                                     ></div>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// const VerifyVote = () => {
//     const [receiptCode, setReceiptCode] = useState('');
//     const [voteDetails, setVoteDetails] = useState(null);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState('');
//     const [success, setSuccess] = useState('');

//     const handleVerify = async (e) => {
//         e.preventDefault();
//         if (!receiptCode.trim()) {
//             setError('Please enter a receipt code');
//             return;
//         }

//         try {
//             setLoading(true);
//             setError('');
//             setSuccess('');
//             const response = await votingAPI.verifyReceipt({ receiptCode });
//             setVoteDetails(response.data.voteDetails);
//             setSuccess(response.data.message);
//             setReceiptCode('');
//         } catch (error) {
//             setError(error.response?.data?.message || 'Failed to verify receipt code');
//             setVoteDetails(null);
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="max-w-md mx-auto">
//             <div className="rounded-xl bg-slate-800/80 border border-purple-500/30 p-6">
//                 <h2 className="text-lg font-bold mb-2">Verify Your Vote</h2>
//                 <p className="text-sm text-slate-300 mb-4">
//                     Enter your receipt code to verify that your vote was recorded and counted.
//                 </p>

//                 {error && (
//                     <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/40 text-red-200 text-sm">
//                         {error}
//                     </div>
//                 )}
//                 {success && (
//                     <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/40 text-green-200 text-sm">
//                         {success}
//                     </div>
//                 )}

//                 <form onSubmit={handleVerify} className="space-y-3">
//                     <input
//                         type="text"
//                         placeholder="Enter receipt code (e.g., EVOTE-20260220-A1B2C3)"
//                         value={receiptCode}
//                         onChange={(e) => setReceiptCode(e.target.value.toUpperCase())}
//                         className="w-full px-4 py-2 rounded-lg bg-slate-700 border border-slate-600 focus:border-purple-500 outline-none transition text-white placeholder-slate-400"
//                     />
//                     <button
//                         type="submit"
//                         disabled={loading}
//                         className="w-full py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 font-semibold disabled:opacity-50 transition"
//                     >
//                         {loading ? 'Verifying...' : 'Verify Receipt'}
//                     </button>
//                 </form>

//                 {voteDetails && (
//                     <div className="mt-6 p-4 rounded-lg bg-slate-700/40 border border-purple-500/40 space-y-3">
//                         <div>
//                             <p className="text-xs text-slate-400">Receipt Code</p>
//                             <p className="font-mono text-sm font-bold text-purple-300">{voteDetails.receiptCode}</p>
//                         </div>
//                         <div>
//                             <p className="text-xs text-slate-400">Election</p>
//                             <p className="text-sm font-semibold">{voteDetails.election}</p>
//                         </div>
//                         <div>
//                             <p className="text-xs text-slate-400">Voted At</p>
//                             <p className="text-sm">{new Date(voteDetails.votedAt).toLocaleString()}</p>
//                         </div>
//                         <div>
//                             <p className="text-xs text-slate-400">Status</p>
//                             <p className="text-sm font-semibold text-green-300">✓ {voteDetails.status}</p>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default Dashboard;
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { votingAPI, electionAPI, candidateProfileAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [elections, setElections] = useState([]);
    const [selectedElection, setSelectedElection] = useState(null);
    const [electionCandidates, setElectionCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [activeTab, setActiveTab] = useState('elections');
    const [receiptCode, setReceiptCode] = useState(null);
    const [showReceiptModal, setShowReceiptModal] = useState(false);

    useEffect(() => {
        fetchElections();
    }, []);

    const fetchElections = async () => {
        try {
            setLoading(true);
            // Only show elections if user is approved
            if (user?.accountStatus !== 'approved') {
                setError('Your account is pending admin approval. Elections will be visible once approved.');
                setElections([]);
                setLoading(false);
                return;
            }
            const response = await electionAPI.list();
            setElections(response.data.elections);
        } catch (err) {
            setError('Failed to load elections');
        } finally {
            setLoading(false);
        }
    };

    const fetchElectionCandidates = async (electionId) => {
        try {
            setLoading(true);
            // Use approved candidate profiles for election
            const response = await candidateProfileAPI.approved(electionId);
            setElectionCandidates(response.data.profiles);
        } catch (err) {
            setError('Failed to load election candidates');
        } finally {
            setLoading(false);
        }
    };

    const handleElectionSelect = (election) => {
        setSelectedElection(election);
        fetchElectionCandidates(election._id);
        setActiveTab('vote');
    };

    const handleVote = async (candidateProfileId) => {
        if (!selectedElection) return;

        if (!window.confirm('Are you sure you want to vote for this candidate?')) return;

        try {
            // Use per-election voting route
            const response = await votingAPI.voteInElection(selectedElection._id, candidateProfileId);
            if (response.data.receiptCode) {
                setReceiptCode(response.data.receiptCode);
                setShowReceiptModal(true);
            }
            setSuccessMessage(response.data.message || 'Vote cast successfully!');
            setTimeout(() => setActiveTab('results'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to cast vote');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const copyReceiptCode = () => {
        navigator.clipboard.writeText(receiptCode);
        alert('Receipt code copied!');
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white">

            {/* HEADER */}
            <header className="border-b border-purple-500/20 bg-slate-900/80">
                <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between">
                    <h1 className="text-2xl font-bold">E-Voting Dashboard</h1>

                    <div className="flex gap-4 items-center">
                        <span className="text-sm">
                            Welcome, <b>{user?.fullName}</b>
                        </span>

                        <Link to="/profile" className="px-3 py-1 bg-slate-700 rounded">
                            Profile
                        </Link>

                        <button
                            onClick={handleLogout}
                            className="px-3 py-1 bg-red-500 rounded"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* RECEIPT MODAL */}
            {showReceiptModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
                    <div className="bg-slate-800 p-6 rounded-xl max-w-md w-full">
                        <h2 className="text-xl font-bold mb-3 text-center">
                            Vote Submitted Successfully
                        </h2>

                        <div className="bg-slate-900 p-3 rounded mb-4 text-purple-400 font-mono text-center">
                            {receiptCode}
                        </div>

                        <button
                            onClick={copyReceiptCode}
                            className="w-full mb-2 py-2 bg-purple-600 rounded"
                        >
                            Copy Receipt
                        </button>

                        <button
                            onClick={() => setShowReceiptModal(false)}
                            className="w-full py-2 bg-slate-700 rounded"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            <main className="max-w-6xl mx-auto p-6">

                {/* TAB BUTTONS */}
                <div className="flex gap-3 mb-6">
                    <button onClick={() => setActiveTab('elections')} className="px-4 py-2 bg-slate-700 rounded">
                        Elections
                    </button>

                    {selectedElection && (
                        <button onClick={() => setActiveTab('vote')} className="px-4 py-2 bg-slate-700 rounded">
                            Vote
                        </button>
                    )}

                    <button onClick={() => setActiveTab('results')} className="px-4 py-2 bg-slate-700 rounded">
                        Results
                    </button>

                    <button onClick={() => setActiveTab('verify')} className="px-4 py-2 bg-slate-700 rounded">
                        Verify
                    </button>
                </div>

                {error && <div className="mb-4 text-red-400">{error}</div>}
                {successMessage && <div className="mb-4 text-green-400">{successMessage}</div>}

                {/* ELECTIONS TAB */}
                {activeTab === 'elections' && (
                    <div className="grid md:grid-cols-3 gap-4">
                        {elections.map(election => (
                            <div key={election._id} className="bg-slate-800 p-4 rounded">
                                <h3 className="font-bold">{election.title}</h3>
                                <p className="text-sm text-slate-300">{election.description}</p>
                                <button
                                    className="mt-3 w-full py-2 bg-purple-600 rounded"
                                    onClick={() => handleElectionSelect(election)}
                                >
                                    Select
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* VOTE TAB */}
                {activeTab === 'vote' && selectedElection && (
                    <div className="grid md:grid-cols-3 gap-4">
                        {electionCandidates.map(candidate => (
                            <div key={candidate._id} className="bg-slate-800 p-4 rounded">
                                <h3 className="font-bold">{candidate.candidate?.name}</h3>
                                <p className="text-sm">{candidate.candidate?.party}</p>
                                <button
                                    onClick={() => handleVote(candidate._id)}
                                    className="mt-3 w-full py-2 bg-purple-600 rounded"
                                >
                                    Vote
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'results' && <Results />}
                {activeTab === 'verify' && <VerifyVote />}

            </main>
        </div>
    );
};

const Results = () => {
    return <div>Results Component</div>;
};

const VerifyVote = () => {
    return <div>Verify Vote Component</div>;
};

export default Dashboard;
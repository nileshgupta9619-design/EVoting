import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI, votingAPI } from '../utils/api';
import MainLayout from '../components/MainLayout';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Loading from '../components/Loading';
import Alert from '../components/Alert';
import Modal from '../components/Modal';

export default function ReceiptPage() {
    const navigate = useNavigate();
    const [votedElections, setVotedElections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);
    const [alert, setAlert] = useState(null);
    const [verifyModalOpen, setVerifyModalOpen] = useState(false);
    const [verifyCode, setVerifyCode] = useState('');
    const [verifyResult, setVerifyResult] = useState(null);

    useEffect(() => {
        fetchVotedElections();
    }, []);

    const fetchVotedElections = async () => {
        try {
            const response = await userAPI.getVotedElections();
            setVotedElections(response.data.data || []);
        } catch (error) {
            setAlert({
                type: 'error',
                title: 'Error',
                message: error.response?.data?.message || 'Failed to load elections',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCopyReceipt = (receiptCode) => {
        navigator.clipboard.writeText(receiptCode);
        setAlert({
            type: 'success',
            title: 'Copied',
            message: 'Receipt code copied to clipboard!',
        });
    };

    const handleVerifyReceipt = async () => {
        if (!verifyCode.trim()) {
            setAlert({
                type: 'error',
                title: 'Error',
                message: 'Please enter a receipt code',
            });
            return;
        }

        setVerifying(true);
        try {
            const response = await votingAPI.verifyReceipt({ receiptCode: verifyCode });
            setVerifyResult(response.data.data);
        } catch (error) {
            setAlert({
                type: 'error',
                title: 'Verification Failed',
                message: error.response?.data?.message || 'Invalid receipt code',
            });
            setVerifyResult(null);
        } finally {
            setVerifying(false);
        }
    };

    const closeVerifyModal = () => {
        setVerifyModalOpen(false);
        setVerifyCode('');
        setVerifyResult(null);
    };

    if (loading) return <Loading fullScreen />;

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg p-8 text-white shadow-lg">
                    <h1 className="text-4xl font-bold mb-2">🎟️ Vote Receipt Manager</h1>
                    <p className="text-green-100 text-lg">Manage and verify your voting receipts</p>
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

                {/* Verify Receipt Button */}
                <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-blue-800 mb-1">🔐 Verify a Receipt</h3>
                            <p className="text-blue-700 text-sm">Enter a receipt code to verify if a vote was recorded</p>
                        </div>
                        <Button
                            onClick={() => setVerifyModalOpen(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap ml-4"
                        >
                            Verify Receipt →
                        </Button>
                    </div>
                </Card>

                {/* Receipts List */}
                {votedElections.length > 0 ? (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-gray-800">📋 Your Vote Receipts ({votedElections.length})</h2>

                        {votedElections.map((election) => (
                            <ReceiptCard
                                key={election.electionId}
                                election={election}
                                onCopy={handleCopyReceipt}
                                onViewDetails={() => navigate(`/voted-elections`)}
                            />
                        ))}
                    </div>
                ) : (
                    <Card className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100">
                        <div className="text-6xl mb-4">🎟️</div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">No Receipts</h3>
                        <p className="text-gray-600 mb-6">You haven't voted in any elections yet</p>
                        <Button
                            onClick={() => navigate('/elections')}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            Browse Elections →
                        </Button>
                    </Card>
                )}

                {/* Navigation */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                        onClick={() => navigate('/dashboard')}
                        className="bg-gray-600 hover:bg-gray-700 text-white"
                    >
                        ← Dashboard
                    </Button>
                    <Button
                        onClick={() => navigate('/voted-elections')}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                        📋 Voting History
                    </Button>
                    <Button
                        onClick={() => navigate('/elections')}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        🗳️ Active Elections
                    </Button>
                </div>
            </div>

            {/* Verify Receipt Modal */}
            <Modal isOpen={verifyModalOpen} onClose={closeVerifyModal}>
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-4 pb-4 border-b">
                        <h2 className="text-2xl font-bold text-gray-800">🔐 Verify Receipt</h2>
                        <button
                            onClick={closeVerifyModal}
                            className="text-2xl text-gray-400 hover:text-gray-600"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Instructions */}
                    {!verifyResult && (
                        <div className="space-y-4">
                            <p className="text-gray-600 text-sm">
                                Enter your receipt code to verify that your vote was successfully recorded.
                            </p>

                            {/* Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Receipt Code
                                </label>
                                <Input
                                    type="text"
                                    value={verifyCode}
                                    onChange={(e) => setVerifyCode(e.target.value)}
                                    placeholder="Enter receipt code"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>

                            {/* Verify Button */}
                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    onClick={closeVerifyModal}
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-800"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleVerifyReceipt}
                                    disabled={verifying}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    {verifying ? 'Verifying...' : 'Verify'}
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Verification Result */}
                    {verifyResult && (
                        <div className="space-y-4">
                            <div className="bg-green-50 border-2 border-green-300 p-4 rounded-lg text-center">
                                <div className="text-4xl mb-2">✓</div>
                                <p className="text-green-800 font-bold">Vote Verified!</p>
                            </div>

                            {/* Result Details */}
                            <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                                <div>
                                    <p className="text-xs text-gray-600 font-semibold">Election</p>
                                    <p className="text-gray-800 font-bold">{verifyResult.electionTitle}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 font-semibold">Your Vote</p>
                                    <p className="text-gray-800 font-bold">{verifyResult.candidateName}</p>
                                    <p className="text-sm text-gray-600">{verifyResult.party}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 font-semibold">Voted At</p>
                                    <p className="text-gray-800 text-sm font-mono">
                                        {new Date(verifyResult.votedAt).toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600 font-semibold">Receipt Code</p>
                                    <p className="text-gray-800 text-sm font-mono break-all">
                                        {verifyResult.receiptCode}
                                    </p>
                                </div>
                            </div>

                            {/* Close Button */}
                            <Button
                                onClick={closeVerifyModal}
                                className="w-full bg-green-600 hover:bg-green-700 text-white"
                            >
                                Close
                            </Button>
                        </div>
                    )}
                </div>
            </Modal>
        </MainLayout>
    );
}

function ReceiptCard({ election, onCopy, onViewDetails }) {
    const votedCandidate = election.candidates.find(c => c.isVotedBy);

    return (
        <Card className="hover:shadow-lg transition-shadow">
            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 pb-4 border-b">
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800">{election.electionTitle}</h3>
                        <p className="text-sm text-gray-600 mt-1">{election.electionDescription}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                        <p className="text-xs text-gray-500 font-mono">
                            Voted: {new Date(election.votedAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                {/* Your Vote */}
                {votedCandidate && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-4 rounded">
                        <p className="text-xs font-semibold text-gray-600 mb-2">YOUR VOTE: ✓</p>
                        <p className="text-lg font-bold text-gray-800">{votedCandidate.candidateName}</p>
                        <p className="text-sm text-gray-600">{votedCandidate.party}</p>
                    </div>
                )}

                {/* Receipt Code */}
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <p className="text-xs font-semibold text-gray-600 mb-1">Receipt Code</p>
                    <div className="flex items-center justify-between gap-2">
                        <code className="flex-1 text-sm font-mono bg-white px-3 py-2 rounded border border-gray-300 break-all">
                            {election.receiptCode}
                        </code>
                        <button
                            onClick={() => onCopy(election.receiptCode)}
                            className="flex-shrink-0 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded font-medium text-sm transition-colors"
                        >
                            Copy
                        </button>
                    </div>
                </div>

                {/* Election Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-blue-50 p-3 rounded text-center">
                        <p className="text-xs text-gray-600 font-semibold">Total Votes</p>
                        <p className="text-lg font-bold text-blue-600">{election.totalVotes}</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded text-center">
                        <p className="text-xs text-gray-600 font-semibold">Candidates</p>
                        <p className="text-lg font-bold text-purple-600">{election.candidates.length}</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded text-center">
                        <p className="text-xs text-gray-600 font-semibold">Status</p>
                        <p className="text-lg font-bold text-green-600">
                            {election.isActive ? '🔴 Active' : '✓ Complete'}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                    <Button
                        onClick={() => onViewDetails()}
                        className="bg-gray-600 hover:bg-gray-700 text-white text-sm"
                    >
                        View Details
                    </Button>
                    <Button
                        onClick={() => onCopy(election.receiptCode)}
                        className="bg-green-600 hover:bg-green-700 text-white text-sm"
                    >
                        Copy Code
                    </Button>
                </div>
            </div>
        </Card>
    );
}

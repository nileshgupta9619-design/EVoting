import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { electionAPI, candidateProfileAPI } from '../utils/api';
import Modal from './Modal';
import Button from './Button';
import Card from './Card';
import Alert from './Alert';

export default function BecomeCandidateModal({ isOpen, onClose }) {
    const navigate = useNavigate();
    const [elections, setElections] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedElection, setSelectedElection] = useState(null);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null);
    const [myProfiles, setMyProfiles] = useState([]);
    const [showExisting, setShowExisting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchData();
        }
    }, [isOpen]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch active elections
            const electionRes = await electionAPI.list();
            const activeElections = (electionRes.data.data || []).filter((e) => {
                const now = new Date();
                const start = e.startDate ? new Date(e.startDate) : null;
                const end = e.endDate ? new Date(e.endDate) : null;
                return (now >= start || !start) && (now <= end || !end) && e.isActive;
            });
            console.log(activeElections);
            
            setElections(electionRes.data.data);

            // Check if user has existing profiles
            try {
                const profileRes = await candidateProfileAPI.myProfile();
                const profileData = profileRes.data.data;

                // Handle both array and single object responses
                if (Array.isArray(profileData)) {
                    setMyProfiles(profileData);
                } else if (profileData) {
                    setMyProfiles([profileData]);
                } else {
                    setMyProfiles([]);
                }
            } catch (err) {
                // No existing profiles
                setMyProfiles([]);
            }
        } catch (error) {
            setAlert({
                type: 'error',
                title: 'Error',
                message: 'Failed to load elections',
            });
        } finally {
            setLoading(false);
        }
    };

    const filteredElections = elections.filter((e) =>
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelectElection = (election) => {
        // Check if user already has a profile for this election
        const existingProfile = myProfiles?.find((p) => p.election?._id === election._id);
        if (existingProfile) {
            setAlert({
                type: 'warning',
                title: 'Already Applied',
                message: `You have already applied for "${election.title}" with status: ${existingProfile.status}`,
            });
            return;
        }

        setSelectedElection(election);
    };

    const handleProceed = () => {
        if (!selectedElection) {
            setAlert({
                type: 'error',
                title: 'Selection Required',
                message: 'Please select an election',
            });
            return;
        }

        // Close modal and navigate to candidate profile page with election pre-selected
        onClose();
        navigate(`/candidate/profile?electionId=${selectedElection._id}`);
    };

    const handleViewExisting = () => {
        onClose();
        navigate('/candidate/profile');
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Become a Candidate">
            <div className="space-y-6 max-h-96 overflow-y-auto">
                {/* Alert */}
                {alert && (
                    <Alert
                        type={alert.type}
                        title={alert.title}
                        message={alert.message}
                        onClose={() => setAlert(null)}
                    />
                )}

                {/* Existing Profiles */}
                {myProfiles && myProfiles.length > 0 && (
                    <Card className="bg-blue-50 border-l-4 border-blue-500">
                        <p className="text-sm text-blue-800 mb-3">
                            <strong>💡 You have {myProfiles.length} existing candidate profile(s):</strong>
                        </p>
                        <div className="space-y-2">
                            {myProfiles.map((profile, idx) => (
                                <div key={idx} className="text-sm text-blue-700">
                                    <p>
                                        {profile.election?.title} -{' '}
                                        <span className={`font-semibold ${profile.status === 'approved' ? 'text-green-600' :
                                                profile.status === 'rejected' ? 'text-red-600' :
                                                    'text-yellow-600'
                                            }`}>
                                            {profile.status === 'approved' ? '✅' :
                                                profile.status === 'rejected' ? '❌' : '⏳'}{' '}
                                            {profile.status.charAt(0).toUpperCase() + profile.status.slice(1)}
                                        </span>
                                    </p>
                                </div>
                            ))}
                        </div>
                        <Button
                            onClick={handleViewExisting}
                            variant="outline"
                            className="w-full mt-3 text-sm"
                        >
                            View/Edit My Profiles
                        </Button>
                    </Card>
                )}

                {/* Loading State */}
                {loading ? (
                    <div className="text-center py-8">
                        <p className="text-gray-600">Loading elections...</p>
                    </div>
                ) : (
                    <>
                        {/* Search Box */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                🔍 Search Elections
                            </label>
                            <input
                                type="text"
                                placeholder="Search by election name or description..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Elections Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                📋 Select Election
                            </label>

                            {filteredElections.length === 0 ? (
                                <Card className="text-center py-8 bg-gray-50">
                                    <p className="text-gray-600">
                                        {elections.length === 0
                                            ? 'No active elections available'
                                            : 'No elections match your search'}
                                    </p>
                                </Card>
                            ) : (
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {filteredElections.map((election) => (
                                        <button
                                            key={election._id}
                                            onClick={() => handleSelectElection(election)}
                                            className={`w-full p-3 rounded-lg border-2 transition-all text-left ${selectedElection?._id === election._id
                                                    ? 'border-blue-600 bg-blue-50 shadow-md'
                                                    : 'border-gray-300 hover:border-blue-400 bg-white hover:shadow-sm'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-800">
                                                        {election.title}
                                                    </h4>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {election.description?.substring(0, 60)}...
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-2">
                                                        👥 {election.candidates?.length || 0} candidates
                                                    </p>
                                                </div>
                                                {selectedElection?._id === election._id && (
                                                    <div className="text-xl text-blue-600 ml-2">✓</div>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Selected Election Details */}
                        {selectedElection && (
                            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
                                <div className="space-y-2">
                                    <p className="font-medium text-gray-800">Selected Election:</p>
                                    <p className="text-lg font-bold text-blue-600">{selectedElection.title}</p>
                                    <p className="text-sm text-gray-600">{selectedElection.description}</p>
                                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mt-3">
                                        <div>
                                            <p className="font-medium">📅 Start:</p>
                                            <p>{new Date(selectedElection.startDate).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <p className="font-medium">📅 End:</p>
                                            <p>{new Date(selectedElection.endDate).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* Info Box */}
                        <Card className="bg-amber-50 border-l-4 border-amber-500">
                            <p className="text-sm text-amber-800">
                                <strong>📝 Note:</strong> After selecting an election, you'll fill in your candidate details including name, party, description, and government ID on the next page. Your profile will then be submitted for admin approval.
                            </p>
                        </Card>
                    </>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6 border-t border-gray-200 pt-4">
                <Button onClick={onClose} variant="outline" className="flex-1">
                    Cancel
                </Button>
                <Button
                    onClick={handleProceed}
                    disabled={!selectedElection || loading}
                    className="flex-1"
                >
                    {loading ? 'Loading...' : 'Continue'}
                </Button>
            </div>
        </Modal>
    );
}

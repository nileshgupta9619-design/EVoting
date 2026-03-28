import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { electionAPI } from '../utils/api';
import MainLayout from '../components/MainLayout';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Loading from '../components/Loading';
import Alert from '../components/Alert';
import Modal from '../components/Modal';
import { toast } from 'react-toastify';

export default function AdminElections() {
    const navigate = useNavigate();
    const [elections, setElections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchElections();
    }, []);

    const fetchElections = async () => {
        try {
            const response = await electionAPI.list();
            setElections(response.data.data || []);
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

    const validateForm = () => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (!formData.startDate) newErrors.startDate = 'Start date is required';
        if (!formData.endDate) newErrors.endDate = 'End date is required';
        if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
            newErrors.endDate = 'End date must be after start date';
        }
        return newErrors;
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        const newErrors = validateForm();

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setSubmitting(true);
        try {
            
            await electionAPI.create(formData);
            setAlert({
                type: 'success',
                title: 'Election Created',
                message: 'Election has been created successfully',
            });
            setShowCreateModal(false);
            setFormData({ title: '', description: '', startDate: '', endDate: '' });
            toast.success("Election created Successfully")
            fetchElections();
        } catch (error) {
            setAlert({
                type: 'error',
                title: 'Error',
                message: error.response?.data?.message || 'Failed to create election',
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleStartElection = async (electionId) => {
        try {
            await electionAPI.start(electionId);
            setAlert({
                type: 'success',
                title: 'Election Started',
                message: 'Election has been started successfully',
            });
            fetchElections();
        } catch (error) {
            setAlert({
                type: 'error',
                title: 'Error',
                message: 'Failed to start election',
            });
        }
    };

    const handleStopElection = async (electionId) => {
        try {
            await electionAPI.stop(electionId);
            setAlert({
                type: 'success',
                title: 'Election Stopped',
                message: 'Election has been stopped successfully',
            });
            fetchElections();
        } catch (error) {
            setAlert({
                type: 'error',
                title: 'Error',
                message: 'Failed to stop election',
            });
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    if (loading) return <Loading fullScreen />;

    const getElectionStatus = (election) => {
        const now = new Date();
        const startDate = election.startDate ? new Date(election.startDate) : null;
        const endDate = election.endDate ? new Date(election.endDate) : null;

        if (!startDate || !endDate) {
            return 'draft';
        }

        if (now < startDate) {
            return 'upcoming';
        }

        if (now >= startDate && now <= endDate && election.isActive) {
            return 'active';
        }

        if (now > endDate || !election.isActive) {
            return 'completed';
        }

        return 'draft';
    };

    const stats = {
        upcoming: elections.filter((e) => getElectionStatus(e) === 'upcoming').length,
        active: elections.filter((e) => getElectionStatus(e) === 'active').length,
        completed: elections.filter((e) => getElectionStatus(e) === 'completed').length,
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg p-8 text-white shadow-lg">
                    <h1 className="text-3xl font-bold mb-2">📋 Election Management</h1>
                    <p className="text-green-100">Create and manage elections</p>
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

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-l-4 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 font-medium">Upcoming</p>
                                <p className="text-4xl font-bold text-blue-600 mt-1">{stats.upcoming}</p>
                            </div>
                            <div className="text-5xl">📅</div>
                        </div>
                    </Card>
                    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-l-4 border-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 font-medium">Active</p>
                                <p className="text-4xl font-bold text-green-600 mt-1">{stats.active}</p>
                            </div>
                            <div className="text-5xl">🔴</div>
                        </div>
                    </Card>
                    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-l-4 border-purple-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 font-medium">Completed</p>
                                <p className="text-4xl font-bold text-purple-600 mt-1">{stats.completed}</p>
                            </div>
                            <div className="text-5xl">✅</div>
                        </div>
                    </Card>
                </div>

                {/* Create Button */}
                <Button
                    onClick={() => setShowCreateModal(true)}
                    className="w-full md:w-auto text-lg py-3"
                >
                    + Create New Election
                </Button>

                {/* Elections List */}
                {elections.length > 0 ? (
                    <div className="space-y-4">
                        {elections.map((election) => (
                            <ElectionAdminCard
                                key={election._id}
                                election={election}
                                status={getElectionStatus(election)}
                                onStart={() => handleStartElection(election._id)}
                                onStop={() => handleStopElection(election._id)}
                                onViewCandidates={() => navigate(`/admin/election/${election._id}/candidates`)}
                            />
                        ))}
                    </div>
                ) : (
                    <Card className="text-center py-12">
                        <div className="text-6xl mb-4">📋</div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">No Elections</h3>
                        <p className="text-gray-600 mb-6">Create your first election to get started</p>
                        <Button onClick={() => setShowCreateModal(true)}>Create Election</Button>
                    </Card>
                )}

                {/* Create Election Modal */}
                <Modal
                    isOpen={showCreateModal}
                    onClose={() => {
                        setShowCreateModal(false);
                        setFormData({ title: '', description: '', startDate: '', endDate: '' });
                        setErrors({});
                    }}
                    title="Create New Election"
                >
                    <form onSubmit={handleCreate} className="space-y-4">
                        <Input
                            label="Election Title"
                            name="title"
                            placeholder="e.g., 2024 General Election"
                            value={formData.title}
                            onChange={handleChange}
                            error={errors.title}
                        />

                        <div>
                            <label className="block text-gray-700 font-medium text-sm mb-2">
                                Description
                            </label>
                            <textarea
                                name="description"
                                placeholder="Describe this election..."
                                value={formData.description}
                                onChange={handleChange}
                                rows="3"
                                className={`w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200 ${errors.description ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''
                                    }`}
                            />
                            {errors.description && <p className="text-red-600 text-sm mt-1">⚠ {errors.description}</p>}
                        </div>

                        <Input
                            label="Start Date & Time"
                            type="datetime-local"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleChange}
                            error={errors.startDate}
                        />

                        <Input
                            label="End Date & Time"
                            type="datetime-local"
                            name="endDate"
                            value={formData.endDate}
                            onChange={handleChange}
                            error={errors.endDate}
                        />

                        <div className="flex gap-3 pt-4">
                            <Button type="submit" loading={submitting} disabled={submitting} className="flex-1">
                                Create Election
                            </Button>
                            <Button
                                type="button"
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setFormData({ title: '', description: '', startDate: '', endDate: '' });
                                    setErrors({});
                                }}
                                variant="secondary"
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </MainLayout>
    );
}

function ElectionAdminCard({ election, status, onStart, onStop, onViewCandidates }) {
    const startDate = election.startDate ? new Date(election.startDate).toLocaleString() : 'Not set';
    const endDate = election.endDate ? new Date(election.endDate).toLocaleString() : 'Not set';

    const statusColor = {
        upcoming: 'bg-blue-100 text-blue-800',
        active: 'bg-green-100 text-green-800',
        completed: 'bg-gray-100 text-gray-800',
        draft: 'bg-gray-100 text-gray-800',
    };

    return (
        <Card className="border-l-4 border-green-500">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800">{election.title}</h3>
                    <p className="text-gray-600 mt-1">{election.description}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-4 ${statusColor[status]}`}>
                    {status.toUpperCase()}
                </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 text-sm text-gray-600">
                <p>
                    <span className="font-medium">📅 Start:</span> {startDate}
                </p>
                <p>
                    <span className="font-medium">📅 End:</span> {endDate}
                </p>
                <p>
                    <span className="font-medium">👥 Candidates:</span> {election.candidates?.length || 0}
                </p>
            </div>

            <div className="flex gap-2 flex-wrap">
                {status === 'upcoming' && (
                    <Button onClick={onStart} className="!px-4">
                        Start Election
                    </Button>
                )}
                {status === 'active' && (
                    <Button onClick={onStop} variant="danger" className="!px-4">
                        Stop Election
                    </Button>
                )}
                <Button onClick={onViewCandidates} variant="outline" className="!px-4">
                    View Candidates
                </Button>
            </div>
        </Card>
    );
}

import React, { useState, useEffect } from 'react';
import { adminAPI, electionAPI } from '../utils/api';
import MainLayout from '../components/MainLayout';
import Card from '../components/Card';
import Button from '../components/Button';
import Loading from '../components/Loading';
import Alert from '../components/Alert';
import Modal from '../components/Modal';

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [elections, setElections] = useState([]);
    const [selectedElection, setSelectedElection] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchUsers();
        fetchElections();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await adminAPI.getUsers();
            setUsers(response.data.data || []);
        } catch (error) {
            setAlert({
                type: 'error',
                title: 'Error',
                message: 'Failed to load users',
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchElections = async () => {
        try {
            const response = await electionAPI.list();
            setElections(response.data.data || []);
        } catch (error) {
            console.log('Failed to load elections');
        }
    };

    const handleApprove = async (userId) => {
        try {
            await adminAPI.approveUser(userId);
            setAlert({
                type: 'success',
                title: 'User Approved',
                message: 'User has been approved successfully',
            });
            fetchUsers();
        } catch (error) {
            setAlert({
                type: 'error',
                title: 'Error',
                message: 'Failed to approve user',
            });
        }
    };

    const handleReject = async (userId) => {
        try {
            await adminAPI.rejectUser(userId, {
                reason: 'Rejected by administrator',
            });
            setAlert({
                type: 'success',
                title: 'User Rejected',
                message: 'User has been rejected',
            });
            fetchUsers();
        } catch (error) {
            setAlert({
                type: 'error',
                title: 'Error',
                message: 'Failed to reject user',
            });
        }
    };

    const handleAssignElection = async () => {
        if (!selectedElection) {
            setAlert({
                type: 'error',
                title: 'Error',
                message: 'Please select an election',
            });
            return;
        }

        try {
            await adminAPI.assignElectionToUser(selectedUser._id, {
                electionId: selectedElection,
            });
            setAlert({
                type: 'success',
                title: 'Election Assigned',
                message: 'Election has been assigned to user',
            });
            setShowAssignModal(false);
            fetchUsers();
        } catch (error) {
            setAlert({
                type: 'error',
                title: 'Error',
                message: 'Failed to assign election',
            });
        }
    };

    if (loading) return <Loading fullScreen />;

    const filteredUsers =
        filter === 'all'
            ? users
            : filter === 'approved'
                ? users.filter((u) => u.accountStatus === 'approved')
                : filter === 'pending'
                    ? users.filter((u) => u.accountStatus === 'pending')
                    : users.filter((u) => u.accountStatus === 'rejected');

    const userStats = {
        all: users.length,
        approved: users.filter((u) => u.accountStatus === 'approved').length,
        pending: users.filter((u) => u.accountStatus === 'pending').length,
        rejected: users.filter((u) => u.accountStatus === 'rejected').length,
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-8 text-white shadow-lg">
                    <h1 className="text-3xl font-bold mb-2">👥 User Management</h1>
                    <p className="text-blue-100">Approve, reject, and manage voter registrations</p>
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

                {/* Filter Tabs */}
                <div className="flex gap-3">
                    {['all', 'approved', 'pending', 'rejected'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${filter === status
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                                }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)} ({userStats[status]})
                        </button>
                    ))}
                </div>

                {/* Users Table */}
                <Card className="overflow-hidden">
                    {filteredUsers.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50 border-b">
                                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Name</th>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Email</th>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Role</th>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((user) => (
                                        <tr key={user._id} className="border-b hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3">{user.fullName}</td>
                                            <td className="px-4 py-3">{user.email}</td>
                                            <td className="px-4 py-3">
                                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-medium ${user.accountStatus === 'approved'
                                                        ? 'bg-green-100 text-green-800'
                                                        : user.accountStatus === 'rejected'
                                                            ? 'bg-red-100 text-red-800'
                                                            : 'bg-yellow-100 text-yellow-800'
                                                        }`}
                                                >
                                                    {user.accountStatus.charAt(0).toUpperCase() + user.accountStatus.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-2">
                                                    {user.accountStatus !== 'approved' && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                onClick={() => handleApprove(user._id)}
                                                                className="!px-2 !py-1 text-xs"
                                                            >
                                                                Approve
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="danger"
                                                                onClick={() => handleReject(user._id)}
                                                                className="!px-2 !py-1 text-xs"
                                                            >
                                                                Reject
                                                            </Button>
                                                        </>
                                                    )}
                                                    {user.accountStatus === 'approved' && user.role === 'voter' && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => {
                                                                setSelectedUser(user);
                                                                setShowAssignModal(true);
                                                            }}
                                                            className="!px-2 !py-1 text-xs"
                                                        >
                                                            Assign Election
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-600">No users found</p>
                        </div>
                    )}
                </Card>

                {/* Assign Election Modal */}
                <Modal
                    isOpen={showAssignModal}
                    onClose={() => {
                        setShowAssignModal(false);
                        setSelectedUser(null);
                    }}
                    title="Assign Election"
                >
                    <div className="space-y-4">
                        <p className="text-gray-600">
                            Assign an election to <strong>{selectedUser?.fullName}</strong>
                        </p>
                        <div>
                            <label className="block text-gray-700 font-medium text-sm mb-2">
                                Select Election
                            </label>
                            <select
                                value={selectedElection}
                                onChange={(e) => setSelectedElection(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                            >
                                <option value="">-- Select an election --</option>
                                {elections.map((election) => (
                                    <option key={election._id} value={election._id}>
                                        {election.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex gap-3 pt-4">
                            <Button onClick={handleAssignElection} className="flex-1">
                                Assign
                            </Button>
                            <Button
                                onClick={() => {
                                    setShowAssignModal(false);
                                    setSelectedUser(null);
                                }}
                                variant="secondary"
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </Modal>
            </div>
        </MainLayout>
    );
}

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

const UserProfile = () => {
    const navigate = useNavigate();
    const { user, logout, token } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [userData, setUserData] = useState(null);
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [accountStatus, setAccountStatus] = useState(''); // New state for account status

    if (!token) {
        navigate('/login');
        return null;
    }

    useEffect(() => {
        // Fetch fresh user data from backend
        
        const fetchUserData = async () => {
            try {
                const response = await api.get('/user/profile'); // Ensure this is the correct route
                if (response.data?.user) {
                    setUserData(response.data.user);
                    console.log(response.data.user)
                    setFormData({
                        fullName: response.data.user.fullName || '',
                        phone: response.data.user.phone || '',
                        accountStatus: response.data.user.accountStatus || '', // Handle account status
                    });
                }
            } catch (error) {
                console.error('Failed to fetch user data:', error);
                setError('Failed to load profile data');
            }
        };

        if (token) {
            fetchUserData();
        } else {
            navigate('/login');
        }
    }, [token, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        if (!formData.fullName || !formData.phone) {
            setError('All fields are required');
            setLoading(false);
            return;
        }

        try {
            const response = await api.put('/users/profile', {
                fullName: formData.fullName,
                phone: formData.phone,
            });

            setMessage('Profile updated successfully!');
            setIsEditing(false);
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        const password = prompt('Enter your password to confirm account deletion:');

        if (!password) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            await api.delete('/users/account', {
                data: { password },
            });

            alert('Account deleted successfully');
            logout();
            navigate('/');
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to delete account');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
            <div className="absolute top-0 left-0 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />

            <div className="relative w-full max-w-2xl">
                <div className="bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-purple-500/20">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-white">User Profile</h2>
                            <p className="text-xs text-purple-300">Manage your account details and security</p>
                        </div>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="text-xs text-purple-300 hover:text-purple-100"
                        >
                            ← Back to Dashboard
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

                    {!isEditing ? (
                        <div className="grid md:grid-cols-2 gap-4 text-sm text-slate-100">
                            <div>
                                <p className="text-xs text-purple-300 mb-1">Full Name</p>
                                <p className="font-semibold mb-3">{userData?.fullName}</p>
                                <p className="text-xs text-purple-300 mb-1">Email</p>
                                <p className="font-semibold mb-3 break-all">{userData?.email}</p>
                                <p className="text-xs text-purple-300 mb-1">Phone</p>
                                <p className="font-semibold mb-3">{userData?.phone}</p>
                            </div>
                            <div>
                                <p className="text-xs text-purple-300 mb-1">Email Verified</p>
                                <p className="font-semibold mb-3">
                                    {userData?.isEmailVerified ? <p className='text-green-400'>✓ Yes</p> : <p className='text-red-500'>✗ No</p>}
                                </p>
                                <p className="text-xs text-purple-300 mb-1">Voting Status</p>
                                <p className="font-semibold mb-3">
                                    {userData?.hasVoted ? '✓ Already Voted' : '✗ Not Voted Yet'}
                                </p>
                                   <p className="text-xs text-purple-300 mb-1">Account Status</p>
                                   <p className="font-semibold mb-3">{userData?.accountStatus || 'N/A'}</p> {/* Display account status */}
                                <p className="text-xs text-purple-300 mb-1">Member Since</p>
                                <p className="font-semibold mb-3">
                                    {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : '-'}
                                </p>
                            </div>

                            <div className="md:col-span-2 mt-2 space-y-2">
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="w-full py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold text-sm"
                                >
                                    Edit Profile
                                </button>
                                <Link
                                    to="/change-password"
                                    className="block w-full text-center py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-sm font-semibold text-white"
                                >
                                    Change Password
                                </Link>
                                <button
                                    onClick={handleDeleteAccount}
                                    disabled={loading}
                                    className="w-full py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-sm disabled:opacity-70"
                                >
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-purple-200 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-lg bg-slate-700/60 border border-purple-500/30 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-purple-200 mb-1">Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 rounded-lg bg-slate-700/60 border border-purple-500/30 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 mt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold text-sm disabled:opacity-70"
                                >
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="flex-1 py-2 rounded-lg bg-slate-600 hover:bg-slate-500 text-sm font-semibold text-white"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
        </div>
    );
};

export default UserProfile;

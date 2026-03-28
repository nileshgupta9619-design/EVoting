import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI, candidateProfileAPI } from '../utils/api';
import Button from '../components/Button';
import Input from '../components/Input';
import Alert from '../components/Alert';
import Loading from '../components/Loading';

export default function CandidateLogin() {
    const navigate = useNavigate();
    const { user, login, loading: authLoading } = useAuth();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [alert, setAlert] = useState(null);
    const [loading, setLoading] = useState(false);

    // Redirect if already logged in as candidate
    useEffect(() => {
        if (user && !authLoading) {
            // Candidates are voters who have submitted candidate profiles
            navigate('/candidate/dashboard');
        }
    }, [user, authLoading, navigate]);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
        if (!formData.password) newErrors.password = 'Password is required';
        return newErrors;
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        const newErrors = validateForm();

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        try {
            const response = await authAPI.login(formData);
            const { user: userData, token } = response.data.data;

            // Only voters can be candidates
            if (userData.role !== 'voter') {
                setAlert({
                    type: 'error',
                    title: 'Access Denied',
                    message: 'Candidates must login as voters first.',
                });
                setLoading(false);
                return;
            }

            // Check if candidate has an approved profile
            try {
                const profileResponse = await candidateProfileAPI.myProfile();
                if (profileResponse.data.data.status !== 'approved') {
                    setAlert({
                        type: 'info',
                        title: 'Profile Under Review',
                        message: 'Your candidate profile is pending admin approval.',
                    });
                    // Still log them in but redirect to profile
                    login(token, userData);
                    navigate('/candidate/profile');
                    setLoading(false);
                    return;
                }
            } catch (error) {
                setAlert({
                    type: 'warning',
                    title: 'No Candidate Profile',
                    message: 'Please create your candidate profile first.',
                });
                // Still log them in but redirect to profile
                login(token, userData);
                navigate('/candidate/profile');
                setLoading(false);
                return;
            }

            login(token, userData);
            setAlert({
                type: 'success',
                title: 'Login Successful',
                message: `Welcome back, ${userData.fullName}!`,
            });
            setTimeout(() => {
                navigate('/candidate/dashboard');
            }, 1000);
        } catch (error) {
            setAlert({
                type: 'error',
                title: 'Login Failed',
                message: error.response?.data?.message || 'Invalid email or password',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    if (authLoading) return <Loading fullScreen />;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-400 to-indigo-600 flex items-center justify-center p-4">
            {/* Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 w-72 h-72 bg-white opacity-10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-10 right-10 w-72 h-72 bg-white opacity-10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            {/* Login Card */}
            <div className="w-full max-w-md relative z-10">
                {/* Header Card */}
                <div className="bg-white rounded-t-2xl shadow-2xl p-8 text-center mb-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-white text-3xl font-bold">👨‍💼</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Candidate Login</h1>
                    <p className="text-gray-600">Access your candidate dashboard</p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-b-2xl shadow-2xl p-8">
                    {/* Alert Messages */}
                    {alert && (
                        <div className="mb-6">
                            <Alert
                                type={alert.type}
                                title={alert.title}
                                message={alert.message}
                                onClose={() => setAlert(null)}
                            />
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        {/* Email Input */}
                        <Input
                            label="Email Address"
                            type="email"
                            name="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            error={errors.email}
                        />

                        {/* Password Input */}
                        <Input
                            label="Password"
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            error={errors.password}
                        />

                        {/* Forgot Password Link */}
                        <div className="flex justify-end">
                            <Link
                                to="/forgot-password"
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        {/* Login Button */}
                        <Button
                            type="submit"
                            loading={loading}
                            disabled={loading}
                            className="w-full text-base py-3"
                        >
                            Sign In
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="my-6 flex items-center">
                        <div className="flex-1 border-t border-gray-300"></div>
                        <span className="px-3 text-sm text-gray-500">or</span>
                        <div className="flex-1 border-t border-gray-300"></div>
                    </div>

                    {/* Other Login Options */}
                    <div className="space-y-3">
                        <p className="text-center text-sm text-gray-600">
                            Not a candidate?{' '}
                            <Link
                                to="/login"
                                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                            >
                                Voter Login
                            </Link>
                        </p>
                        <p className="text-center text-sm text-gray-600">
                            New candidate?{' '}
                            <Link
                                to="/register"
                                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                            >
                                Register Here
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-6 text-white text-sm">
                    <p>© 2026 E-Voting System. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
}

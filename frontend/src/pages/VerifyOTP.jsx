import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const VerifyOTP = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [searchParams] = useSearchParams();
    const [userId, setUserId] = useState('');

    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [timer, setTimer] = useState(0);
    const [accountPending, setAccountPending] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        let id = searchParams.get('userId');
        if (!id) {
            id = localStorage.getItem('evoting_userId');
        }
        setUserId(id || '');
    }, [searchParams]);

    useEffect(() => {
        if (timer > 0) {
            const interval = setTimeout(() => setTimer(timer - 1), 1000);
            return () => clearTimeout(interval);
        }
    }, [timer]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!userId) {
            setError('Missing userId. Please register again.');
            setLoading(false);
            return;
        }

        try {
            const response = await authAPI.verifyOTP({ userId, otp });
            const { token, user, accountStatus } = response.data;

            if (accountStatus === 'pending') {
                setAccountPending(true);
                setMessage('Your account is pending admin approval. You will be able to login once approved.');
                localStorage.setItem('tempToken', token);
                localStorage.setItem('tempUser', JSON.stringify(user));
                setLoading(false);
                return;
            }

            login(token, user);
            navigate('/dashboard');
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Verification failed';
            if (errorMsg.includes('rejected')) {
                // Extract rejection reason
                const reason = errorMsg.split('Reason: ')[1];
                setRejectionReason(reason || 'Not specified');
            }
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setLoading(true);
        setError('');

        if (!userId) {
            setError('Missing userId. Please register again.');
            setLoading(false);
            return;
        }

        try {
            await authAPI.resendOTP({ userId });
            setMessage('OTP sent successfully');
            setTimer(60);
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to resend OTP');
        } finally {
            setLoading(false);
        }
    };

    if (!userId) {
        return <div>Invalid request. Please register first.</div>;
    }

    // Account Pending Approval
    if (accountPending) {
        return (
            <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
                <div className="absolute top-0 left-0 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />

                <div className="relative w-full max-w-md">
                    <div className="bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-yellow-500/20">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Account Pending Approval</h2>
                            <p className="text-sm text-slate-300 mb-4">
                                Your email has been verified successfully! Your account is now pending admin approval.
                            </p>
                            <div className="bg-slate-700/40 border border-yellow-500/30 rounded-lg p-4 mb-6 text-left">
                                <p className="text-sm text-slate-200">
                                    <strong>Next Steps:</strong>
                                </p>
                                <ul className="text-xs text-slate-300 mt-2 space-y-1 list-disc list-inside">
                                    <li>Admin will verify your government ID document</li>
                                    <li>You will receive an email once your account is approved or rejected</li>
                                    <li>Approved accounts can start voting immediately</li>
                                </ul>
                            </div>
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full py-2.5 rounded-lg bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold text-sm"
                            >
                                Return to Login
                            </button>
                        </div>
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
    }

    // Account Rejected
    if (rejectionReason) {
        return (
            <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
                <div className="absolute top-0 left-0 w-80 h-80 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
                <div className="absolute top-0 right-0 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />

                <div className="relative w-full max-w-md">
                    <div className="bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-red-500/20">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Registration Rejected</h2>
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 text-left">
                                <p className="text-sm text-red-200">
                                    <strong>Reason:</strong> {rejectionReason}
                                </p>
                            </div>
                            <p className="text-sm text-slate-300 mb-6">
                                Please contact admin support or register again with valid documents.
                            </p>
                            <button
                                onClick={() => navigate('/register')}
                                className="w-full py-2.5 rounded-lg bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold text-sm"
                            >
                                Register Again
                            </button>
                        </div>
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
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
            <div className="absolute top-0 left-0 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />

            <div className="relative w-full max-w-md">
                <div className="bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-purple-500/20">
                    <h2 className="text-2xl font-bold text-white mb-1">Verify your email</h2>
                    <p className="text-xs text-purple-300 mb-4">Enter the 6-digit OTP sent to your email address</p>

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

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-purple-200 mb-1">OTP (6 digits)</label>
                            <input
                                type="text"
                                maxLength="6"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                required
                                placeholder="000000"
                                className="w-full px-4 py-3 rounded-lg bg-slate-700/60 border border-purple-500/30 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent tracking-widest text-center"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || otp.length !== 6}
                            className="w-full py-2.5 rounded-lg bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold text-sm disabled:opacity-70"
                        >
                            {loading ? 'Verifying...' : 'Verify OTP'}
                        </button>
                    </form>

                    <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={loading || timer > 0}
                        className="mt-4 w-full text-center text-xs text-purple-300 hover:text-purple-100 disabled:opacity-70"
                    >
                        {timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP'}
                    </button>
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

export default VerifyOTP;

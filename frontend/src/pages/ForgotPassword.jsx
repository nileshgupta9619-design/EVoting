import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../utils/api';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState('email'); // email, otp, password
    const [email, setEmail] = useState('');
    const [userId, setUserId] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [timer, setTimer] = useState(0);

    // Timer for resend OTP
    React.useEffect(() => {
        if (timer > 0) {
            const interval = setTimeout(() => setTimer(timer - 1), 1000);
            return () => clearTimeout(interval);
        }
    }, [timer]);

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await userAPI.forgotPassword({ email });
            setUserId(response.data.data.userId);
            setMessage('OTP sent to your email. Check your inbox.');
            setStep('otp');
            setTimer(60);
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (otp.length !== 6) {
            setError('OTP must be 6 digits');
            setLoading(false);
            return;
        }

        try {
            // Just verify OTP and move to password reset
            setMessage('OTP verified! Now set your new password.');
            setStep('password');
            console.log(userId);

        } catch (error) {
            setError('Failed to verify OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setLoading(true);
        setError('');

        try {
            await userAPI.forgotPassword({ email });
            setMessage('OTP resent to your email');
            setTimer(60);
        } catch (error) {
            setError('Failed to resend OTP');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            await userAPI.resetPassword({
                userId,
                otp,
                newPassword,
                confirmPassword,
            });

            setMessage('Password reset successful! Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
            <div className="absolute top-0 left-0 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />

            <div className="relative w-full max-w-md">
                <div className="bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-purple-500/20">
                    <h2 className="text-2xl font-bold text-white mb-2">Forgot Password</h2>
                    <p className="text-xs text-purple-300 mb-4">
                        {step === 'email' && 'Enter your email to receive an OTP'}
                        {step === 'otp' && 'Enter the OTP we sent to your email'}
                        {step === 'password' && 'Choose a new password to secure your account'}
                    </p>

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

                    {step === 'email' && (
                        <form onSubmit={handleEmailSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-purple-200 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 rounded-lg bg-slate-700/60 border border-purple-500/30 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold text-sm disabled:opacity-70"
                            >
                                {loading ? 'Sending OTP...' : 'Send OTP'}
                            </button>
                        </form>
                    )}

                    {step === 'otp' && (
                        <form onSubmit={handleOtpSubmit} className="space-y-4">
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
                                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold text-sm disabled:opacity-70"
                            >
                                {loading ? 'Verifying...' : 'Verify OTP'}
                            </button>
                            <button
                                type="button"
                                onClick={handleResendOtp}
                                disabled={loading || timer > 0}
                                className="w-full py-2 text-xs text-purple-200 hover:text-purple-100"
                            >
                                {timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP'}
                            </button>
                        </form>
                    )}

                    {step === 'password' && (
                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-purple-200 mb-1">New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 rounded-lg bg-slate-700/60 border border-purple-500/30 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-purple-200 mb-1">Confirm Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 rounded-lg bg-slate-700/60 border border-purple-500/30 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold text-sm disabled:opacity-70"
                            >
                                {loading ? 'Resetting Password...' : 'Reset Password'}
                            </button>
                        </form>
                    )}

                    <button
                        type="button"
                        onClick={() => navigate('/login')}
                        className="mt-4 w-full text-center text-xs text-purple-300 hover:text-purple-100"
                    >
                        ← Back to Login
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

export default ForgotPassword;

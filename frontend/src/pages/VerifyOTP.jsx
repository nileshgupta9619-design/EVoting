import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const VerifyOTP = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [searchParams] = useSearchParams();
    const userId = searchParams.get('userId');

    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [timer, setTimer] = useState(0);

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

        try {
            const response = await authAPI.verifyOTP({ userId, otp });
            const { token, user } = response.data;
            login(token, user);
            navigate('/dashboard');
        } catch (error) {
            setError(error.response?.data?.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setLoading(true);
        setError('');

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

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
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
                            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold text-sm disabled:opacity-70"
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

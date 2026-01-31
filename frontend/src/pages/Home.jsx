import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Home = () => {
    const navigate = useNavigate();
    const { token } = useSelector((state) => state.auth);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
            {/* Animated background elements */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

            <div className="relative max-w-2xl mx-auto text-center z-10">
                {/* Header */}
                <div className="mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl mb-6">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m7.538-4a2.5 2.5 0 00-3.536 0L9 12M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
                        Welcome to E-Voting
                    </h1>
                    <p className="text-xl text-purple-300 mb-8">
                        Secure, transparent, and accessible voting platform
                    </p>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                    {token ? (
                        <>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg transition transform hover:scale-105"
                            >
                                Go to Dashboard
                            </button>
                            <button
                                onClick={() => navigate('/profile')}
                                className="px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition border border-purple-500/30"
                            >
                                My Profile
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => navigate('/register')}
                                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg transition transform hover:scale-105"
                            >
                                Register Now
                            </button>
                            <button
                                onClick={() => navigate('/login')}
                                className="px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition border border-purple-500/30"
                            >
                                Sign In
                            </button>
                        </>
                    )}
                </div>

                {/* Features */}
                <div className="grid md:grid-cols-3 gap-6 mt-16">
                    {[
                        { icon: '🔒', title: 'Secure', desc: 'Encrypted and protected votes' },
                        { icon: '🔐', title: 'Verified', desc: 'Email OTP verification' },
                        { icon: '📊', title: 'Transparent', desc: 'Real-time results tracking' },
                    ].map((feature, idx) => (
                        <div key={idx} className="bg-slate-800/50 backdrop-blur-xl border border-purple-500/20 rounded-lg p-6 hover:border-purple-500/40 transition">
                            <div className="text-4xl mb-3">{feature.icon}</div>
                            <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                            <p className="text-purple-300 text-sm">{feature.desc}</p>
                        </div>
                    ))}
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

export default Home;

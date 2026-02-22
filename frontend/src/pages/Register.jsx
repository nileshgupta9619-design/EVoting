import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../utils/api';

const Register = () => {
    const navigate = useNavigate();
    const [aadharError, setAadharError] = useState('');
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        governmentIdType: 'aadhar',
        governmentIdNumber: '',
        governmentIdDocument: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [idDocumentPreview, setIdDocumentPreview] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "governmentIdNumber" && formData.governmentIdType === "aadhar") {
            // Check if letters are entered
            if (/[^0-9-]/.test(value)) {
                setAadharError("Enter valid Aadhar number.Letter not allowed");
                return;
            }

            // Remove dashes for digit checking
            let digits = value.replace(/\D/g, "");

            // More than 12 digits
            if (digits.length > 12) {
                setAadharError("Enter valid Aadhar number");
                return;
            }

            // Format with dash
            let formatted = digits.replace(/(\d{4})(?=\d)/g, "$1-");

            // Clear error if valid so far
            setAadharError("");

            setFormData((prev) => ({
                ...prev,
                governmentIdNumber: formatted,
            }));

            return;
        }

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64 = event.target.result;
                setFormData((prev) => ({
                    ...prev,
                    governmentIdDocument: base64,
                }));
                setIdDocumentPreview(base64);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validate formif (formData.governmentIdType === "aadhar") {
        const digitsOnly = formData.governmentIdNumber.replace(/-/g, "");

        if (digitsOnly.length !== 12) {
            setAadharError("Enter valid Aadhar number");
            setLoading(false);
            return;
        }

        if (!formData.governmentIdDocument) {
            setError('Please upload your government ID document');
            setLoading(false);
            return;
        }

        try {
            const response = await authAPI.register(formData);
            const userId = response.data?.data?.userId;
            const accountStatus = response.data?.data?.accountStatus;
            if (accountStatus === 'pending') {
                setError('Your account is pending admin approval. You will be able to login once approved.');
                setLoading(false);
                return;
            }
            if (!userId) {
                setError('Registration failed: No userId returned');
                setLoading(false);
                return;
            }
            localStorage.setItem('evoting_userId', userId);
            navigate(`/verify-otp?userId=${userId}`);
        } catch (error) {
            setError(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
            <div className="absolute top-0 left-0 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />

            <div className="relative w-full max-w-2xl">
                <div className="bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-purple-500/20">
                    <div className="text-center mb-6">
                        <h2 className="text-3xl font-bold text-white mb-2">Create your account</h2>
                        <p className="text-purple-300 text-sm">Register to participate in secure online voting</p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/40 text-red-200 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Full Name */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-purple-200 mb-1">Full Name</label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-lg bg-slate-700/60 border border-purple-500/30 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Enter your full name"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-purple-200 mb-1">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-lg bg-slate-700/60 border border-purple-500/30 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="your.email@example.com"
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-medium text-purple-200 mb-1">Phone</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-lg bg-slate-700/60 border border-purple-500/30 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="10-digit phone number"
                            />
                        </div>

                        {/* Password */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-purple-200 mb-1">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-lg bg-slate-700/60 border border-purple-500/30 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Minimum 6 characters"
                            />
                        </div>

                        {/* Government ID Type */}
                        <div>
                            <label className="block text-sm font-medium text-purple-200 mb-1">Government ID Type</label>
                            <select
                                name="governmentIdType"
                                value={formData.governmentIdType}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-lg bg-slate-700/60 border border-purple-500/30 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                                <option value="aadhar">Aadhar Card</option>
                                <option value="pan">PAN Card</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        {/* Government ID Number */}
                        <div>
                            <label className="block text-sm font-medium text-purple-200 mb-1">
                                {formData.governmentIdType === 'aadhar' ? 'Aadhar Number' : 'ID Number'}
                            </label>
                            <input
                                type="text"
                                name="governmentIdNumber"
                                value={formData.governmentIdNumber}
                                minLength={14}
                                maxLength={14}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-lg bg-slate-700/60 border border-purple-500/30 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder={formData.governmentIdType === 'aadhar' ? 'XXXX XXXX XXXX' : 'ID number'}
                            />
                        </div>
                        {aadharError && (
                            <p className="text-red-400 text-xs mt-1">{aadharError}</p>
                        )}

                        {/* Government ID Document Upload */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-purple-200 mb-1">Upload Government ID Document</label>
                            <input
                                type="file"
                                accept="image/*,.pdf"
                                onChange={handleFileChange}
                                required
                                className="w-full px-4 py-3 rounded-lg bg-slate-700/60 border border-purple-500/30 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                            <p className="text-xs text-slate-400 mt-1">Supported formats: JPG, PNG, PDF (Max 5MB)</p>
                        </div>

                        {/* ID Document Preview */}
                        {idDocumentPreview && (
                            <div className="md:col-span-2">
                                <p className="text-sm font-medium text-purple-200 mb-2">Document Preview</p>
                                <div className="rounded-lg overflow-hidden border border-purple-500/30 bg-slate-700/40">
                                    <img
                                        src={idDocumentPreview}
                                        alt="ID Document"
                                        className="w-full h-48 object-cover"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="md:col-span-2 mt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 rounded-lg bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold shadow-lg shadow-purple-500/30 transition disabled:opacity-60"
                            >
                                {loading ? 'Registering...' : 'Register'}
                            </button>
                        </div>
                    </form>

                    <p className="mt-4 text-center text-slate-300 text-sm">
                        Already have an account?{' '}
                        <Link to="/login" className="text-purple-300 hover:text-purple-100 font-semibold">
                            Login
                        </Link>
                    </p>
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

export default Register;

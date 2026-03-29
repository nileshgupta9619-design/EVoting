import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../utils/api';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Alert from '../components/Alert';
import Loading from '../components/Loading';

export default function CandidateRegisterPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        governmentIdType: 'National ID',
        governmentIdNumber: '',
        governmentIdDocumentUrl: '',
    });
    const [errors, setErrors] = useState({});
    const [alert, setAlert] = useState(null);
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData((prev) => ({ ...prev, governmentIdDocumentUrl: reader.result }));
                setImagePreview(reader.result);
                if (errors.governmentIdDocumentUrl) {
                    setErrors((prev) => ({ ...prev, governmentIdDocumentUrl: '' }));
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
        if (!formData.email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
        if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm password';
        else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        if (!formData.phone) newErrors.phone = 'Phone number is required';
        if (!formData.governmentIdNumber.trim()) newErrors.governmentIdNumber = 'Government ID number is required';
        if (!formData.governmentIdDocumentUrl) newErrors.governmentIdDocumentUrl = 'Government ID document is required';
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = validateForm();

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        try {
            const registerData = {
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                governmentIdType: formData.governmentIdType,
                governmentIdNumber: formData.governmentIdNumber,
                governmentIdDocumentUrl: formData.governmentIdDocumentUrl,
                fullName: formData.fullName,
            };

            const response = await authAPI.register(registerData);

            setAlert({
                type: 'success',
                title: 'Registration Successful',
                message: 'Check your email for OTP verification code',
            });

            setTimeout(() => {
                navigate('/verify-otp', {
                    state: { email: formData.email, isCandidate: true },
                });
            }, 2000);
        } catch (error) {
            setAlert({
                type: 'error',
                title: 'Registration Failed',
                message: error.response?.data?.message || 'Something went wrong',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header Card */}
                <Card className="bg-white/10 backdrop-blur-md border border-white/20 text-white mb-6">
                    <div className="text-center">
                        <div className="text-5xl mb-3">🎭</div>
                        <h1 className="text-3xl font-bold">Become a Candidate</h1>
                        <p className="text-indigo-100 mt-2">Register to participate in elections</p>
                    </div>
                </Card>

                {/* Alert */}
                {alert && (
                    <Alert
                        type={alert.type}
                        title={alert.title}
                        message={alert.message}
                        onClose={() => setAlert(null)}
                    />
                )}

                {/* Form Card */}
                <Card className="bg-white shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Full Name */}
                        <Input
                            label="Full Name"
                            name="fullName"
                            placeholder="Enter your full name"
                            value={formData.fullName}
                            onChange={handleChange}
                            error={errors.fullName}
                            required
                        />

                        {/* Email */}
                        <Input
                            label="Email"
                            type="email"
                            name="email"
                            placeholder="your@email.com"
                            value={formData.email}
                            onChange={handleChange}
                            error={errors.email}
                            required
                        />

                        {/* Phone */}
                        <Input
                            label="Phone Number"
                            name="phone"
                            placeholder="+1-555-0000"
                            value={formData.phone}
                            onChange={handleChange}
                            error={errors.phone}
                            required
                        />

                        {/* Password */}
                        <Input
                            label="Password"
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            error={errors.password}
                            required
                        />

                        {/* Confirm Password */}
                        <Input
                            label="Confirm Password"
                            type="password"
                            name="confirmPassword"
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            error={errors.confirmPassword}
                            required
                        />

                        {/* Government ID Type */}
                        <div>
                            <label className="block text-gray-700 font-medium text-sm mb-2">
                                Government ID Type *
                            </label>
                            <select
                                name="governmentIdType"
                                value={formData.governmentIdType}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-indigo-500 focus:outline-none"
                            >
                                <option value="National ID">National ID</option>
                                <option value="Passport">Passport</option>
                                <option value="Driver License">Driver License</option>
                                <option value="Voter ID">Voter ID</option>
                            </select>
                        </div>

                        {/* Government ID Number */}
                        <Input
                            label="Government ID Number"
                            name="governmentIdNumber"
                            placeholder="Enter your ID number"
                            value={formData.governmentIdNumber}
                            onChange={handleChange}
                            error={errors.governmentIdNumber}
                            required
                        />

                        {/* Government ID Document */}
                        <div>
                            <label className="block text-gray-700 font-medium text-sm mb-2">
                                Government ID Document *
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-indigo-500 focus:outline-none"
                            />
                            {imagePreview && (
                                <div className="mt-3">
                                    <img
                                        src={imagePreview}
                                        alt="ID Preview"
                                        className="w-32 h-32 rounded-lg object-cover border-2 border-indigo-300"
                                    />
                                </div>
                            )}
                            {errors.governmentIdDocumentUrl && (
                                <p className="text-red-600 text-sm mt-1">⚠️ {errors.governmentIdDocumentUrl}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            loading={loading}
                            disabled={loading}
                            className="w-full text-lg py-3 mt-6"
                        >
                            {loading ? 'Registering...' : '📝 Create Account'}
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="my-6 flex items-center">
                        <div className="flex-1 border-t border-gray-300"></div>
                        <span className="px-3 text-gray-500">OR</span>
                        <div className="flex-1 border-t border-gray-300"></div>
                    </div>

                    {/* Login Link */}
                    <div className="text-center">
                        <p className="text-gray-600">Already have an account?</p>
                        <Link
                            to="/candidate/login"
                            className="text-indigo-600 hover:text-indigo-700 font-semibold"
                        >
                            Login Here
                        </Link>
                    </div>
                </Card>

                {/* Footer */}
                <Card className="bg-indigo-100/50 border border-indigo-300 mt-4">
                    <p className="text-indigo-800 text-sm text-center">
                        ℹ️ Your account will be reviewed by admins before you can submit a candidate profile.
                    </p>
                </Card>
            </div>
        </div>
    );
}

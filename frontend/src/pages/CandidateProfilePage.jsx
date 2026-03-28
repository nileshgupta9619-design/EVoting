import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { candidateProfileAPI } from '../utils/api';
import MainLayout from '../components/MainLayout';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Loading from '../components/Loading';
import Alert from '../components/Alert';

export default function CandidateProfile() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        partyName: '',
        bio: '',
        platform: '',
        qualifications: '',
        experience: '',
    });
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [alert, setAlert] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await candidateProfileAPI.myProfile();
            const data = response.data.data;
            setProfile(data);
            setFormData({
                partyName: data.partyName || '',
                bio: data.bio || '',
                platform: data.platform || '',
                qualifications: data.qualifications || '',
                experience: data.experience || '',
            });
        } catch (error) {
            // No profile yet - which is fine, user will create new one
            console.log('No existing profile');
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.partyName.trim()) newErrors.partyName = 'Party name is required';
        if (!formData.bio.trim()) newErrors.bio = 'Bio is required';
        if (formData.bio.length < 50) newErrors.bio = 'Bio must be at least 50 characters';
        if (!formData.platform.trim()) newErrors.platform = 'Platform is required';
        return newErrors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = validateForm();

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setSubmitting(true);
        try {
            if (profile) {
                await candidateProfileAPI.update(profile._id, formData);
                setAlert({
                    type: 'success',
                    title: 'Profile Updated',
                    message: 'Your candidate profile has been updated successfully',
                });
            } else {
                await candidateProfileAPI.submit(formData);
                setAlert({
                    type: 'success',
                    title: 'Profile Created',
                    message: 'Your candidate profile has been submitted successfully',
                });
            }
            setTimeout(() => {
                navigate('/candidate/dashboard');
            }, 1500);
        } catch (error) {
            setAlert({
                type: 'error',
                title: 'Error',
                message: error.response?.data?.message || 'Failed to save profile',
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Loading fullScreen />;

    return (
        <MainLayout>
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                    <h1 className="text-3xl font-bold mb-2">
                        {profile ? 'Edit Your Profile' : 'Create Your Candidate Profile'}
                    </h1>
                    <p className="text-indigo-100">Complete your information to participate in elections</p>
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

                {/* Status Badge */}
                {profile && (
                    <Card className={`border-l-4 ${profile.status === 'approved'
                            ? 'border-green-500 bg-green-50'
                            : profile.status === 'rejected'
                                ? 'border-red-500 bg-red-50'
                                : 'border-yellow-500 bg-yellow-50'
                        }`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-lg">
                                    {profile.status === 'approved'
                                        ? '✅ Your profile is approved'
                                        : profile.status === 'rejected'
                                            ? '❌ Your profile was rejected'
                                            : '⏳ Your profile is pending review'}
                                </h3>
                                {profile.rejectionReason && (
                                    <p className="text-sm mt-2">{profile.rejectionReason}</p>
                                )}
                            </div>
                        </div>
                    </Card>
                )}

                {/* Form */}
                <Card>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Party Name */}
                        <Input
                            label="Party Name / Independent Name"
                            name="partyName"
                            placeholder="Enter your party name or 'Independent'"
                            value={formData.partyName}
                            onChange={handleChange}
                            error={errors.partyName}
                        />

                        {/* Bio */}
                        <div>
                            <label className="block text-gray-700 font-medium text-sm mb-2">
                                Bio (Brief Introduction)
                            </label>
                            <textarea
                                name="bio"
                                placeholder="Write a brief introduction about yourself (minimum 50 characters)"
                                value={formData.bio}
                                onChange={handleChange}
                                rows="5"
                                className={`w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200 ${errors.bio ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''
                                    }`}
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                {formData.bio.length}/500 characters
                            </p>
                            {errors.bio && <p className="text-red-600 text-sm mt-1">⚠ {errors.bio}</p>}
                        </div>

                        {/* Platform */}
                        <div>
                            <label className="block text-gray-700 font-medium text-sm mb-2">
                                Platform / Vision
                            </label>
                            <textarea
                                name="platform"
                                placeholder="What are your key policies and vision?"
                                value={formData.platform}
                                onChange={handleChange}
                                rows="4"
                                className={`w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200 ${errors.platform ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''
                                    }`}
                            />
                            {errors.platform && <p className="text-red-600 text-sm mt-1">⚠ {errors.platform}</p>}
                        </div>

                        {/* Qualifications */}
                        <Input
                            label="Qualifications (Optional)"
                            name="qualifications"
                            placeholder="List your qualifications and credentials"
                            value={formData.qualifications}
                            onChange={handleChange}
                        />

                        {/* Experience */}
                        <Input
                            label="Experience (Optional)"
                            name="experience"
                            placeholder="Describe your relevant experience"
                            value={formData.experience}
                            onChange={handleChange}
                        />

                        {/* Form Actions */}
                        <div className="flex gap-4 pt-6 border-t">
                            <Button
                                type="submit"
                                loading={submitting}
                                disabled={submitting}
                                className="flex-1 text-lg py-3"
                            >
                                {profile ? 'Update Profile' : 'Submit Profile'}
                            </Button>
                            <Button
                                type="button"
                                onClick={() => navigate('/candidate/dashboard')}
                                variant="secondary"
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </Card>

                {/* Info Box */}
                <Card className="bg-blue-50 border-l-4 border-blue-500">
                    <h4 className="font-bold text-blue-900 mb-2">ℹ️ Important Notes</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>✓ Complete all required fields to submit your profile</li>
                        <li>✓ Your profile will be reviewed by administrators</li>
                        <li>✓ You'll be notified when your profile is approved or rejected</li>
                        <li>✓ You can edit your profile anytime before approval</li>
                    </ul>
                </Card>
            </div>
        </MainLayout>
    );
}

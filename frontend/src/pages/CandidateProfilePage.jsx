import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { candidateProfileAPI, electionAPI } from '../utils/api';
import MainLayout from '../components/MainLayout';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Loading from '../components/Loading';
import Alert from '../components/Alert';

export default function CandidateProfilePage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const preSelectedElectionId = searchParams.get('electionId');

    const [formData, setFormData] = useState({
        candidateName: '',
        party: '',
        description: '',
        electionId: preSelectedElectionId || '',
        voterId: '',
        voterIdDocument: '',
        profileImage: '',
    });
    const [elections, setElections] = useState([]);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [alert, setAlert] = useState(null);
    const [errors, setErrors] = useState({});
    const [imagePreview, setImagePreview] = useState(null);
    const [docPreview, setDocPreview] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch existing profile if any
            // try {
            //     const response = await candidateProfileAPI.myProfile();
            //     const data = response.data.data;
            //     setProfile(data);
            //     setFormData({
            //         candidateName: data.candidateName || '',
            //         party: data.party || '',
            //         description: data.description || '',
            //         electionId: data.election?._id || '',
            //         voterId: data.voterId || '',
            //         voterIdDocument: data.voterIdDocument || '',
            //         profileImage: data.profileImage || '',
            //     });
            //     if (data.profileImage) {
            //         setImagePreview(data.profileImage);
            //     }
            //     if (data.voterIdDocument) {
            //         setDocPreview(data.voterIdDocument);
            //     }
            // } catch (error) {
            //     console.log('No existing profile yet');
            // }

            // Fetch available elections
            const electionsRes = await electionAPI.list();
            console.log("electionsRes.data",electionsRes.data.data.filter((election)=> election.isActive))
            // setElections(electionsRes.data.data || []);
            setElections(electionsRes.data.data.filter((election)=> election.isActive) || []);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.candidateName.trim()) newErrors.candidateName = 'Candidate name is required';
        if (!formData.party.trim()) newErrors.party = 'Political party is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (formData.description.length < 10) newErrors.description = 'Description must be at least 10 characters';
        if (!formData.electionId) newErrors.electionId = 'Please select an election';
        if (!formData.voterId.trim()) newErrors.voterId = 'Voter ID is required';
        if (!formData.voterIdDocument && !profile) newErrors.voterIdDocument = 'Voter ID document is required';
        return newErrors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handleImageChange = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData((prev) => ({ ...prev, [field]: reader.result }));
                if (field === 'profileImage') {
                    setImagePreview(reader.result);
                } else if (field === 'voterIdDocument') {
                    setDocPreview(reader.result);
                }
            };
            reader.readAsDataURL(file);
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
                // Update existing profile
                const updateData = {
                    candidateName: formData.candidateName,
                    party: formData.party,
                    description: formData.description,
                    voterId: formData.voterId,
                };
                if (formData.profileImage && formData.profileImage.startsWith('data:')) {
                    updateData.profileImage = formData.profileImage;
                }
                if (formData.voterIdDocument && formData.voterIdDocument.startsWith('data:')) {
                    updateData.voterIdDocument = formData.voterIdDocument;
                }
                await candidateProfileAPI.update(profile._id, updateData);
                setAlert({
                    type: 'success',
                    title: 'Profile Updated',
                    message: 'Your candidate profile has been updated successfully',
                });
            } else {
                // Create new profile
                await candidateProfileAPI.submit(formData);
                setAlert({
                    type: 'success',
                    title: 'Profile Submitted',
                    message: 'Your candidate profile has been submitted for admin review',
                });
            }
            setTimeout(() => {
                navigate('/candidate/dashboard');
            }, 2000);
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
                                            : '⏳Create Your Candidate profile'}
                                </h3>
                                {profile.rejectionReason && (
                                    <p className="text-sm mt-2 font-medium">Reason: {profile.rejectionReason}</p>
                                )}
                            </div>
                        </div>
                    </Card>
                )}
                <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                    {/* <h1 className="text-3xl font-bold mb-2">
                        {profile ? 'Edit Candidate Profile' : 'Create Candidate Profile'}
                    </h1> */}
                    <p className="text-indigo-100">
                        {profile
                            ? 'Update your information to participate in elections'
                            : 'Fill in your details to become a candidate in elections'}
                    </p>
                </Card>

                {/* Form */}
                <Card>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Candidate Name */}
                        <Input
                            label="Full Name"
                            name="candidateName"
                            placeholder="Enter your full name"
                            value={formData.candidateName}
                            onChange={handleChange}
                            error={errors.candidateName}
                            required
                        />

                        {/* Political Party */}
                        <Input
                            label="Political Party / Organization"
                            name="party"
                            placeholder="Enter party name or 'Independent'"
                            value={formData.party}
                            onChange={handleChange}
                            error={errors.party}
                            required
                        />

                        {/* Description */}
                        <div>
                            <label className="block text-gray-700 font-medium text-sm mb-2">
                                Bio / Description *
                            </label>
                            <textarea
                                name="description"
                                placeholder="Write about yourself, background, and vision (minimum 10 characters)"
                                value={formData.description}
                                onChange={handleChange}
                                rows="5"
                                className={`w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all duration-200 font-sans ${errors.description ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''
                                    }`}
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                {formData.description.length} characters
                            </p>
                            {errors.description && <p className="text-red-600 text-sm mt-1">⚠️ {errors.description}</p>}
                        </div>

                        {/* Election Selection */}
                        <div>
                            <label className="block text-gray-700 font-medium text-sm mb-2">
                                Select Election *
                            </label>
                            <select
                                name="electionId"
                                value={formData.electionId}
                                onChange={handleChange}
                                className={`w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all duration-200 ${errors.electionId ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''
                                    }`}
                                // disabled={profile} // Can't change election after creation
                            >
                                <option value="">-- Select an election --</option>
                                {elections.map((election) => (
                                    <option key={election._id} value={election._id}>
                                        {election.title}
                                    </option>
                                ))}
                            </select>
                            {errors.electionId && <p className="text-red-600 text-sm mt-1">⚠️ {errors.electionId}</p>}
                        </div>

                        {/* Voter ID */}
                        <Input
                            label="Government Voter ID Number *"
                            name="voterId"
                            placeholder="Enter your voter ID number"
                            value={formData.voterId}
                            onChange={handleChange}
                            error={errors.voterId}
                            required
                        />

                        {/* Voter ID Document */}
                        <div>
                            <label className="block text-gray-700 font-medium text-sm mb-2">
                                Voter ID Document Image {!profile && '*'}
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    handleImageChange(e, 'voterIdDocument');
                                    if (errors.voterIdDocument) {
                                        setErrors((prev) => ({ ...prev, voterIdDocument: '' }));
                                    }
                                }}
                                className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-indigo-500 focus:outline-none"
                            />
                            {docPreview && (
                                <div className="mt-3">
                                    <img
                                        src={docPreview}
                                        alt="Voter Doc Preview"
                                        className="w-32 h-32 rounded-lg object-cover border-2 border-gray-300"
                                    />
                                </div>
                            )}
                            {errors.voterIdDocument && (
                                <p className="text-red-600 text-sm mt-1">⚠️ {errors.voterIdDocument}</p>
                            )}
                        </div>

                        {/* Profile Image */}
                        <div>
                            <label className="block text-gray-700 font-medium text-sm mb-2">
                                Profile Picture (Optional)
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageChange(e, 'profileImage')}
                                className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 focus:border-indigo-500 focus:outline-none"
                            />
                            {imagePreview && (
                                <div className="mt-3">
                                    <img
                                        src={imagePreview}
                                        alt="Profile Preview"
                                        className="w-32 h-32 rounded-lg object-cover border-2 border-gray-300"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Form Actions */}
                        <div className="flex gap-4 pt-6 border-t">
                            <Button
                                type="submit"
                                loading={submitting}
                                disabled={submitting}
                                className="flex-1 text-lg py-3"
                            >
                                {profile ? '✏️ Update Profile' : '📝 Submit Profile'}
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
                    <h4 className="font-bold text-blue-900 mb-2">ℹ️ Important Information</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>✓ Your account must be approved by admins before you can submit a profile</li>
                        <li>✓ Complete all required (*) fields to submit your profile</li>
                        <li>✓ Your profile will be reviewed by administrators</li>
                        <li>✓ You'll be notified when your profile is approved or rejected</li>
                        <li>✓ You can edit your profile before admin approval</li>
                    </ul>
                </Card>
            </div>
        </MainLayout>
    );
}

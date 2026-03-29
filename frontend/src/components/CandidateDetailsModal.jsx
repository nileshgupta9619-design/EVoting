import React from 'react';
import Modal from './Modal';
import Card from './Card';
import Button from './Button';

export default function CandidateDetailsModal({ isOpen, onClose, candidate, onVote }) {
    if (!isOpen || !candidate) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Candidate Details">
            <div className="space-y-6">
                {/* Profile Avatar */}
                {candidate.profileImage && (
                    <div className="flex justify-center">
                        <img
                            src={candidate.profileImage}
                            alt={candidate.candidateName}
                            className="w-24 h-24 rounded-full border-4 border-blue-500 object-cover"
                        />
                    </div>
                )}

                {/* Name and Party */}
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {candidate.candidateName || candidate.partyName}
                    </h2>
                    <p className="text-lg text-blue-600 font-semibold">
                        🏛️ {candidate.party || candidate.partyName}
                    </p>
                </div>

                {/* Description/Bio */}
                {(candidate.description || candidate.bio) && (
                    <Card className="bg-gray-50">
                        <h3 className="font-semibold text-gray-800 mb-2">📖 Biography</h3>
                        <p className="text-gray-700 leading-relaxed">
                            {candidate.description || candidate.bio}
                        </p>
                    </Card>
                )}

                {/* Platform/Qualifications */}
                {candidate.platform && (
                    <Card className="bg-blue-50 border-l-4 border-blue-500">
                        <h3 className="font-semibold text-gray-800 mb-2">💡 Platform</h3>
                        <p className="text-gray-700 leading-relaxed">{candidate.platform}</p>
                    </Card>
                )}

                {/* Vote Count */}
                <Card className="bg-gradient-to-r from-green-50 to-emerald-50">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-700 font-medium">📊 Current Votes</span>
                        <span className="text-3xl font-bold text-green-600">
                            {candidate.voteCount || 0}
                        </span>
                    </div>
                </Card>

                {/* Info Message */}
                <Card className="bg-amber-50 border-l-4 border-amber-500">
                    <p className="text-sm text-amber-800">
                        <strong>⚠️ Important:</strong> After you vote, you <strong>cannot change or cancel your vote</strong>.
                        Please review candidate details carefully before confirming your vote.
                    </p>
                </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6 border-t border-gray-200 pt-4">
                <Button onClick={onClose} variant="outline" className="flex-1">
                    Back
                </Button>
                <Button
                    onClick={(e) => {
                        e.preventDefault();
                        onVote();
                        onClose();
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                >
                    ✓ Vote For This Candidate
                </Button>
            </div>
        </Modal>
    );
}

// frontend/src/pages/UserProfilePage.tsx
import React, { useEffect, useState } from 'react';
import apiClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { UserCircleIcon, StarIcon, AcademicCapIcon, EnvelopeIcon, IdentificationIcon, ArrowPathIcon, ExclamationCircleIcon, TrophyIcon } from '@heroicons/react/24/outline';
import { User } from '../types'; // Import the User interface

const UserProfilePage: React.FC = () => {
    const { user: authUser, loading: authLoading } = useAuth(); // Get authenticated user from context
    const [profile, setProfile] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            setLoading(true);
            setError(null);

            if (authLoading) {
                // Wait for authentication to complete
                return;
            }

            if (!authUser) {
                setError('You must be logged in to view your profile.');
                setLoading(false);
                return;
            }

            try {
                // Fetch user data from your backend.
                // Assuming an endpoint like /api/users/:id exists
                const response = await apiClient.get<User>(`/users/${authUser._id}`);
                setProfile(response.data);
            } catch (err: any) {
                console.error('Error fetching user profile:', err.response?.data || err.message);
                setError('Failed to load profile data. ' + (err.response?.data?.message || ''));
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [authUser, authLoading]);

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } }
    };

    if (loading || authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <ArrowPathIcon className="h-16 w-16 text-indigo-600 animate-spin" />
                <p className="ml-4 text-xl text-gray-700">Loading Profile...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
                <ExclamationCircleIcon className="h-20 w-20 text-red-500 mb-4" />
                <p className="text-red-600 text-center text-2xl font-semibold mb-4">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (!profile) {
        return <div className="text-red-500 text-center mt-8 text-lg">Profile data not available.</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="bg-white rounded-2xl shadow-xl p-8 md:p-10 max-w-3xl mx-auto"
                >
                    <div className="flex flex-col items-center mb-8">
                        <UserCircleIcon className="h-28 w-28 text-indigo-600 mb-4" />
                        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{profile.username}</h1>
                        <p className="text-lg text-gray-600 flex items-center">
                            <IdentificationIcon className="h-5 w-5 mr-2 text-gray-500" />
                            Role: <span className="font-semibold capitalize ml-1">{profile.role}</span>
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 border-t pt-8 border-gray-200">
                        <motion.div variants={itemVariants} className="flex items-center text-gray-700">
                            <EnvelopeIcon className="h-6 w-6 mr-3 text-blue-500" />
                            <span className="font-semibold">Email:</span> {profile.email}
                        </motion.div>
                        {profile.role === 'student' && profile.grade && (
                            <motion.div variants={itemVariants} className="flex items-center text-gray-700">
                                <AcademicCapIcon className="h-6 w-6 mr-3 text-green-500" />
                                <span className="font-semibold">Grade:</span> {profile.grade}
                            </motion.div>
                        )}
                        <motion.div variants={itemVariants} className="flex items-center text-gray-700">
                            <StarIcon className="h-6 w-6 mr-3 text-yellow-500" />
                            <span className="font-semibold">Total XP:</span> {profile.totalXp || 0}
                        </motion.div>
                        <motion.div variants={itemVariants} className="flex items-center text-gray-700">
                            <TrophyIcon className="h-6 w-6 mr-3 text-purple-500" />
                            <span className="font-semibold">Current Level:</span> {profile.currentLevel || 1}
                        </motion.div>
                    </div>

                    {profile.badges && profile.badges.length > 0 && (
                        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="mb-8 border-t pt-8 border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                                <TrophyIcon className="h-7 w-7 mr-3 text-yellow-500" />
                                Badges Earned
                            </h2>
                            <div className="flex flex-wrap gap-3">
                                {profile.badges.map((badge, index) => (
                                    <motion.span
                                        key={index}
                                        variants={itemVariants}
                                        className="bg-indigo-100 text-indigo-800 text-sm font-medium px-4 py-1.5 rounded-full shadow-sm flex items-center"
                                    >
                                        <StarIcon className="h-4 w-4 mr-2 text-indigo-600" /> {badge}
                                    </motion.span>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    <div className="text-center mt-10 border-t pt-8 border-gray-200">
                        <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105">
                            Edit Profile
                        </button>
                        {/* You might add more actions here, e.g., "View My Projects" */}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default UserProfilePage;

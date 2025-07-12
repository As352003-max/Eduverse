import React, { useEffect, useState } from 'react';
import apiClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import {
    UserCircleIcon,
    StarIcon,
    AcademicCapIcon,
    EnvelopeIcon,
    IdentificationIcon,
    ArrowPathIcon,
    ExclamationCircleIcon,
    TrophyIcon,
    ChartBarIcon,
    ClockIcon
} from '@heroicons/react/24/outline';
import BadgeDisplay from '../components/BadgeDisplay';
import { calculateLevel } from '../utils/gamificationUtilsFrontend';

interface UserProfile {
    _id: string;
    username: string;
    email: string;
    role: string;
    grade?: number;
    totalXp?: number;
    currentLevel?: number;
    badges?: string[];
}

interface UserAnalytics {
    totalModulesAttempted: number;
    modulesCompleted: number;
    completionRate: number;
    totalAvailableModules: number;
    recentActivity: Array<{
        moduleId: string;
        score: number;
        completed: boolean;
        lastAttemptedAt: string;
    }>;
}

const motivationalQuotes = [
    "Every expert was once a beginner.",
    "Keep pushing your limits.",
    "Learning never exhausts the mind.",
    "Your journey matters more than perfection."
];
const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

const UserProfilePage: React.FC = () => {
    const { user: authUser, loading: authLoading } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserProfileAndAnalytics = async () => {
            setLoading(true);
            setError(null);

            if (authLoading) return;

            if (!authUser) {
                setError('You must be logged in to view your profile.');
                setLoading(false);
                return;
            }

            try {
                const profileResponse = await apiClient.get<UserProfile>(`/users/${authUser._id}`);
                setProfile(profileResponse.data);

                if (authUser.role === 'student') {
                    const analyticsResponse = await apiClient.get<{ analytics: UserAnalytics }>(`/analytics/student/${authUser._id}`);
                    setAnalytics(analyticsResponse.data.analytics);
                } else {
                    setAnalytics(null);
                }

            } catch (err: any) {
                console.error('Error fetching user data:', err.response?.data || err.message);
                if (err.response?.status === 404 && authUser.role === 'student') {
                    setError('Student analytics data not found. Please ensure the student ID is correct and analytics exist for them.');
                } else {
                    setError('Failed to load profile data. ' + (err.response?.data?.message || ''));
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfileAndAnalytics();
    }, [authUser, authLoading]);

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

    const userLevel = profile.totalXp !== undefined ? calculateLevel(profile.totalXp) : 1;

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
                        <p className="text-sm italic text-gray-500 mt-2">"{randomQuote}"</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 border-t pt-8 border-gray-200">
                        <motion.div variants={itemVariants} className="flex items-center text-gray-700">
                            <EnvelopeIcon className="h-6 w-6 mr-3 text-blue-500" />
                            <span className="font-semibold">Email:</span> {profile.email}
                        </motion.div>
                        {profile.role === 'student' && profile.grade !== undefined && (
                            <motion.div variants={itemVariants} className="flex items-center text-gray-700">
                                <AcademicCapIcon className="h-6 w-6 mr-3 text-green-500" />
                                <span className="font-semibold">Grade:</span> {profile.grade}
                            </motion.div>
                        )}
                        {profile.totalXp !== undefined && (
                            <motion.div variants={itemVariants} className="flex flex-col text-gray-700">
                                <div className="flex items-center">
                                    <StarIcon className="h-6 w-6 mr-3 text-yellow-500" />
                                    <span className="font-semibold">Total XP:</span> <CountUp end={profile.totalXp} duration={1.5} />
                                </div>
                                <div className="h-3 bg-gray-300 rounded-full overflow-hidden mt-2">
                                    <div
                                        className="bg-indigo-600 h-full"
                                        style={{ width: `${(profile.totalXp % 1000) / 10}%` }}
                                    />
                                </div>
                                <p className="text-sm text-gray-500 mt-1">XP to next level: {1000 - (profile.totalXp % 1000)}</p>
                            </motion.div>
                        )}
                        {profile.totalXp !== undefined && (
                            <motion.div variants={itemVariants} className="flex items-center text-gray-700">
                                <TrophyIcon className="h-6 w-6 mr-3 text-purple-500" />
                                <span className="font-semibold">Current Level:</span> {userLevel}
                            </motion.div>
                        )}
                    </div>

                    {profile.badges && profile.badges.length > 0 && (
                        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="mb-8 border-t pt-8 border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                                <TrophyIcon className="h-7 w-7 mr-3 text-yellow-500" />
                                Badges Earned
                            </h2>
                            <BadgeDisplay badges={profile.badges} />
                        </motion.div>
                    )}

                    {!profile.badges || profile.badges.length === 0 && (
                        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="mb-8 border-t pt-8 border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                                <TrophyIcon className="h-7 w-7 mr-3 text-yellow-500" />
                                Badges Earned
                            </h2>
                            <div className="text-center text-gray-600 p-4 bg-gray-100 rounded-lg">
                                <p>No badges earned yet. Keep playing to unlock them!</p>
                            </div>
                        </motion.div>
                    )}

                    {analytics && (
                        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="mb-8 border-t pt-8 border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                                <ChartBarIcon className="h-7 w-7 mr-3 text-blue-500" />
                                Learning Progress
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="bg-blue-50 bg-opacity-70 p-4 rounded-lg shadow-sm">
                                    <p className="text-sm text-gray-600">Modules Attempted</p>
                                    <p className="text-2xl font-semibold text-blue-800">{analytics.totalModulesAttempted}</p>
                                </div>
                                <div className="bg-green-50 bg-opacity-70 p-4 rounded-lg shadow-sm">
                                    <p className="text-sm text-gray-600">Modules Completed</p>
                                    <p className="text-2xl font-semibold text-green-800">{analytics.modulesCompleted}</p>
                                </div>
                                <div className="bg-purple-50 bg-opacity-70 p-4 rounded-lg shadow-sm">
                                    <p className="text-sm text-gray-600">Completion Rate</p>
                                    <p className="text-2xl font-semibold text-purple-800">{analytics.completionRate?.toFixed(2) || 0}%</p>
                                </div>
                                <div className="bg-yellow-50 bg-opacity-70 p-4 rounded-lg shadow-sm">
                                    <p className="text-sm text-gray-600">Total Available Modules</p>
                                    <p className="text-2xl font-semibold text-yellow-800">{analytics.totalAvailableModules}</p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {analytics && analytics.recentActivity && analytics.recentActivity.length > 0 && (
                        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="mb-8 border-t pt-8 border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                                <ClockIcon className="h-7 w-7 mr-3 text-teal-500" />
                                Recent Activity
                            </h2>
                            <ul className="space-y-3">
                                {analytics.recentActivity.map((activity, index) => (
                                    <li key={index} className="bg-gray-50 p-4 rounded-lg shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center text-gray-700">
                                        <span className="font-medium">Module ID: {activity.moduleId}</span>
                                        <div className="flex flex-col sm:flex-row sm:space-x-4 mt-2 sm:mt-0">
                                            <span>Score: {activity.score || 'N/A'}</span>
                                            <span className="font-semibold">{activity.completed ? 'Completed' : 'Attempted'}</span>
                                            <span className="text-sm text-gray-500">{new Date(activity.lastAttemptedAt).toLocaleDateString()}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    )}

                    <div className="text-center mt-10 border-t pt-8 border-gray-200">
                        <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105">
                            Edit Profile
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default UserProfilePage;

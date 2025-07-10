import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { AcademicCapIcon, UserCircleIcon, ChartBarIcon, TrophyIcon, ArrowPathIcon, ExclamationCircleIcon, ClockIcon, BookOpenIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface StudentProfile {
    _id: string;
    username: string;
    email: string;
    role: string;
    totalXp: number;
    currentLevel: number;
    badges: string[];
    grade?: string;
}

interface StudentAnalytics {
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

const StudentProgressDetailPage: React.FC = () => {
    const { studentId } = useParams<{ studentId: string }>();
    const { user: authUser, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
    const [studentAnalytics, setStudentAnalytics] = useState<StudentAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStudentData = async () => {
            setLoading(true);
            setError(null);

            if (authLoading) {
                return;
            }

            if (!authUser || (authUser.role !== 'teacher' && authUser.role !== 'parent' && authUser.role !== 'admin')) {
                setError('You are not authorized to view this student\'s progress.');
                setLoading(false);
                return;
            }

            if (!studentId) {
                setError('No student ID provided in the URL.');
                setLoading(false);
                return;
            }

            try {
                // Fetch student's basic profile
                const profileRes = await apiClient.get<StudentProfile>(`/users/${studentId}`);
                setStudentProfile(profileRes.data);

                // Fetch student's analytics data
                const analyticsRes = await apiClient.get<{ analytics: StudentAnalytics }>(`/analytics/student/${studentId}`);
                setStudentAnalytics(analyticsRes.data.analytics);

            } catch (err: any) {
                console.error('Error fetching student data:', err.response?.data || err.message);
                setError('Failed to load student progress. ' + (err.response?.data?.message || ''));
            } finally {
                setLoading(false);
            }
        };

        fetchStudentData();
    }, [studentId, authUser, authLoading]);

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
                <p className="ml-4 text-xl text-gray-700">Loading Student Progress...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
                <ExclamationCircleIcon className="h-20 w-20 text-red-500 mb-4" />
                <p className="text-red-600 text-center text-2xl font-semibold mb-4">{error}</p>
                <button
                    onClick={() => navigate(-1)} // Go back to the previous page
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300"
                >
                    Go Back
                </button>
            </div>
        );
    }

    if (!studentProfile) {
        return <div className="text-red-500 text-center mt-8 text-lg">Student data not available.</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="bg-white rounded-2xl shadow-xl p-8 md:p-10 max-w-4xl mx-auto"
                >
                    <div className="flex flex-col items-center mb-8">
                        <UserCircleIcon className="h-28 w-28 text-indigo-600 mb-4" />
                        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{studentProfile.username}'s Progress</h1>
                        <p className="text-lg text-gray-600 flex items-center">
                            <AcademicCapIcon className="h-5 w-5 mr-2 text-gray-500" />
                            <span className="font-semibold">Email:</span> {studentProfile.email}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 border-t pt-8 border-gray-200">
                        <motion.div variants={itemVariants} className="flex items-center text-gray-700">
                            <TrophyIcon className="h-6 w-6 mr-3 text-purple-500" />
                            <span className="font-semibold">Current Level:</span> {studentProfile.currentLevel || 1}
                        </motion.div>
                        <motion.div variants={itemVariants} className="flex items-center text-gray-700">
                            <ChartBarIcon className="h-6 w-6 mr-3 text-yellow-500" />
                            <span className="font-semibold">Total XP:</span> {studentProfile.totalXp || 0}
                        </motion.div>
                        {studentProfile.role === 'student' && studentProfile.grade && (
                            <motion.div variants={itemVariants} className="flex items-center text-gray-700">
                                <BookOpenIcon className="h-6 w-6 mr-3 text-green-500" />
                                <span className="font-semibold">Grade:</span> {studentProfile.grade}
                            </motion.div>
                        )}
                    </div>

                    {studentAnalytics && (
                        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="mb-8 border-t pt-8 border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                                <ChartBarIcon className="h-7 w-7 mr-3 text-blue-500" />
                                Learning Overview
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="bg-blue-50 bg-opacity-70 p-4 rounded-lg shadow-sm">
                                    <p className="text-sm text-gray-600">Modules Attempted</p>
                                    <p className="text-2xl font-semibold text-blue-800">{studentAnalytics.totalModulesAttempted}</p>
                                </div>
                                <div className="bg-green-50 bg-opacity-70 p-4 rounded-lg shadow-sm">
                                    <p className="text-sm text-gray-600">Modules Completed</p>
                                    <p className="text-2xl font-semibold text-green-800">{studentAnalytics.modulesCompleted}</p>
                                </div>
                                <div className="bg-purple-50 bg-opacity-70 p-4 rounded-lg shadow-sm">
                                    <p className="text-sm text-gray-600">Completion Rate</p>
                                    <p className="text-2xl font-semibold text-purple-800">{studentAnalytics.completionRate?.toFixed(2) || 0}%</p>
                                </div>
                                <div className="bg-yellow-50 bg-opacity-70 p-4 rounded-lg shadow-sm">
                                    <p className="text-sm text-gray-600">Total Available Modules</p>
                                    <p className="text-2xl font-semibold text-yellow-800">{studentAnalytics.totalAvailableModules}</p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {studentProfile.badges && studentProfile.badges.length > 0 && (
                        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="mb-8 border-t pt-8 border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                                <TrophyIcon className="h-7 w-7 mr-3 text-yellow-500" />
                                Badges Earned
                            </h2>
                            <div className="flex flex-wrap gap-3">
                                {studentProfile.badges.map((badge, index) => (
                                    <motion.span
                                        key={index}
                                        variants={itemVariants}
                                        className="bg-indigo-100 text-indigo-800 text-sm font-medium px-4 py-1.5 rounded-full shadow-sm flex items-center"
                                    >
                                        <CheckCircleIcon className="h-4 w-4 mr-2 text-indigo-600" /> {badge}
                                    </motion.span>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {studentAnalytics && studentAnalytics.recentActivity && studentAnalytics.recentActivity.length > 0 && (
                        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="mb-8 border-t pt-8 border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                                <ClockIcon className="h-7 w-7 mr-3 text-teal-500" />
                                Recent Activity
                            </h2>
                            <ul className="space-y-3">
                                {studentAnalytics.recentActivity.map((activity, index) => (
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
                        <button
                            onClick={() => navigate(-1)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default StudentProgressDetailPage;
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/axiosClient';
import { motion } from 'framer-motion';
import {
    BookOpenIcon,
    ChartBarIcon,
    PuzzlePieceIcon,
    ChatBubbleLeftRightIcon,
    TrophyIcon,
    UserCircleIcon,
    UsersIcon,
    ClipboardDocumentListIcon,
    SparklesIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';

interface StudentAnalyticsData {
    userId: string;
    username: string;
    totalXp: number;
    currentLevel: number;
    completedModules: number;
    quizzesPassed: number;
    averageScore: number;
    recentActivities: { activity: string; date: string }[];
}

interface StudentInfo {
    _id: string;
    username: string;
    email: string;
    totalXp: number;
    currentLevel: number;
}

interface AdminOverviewData {
    totalUsers: number;
    totalStudents: number;
    totalTeachers: number;
    totalParents: number;
    activeModules: number;
}

const DashboardPage: React.FC = () => {
    const { user, logout, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [data, setData] = useState<StudentAnalyticsData | StudentInfo[] | AdminOverviewData | null>(null);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoadingData(true);
            setError(null);

            if (authLoading || !user) {
                setLoadingData(false);
                return;
            }

            try {
                let res;
                if (user.role === 'student') {
                    res = await apiClient.get<StudentAnalyticsData>(`/analytics/student/${user._id}`);
                } else if (user.role === 'teacher' || user.role === 'parent') {
                    // CORRECTED LINE: Changed from '/users/students' to '/users/role/student'
                    res = await apiClient.get<StudentInfo[]>('/users/role/student');
                } else if (user.role === 'admin') {
                    res = await apiClient.get<AdminOverviewData>('/analytics/overview');
                } else {
                    setError('Unsupported user role.');
                    setLoadingData(false);
                    return;
                }
                setData(res?.data || null);
            } catch (err: any) {
                console.error('Error fetching dashboard data:', err.response?.data || err.message);
                setError('Failed to load dashboard data. ' + (err.response?.data?.message || ''));
            } finally {
                setLoadingData(false);
            }
        };

        if (!authLoading && user) {
            fetchDashboardData();
        }
    }, [user, authLoading]);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    if (authLoading || loadingData) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <ArrowPathIcon className="h-16 w-16 text-indigo-600 animate-spin" />
                <p className="ml-4 text-xl text-gray-700">Loading Dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
                <p className="text-red-600 text-center text-2xl font-semibold mb-4">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300"
                >
                    Retry
                </button>
                <button
                    onClick={handleLogout}
                    className="mt-4 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300"
                >
                    Logout
                </button>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="text-center mt-8 text-red-500">
                You must be logged in to access the dashboard. <Link to="/login" className="text-blue-600 hover:underline">Login here</Link>
            </div>
        );
    }

    const cardVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl shadow-xl p-8 mb-12 text-center"
                >
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
                        Welcome, <span className="text-yellow-300">{user.username}!</span>
                    </h1>
                    <p className="text-xl opacity-90">
                        Your personalized learning journey begins here.
                    </p>
                    <div className="mt-4 text-lg">
                        <p>Role: <span className="font-semibold">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span></p>
                        {user.role === 'student' && (
                            <p>Level: <span className="font-semibold">{user.currentLevel}</span> | XP: <span className="font-semibold">{user.totalXp}</span></p>
                        )}
                    </div>
                </motion.div>

                <h2 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    {[
                        { title: 'Explore Modules', icon: BookOpenIcon, link: '/modules', color: 'bg-blue-500', hover: 'hover:bg-blue-600' },
                        { title: 'Play Games', icon: PuzzlePieceIcon, link: '/modules', color: 'bg-green-500', hover: 'hover:bg-green-600' },
                        { title: 'AI Chat', icon: ChatBubbleLeftRightIcon, link: '/ai-chat', color: 'bg-purple-500', hover: 'hover:bg-purple-600' },
                        { title: 'My Projects', icon: ClipboardDocumentListIcon, link: '/projects', color: 'bg-yellow-500', hover: 'hover:bg-yellow-600' },
                        { title: 'Leaderboard', icon: TrophyIcon, link: '/leaderboard', color: 'bg-red-500', hover: 'hover:bg-red-600' },
                        { title: 'My Profile', icon: UserCircleIcon, link: '/profile', color: 'bg-indigo-500', hover: 'hover:bg-indigo-600' },
                    ].map((item, index) => (
                        <motion.div
                            key={item.title}
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: index * 0.1 }}
                            className={`p-6 rounded-xl shadow-lg ${item.color} text-white flex flex-col items-center justify-center text-center transform transition duration-300 ease-in-out ${item.hover} hover:scale-105`}
                        >
                            <Link to={item.link} className="flex flex-col items-center justify-center w-full h-full">
                                <item.icon className="h-16 w-16 mb-4" />
                                <h3 className="text-2xl font-bold">{item.title}</h3>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {user.role === 'student' && data && (data as StudentAnalyticsData).userId && (
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                        className="bg-white rounded-xl shadow-lg p-6 mb-8"
                    >
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <ChartBarIcon className="h-7 w-7 mr-3 text-indigo-600" /> Your Learning Progress
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg text-gray-700">
                            <p><strong>Total XP:</strong> <span className="font-semibold text-indigo-700">{(data as StudentAnalyticsData).totalXp}</span></p>
                            <p><strong>Current Level:</strong> <span className="font-semibold text-purple-700">{(data as StudentAnalyticsData).currentLevel}</span></p>
                            <p><strong>Completed Modules:</strong> <span className="font-semibold text-green-700">{(data as StudentAnalyticsData).completedModules}</span></p>
                            <p><strong>Quizzes Passed:</strong> <span className="font-semibold text-blue-700">{(data as StudentAnalyticsData).quizzesPassed}</span></p>
                            <p><strong>Average Quiz Score:</strong> <span className="font-semibold text-yellow-700">{(data as StudentAnalyticsData).averageScore}%</span></p>
                        </div>
                        {(data as StudentAnalyticsData).recentActivities && (data as StudentAnalyticsData).recentActivities.length > 0 && (
                            <div className="mt-6">
                                <h3 className="text-xl font-bold text-gray-800 mb-3">Recent Activities</h3>
                                <ul className="list-disc list-inside text-gray-600">
                                    {(data as StudentAnalyticsData).recentActivities.map((activity, index) => (
                                        <li key={index} className="mb-1">
                                            {activity.activity} on {new Date(activity.date).toLocaleDateString()}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </motion.div>
                )}

                {(user.role === 'teacher' || user.role === 'parent') && data && Array.isArray(data) && (
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                        className="bg-white rounded-xl shadow-lg p-6 mb-8"
                    >
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <UsersIcon className="h-7 w-7 mr-3 text-indigo-600" /> Your Associated Students
                        </h2>
                        {data.length === 0 ? (
                            <p className="text-gray-600">No students found.</p>
                        ) : (
                            <ul className="divide-y divide-gray-200">
                                {data.map((student: StudentInfo) => (
                                    <li key={student._id} className="py-3 flex justify-between items-center">
                                        <div>
                                            <p className="text-lg font-semibold text-gray-800">{student.username}</p>
                                            <p className="text-sm text-gray-500">{student.email}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-md text-gray-700">Level: {student.currentLevel}</p>
                                            <p className="text-md text-gray-700">XP: {student.totalXp}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </motion.div>
                )}

                {user.role === 'admin' && data && !Array.isArray(data) && (data as AdminOverviewData).totalUsers !== undefined && (
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                        className="bg-white rounded-xl shadow-lg p-6 mb-8"
                    >
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <SparklesIcon className="h-7 w-7 mr-3 text-indigo-600" /> Admin Overview
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-lg text-gray-700">
                            <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
                                <p className="text-sm text-gray-600">Total Users</p>
                                <p className="text-2xl font-semibold text-blue-800">{(data as AdminOverviewData).totalUsers}</p>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg shadow-sm">
                                <p className="text-sm text-gray-600">Total Students</p>
                                <p className="text-2xl font-semibold text-green-800">{(data as AdminOverviewData).totalStudents}</p>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-lg shadow-sm">
                                <p className="text-sm text-gray-600">Total Teachers</p>
                                <p className="text-2xl font-semibold text-purple-800">{(data as AdminOverviewData).totalTeachers}</p>
                            </div>
                            <div className="bg-yellow-50 p-4 rounded-lg shadow-sm">
                                <p className="text-sm text-gray-600">Total Parents</p>
                                <p className="text-2xl font-semibold text-yellow-800">{(data as AdminOverviewData).totalParents}</p>
                            </div>
                            <div className="bg-red-50 p-4 rounded-lg shadow-sm">
                                <p className="text-sm text-gray-600">Active Modules</p>
                                <p className="text-2xl font-semibold text-red-800">{(data as AdminOverviewData).activeModules}</p>
                            </div>
                        </div>
                    </motion.div>
                )}

                <div className="text-center mt-10">
                    <button
                        onClick={handleLogout}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
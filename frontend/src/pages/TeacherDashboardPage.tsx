import React, { useEffect, useState } from 'react';
import apiClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { AcademicCapIcon, UserGroupIcon, ArrowPathIcon, ExclamationCircleIcon, EyeIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

interface Student {
    _id: string;
    username: string;
    email: string;
    totalXp: number;
    currentLevel: number;
    role: string;
}

const TeacherDashboardPage: React.FC = () => {
    const { user: authUser, loading: authLoading } = useAuth();
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStudents = async () => {
            setLoading(true);
            setError(null);

            if (authLoading) {
                return;
            }

            if (!authUser || (authUser.role !== 'teacher' && authUser.role !== 'admin')) {
                setError('You are not authorized to view this page.');
                setLoading(false);
                return;
            }

            try {
                const response = await apiClient.get<Student[]>('/dashboard/teacher/students');
                setStudents(response.data);
            } catch (err: any) {
                console.error('Error fetching students:', err.response?.data || err.message);
                setError('Failed to load students data. ' + (err.response?.data?.message || ''));
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
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
                <p className="ml-4 text-xl text-gray-700">Loading Students...</p>
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

    return (
        <div className="min-h-screen bg-gray-100 py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="bg-white rounded-2xl shadow-xl p-8 md:p-10 max-w-5xl mx-auto"
                >
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-4xl font-extrabold text-gray-900 flex items-center">
                            <UserGroupIcon className="h-10 w-10 text-indigo-600 mr-4" />
                            Student Roster
                        </h1>
                    </div>

                    {students.length === 0 ? (
                        <div className="text-center text-gray-600 text-xl py-10">
                            No student accounts found.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white rounded-lg shadow-md overflow-hidden">
                                <thead className="bg-indigo-600 text-white">
                                    <tr>
                                        <th className="py-3 px-6 text-left text-sm font-medium uppercase tracking-wider">Username</th>
                                        <th className="py-3 px-6 text-left text-sm font-medium uppercase tracking-wider">Email</th>
                                        <th className="py-3 px-6 text-left text-sm font-medium uppercase tracking-wider">Total XP</th>
                                        <th className="py-3 px-6 text-left text-sm font-medium uppercase tracking-wider">Level</th>
                                        <th className="py-3 px-6 text-right text-sm font-medium uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {students.map((student) => (
                                        <motion.tr
                                            key={student._id}
                                            variants={itemVariants}
                                            whileHover={{ scale: 1.01, backgroundColor: '#f3f4f6' }}
                                            className="bg-white hover:bg-gray-50 transition duration-150 ease-in-out"
                                        >
                                            <td className="py-4 px-6 whitespace-nowrap text-gray-800 font-medium flex items-center">
                                                <AcademicCapIcon className="h-5 w-5 text-indigo-500 mr-2" />
                                                {student.username}
                                            </td>
                                            <td className="py-4 px-6 whitespace-nowrap text-gray-600">{student.email}</td>
                                            <td className="py-4 px-6 whitespace-nowrap text-gray-600">{student.totalXp}</td>
                                            <td className="py-4 px-6 whitespace-nowrap text-gray-600">{student.currentLevel}</td>
                                            <td className="py-4 px-6 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => navigate(`/dashboard/students/${student._id}`)}
                                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150"
                                                >
                                                    <EyeIcon className="h-5 w-5 mr-2" /> View Progress
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default TeacherDashboardPage;
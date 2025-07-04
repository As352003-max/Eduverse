import React, { useEffect, useState } from 'react';
import apiClient from '../api/axiosClient';
import { motion } from 'framer-motion';
import { TrophyIcon, ArrowPathIcon, ExclamationCircleIcon, UserCircleIcon, StarIcon } from '@heroicons/react/24/outline';
import { LeaderboardEntry } from '../types'; 

const LeaderboardPage: React.FC = () => {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await apiClient.get<LeaderboardEntry[]>('/games/leaderboard');
                setLeaderboard(response.data);
            } catch (err: any) {
                console.error('Error fetching leaderboard:', err.response?.data || err.message);
                setError('Failed to load leaderboard. ' + (err.response?.data?.message || 'Please check your backend server.'));
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <ArrowPathIcon className="h-16 w-16 text-indigo-600 animate-spin" />
                <p className="ml-4 text-xl text-gray-700">Loading Leaderboard...</p>
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
                <motion.h1
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-10 text-center flex items-center justify-center"
                >
                    <TrophyIcon className="h-10 w-10 mr-4 text-yellow-500" />
                    Global Leaderboard
                </motion.h1>

                {leaderboard.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="bg-white rounded-2xl shadow-lg p-10 text-center flex flex-col items-center justify-center"
                    >
                        <UserCircleIcon className="h-24 w-24 text-gray-400 mb-6" />
                        <p className="text-xl text-gray-700 font-semibold mb-4">No users on the leaderboard yet.</p>
                        <p className="text-lg text-gray-600">Start playing and earning XP to climb the ranks!</p>
                    </motion.div>
                ) : (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="bg-white rounded-2xl shadow-lg p-6"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {leaderboard.map((entry, index) => (
                                <motion.div
                                    key={entry._id}
                                    variants={itemVariants}
                                    whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
                                    className="bg-gradient-to-br from-indigo-50 to-blue-100 rounded-xl shadow-md p-6 flex items-center space-x-4 transform transition duration-300 ease-in-out"
                                >
                                    <div className="flex-shrink-0 text-3xl font-bold text-indigo-700 w-10 text-center">
                                        #{index + 1}
                                    </div>
                                    <div className="flex-grow">
                                        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                                            {entry.username}
                                            {index === 0 && <span className="ml-2 text-yellow-500"><TrophyIcon className="h-6 w-6 inline-block" /></span>}
                                        </h3>
                                        <p className="text-sm text-gray-600 flex items-center">
                                            <StarIcon className="h-4 w-4 mr-1 text-yellow-600" /> XP: <span className="font-bold ml-1">{entry.totalXp}</span>
                                        </p>
                                        <p className="text-sm text-gray-600">Level: <span className="font-bold">{entry.currentLevel}</span></p>
                                        {entry.badges && entry.badges.length > 0 && (
                                            <div className="flex flex-wrap mt-2">
                                                {entry.badges.map(badge => (
                                                    <span key={badge} className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-2 mb-1">
                                                        {badge}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default LeaderboardPage;

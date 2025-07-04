import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { BookOpenIcon, PlayCircleIcon, PuzzlePieceIcon, RocketLaunchIcon, ArrowsRightLeftIcon, ArrowPathIcon, ExclamationCircleIcon, ChartBarIcon, StarIcon } from '@heroicons/react/24/outline';
import { Module, GameProgress } from '../types';

const ModuleDetailPage: React.FC = () => {
    const { moduleId } = useParams<{ moduleId: string }>();
    const { user } = useAuth();
    const [module, setModule] = useState<Module | null>(null);
    const [progress, setProgress] = useState<GameProgress | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [gamificationMessage, setGamificationMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const moduleRes = await apiClient.get<Module>(`/modules/${moduleId}`);
                setModule(moduleRes.data);

                if (user) {
                    try {
                        const progressRes = await apiClient.get<{ message: string; progress: GameProgress | null; completed: boolean; score: number }>(`/games/progress/${moduleId}`);
                        setProgress(progressRes.data.progress);
                    } catch (progressErr: any) {
                        console.error('Error fetching game progress:', progressErr.response?.data || progressErr.message);
                        setProgress(null);
                        if (progressErr.response && progressErr.response.status !== 404) {
                            setError('Failed to load module progress.');
                        }
                    }
                }
            } catch (err: any) {
                console.error('Error fetching module details:', err.response?.data || err.message);
                setError('Failed to load module details.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [moduleId, user]);

    const handleUpdateProgress = async (completed: boolean, score: number, hintsUsed: number, customData: any) => {
        if (!user || !module?._id) {
            setGamificationMessage('Please log in to update progress.');
            setTimeout(() => setGamificationMessage(null), 3000);
            return;
        }
        try {
            const res = await apiClient.post('/games/progress', {
                moduleId: module._id,
                progress: completed ? 100 : 50,
                score: score || 0,
                completed: completed,
                hintsUsed: hintsUsed || 0,
                customData: customData || {},
            });
            setProgress(res.data.progress);
            const gamification = res.data.gamification;
            let message = res.data.message || 'Progress Updated!';
            if (gamification.xpGain) {
                message += ` (+${gamification.xpGain} XP)`;
            }
            if (gamification.levelUp) {
                message += ` 🎉 Level Up to ${gamification.newLevel}!`;
            }
            if (gamification.newBadges && gamification.newBadges.length > 0) {
                message += ` 🏆 New Badge: ${gamification.newBadges.join(', ')}!`;
            }
            setGamificationMessage(message);
            setTimeout(() => setGamificationMessage(null), 5000);
            console.log('Gamification response:', res.data);
        } catch (error: any) {
            console.error('Failed to update progress:', error.response?.data || error.message);
            setGamificationMessage('Error: Failed to save progress.');
            setTimeout(() => setGamificationMessage(null), 3000);
        }
    };

    const contentItemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <ArrowPathIcon className="h-16 w-16 text-indigo-600 animate-spin" />
                <p className="ml-4 text-xl text-gray-700">Loading Module Details...</p>
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

    if (!module) {
        return <div className="text-red-500 text-center mt-8 text-lg">Module data not available.</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 py-12">
            <div className="container mx-auto p-6">
                <motion.h1
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 text-center"
                >
                    <BookOpenIcon className="inline-block h-10 w-10 mr-4 text-indigo-600" />
                    {module.title}
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-lg text-gray-700 mb-8 text-center max-w-2xl mx-auto"
                >
                    {module.description}
                </motion.p>

                {gamificationMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="bg-green-100 border-l-4 border-green-500 text-green-800 p-4 mb-6 rounded-md shadow-sm text-center font-medium"
                    >
                        {gamificationMessage}
                    </motion.div>
                )}

                {progress && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="bg-blue-100 border-l-4 border-blue-500 text-blue-800 p-6 mb-8 rounded-xl shadow-md flex flex-col md:flex-row items-center justify-between"
                    >
                        <div className="mb-4 md:mb-0 md:mr-4">
                            <h3 className="font-bold text-xl mb-2 flex items-center">
                                <ChartBarIcon className="h-6 w-6 mr-2" /> Your Progress
                            </h3>
                            <p>Progress: <span className="font-semibold">{progress.progress}%</span></p>
                            <p>Score: <span className="font-semibold">{progress.score}</span></p>
                            <p>Completed: <span className="font-semibold">{progress.completed ? 'Yes' : 'No'}</span></p>
                            {progress.lastAttemptedAt && <p>Last Attempt: {new Date(progress.lastAttemptedAt).toLocaleDateString()}</p>}
                        </div>
                        <div className="w-full md:w-48 h-4 bg-blue-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-600 rounded-full"
                                style={{ width: `${progress.progress}%` }}
                            ></div>
                        </div>
                    </motion.div>
                )}

                <div className="bg-white p-8 rounded-xl shadow-lg">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4 flex items-center">
                        <BookOpenIcon className="h-6 w-6 mr-2 text-gray-600" /> Learning Content & Activities
                    </h2>
                    {module.content.length === 0 ? (
                        <p className="text-center text-gray-600 text-lg py-8">No content available for this module yet.</p>
                    ) : (
                        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
                            {module.content.map((contentPiece, index) => (
                                <motion.div
                                    key={index}
                                    variants={contentItemVariants}
                                    className="border-b border-gray-200 pb-6 mb-6 last:border-b-0 last:mb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between"
                                >
                                    <div className="flex-grow mb-4 sm:mb-0">
                                        <h3 className="text-xl font-semibold text-purple-700 mb-2 capitalize flex items-center">
                                            {contentPiece.type === 'text' && <BookOpenIcon className="h-5 w-5 mr-2" />}
                                            {contentPiece.type === 'quiz' && <PlayCircleIcon className="h-5 w-5 mr-2" />}
                                            {contentPiece.type === 'puzzle' && <PuzzlePieceIcon className="h-5 w-5 mr-2" />}
                                            {contentPiece.type === 'simulation' && <RocketLaunchIcon className="h-5 w-5 mr-2" />}
                                            {contentPiece.type === 'drag-and-drop' && <ArrowsRightLeftIcon className="h-5 w-5 mr-2" />}
                                            {contentPiece.type.replace('-', ' ')}
                                        </h3>
                                        {contentPiece.type === 'text' && (
                                            <p className="text-gray-700 leading-relaxed">{contentPiece.data.text}</p>
                                        )}
                                        {contentPiece.type === 'quiz' && (
                                            <p className="text-gray-700">Question: "{contentPiece.data.question}"</p>
                                        )}
                                    </div>
                                    <Link
                                        to={`/game/${module._id}/${index}`}
                                        state={{ contentPiece, moduleTitle: module.title }}
                                        className="inline-block bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-2 px-5 rounded-full shadow-md transition duration-300 ease-in-out transform hover:scale-105"
                                    >
                                        {contentPiece.type === 'text' ? 'Read Content' : `Start ${contentPiece.type.replace('-', ' ')}`}
                                    </Link>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </div>

                <div className="text-center mt-10">
                    <button
                        onClick={() => handleUpdateProgress(true, 500, 0, {})}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center mx-auto"
                    >
                        <StarIcon className="h-5 w-5 mr-2" /> Mark Module as Completed (Example)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModuleDetailPage;

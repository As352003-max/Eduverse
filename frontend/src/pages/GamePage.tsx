import React, { useEffect, useState, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlayCircleIcon, PuzzlePieceIcon, RocketLaunchIcon, ArrowsRightLeftIcon, BookOpenIcon, CheckCircleIcon, ArrowLeftIcon, LightBulbIcon, SparklesIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'; // Added ExclamationCircleIcon
import { ModuleContentPiece, Module } from '../types'; 
import apiClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext'; 
import { toast } from 'react-toastify'; 

interface GamePageState {
    contentPiece: ModuleContentPiece;
    moduleTitle: string;
}

const GamePage: React.FC = () => {
    const { moduleId, contentPieceIndex } = useParams<{ moduleId: string; contentPieceIndex: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [gameContent, setGameContent] = useState<ModuleContentPiece | null>(null);
    const [currentModuleTitle, setCurrentModuleTitle] = useState<string>('');
    const [gameStatus, setGameStatus] = useState<'playing' | 'completed'>('playing');
    const [quizAnswer, setQuizAnswer] = useState<string>('');
    const [quizFeedback, setQuizFeedback] = useState<string | null>(null);
    const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
    const [loadingProgressUpdate, setLoadingProgressUpdate] = useState<boolean>(false);
    const [loadingGameContent, setLoadingGameContent] = useState<boolean>(true); // New loading state for game content
    const [errorGameContent, setErrorGameContent] = useState<string | null>(null); // New error state for game content

    useEffect(() => {
        const fetchGameData = async () => {
            setLoadingGameContent(true);
            setErrorGameContent(null);
            const state = location.state as GamePageState;

            if (state && state.contentPiece && state.moduleTitle) {
                // Data available from location state
                console.log("GamePage: Loading from location state.");
                setGameContent(state.contentPiece);
                setCurrentModuleTitle(state.moduleTitle);
                setGameStatus('playing');
                setQuizAnswer('');
                setQuizFeedback(null);
                setQuizSubmitted(false);
                setLoadingGameContent(false);
            } else if (moduleId && contentPieceIndex !== undefined) {
                // Fallback: Fetch module data from backend if state is lost (e.g., page refresh)
                console.log("GamePage: Location state missing, attempting fallback fetch.");
                try {
                    const moduleRes = await apiClient.get<Module>(`/modules/${moduleId}`);
                    const module = moduleRes.data;
                    const index = parseInt(contentPieceIndex);

                    if (module && module.content && module.content[index]) {
                        console.log("GamePage: Fallback fetch successful.");
                        setGameContent(module.content[index]);
                        setCurrentModuleTitle(module.title);
                        setGameStatus('playing');
                        setQuizAnswer('');
                        setQuizFeedback(null);
                        setQuizSubmitted(false);
                    } else {
                        const errorMessage = 'Game content not found within the module or invalid index.';
                        setErrorGameContent(errorMessage);
                        toast.error(errorMessage + " Returning to modules list.");
                        navigate('/modules'); // Navigate to general modules if specific content is missing
                    }
                } catch (err: any) {
                    const errorMessage = 'Failed to load game content from backend. ' + (err.response?.data?.message || err.message || 'Server error.');
                    console.error('GamePage: Error fetching game content fallback:', errorMessage);
                    setErrorGameContent(errorMessage);
                    toast.error('Failed to load game content. Please try again.');
                    navigate('/modules'); // Navigate to general modules on error
                } finally {
                    setLoadingGameContent(false);
                }
            } else {
                // Neither state nor URL params are sufficient
                const errorMessage = 'Invalid game access. Please select a game from a module.';
                setErrorGameContent(errorMessage);
                toast.error(errorMessage + " Returning to modules.");
                navigate('/modules');
                setLoadingGameContent(false);
            }
        };

        fetchGameData();
    }, [location.state, moduleId, contentPieceIndex, navigate]); // Dependencies for useEffect

    const handleGameCompletion = async (score: number, hintsUsed: number, completed: boolean = true) => {
        if (!user || !moduleId) {
            toast.error('Please log in to save game progress.');
            return;
        }
        setLoadingProgressUpdate(true);
        try {
            const res = await apiClient.post('/games/progress', {
                moduleId: moduleId,
                progress: completed ? 100 : 50,
                score: score,
                completed: completed,
                hintsUsed: hintsUsed,
                customData: {
                    gameType: gameContent?.type,
                    contentIndex: contentPieceIndex,
                },
            });
            console.log('Game progress updated:', res.data);
            setGameStatus('completed');
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
            toast.success(message, { autoClose: 5000 });
        } catch (error: any) {
            console.error('Failed to update game progress:', error.response?.data || error.message);
            toast.error('Error saving game progress.');
        } finally {
            setLoadingProgressUpdate(false);
        }
    };

    const handleQuizSubmit = () => {
        if (gameContent?.type === 'quiz' && quizAnswer.trim() && !quizSubmitted) {
            const isCorrect = quizAnswer.trim().toLowerCase() === gameContent.data.correctAnswer.toLowerCase();
            setQuizSubmitted(true);
            if (isCorrect) {
                setQuizFeedback('Correct! 🎉');
                handleGameCompletion(100, 0, true);
            } else {
                setQuizFeedback(`Incorrect. The correct answer was: "${gameContent.data.correctAnswer}"`);
                handleGameCompletion(0, 0, false);
            }
        }
    };

    const handleQuizRetry = () => {
        setQuizAnswer('');
        setQuizFeedback(null);
        setQuizSubmitted(false);
        setGameStatus('playing');
    };

    if (loadingGameContent) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <SparklesIcon className="h-16 w-16 text-indigo-600 animate-pulse" />
                <p className="ml-4 text-xl text-gray-700">Loading Game Content...</p>
            </div>
        );
    }

    if (errorGameContent) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
                <ExclamationCircleIcon className="h-20 w-20 text-red-500 mb-4" />
                <p className="text-red-600 text-center text-2xl font-semibold mb-4">{errorGameContent}</p>
                <button
                    onClick={() => navigate('/modules')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300"
                >
                    Browse Modules
                </button>
            </div>
        );
    }

    if (!gameContent) {
        return <div className="text-red-500 text-center mt-8 text-lg">Game content could not be loaded. This should not happen if error handling works.</div>;
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'quiz': return <PlayCircleIcon className="h-12 w-12 text-blue-600" />;
            case 'puzzle': return <PuzzlePieceIcon className="h-12 w-12 text-green-600" />;
            case 'simulation': return <RocketLaunchIcon className="h-12 w-12 text-yellow-600" />;
            case 'drag-and-drop': return <ArrowsRightLeftIcon className="h-12 w-12 text-red-600" />;
            case 'text': return <BookOpenIcon className="h-12 w-12 text-purple-600" />;
            default: return <PlayCircleIcon className="h-12 w-12 text-gray-600" />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-12 flex flex-col items-center">
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-2xl shadow-xl p-8 md:p-10 w-full max-w-4xl mx-auto"
            >
                <div className="flex items-center justify-between mb-6 border-b pb-4">
                    <button
                        onClick={() => navigate(`/modules/${moduleId}`)}
                        className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                        <ArrowLeftIcon className="h-5 w-5 mr-2" /> Back to Module
                    </button>
                    <h1 className="text-3xl font-extrabold text-gray-900 text-center flex-grow">
                        {currentModuleTitle}
                    </h1>
                    <div className="w-10"></div>
                </div>

                <div className="text-center mb-8">
                    {getIcon(gameContent.type)}
                    <h2 className="text-2xl font-bold text-gray-800 mt-4 capitalize">
                        {gameContent.type.replace('-', ' ')} Activity
                    </h2>
                    <p className="text-gray-600 mt-2">Module: {currentModuleTitle}</p>
                </div>

                {gameStatus === 'completed' ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="bg-emerald-100 border-l-4 border-emerald-500 text-emerald-800 p-6 rounded-md text-center flex flex-col items-center"
                    >
                        <CheckCircleIcon className="h-16 w-16 text-emerald-600 mb-4" />
                        <h3 className="text-2xl font-bold mb-2">Activity Completed!</h3>
                        <p className="text-lg">Your progress has been saved.</p>
                        <button
                            onClick={() => navigate(`/modules/${moduleId}`)}
                            className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
                        >
                            Return to Module
                        </button>
                    </motion.div>
                ) : (
                    <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
                        {gameContent.type === 'text' && (
                            <div className="prose max-w-none text-gray-700">
                                <h3 className="text-xl font-semibold mb-3">Reading:</h3>
                                <p className="mb-6">{gameContent.data.text}</p>
                                <button
                                    onClick={() => handleGameCompletion(0, 0, true)}
                                    className="mt-6 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
                                    disabled={loadingProgressUpdate}
                                >
                                    {loadingProgressUpdate ? 'Saving...' : 'Mark as Read'}
                                </button>
                            </div>
                        )}

                        {gameContent.type === 'quiz' && (
                            <div>
                                <h3 className="text-xl font-semibold mb-3">Quiz:</h3>
                                <p className="text-gray-800 font-medium text-lg mb-4">{gameContent.data.question}</p>
                                <div className="space-y-3">
                                    {gameContent.data.options.map((option: string, i: number) => (
                                        <div key={i} className="flex items-center">
                                            <input
                                                type="radio"
                                                id={`option-${i}`}
                                                name="quiz-option"
                                                value={option}
                                                checked={quizAnswer === option}
                                                onChange={(e) => setQuizAnswer(e.target.value)}
                                                className="h-5 w-5 text-blue-600 form-radio focus:ring-blue-500"
                                                disabled={quizSubmitted || loadingProgressUpdate}
                                            />
                                            <label htmlFor={`option-${i}`} className="ml-3 text-gray-700 text-base cursor-pointer">{option}</label>
                                        </div>
                                    ))}
                                </div>
                                {quizFeedback && (
                                    <p className={`mt-4 font-semibold ${quizFeedback.includes('Correct') ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {quizFeedback}
                                    </p>
                                )}
                                <div className="flex gap-4 mt-6">
                                    <button
                                        onClick={handleQuizSubmit}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex-grow"
                                        disabled={loadingProgressUpdate || quizSubmitted || !quizAnswer.trim()}
                                    >
                                        {loadingProgressUpdate ? 'Submitting...' : 'Submit Answer'}
                                    </button>
                                    {quizSubmitted && (
                                        <button
                                            onClick={handleQuizRetry}
                                            className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
                                            disabled={loadingProgressUpdate}
                                        >
                                            Retry Quiz
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {gameContent.type === 'puzzle' && (
                            <div>
                                <h3 className="text-xl font-semibold mb-3 flex items-center">
                                    <PuzzlePieceIcon className="h-6 w-6 mr-2 text-green-600" /> Puzzle: {gameContent.data.puzzleName}
                                </h3>
                                <p className="text-gray-700 mb-4">{gameContent.data.description || 'A challenging puzzle awaits!'}</p>
                                <div className="bg-white border border-gray-300 p-8 rounded-lg shadow-inner text-center text-gray-500 italic h-48 flex items-center justify-center">
                                    <p>This is where you would integrate your interactive puzzle component.</p>
                                </div>
                                <button
                                    onClick={() => handleGameCompletion(100, 0)}
                                    className="mt-6 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
                                    disabled={loadingProgressUpdate}
                                >
                                    {loadingProgressUpdate ? 'Saving...' : 'Simulate Puzzle Solve'}
                                </button>
                            </div>
                        )}

                        {gameContent.type === 'simulation' && (
                            <div>
                                <h3 className="text-xl font-semibold mb-3 flex items-center">
                                    <RocketLaunchIcon className="h-6 w-6 mr-2 text-yellow-600" /> Simulation: {gameContent.data.simulationName}
                                </h3>
                                <p className="text-gray-700 mb-4">{gameContent.data.description || 'Run an interactive simulation.'}</p>
                                <div className="bg-white border border-gray-300 p-8 rounded-lg shadow-inner text-center text-gray-500 italic h-64 flex items-center justify-center">
                                    <p>This is where you would integrate your simulation component (e.g., a Canvas for Three.js/D3.js).</p>
                                </div>
                                <button
                                    onClick={() => handleGameCompletion(100, 0)}
                                    className="mt-6 bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
                                    disabled={loadingProgressUpdate}
                                >
                                    {loadingProgressUpdate ? 'Saving...' : 'Simulate Simulation Run'}
                                </button>
                            </div>
                        )}

                        {gameContent.type === 'drag-and-drop' && (
                            <div>
                                <h3 className="text-xl font-semibold mb-3 flex items-center">
                                    <ArrowsRightLeftIcon className="h-6 w-6 mr-2 text-red-600" /> Drag-and-Drop: {gameContent.data.activityName}
                                </h3>
                                <p className="text-gray-700 mb-4">{gameContent.data.description || 'Engage in a drag-and-drop activity.'}</p>
                                <div className="bg-white border border-gray-300 p-8 rounded-lg shadow-inner text-center text-gray-500 italic h-48 flex items-center justify-center">
                                    <p>This is where you would integrate your drag-and-drop component.</p>
                                </div>
                                <button
                                    onClick={() => handleGameCompletion(100, 0)}
                                    className="mt-6 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
                                    disabled={loadingProgressUpdate}
                                >
                                    {loadingProgressUpdate ? 'Saving...' : 'Simulate Activity Completion'}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default GamePage;

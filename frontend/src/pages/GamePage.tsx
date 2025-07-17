import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PlayCircleIcon, PuzzlePieceIcon, RocketLaunchIcon, ArrowsRightLeftIcon, BookOpenIcon, ArrowLeftIcon, PlayIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolidIcon, ExclamationCircleIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { ModuleContentPiece, Module } from '../types';
import apiClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { useAnalytics } from '../hooks/useAnalytics';

declare global {
    interface Window {
        onYouTubeIframeAPIReady: () => void;
        YT: any;
    }
}

interface GamePageState {
    contentPiece: ModuleContentPiece;
    moduleTitle: string;
}

const GamePage: React.FC = () => {
    const { moduleId, contentPieceIndex } = useParams<{ moduleId: string; contentPieceIndex: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const { user, selectedChild } = useAuth();
    const { trackEvent } = useAnalytics();

    const [gameContent, setGameContent] = useState<ModuleContentPiece | null>(null);
    const [currentModuleTitle, setCurrentModuleTitle] = useState<string>('');
    const [gameStatus, setGameStatus] = useState<'playing' | 'completed'>('playing');
    const [quizAnswer, setQuizAnswer] = useState<string>('');
    const [quizFeedback, setQuizFeedback] = useState<string | null>(null);
    const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
    const [loadingProgressUpdate, setLoadingProgressUpdate] = useState<boolean>(false);
    const [loadingGameContent, setLoadingGameContent] = useState<boolean>(true);
    const [errorGameContent, setErrorGameContent] = useState<string | null>(null);

    const youtubePlayerRef = useRef<any>(null);
    const iframeId = useRef<string>(`Youtubeer-${Date.now()}`);
    const [videoCompleted, setVideoCompleted] = useState<boolean>(false);

    const handleGameCompletion = useCallback(async (score: number, hintsUsed: number, completed: boolean = true, gamificationData?: { xpGain?: number, levelUp?: boolean, newLevel?: number, newBadges?: string[] }) => {
        if (!user || !moduleId || !gameContent) {
            toast.error('Please log in to save game progress.');
            trackEvent('ACTIVITY_COMPLETE_FAILED', {
                moduleId: moduleId,
                activityType: gameContent?.type,
                contentIndex: contentPieceIndex,
                reason: 'User not logged in or no game content',
                score,
                completed,
                targetProfileType: selectedChild ? 'child' : 'user',
                targetProfileId: selectedChild ? selectedChild._id : user?._id
            });
            return;
        }
        setLoadingProgressUpdate(true);

        const targetId = selectedChild ? selectedChild._id : user._id;
        const updateEndpoint = selectedChild ? `/children/${targetId}/progress` : `/users/${targetId}/progress`;

        try {
            const payload = {
                moduleId: moduleId,
                progress: completed ? 100 : 50,
                score: score,
                completed: completed,
                hintsUsed: hintsUsed,
                xpGained: gamificationData?.xpGain || 0,
                level: gamificationData?.newLevel || 0,
                overallProgress: gamificationData?.newLevel || 0, // Assuming overallProgress correlates with level
                gameId: gameContent._id, // Send contentPiece _id as gameId
                badgesEarned: gamificationData?.newBadges || [],
                customData: {
                    gameType: gameContent.type,
                    contentIndex: contentPieceIndex,
                },
            };

            const res = await apiClient.post(updateEndpoint, payload);
            setGameStatus('completed');
            const backendGamification = res.data.gamification || {};

            let message = res.data.message || 'Progress Updated!';
            if (backendGamification.xpGain) {
                message += ` (+${backendGamification.xpGain} XP)`;
            }
            if (backendGamification.levelUp) {
                message += ` 🎉 Level Up to ${backendGamification.newLevel}!`;
            }
            if (backendGamification.newBadges && backendGamification.newBadges.length > 0) {
                message += ` 🏆 New Badge: ${backendGamification.newBadges.join(', ')}!`;
            }
            toast.success(message, { autoClose: 5000 });

            trackEvent('ACTIVITY_COMPLETED', {
                moduleId: moduleId,
                moduleTitle: currentModuleTitle,
                activityType: gameContent.type,
                contentIndex: contentPieceIndex,
                score: score,
                hintsUsed: hintsUsed,
                isCompleted: completed,
                xpGain: backendGamification.xpGain,
                levelUp: backendGamification.levelUp,
                newBadges: backendGamification.newBadges,
                targetProfileType: selectedChild ? 'child' : 'user',
                targetProfileId: targetId
            });

        } catch (error: any) {
            console.error('Failed to update game progress:', error.response?.data || error.message);
            toast.error('Error saving game progress.');
            trackEvent('ACTIVITY_COMPLETE_FAILED', {
                moduleId: moduleId,
                activityType: gameContent?.type,
                contentIndex: contentPieceIndex,
                score,
                completed,
                error: error.response?.data || error.message,
                targetProfileType: selectedChild ? 'child' : 'user',
                targetProfileId: targetId
            });
        } finally {
            setLoadingProgressUpdate(false);
        }
    }, [moduleId, contentPieceIndex, user, gameContent, currentModuleTitle, selectedChild, trackEvent]);

    const onPlayerStateChange = useCallback((event: any) => {
        if (event.data === window.YT.PlayerState.ENDED) {
            if (!videoCompleted) {
                setVideoCompleted(true);
                handleGameCompletion(100, 0, true, { xpGain: 50, levelUp: false, newBadges: [] }); // Example XP for video
                trackEvent('VIDEO_COMPLETED', {
                    moduleId: moduleId,
                    contentIndex: contentPieceIndex,
                    videoTitle: gameContent?.title,
                    targetProfileType: selectedChild ? 'child' : 'user',
                    targetProfileId: selectedChild ? selectedChild._id : user?._id
                });
            }
        }
    }, [videoCompleted, handleGameCompletion, moduleId, contentPieceIndex, gameContent, selectedChild, user, trackEvent]);


    useEffect(() => {
        const fetchGameData = async () => {
            setLoadingGameContent(true);
            setErrorGameContent(null);

            if (!user) {
                navigate('/login');
                toast.error('Please log in to access games.');
                return;
            }

            if (user.role === 'parent' && !selectedChild) {
                toast.warn('Please select a child profile before starting a game.');
                navigate('/children');
                trackEvent('GAME_START_BLOCKED_NO_CHILD', {
                    moduleId,
                    contentIndex: contentPieceIndex
                });
                return;
            }

            const state = location.state as GamePageState;
            let currentContentPiece: ModuleContentPiece | null = null;
            let currentModuleTitleFromFetch: string = '';

            if (state && state.contentPiece && state.moduleTitle) {
                currentContentPiece = state.contentPiece;
                currentModuleTitleFromFetch = state.moduleTitle;
            } else if (moduleId && contentPieceIndex !== undefined) {
                try {
                    const moduleRes = await apiClient.get<Module>(`/modules/${moduleId}`);
                    const module = moduleRes.data;
                    const index = parseInt(contentPieceIndex);

                    if (module && module.content && module.content[index]) {
                        currentContentPiece = module.content[index];
                        currentModuleTitleFromFetch = module.title;
                    } else {
                        const errorMessage = 'Game content not found within the module or invalid index.';
                        setErrorGameContent(errorMessage);
                        toast.error(errorMessage + " Returning to modules list.");
                        navigate('/modules');
                        trackEvent('ACTIVITY_START_FAILED', {
                            moduleId: moduleId,
                            contentIndex: contentPieceIndex,
                            reason: 'Content piece not found or invalid index',
                            error: errorMessage,
                            targetProfileType: selectedChild ? 'child' : 'user',
                            targetProfileId: selectedChild ? selectedChild._id : user?._id
                        });
                        return;
                    }
                } catch (err: any) {
                    const errorMessage = 'Failed to load game content from backend. ' + (err.response?.data?.message || err.message || 'Server error.');
                    setErrorGameContent(errorMessage);
                    toast.error('Failed to load game content. Please try again.');
                    navigate('/modules');
                    trackEvent('ACTIVITY_START_FAILED', {
                        moduleId: moduleId,
                        contentIndex: contentPieceIndex,
                        reason: 'Backend fetch failed',
                        error: errorMessage,
                        targetProfileType: selectedChild ? 'child' : 'user',
                        targetProfileId: selectedChild ? selectedChild._id : user?._id
                    });
                    return;
                }
            } else {
                const errorMessage = 'Invalid game access. Please select a game from a module.';
                setErrorGameContent(errorMessage);
                toast.error(errorMessage + " Returning to modules.");
                navigate('/modules');
                setLoadingGameContent(false);
                trackEvent('ACTIVITY_START_FAILED', {
                    moduleId: moduleId,
                    contentIndex: contentPieceIndex,
                    reason: 'Invalid URL parameters or state',
                    error: errorMessage,
                    targetProfileType: selectedChild ? 'child' : 'user',
                    targetProfileId: selectedChild ? selectedChild._id : user?._id
                });
                return;
            }

            setGameContent(currentContentPiece);
            setCurrentModuleTitle(currentModuleTitleFromFetch);
            setGameStatus('playing');
            setQuizAnswer('');
            setQuizFeedback(null);
            setQuizSubmitted(false);
            setVideoCompleted(false);
            setLoadingGameContent(false);

            trackEvent('ACTIVITY_STARTED', {
                moduleId: moduleId,
                moduleTitle: currentModuleTitleFromFetch,
                activityType: currentContentPiece?.type,
                contentIndex: contentPieceIndex,
                targetProfileType: selectedChild ? 'child' : 'user',
                targetProfileId: selectedChild ? selectedChild._id : user?._id,
                source: state ? 'state_prop' : 'backend_fetch'
            });

            if (currentContentPiece?.type === 'video' && window.YT && window.YT.Player) {
                const videoIdMatch = currentContentPiece.data.url.match(/embed\/([a-zA-Z0-9_-]+)/);
                if (videoIdMatch && videoIdMatch[1]) {
                    if (youtubePlayerRef.current) {
                        youtubePlayerRef.current.destroy();
                        youtubePlayerRef.current = null;
                    }

                    youtubePlayerRef.current = new window.YT.Player(iframeId.current, {
                        videoId: videoIdMatch[1],
                        playerVars: {
                            'autoplay': 0,
                            'controls': 1,
                            'rel': 0,
                            'modestbranding': 1,
                            'enablejsapi': 1,
                            'origin': window.location.origin
                        },
                        events: {
                            'onReady': (e: any) => console.log('YouTube Player Ready'),
                            'onStateChange': onPlayerStateChange,
                            'onError': (e: any) => console.error('YouTube Player Error:', e)
                        }
                    });
                } else {
                    console.error("Invalid YouTube URL format:", currentContentPiece.data.url);
                    toast.error("Could not load video player. Invalid YouTube URL.");
                }
            }
        };

        if (gameContent?.type === 'video' && !window.YT && !document.getElementById('youtube-iframe-api-script')) {
            const tag = document.createElement('script');
            tag.id = 'youtube-iframe-api-script';
            tag.src = 'http://www.youtube.com/iframe_api'; // Correct YouTube API URL
            const firstScriptTag = document.getElementsByTagName('script')[0];
            if (firstScriptTag && firstScriptTag.parentNode) {
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            } else {
                document.head.appendChild(tag);
            }
        }

        if (!window.onYouTubeIframeAPIReady) {
            window.onYouTubeIframeAPIReady = fetchGameData;
        } else {
            fetchGameData();
        }

        return () => {
            if (youtubePlayerRef.current) {
                youtubePlayerRef.current.destroy();
                youtubePlayerRef.current = null;
            }
        };

    }, [location.state, moduleId, contentPieceIndex, navigate, trackEvent, user, selectedChild, onPlayerStateChange, gameContent?.type]); // Add gameContent.type to dependencies

    const handleQuizSubmit = () => {
        if (gameContent?.type === 'quiz' && quizAnswer.trim() && !quizSubmitted) {
            const isCorrect = quizAnswer.trim().toLowerCase() === gameContent.data.correctAnswer.toLowerCase();
            setQuizSubmitted(true);
            const score = isCorrect ? 100 : 0;
            const xpGain = isCorrect ? 30 : 0; // Example XP for quiz
            const newBadges = isCorrect ? ['QuizMaster'] : []; // Example badge for quiz

            setQuizFeedback(isCorrect ? 'Correct! 🎉' : `Incorrect. The correct answer was: "${gameContent.data.correctAnswer}"`);
            handleGameCompletion(score, 0, isCorrect, { xpGain, newBadges });

            trackEvent('QUIZ_SUBMITTED', {
                moduleId: moduleId,
                contentIndex: contentPieceIndex,
                isCorrect: isCorrect,
                answer: quizAnswer.trim(),
                ...(isCorrect ? {} : { correctAnswer: gameContent.data.correctAnswer }),
                score: score,
                targetProfileType: selectedChild ? 'child' : 'user',
                targetProfileId: selectedChild ? selectedChild._id : user?._id
            });
        }
    };

    const handleQuizRetry = () => {
        setQuizAnswer('');
        setQuizFeedback(null);
        setQuizSubmitted(false);
        setGameStatus('playing');
        trackEvent('QUIZ_RETRY', {
            moduleId: moduleId,
            contentIndex: contentPieceIndex,
            targetProfileType: selectedChild ? 'child' : 'user',
            targetProfileId: selectedChild ? selectedChild._id : user?._id
        });
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
            case 'video': return <PlayIcon className="h-12 w-12 text-teal-600" />;
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
                    <div className="text-sm text-gray-500 flex items-center">
                        <span className="mr-1">Playing as:</span>
                        <span className="font-semibold text-indigo-700">
                            {selectedChild ? selectedChild.name : (user ? user.name || user.email : 'Guest')}
                        </span>
                    </div>
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
                        <CheckCircleSolidIcon className="h-16 w-16 text-emerald-600 mb-4" />
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
                                    onClick={() => handleGameCompletion(100, 0, true, { xpGain: 10, levelUp: false, newBadges: [] })} // Example XP for text
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

                        {gameContent.type === 'video' && (
                            <div>
                                <h3 className="text-xl font-semibold mb-3 flex items-center">
                                    <PlayIcon className="h-6 w-6 mr-2 text-teal-600" /> Video: {gameContent.title}
                                </h3>
                                <p className="text-gray-700 mb-4">{gameContent.data.description || 'Watch this educational video.'}</p>
                                <div className="aspect-w-16 aspect-h-9 w-full bg-black rounded-lg overflow-hidden shadow-inner">
                                    <iframe
                                        id={iframeId.current}
                                        src={gameContent.data.url}
                                        title={gameContent.title}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        allowFullScreen
                                        className="w-full h-full"
                                    ></iframe>
                                </div>
                                <button
                                    onClick={() => {
                                        if (!videoCompleted) {
                                            setVideoCompleted(true);
                                            handleGameCompletion(100, 0, true, { xpGain: 50, levelUp: false, newBadges: [] });
                                            toast.info('Video manually marked as completed.');
                                        }
                                    }}
                                    className="mt-6 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={loadingProgressUpdate || videoCompleted}
                                >
                                    {loadingProgressUpdate ? 'Saving...' : videoCompleted ? 'Video Completed!' : 'Mark as Watched (Manual)'}
                                </button>
                                {!videoCompleted && (
                                    <p className="text-sm text-gray-500 mt-2">
                                        The video will auto-complete when watched. Click "Mark as Watched" if needed.
                                    </p>
                                )}
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
                                    onClick={() => handleGameCompletion(100, 0, true, { xpGain: 75, levelUp: false, newBadges: ['PuzzleSolver'] })} // Example XP/badge for puzzle
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
                                    onClick={() => handleGameCompletion(100, 0, true, { xpGain: 100, levelUp: true, newLevel: (user?.currentLevel || 0) + 1, newBadges: ['SimulatorPro'] })} // Example XP/badge/level for simulation
                                    className="mt-6 bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
                                    disabled={loadingProgressUpdate}
                                >
                                    {loadingProgressUpdate ? 'Saving...' : 'Simulate Simulation Completion'}
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
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { startMathMazeGame, submitMathMazeAnswer } from '../api/mathMazeApi';
import { MathMazeGame, Position } from '../types/mathMazeTypes';
import MazeGrid from '../components/MathMaze/MazeGrid';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const MathMazePage: React.FC = () => {
    const { moduleId } = useParams<{ moduleId: string }>();
    const { user } = useAuth();
    const [game, setGame] = useState<MathMazeGame | null>(null);
    const [answerInput, setAnswerInput] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [message, setMessage] = useState<string>('');

    const fetchNewGame = useCallback(async () => {
        if (!moduleId) return;
        setIsLoading(true);
        try {
            const newGame = await startMathMazeGame(moduleId);
            setGame(newGame);
            setMessage('Game started! Solve the problem to move.');
        } catch (err) {
            console.error('Error starting game:', err);
            toast.error('Failed to start Math Maze game.');
            setMessage('Failed to load game. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [moduleId]);

    useEffect(() => {
        fetchNewGame();
    }, [fetchNewGame]);

    const handleAnswerSubmit = async (attemptedMove: Position) => {
        if (!game || !answerInput) {
            toast.warn('Please enter an answer.');
            return;
        }

        try {
            const response = await submitMathMazeAnswer(game._id, answerInput, attemptedMove);
            setGame(response.game);
            setAnswerInput('');
            setMessage(response.msg);
            if (response.correct) {
                toast.success(response.msg);
                if (response.game.completed) {
                    toast.success(`Maze Completed! You earned ${response.game.xpEarned} XP!`);
                }
            } else {
                toast.error(response.msg);
            }
        } catch (err: any) {
            console.error('Error submitting answer:', err);
            toast.error(err.response?.data?.msg || 'Failed to submit answer.');
        }
    };

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!game || game.completed) return;

        let attemptedMove: Position | null = null;
        if (e.key === 'ArrowUp') attemptedMove = { row: -1, col: 0 };
        else if (e.key === 'ArrowDown') attemptedMove = { row: 1, col: 0 };
        else if (e.key === 'ArrowLeft') attemptedMove = { row: 0, col: -1 };
        else if (e.key === 'ArrowRight') attemptedMove = { row: 0, col: 1 };

        if (attemptedMove) {
            e.preventDefault();
            handleAnswerSubmit(attemptedMove);
        }
    }, [game, answerInput, handleAnswerSubmit]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);


    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-xl text-gray-600">Loading Math Maze...</p>
            </div>
        );
    }

    if (!game) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-xl text-red-500">Could not load game. Please check module ID.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 flex flex-col items-center min-h-screen bg-gray-100">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Math Maze</h1>
            
            {game.completed ? (
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <p className="text-2xl font-semibold text-green-600 mb-4">Maze Completed!</p>
                    <p className="text-lg text-gray-700">Problems Solved: {game.problemsSolved}</p>
                    <p className="text-lg text-gray-700">Incorrect Attempts: {game.incorrectAttempts}</p>
                    <p className="text-lg text-gray-700">Time Taken: {(new Date(game.endTime!).getTime() - new Date(game.startTime).getTime()) / 1000} seconds</p>
                    <p className="text-2xl font-bold text-indigo-700 mt-4">XP Earned: {game.xpEarned}</p>
                    <button
                        onClick={fetchNewGame}
                        className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
                    >
                        Play Again
                    </button>
                </div>
            ) : (
                <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl">
                    <div className="md:w-2/3">
                        <MazeGrid
                            mazeLayout={game.mazeLayout}
                            currentPosition={game.currentPosition}
                            targetPosition={game.targetPosition}
                            pathTaken={game.pathTaken}
                        />
                    </div>
                    <div className="md:w-1/3 bg-white p-6 rounded-lg shadow-md flex flex-col justify-between">
                        <div>
                            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Current Problem:</h2>
                            <p className="text-3xl font-extrabold text-blue-700 mb-6">{game.currentProblem.question}</p>
                            
                            <input
                                type="text"
                                value={answerInput}
                                onChange={(e) => setAnswerInput(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        toast.warn('Please use arrow keys to answer and move.');
                                    }
                                }}
                                placeholder="Your answer"
                                className="w-full p-3 border border-gray-300 rounded-md mb-4 focus:ring-blue-500 focus:border-blue-500"
                            />
                            
                            <p className="text-sm text-gray-600 mt-2">
                                Solve the problem, then use <span className="font-bold">Arrow Keys</span> to move!
                            </p>
                            <p className="text-lg font-medium text-gray-700 mt-4">{message}</p>
                        </div>
                        <div className="mt-8">
                            <p className="text-lg text-gray-700">Problems Solved: {game.problemsSolved}</p>
                            <p className="text-lg text-gray-700">Incorrect Attempts: {game.incorrectAttempts}</p>
                            <p className="text-lg text-gray-700">Moves: {game.movesCount}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MathMazePage;
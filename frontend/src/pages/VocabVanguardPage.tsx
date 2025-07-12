import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { startVocabVanguardGame, submitVocabVanguardGuess, getVocabVanguardGameStatus } from '../api/vocabVanguardApi';
import { VocabVanguardGame } from '../types/vocabVanguardTypes';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const VocabVanguardPage: React.FC = () => {
    const { moduleId } = useParams<{ moduleId: string }>();
    const [game, setGame] = useState<VocabVanguardGame | null>(null);
    const [guessInput, setGuessInput] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [message, setMessage] = useState<string>('');

    const fetchGame = useCallback(async () => {
        if (!moduleId) return;
        setIsLoading(true);
        try {
            const newGame = await startVocabVanguardGame(moduleId);
            setGame(newGame);
            setMessage('Try to guess the word!');
        } catch (err) {
            console.error('Error starting game:', err);
            toast.error('Failed to start Vocab Vanguard game.');
            setMessage('Failed to load game. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [moduleId]);

    useEffect(() => {
        fetchGame();
    }, [fetchGame]);

    const handleGuess = async () => {
        if (!game || !guessInput.trim() || game.completed) {
            toast.warn('Please enter a guess.');
            return;
        }

        try {
            const response = await submitVocabVanguardGuess(game._id, guessInput.trim());
            setGame(response.game);
            setGuessInput('');
            setMessage(response.msg);
            if (response.game.completed) {
                if (response.game.won) {
                    toast.success(`You won! Earned ${response.game.xpEarned} XP!`);
                } else {
                    toast.error(`Game Over! The word was "${response.game.currentWord.word}".`);
                }
            } else if (response.msg.includes('Correct')) {
                toast.success(response.msg);
            } else {
                toast.error(response.msg);
            }
        } catch (err: any) {
            console.error('Error submitting guess:', err);
            toast.error(err.response?.data?.msg || 'Failed to submit guess.');
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-xl text-gray-600">Loading Vocab Vanguard...</p>
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

    const currentHintArray = game.currentWord.hint.split('');
    const hiddenWord = game.currentWord.word.split('');

    const displayWord = currentHintArray.map((char, index) =>
        char === '_' ? (game.correctlyGuessedLetters.includes(hiddenWord[index]) ? hiddenWord[index] : '_') : char
    ).join(' ');

    return (
        <div className="container mx-auto p-4 flex flex-col items-center min-h-screen bg-gray-100">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Vocab Vanguard</h1>

            {game.completed ? (
                <div className="bg-white p-6 rounded-lg shadow-md text-center w-full max-w-md">
                    <p className={`text-2xl font-semibold mb-4 ${game.won ? 'text-green-600' : 'text-red-600'}`}>
                        {game.won ? 'Congratulations!' : 'Game Over!'}
                    </p>
                    <p className="text-xl text-gray-700 mb-2">The word was: <span className="font-bold">{game.currentWord.word}</span></p>
                    <p className="text-lg text-gray-700">Guesses Made: {game.guessesMade}</p>
                    <p className="text-2xl font-bold text-indigo-700 mt-4">XP Earned: {game.xpEarned}</p>
                    <button
                        onClick={fetchGame}
                        className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
                    >
                        Play Again
                    </button>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg flex flex-col items-center"
                >
                    <p className="text-lg text-gray-700 mb-4 text-center">{game.currentWord.definition}</p>
                    {game.currentWord.imageUrl && (
                        <img src={game.currentWord.imageUrl} alt="Hint image" className="mb-4 max-h-48 object-contain" />
                    )}
                    
                    <motion.div
                        className="text-5xl font-extrabold tracking-widest text-blue-700 mb-8"
                        key={displayWord}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
                    >
                        {displayWord}
                    </motion.div>

                    <input
                        type="text"
                        value={guessInput}
                        onChange={(e) => setGuessInput(e.target.value.toLowerCase())}
                        onKeyPress={(e) => { if (e.key === 'Enter') handleGuess(); }}
                        placeholder="Guess a letter or the whole word"
                        className="w-full p-3 border border-gray-300 rounded-md mb-4 text-center text-lg focus:ring-blue-500 focus:border-blue-500"
                        maxLength={game.currentWord.word.length}
                    />
                    <button
                        onClick={handleGuess}
                        className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition duration-300 font-semibold"
                    >
                        Submit Guess
                    </button>

                    <div className="mt-6 text-center">
                        <p className="text-xl font-medium text-gray-800 mb-2">{message}</p>
                        <p className="text-lg text-gray-700">Guesses Left: {game.maxGuesses - game.guessesMade}</p>
                        <p className="text-sm text-gray-600">Incorrect Letters: <span className="font-bold text-red-500">{game.incorrectLetters.join(', ').toUpperCase()}</span></p>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default VocabVanguardPage;
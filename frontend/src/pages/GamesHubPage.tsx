// frontend/src/pages/GamesHubPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const gameCards = [
    {
        id: 'math-maze',
        title: 'Math Maze',
        description: 'Navigate a maze by solving math problems. Test your speed and accuracy!',
        link: '/game/mathmaze/60d5ec49f8c7a60015f6e8e1', 
        icon: '🧠',
        bgColor: 'from-blue-400 to-blue-600'
    },
    {
        id: 'vocab-vanguard',
        title: 'Vocab Vanguard',
        description: 'Guess the word based on definitions and hints. Improve your vocabulary!',
        link: '/game/vocabvanguard/60d5ec49f8c7a60015f6e8e2', 
        icon: '📚',
        bgColor: 'from-purple-400 to-purple-600'
    },
    {
        id: 'logic-circuit',
        title: 'Logic Circuit Builder',
        description: 'Build digital circuits with logic gates to solve challenges. Master boolean logic!',
        link: '/game/logiccircuit/60d5ec49f8c7a60015f6e8e3', 
        icon: '💡',
        bgColor: 'from-green-400 to-green-600'
    },
     {
        id: 'shadow-match',
        title: 'Shadow Match Game',
        description: 'Match items with their correct shadows! Improve visual recognition and memory!',
        link: '/shadow-game/0',
        icon: '🌟',
        bgColor: 'from-yellow-400 to-yellow-600'
    }
];

const GamesHubPage: React.FC = () => {
    return (
        <div className="container mx-auto p-6 min-h-screen bg-gray-50">
            <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-4xl font-extrabold text-center text-gray-800 mb-12"
            >
                Explore Eduverse Games
            </motion.h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {gameCards.map((game) => (
                    <motion.div
                        key={game.id}
                        className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden transform hover:-translate-y-2`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.1 * gameCards.indexOf(game) }}
                    >
                        <Link to={game.link} className="block">
                            <div className={`p-6 bg-gradient-to-br ${game.bgColor} text-white flex flex-col items-center justify-center h-40`}>
                                <span className="text-6xl mb-2">{game.icon}</span>
                                <h2 className="text-2xl font-bold text-center">{game.title}</h2>
                            </div>
                            <div className="p-6">
                                <p className="text-gray-700 text-center mb-4">{game.description}</p>
                                <div className="text-center">
                                    <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition duration-300 shadow-md">
                                        Play Now
                                    </button>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>

            <div className="mt-16 text-center text-gray-600">
                <p className="text-xl font-semibold mb-4">Earn XP and unlock awesome badges as you play!</p>
                <Link to="/profile" className="text-blue-600 hover:underline">
                    View your profile to see your progress and badges.
                </Link>
            </div>
        </div>
    );
};

export default GamesHubPage;
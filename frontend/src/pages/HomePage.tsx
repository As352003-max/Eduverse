import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomePage: React.FC = () => {
    const { user } = useAuth();

    const navCards = [
        {
            title: 'Start Learning',
            description: 'Explore our AI-powered modules and expand your knowledge.',
            icon: '📚',
            link: '/modules',
            bgColor: 'bg-blue-50',
            hoverColor: 'hover:bg-blue-100',
            textColor: 'text-blue-700'
        },
        {
            title: 'Play & Earn XP',
            description: 'Engage in fun games and quizzes to earn experience points.',
            icon: '🎮',
            link: '/game/start',
            bgColor: 'bg-green-50',
            hoverColor: 'hover:bg-green-100',
            textColor: 'text-green-700'
        },
        {
            title: 'Ask the AI',
            description: 'Get instant answers and explanations from your AI assistant.',
            icon: '🤖',
            link: '/ai-chat',
            bgColor: 'bg-purple-50',
            hoverColor: 'hover:bg-purple-100',
            textColor: 'text-purple-700'
        },
        {
            title: 'Build & Collaborate',
            description: 'Work on exciting projects, solo or with your peers.',
            icon: '💡',
            link: '/projects',
            bgColor: 'bg-yellow-50',
            hoverColor: 'hover:bg-yellow-100',
            textColor: 'text-yellow-700'
        },
        {
            title: 'See Your Rank',
            description: 'Check out the global leaderboard and see where you stand.',
            icon: '🏆',
            link: '/leaderboard',
            bgColor: 'bg-red-50',
            hoverColor: 'hover:bg-red-100',
            textColor: 'text-red-700'
        },
        {
            title: 'Manage Profile',
            description: 'Update your personal information and view your achievements.',
            icon: '👤',
            link: '/profile',
            bgColor: 'bg-indigo-50',
            hoverColor: 'hover:bg-indigo-100',
            textColor: 'text-indigo-700'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-100 py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-12 text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
                        Welcome, <span className="text-indigo-600">{user?.username || 'Learner'}</span>!
                    </h1>
                    <p className="text-xl text-gray-600">
                        Your personalized learning journey begins here.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {navCards.map((card, index) => (
                        <Link
                            key={index}
                            to={card.link}
                            className={`block ${card.bgColor} rounded-2xl shadow-md p-6 transform transition duration-300 ease-in-out hover:scale-105 ${card.hoverColor} border-b-4 border-transparent hover:border-${card.textColor.split('-')[1]}-500`}
                        >
                            <div className={`text-5xl mb-4 ${card.textColor}`}>{card.icon}</div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">{card.title}</h2>
                            <p className="text-gray-600">{card.description}</p>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HomePage;

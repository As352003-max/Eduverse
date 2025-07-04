
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    HomeIcon,
    Bars3Icon,
    XMarkIcon,
    ArrowRightOnRectangleIcon,
    UserPlusIcon,
    UserCircleIcon,
    ChatBubbleLeftRightIcon,
    TrophyIcon,
    BookOpenIcon,
    RectangleStackIcon
} from '@heroicons/react/24/outline';

const Navbar: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

    return (
        <nav className="bg-white shadow-md py-4 px-6 md:px-12 flex justify-between items-center rounded-b-xl sticky top-0 z-50">
            <Link to={user ? "/dashboard" : "/"} className="text-2xl font-extrabold text-indigo-700 flex items-center gap-2">
                Eduverse
            </Link>

            <div className="md:hidden">
                <button onClick={toggleMenu}>
                    {isMenuOpen ? <XMarkIcon className="h-6 w-6 text-gray-700" /> : <Bars3Icon className="h-6 w-6 text-gray-700" />}
                </button>
            </div>

            <div className={`flex-col md:flex md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0 absolute md:static bg-white md:bg-transparent top-20 left-0 w-full md:w-auto px-6 md:px-0 shadow-md md:shadow-none transition-all duration-300 ease-in-out ${isMenuOpen ? 'flex' : 'hidden'}`}>
                {user ? (
                    <>
                        <Link to="/dashboard" className="flex items-center text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-lg transition">
                            <HomeIcon className="h-5 w-5 mr-1" /> Dashboard
                        </Link>
                        <Link to="/modules" className="flex items-center text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-lg transition">
                            <BookOpenIcon className="h-5 w-5 mr-1" /> Modules
                        </Link>
                        <Link to="/projects" className="flex items-center text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-lg transition">
                            <RectangleStackIcon className="h-5 w-5 mr-1" /> Projects
                        </Link>
                        <Link to="/leaderboard" className="flex items-center text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-lg transition">
                            <TrophyIcon className="h-5 w-5 mr-1" /> Leaderboard
                        </Link>
                        <Link to="/ai-chat" className="flex items-center text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-lg transition">
                            <ChatBubbleLeftRightIcon className="h-5 w-5 mr-1" /> AI Chat
                        </Link>
                        <div className="relative">
                            <button onClick={toggleDropdown} className="flex items-center bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full hover:bg-indigo-200 transition">
                                <UserCircleIcon className="h-5 w-5 mr-2" />
                                {user.username}
                            </button>
                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10">
                                    <Link to="/profile" className="block px-4 py-2 hover:bg-indigo-50 text-gray-700">Profile</Link>
                                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 hover:bg-red-100 text-red-600">Logout</button>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        <Link to="/" className="flex items-center text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-lg transition">
                            <HomeIcon className="h-5 w-5 mr-1" /> Home
                        </Link>
                        <Link to="/login" className="flex items-center bg-indigo-600 text-white px-5 py-2 rounded-full shadow-md hover:bg-indigo-700 transition">
                            <ArrowRightOnRectangleIcon className="h-5 w-5 mr-1" /> Login
                        </Link>
                        <Link to="/register" className="flex items-center border-2 border-indigo-600 text-indigo-600 px-5 py-2 rounded-full hover:bg-indigo-50 transition">
                            <UserPlusIcon className="h-5 w-5 mr-1" /> Register
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckBadgeIcon, AcademicCapIcon } from '@heroicons/react/24/solid';
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
    RectangleStackIcon,
    PuzzlePieceIcon
} from '@heroicons/react/24/outline';
import { CursorArrowRaysIcon } from "@heroicons/react/24/outline";
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
        <nav className="bg-gradient-to-r from-indigo-800 via-purple-700 to-pink-600 text-white py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 w-full z-50 shadow-xl">
            <Link to={user ? "/dashboard" : "/"} className="text-2xl font-bold flex items-center gap-2">
                <AcademicCapIcon className="h-8 w-8 text-white" />
                <span className="tracking-wide">Eduverse</span>
            </Link>

            <div className="md:hidden">
                <button onClick={toggleMenu}>
                    {isMenuOpen ? <XMarkIcon className="h-6 w-6 text-white" /> : <Bars3Icon className="h-6 w-6 text-white" />}
                </button>
            </div>

            <div className={`flex-col md:flex md:flex-row md:items-center md:space-x-6 space-y-2 md:space-y-0 absolute md:static bg-indigo-800 md:bg-transparent top-20 left-0 w-full md:w-auto px-6 md:px-0 shadow-lg md:shadow-none transition-all duration-300 ease-in-out ${isMenuOpen ? 'flex' : 'hidden'}`}>
                {user ? (
                    <>
                        <Link to="/dashboard" className="flex items-center hover:text-yellow-300 px-3 py-2 rounded-lg transition">
                            <HomeIcon className="h-5 w-5 mr-1" /> Dashboard
                        </Link>
                        <Link to="/modules" className="flex items-center hover:text-yellow-300 px-3 py-2 rounded-lg transition">
                            <BookOpenIcon className="h-5 w-5 mr-1" /> Modules
                        </Link>
                                 <Link
  to="/newmodules"
  className="flex items-center text-white-700 hover:text-indigo-600 px-3 py-2 rounded-lg transition"
>
  <CursorArrowRaysIcon className="h-5 w-5 mr-1" />
  Interactive Content
</Link>
                        <Link to="/games" className="flex items-center hover:text-yellow-300 px-3 py-2 rounded-lg transition">
                            <PuzzlePieceIcon className="h-5 w-5 mr-1" /> Games
                        </Link>
                        <Link to="/projects" className="flex items-center hover:text-yellow-300 px-3 py-2 rounded-lg transition">
                            <RectangleStackIcon className="h-5 w-5 mr-1" /> Projects
                        </Link>
                        <Link to="/badges" className="flex items-center hover:text-yellow-300 px-3 py-2 rounded-lg transition">
                            <CheckBadgeIcon className="h-5 w-5 mr-1" /> Badges
                        </Link>
                        <Link to="/leaderboard" className="flex items-center hover:text-yellow-300 px-3 py-2 rounded-lg transition">
                            <TrophyIcon className="h-5 w-5 mr-1" /> Leaderboard
                        </Link>
                        <Link to="/ai-chat" className="flex items-center hover:text-yellow-300 px-3 py-2 rounded-lg transition">
                            <ChatBubbleLeftRightIcon className="h-5 w-5 mr-1" /> AI Chat
                        </Link>
                        
                        <div className="relative">
                            <button onClick={toggleDropdown} className="flex items-center bg-white text-indigo-700 px-4 py-2 rounded-full hover:bg-gray-100 transition">
                                <UserCircleIcon className="h-5 w-5 mr-2" />
                                {user.username}
                            </button>
                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 text-gray-700">
                                    <Link to="/profile" className="block px-4 py-2 hover:bg-indigo-50">Profile</Link>
                                    {user.role === 'teacher' && (
                                        <Link to="/dashboard/students" className="block px-4 py-2 hover:bg-indigo-50">Students Dashboard</Link>
                                    )}
                                    {user.role === 'parent' && (
                                        <Link to="/children" className="block px-4 py-2 hover:bg-indigo-50">My Children</Link>
                                    )}
                                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 hover:bg-red-100 text-red-600">Logout</button>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        <Link to="/" className="flex items-center hover:text-yellow-300 px-3 py-2 rounded-lg transition">
                            <HomeIcon className="h-5 w-5 mr-1" /> Home
                        </Link>
                        <Link to="/login" className="flex items-center bg-white text-indigo-700 px-5 py-2 rounded-full shadow-md hover:bg-gray-100 transition">
                            <ArrowRightOnRectangleIcon className="h-5 w-5 mr-1" /> Login
                        </Link>
                        <Link to="/register" className="flex items-center border-2 border-white text-white px-5 py-2 rounded-full hover:bg-white hover:text-indigo-700 transition">
                            <UserPlusIcon className="h-5 w-5 mr-1" /> Register
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;

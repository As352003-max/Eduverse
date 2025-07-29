import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AcademicCapIcon } from '@heroicons/react/24/solid';
import {
    HomeIcon, Bars3Icon, XMarkIcon, ArrowRightOnRectangleIcon,
    UserPlusIcon, ChatBubbleLeftRightIcon, TrophyIcon,
    BookOpenIcon, RectangleStackIcon, PuzzlePieceIcon,
    CheckBadgeIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { CursorArrowRaysIcon } from "@heroicons/react/24/outline";

const Navbar: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

    // ✅ Avatar & Role Colors
    const roleColors: Record<string, string> = {
        student: 'ring-green-400',
        teacher: 'ring-blue-400',
        parent: 'ring-purple-400',
        admin: 'ring-red-400'
    };
    const avatarUrl = user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.username}&background=random`;

    return (
        <nav className="bg-gradient-to-r from-indigo-800 via-purple-700 to-pink-600 text-white py-4 px-6 md:px-12 flex justify-between items-center sticky top-0 w-full z-50 shadow-xl">
            
            {/* ✅ Brand */}
            <Link to={user ? "/dashboard" : "/"} className="text-2xl font-bold flex items-center gap-2">
                <AcademicCapIcon className="h-8 w-8 text-white" />
                Eduverse
            </Link>

            {/* ✅ Mobile Menu Button */}
            <div className="md:hidden">
                <button onClick={toggleMenu}>
                    {isMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
                </button>
            </div>

            {/* ✅ Menu */}
            <div className={`flex-col md:flex md:flex-row md:items-center md:space-x-6 space-y-2 md:space-y-0 absolute md:static bg-indigo-800 md:bg-transparent top-20 left-0 w-full md:w-auto px-6 md:px-0 shadow-lg md:shadow-none ${isMenuOpen ? 'flex' : 'hidden'}`}>
                {user ? (
                    <>
                        <Link to="/dashboard" className="hover:text-yellow-300 flex items-center"><HomeIcon className="h-5 w-5 mr-1" />Dashboard</Link>
                        <Link to="/modules" className="hover:text-yellow-300 flex items-center"><BookOpenIcon className="h-5 w-5 mr-1" />Modules</Link>
                        <Link to="/newmodules" className="hover:text-yellow-300 flex items-center"><CursorArrowRaysIcon className="h-5 w-5 mr-1" />Interactive</Link>
                        <Link to="/games" className="hover:text-yellow-300 flex items-center"><PuzzlePieceIcon className="h-5 w-5 mr-1" />Games</Link>
                        <Link to="/projects" className="hover:text-yellow-300 flex items-center"><RectangleStackIcon className="h-5 w-5 mr-1" />Projects</Link>
                        <Link to="/badges" className="hover:text-yellow-300 flex items-center"><CheckBadgeIcon className="h-5 w-5 mr-1" />Badges</Link>
                        <Link to="/leaderboard" className="hover:text-yellow-300 flex items-center"><TrophyIcon className="h-5 w-5 mr-1" />Leaderboard</Link>
                        <Link to="/ai-chat" className="hover:text-yellow-300 flex items-center"><ChatBubbleLeftRightIcon className="h-5 w-5 mr-1" />AI Chat</Link>

                        {/* ✅ Avatar Dropdown */}
                        <div className="relative">
                            <button onClick={toggleDropdown} className="flex items-center gap-2 bg-white text-indigo-700 px-3 py-2 rounded-full hover:bg-gray-100 transition">
                                <img src={avatarUrl} className={`w-9 h-9 rounded-full ring-2 ${roleColors[user.role]}`} alt="avatar" />
                                <span>{user.username}</span>
                            </button>

                            {/* ✅ Animated Dropdown */}
                            <AnimatePresence>
                                {isDropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="absolute right-0 mt-3 w-56 bg-white rounded-lg shadow-lg z-50 p-3 text-gray-700"
                                    >
                                        {/* ✅ Mini Profile Card */}
                                        <div className="flex items-center gap-3 p-2 border-b">
                                            <img src={avatarUrl} className={`w-10 h-10 rounded-full ring-2 ${roleColors[user.role]}`} />
                                            <div>
                                                <p className="font-semibold">{user.username}</p>
                                                <p className="text-xs capitalize">{user.role}</p>
                                            </div>
                                        </div>

                                        {/* ✅ Links */}
                                        <Link to="/profile" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 hover:bg-indigo-50">Profile</Link>
                                        {user.role === 'teacher' && <Link to="/dashboard/students" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 hover:bg-indigo-50">Students Dashboard</Link>}
                                        {user.role === 'parent' && <Link to="/children" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 hover:bg-indigo-50">My Children</Link>}
                                        <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-100">Logout</button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </>
                ) : (
                    <>
                        <Link to="/" className="hover:text-yellow-300 flex items-center"><HomeIcon className="h-5 w-5 mr-1" />Home</Link>
                        <Link to="/login" className="bg-white text-indigo-700 px-4 py-2 rounded-full shadow-md hover:bg-gray-100">Login</Link>
                        <Link to="/register" className="border-2 border-white px-4 py-2 rounded-full hover:bg-white hover:text-indigo-700">Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;

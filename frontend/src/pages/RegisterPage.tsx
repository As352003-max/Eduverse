// frontend/src/pages/RegisterPage.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion'; // For animations
import { UserIcon, EnvelopeIcon, LockClosedIcon, ArrowPathIcon, ExclamationCircleIcon, AcademicCapIcon } from '@heroicons/react/24/outline'; // Icons

const RegisterPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'student' | 'teacher' | 'parent'>('student'); // Default role
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { register } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            // IMPORTANT: Trim whitespace from username, email, and password before sending
            await register(username.trim(), email.trim(), password.trim(), role);
            navigate('/dashboard'); // Redirect to dashboard on successful registration
        } catch (err: any) {
            console.error('Registration failed:', err.response?.data || err.message);
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-700 to-pink-500">
            <div className="flex w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="hidden md:flex flex-col justify-center items-center w-1/2 bg-gradient-to-br from-indigo-700 to-purple-600 text-white p-10 relative"
                >
                    <div className="absolute inset-0 bg-indigo-900 bg-opacity-40 pointer-events-none" />
                    <div className="relative z-10 flex flex-col items-center">
                        <AcademicCapIcon className="h-16 w-16 mb-6 text-white drop-shadow-lg" />
                        <h2 className="text-4xl font-extrabold mb-4 drop-shadow-lg">Welcome to Eduverse</h2>
                        <p className="text-lg font-medium mb-8 text-indigo-100 text-center">
                            Unlock your learning potential.<br />
                            Join a vibrant community of students, teachers, and parents.
                        </p>
                        <ul className="space-y-3 text-indigo-100 text-base">
                            <li className="flex items-center">
                                <span className="inline-block h-3 w-3 rounded-full bg-pink-400 mr-2" />
                                Personalized dashboard
                            </li>
                            <li className="flex items-center">
                                <span className="inline-block h-3 w-3 rounded-full bg-yellow-400 mr-2" />
                                Interactive courses & resources
                            </li>
                            <li className="flex items-center">
                                <span className="inline-block h-3 w-3 rounded-full bg-green-400 mr-2" />
                                Progress tracking & achievements
                            </li>
                        </ul>
                    </div>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full md:w-1/2 bg-white p-8 md:p-10 flex flex-col justify-center"
                >
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-4 text-center">
                        Create Account
                    </h2>
                    <p className="text-gray-500 text-center mb-6">
                        Start your personalized learning journey.
                    </p>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md flex items-center"
                        >
                            <ExclamationCircleIcon className="h-6 w-6 mr-3" />
                            {error}
                        </motion.div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="username" className="block text-gray-700 text-sm font-semibold mb-2">
                                <UserIcon className="inline-block h-5 w-5 mr-1 text-indigo-500" /> Username
                            </label>
                            <input
                                type="text"
                                id="username"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 bg-gray-50"
                                placeholder="Choose a username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-2">
                                <EnvelopeIcon className="inline-block h-5 w-5 mr-1 text-indigo-500" /> Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 bg-gray-50"
                                placeholder="your@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-2">
                                <LockClosedIcon className="inline-block h-5 w-5 mr-1 text-indigo-500" /> Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 bg-gray-50"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="role" className="block text-gray-700 text-sm font-semibold mb-2">
                                <AcademicCapIcon className="inline-block h-5 w-5 mr-1 text-indigo-500" /> I am a...
                            </label>
                            <select
                                id="role"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 bg-gray-50"
                                value={role}
                                onChange={(e) => setRole(e.target.value as 'student' | 'teacher' | 'parent')}
                                required
                            >
                                <option value="student">Student</option>
                                <option value="teacher">Teacher</option>
                                <option value="parent">Parent</option>
                            </select>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-full shadow-lg flex items-center justify-center transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? (
                                <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                            ) : (
                                'Register'
                            )}
                        </motion.button>
                    </form>
                    <p className="text-center text-gray-600 mt-8">
                        Already have an account?{' '}
                        <Link to="/login" className="text-indigo-600 hover:text-indigo-800 font-semibold transition duration-200">
                            Login
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default RegisterPage;
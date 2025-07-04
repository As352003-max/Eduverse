import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { EnvelopeIcon, LockClosedIcon, ArrowPathIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row">
            <div className="hidden md:flex w-1/2 bg-gradient-to-br from-indigo-900 via-purple-700 to-pink-600 items-center justify-center relative">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7 }}
                    className="text-white text-center px-10"
                >
                    <div className="flex flex-col items-center mb-6">
                        <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center shadow-xl mb-4">
                            {/* Book Logo SVG */}
                            <svg width="60" height="60" viewBox="0 0 64 64" fill="none">
                                <rect x="8" y="12" width="48" height="40" rx="6" fill="#fff" fillOpacity="0.9"/>
                                <path d="M16 20H48M16 28H48M16 36H40" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round"/>
                                <path d="M8 18V46C8 50 12 52 16 52H56" stroke="#a21caf" strokeWidth="2.5" strokeLinecap="round"/>
                            </svg>
                        </div>
                        <h1 className="text-5xl font-extrabold mb-2 drop-shadow-lg">Eduverse</h1>
                    </div>
                    <p className="text-xl font-medium mb-8 opacity-90">
                        Unlock your potential. <br /> Learn, grow, and succeed with us.
                    </p>
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
            </div>
            <div className="flex w-full md:w-1/2 items-center justify-center bg-white">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="rounded-3xl shadow-2xl p-8 md:p-10 w-full max-w-md bg-white"
                >
                    <h2 className="text-4xl font-extrabold text-gray-900 mb-6 text-center">
                        Welcome Back!
                    </h2>
                    <p className="text-gray-600 text-center mb-8">
                        Sign in to continue your learning journey.
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
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-2">
                                <EnvelopeIcon className="inline-block h-5 w-5 mr-1 text-gray-500" /> Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                                placeholder="your@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-2">
                                <LockClosedIcon className="inline-block h-5 w-5 mr-1 text-gray-500" /> Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white font-bold py-3 px-6 rounded-full shadow-lg flex items-center justify-center transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? (
                                <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                            ) : (
                                'Login'
                            )}
                        </motion.button>
                    </form>
                    <p className="text-center text-gray-600 mt-8">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-indigo-600 hover:text-indigo-800 font-semibold transition duration-200">
                            Sign Up
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default LoginPage;

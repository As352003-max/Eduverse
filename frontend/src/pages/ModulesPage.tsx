import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/axiosClient';
import { motion } from 'framer-motion'; 
import { BookOpenIcon, ArrowPathIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

interface Module {
    _id: string;
    title: string;
    description: string;
    gradeLevel: { min: number; max: number };
    difficulty: 'beginner' | 'intermediate' | 'advanced';
}

const ModulesPage: React.FC = () => {
    const [modules, setModules] = useState<Module[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchModules = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await apiClient.get<Module[]>('/modules');
                setModules(response.data);
            } catch (err: any) {
                console.error('Error fetching modules:', err.response?.data || err.message);
                setError('Failed to load modules. ' + (err.response?.data?.message || 'Please check your backend server.'));
            } finally {
                setLoading(false);
            }
        };
        fetchModules();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <ArrowPathIcon className="h-16 w-16 text-indigo-600 animate-spin" />
                <p className="ml-4 text-xl text-gray-700">Loading Modules...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
                <ExclamationCircleIcon className="h-20 w-20 text-red-500 mb-4" />
                <p className="text-red-600 text-center text-2xl font-semibold mb-4">{error}</p>
                <button
                    onClick={() => window.location.reload()} // Simple refresh to retry
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <motion.h1
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-10 text-center"
                >
                    Explore Our AI Modules
                </motion.h1>

                {modules.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="bg-white rounded-2xl shadow-lg p-10 text-center flex flex-col items-center justify-center"
                    >
                        <BookOpenIcon className="h-24 w-24 text-gray-400 mb-6" />
                        <p className="text-xl text-gray-700 font-semibold mb-4">No learning modules available yet.</p>
                        <p className="text-lg text-gray-600">Please check back later or contact support.</p>
                    </motion.div>
                ) : (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {modules.map((module) => (
                            <motion.div
                                key={module._id}
                                variants={itemVariants}
                                whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
                                className="bg-white rounded-xl shadow-md p-6 flex flex-col h-full transform transition duration-300 ease-in-out"
                            >
                                <Link to={`/modules/${module._id}`} className="block h-full">
                                    <h2 className="text-2xl font-bold text-indigo-700 mb-2">{module.title}</h2>
                                    <p className="text-gray-600 flex-grow mb-4 line-clamp-3">{module.description}</p>
                                    <div className="mt-auto pt-4 border-t border-gray-200 text-sm text-gray-500">
                                        <p>Grade: <span className="font-semibold">{module.gradeLevel.min}-{module.gradeLevel.max}</span></p>
                                        <p>Difficulty: <span className="font-semibold capitalize">{module.difficulty}</span></p>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default ModulesPage;
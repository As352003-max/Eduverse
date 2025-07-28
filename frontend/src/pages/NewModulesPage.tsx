// frontend/src/pages/NewModulesPage.tsx
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

const accentColors = [
  'bg-indigo-500',
  'bg-pink-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-purple-500',
  'bg-red-500',
];

const NewModulesPage: React.FC = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModules = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get<Module[]>('/learning-modules');
        setModules(response.data);
      } catch (err: any) {
        console.error('Error fetching modules:', err.response?.data || err.message);
        setError(
          'Failed to load modules. ' + (err.response?.data?.message || 'Please check your backend server.')
        );
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
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <ArrowPathIcon className="h-16 w-16 text-indigo-600 animate-spin" />
        <p className="ml-4 text-xl text-gray-700 font-semibold">Loading Modules...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <ExclamationCircleIcon className="h-20 w-20 text-red-500 mb-4" />
        <p className="text-red-600 text-center text-2xl font-semibold mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <motion.h1
          initial={{ opacity: 0, y: -60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl font-extrabold text-gray-900 mb-16 text-center tracking-tight"
        >
       Discover Interactive Learning Adventures
        </motion.h1>

        {modules.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-3xl shadow-xl p-12 text-center flex flex-col items-center justify-center"
          >
            <BookOpenIcon className="h-28 w-28 text-gray-300 mb-8" />
            <p className="text-2xl text-gray-700 font-semibold mb-3">No learning modules available yet.</p>
            <p className="text-lg text-gray-500 max-w-md">
              Please check back later or contact support if you think this is an error.
            </p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
          >
            {modules.map((module, idx) => (
              <motion.div
                key={module._id}
                variants={itemVariants}
                whileHover={{
                  y: -8,
                  boxShadow:
                    '0 20px 25px -5px rgba(99, 102, 241, 0.3), 0 10px 10px -5px rgba(99, 102, 241, 0.2)',
                }}
                className="bg-white rounded-3xl shadow-lg p-8 flex flex-col h-full border border-gray-100 transform transition duration-300 ease-in-out cursor-pointer"
              >
                {/* Colored accent bar on top */}
                <div className={`h-1 w-14 rounded-full mb-4 ${accentColors[idx % accentColors.length]}`}></div>

                <Link
                  to={`/newmodule/${module._id}`}
                  className="block h-full focus:outline-none focus:ring-4 focus:ring-indigo-400 rounded"
                >
                  <h2 className="text-3xl font-semibold text-indigo-700 mb-4 leading-snug">
                    {module.title}
                  </h2>
                  <p className="text-gray-700 flex-grow mb-6 leading-relaxed line-clamp-4">
                    {module.description}
                  </p>
                  <div className="mt-auto text-indigo-600 font-medium text-sm uppercase tracking-wide select-none">
                    View Details →
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

export default NewModulesPage;

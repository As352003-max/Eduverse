import React, { useEffect, useState } from 'react';
import apiClient from '../api/axiosClient';
import { motion } from 'framer-motion';
import { BookOpenIcon, ArrowPathIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const NewModulesPage: React.FC = () => {
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchModules = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get('/learning-modules');
        setModules(res.data);
      } catch (err: any) {
        console.error('Error fetching modules:', err.response?.data || err.message);
        setError('Failed to load modules. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, []);

  const handleModuleClick = (moduleId: string) => {
    if (moduleId) {
      navigate(`/newmodule/${moduleId}`);
    } else {
      console.error("Attempted to navigate to a module with an invalid ID.");
      setError("Cannot open module: Invalid ID provided.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <ArrowPathIcon className="h-20 w-20 text-indigo-600 animate-spin" />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-xl font-semibold text-indigo-700"
        >
          Loading Modules...
        </motion.p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
        <ExclamationCircleIcon className="h-24 w-24 text-red-500 mb-6" />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-3xl font-semibold text-red-600 mb-6"
        >
          {error}
        </motion.p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => window.location.reload()}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition"
        >
          Retry
        </motion.button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.h1
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-6xl font-extrabold text-center text-indigo-800 mb-16 tracking-tight"
        >
          <BookOpenIcon className="inline-block h-14 w-14 mr-4 text-purple-600" />
          Learning Modules
        </motion.h1>

        {modules.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-2xl text-gray-600 mt-20"
          >
            No modules available yet.
          </motion.div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
          >
            {modules.map((module) => (
              <motion.div
                key={module._id}
                variants={{
                  hidden: { opacity: 0, scale: 0.9 },
                  visible: { opacity: 1, scale: 1 },
                }}
                whileHover={{ scale: 1.03, boxShadow: "0 15px 30px rgba(0,0,0,0.15)" }}
                transition={{ type: "spring", stiffness: 300 }}
                className="bg-white rounded-3xl shadow-xl overflow-hidden cursor-pointer flex flex-col"
                onClick={() => handleModuleClick(module._id)}
              >
                <div className="p-8 flex flex-col justify-between flex-grow">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                    {module.title}
                  </h2>
                  <p className="text-gray-600 text-lg mb-6 flex-grow">
                    {module.description}
                  </p>
                  {module.gradeLevel && (
                    <div className="text-sm text-gray-500 mb-4">
                      <p>Grade: {module.gradeLevel.min}-{module.gradeLevel.max}</p>
                      {module.topics && module.topics.length > 0 && (
                        <p>Difficulty: {module.topics[0]?.level}</p>
                      )}
                    </div>
                  )}
                  <div className="flex justify-end">
                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1">
                      Start Learning
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default NewModulesPage;
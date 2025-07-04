// frontend/src/pages/ProjectsPage.tsx
import React, { useEffect, useState } from 'react';
import apiClient from '../api/axiosClient'; // Correctly import your configured axiosClient
import { useAuth } from '../context/AuthContext'; // Import useAuth to check user state
import { motion } from 'framer-motion'; // For animations
import { PlusCircleIcon, FolderOpenIcon, ArrowPathIcon } from '@heroicons/react/24/outline'; // Icons for better visuals

// Assuming CreateEditProjectPage exists and can be imported
import CreateEditProjectPage from './CreateEditProjectPage'; // Import the Create/Edit Project Page

interface Project {
    _id: string;
    title: string;
    description: string;
    owner: { _id: string; username: string; }; // Expecting populated owner
    status: 'pending' | 'in-progress' | 'completed' | 'reviewed';
    dueDate?: string;
    createdAt: string;
}

const ProjectsPage: React.FC = () => {
    const { user, loading: authLoading } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreateEditModal, setShowCreateEditModal] = useState(false); // State to control modal visibility
    const [editingProject, setEditingProject] = useState<Project | null>(null); // State to hold project being edited

    const fetchProjects = async () => {
        setLoadingData(true);
        setError(null);

        if (authLoading || !user) {
            setLoadingData(false);
            return;
        }

        try {
            const response = await apiClient.get<Project[]>('/projects');
            setProjects(response.data);
        } catch (err: any) {
            console.error('Error fetching projects:', err.response?.data || err.message);
            setError('Failed to load projects. ' + (err.response?.data?.message || ''));
        } finally {
            setLoadingData(false);
        }
    };

    useEffect(() => {
        // Fetch projects only if AuthContext has loaded and a user is present
        if (!authLoading && user) {
            fetchProjects();
        }
    }, [user, authLoading]); // Dependencies

    const handleCreateNewProject = () => {
        setEditingProject(null); // Clear any existing project data
        setShowCreateEditModal(true);
    };

    const handleEditProject = (project: Project) => {
        setEditingProject(project);
        setShowCreateEditModal(true);
    };

    const handleModalClose = () => {
        setShowCreateEditModal(false);
        setEditingProject(null); // Clear editing project state
        fetchProjects(); // Re-fetch projects to show any new/updated ones
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1 // Stagger animation for children
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    if (authLoading || loadingData) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <ArrowPathIcon className="h-16 w-16 text-indigo-600 animate-spin" />
                <p className="ml-4 text-xl text-gray-700">Loading Projects...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
                <p className="text-red-600 text-center text-2xl font-semibold mb-4">{error}</p>
                <button
                    onClick={fetchProjects}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300"
                >
                    Retry Loading
                </button>
            </div>
        );
    }

    if (!user) {
        return <div className="text-center mt-8 text-red-500">Please log in to view your projects.</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <motion.h1
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-8 text-center"
                >
                    My Creative Projects
                </motion.h1>

                <div className="text-center mb-10">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCreateNewProject}
                        className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white font-bold py-3 px-8 rounded-full shadow-lg flex items-center justify-center mx-auto transition duration-300 ease-in-out"
                    >
                        <PlusCircleIcon className="h-6 w-6 mr-2" />
                        Create New Project
                    </motion.button>
                </div>

                {projects.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="bg-white rounded-2xl shadow-lg p-10 text-center flex flex-col items-center justify-center"
                    >
                        <FolderOpenIcon className="h-24 w-24 text-gray-400 mb-6" />
                        <p className="text-xl text-gray-700 font-semibold mb-4">No projects found.</p>
                        <p className="text-lg text-gray-600">Start your creative journey by creating your first project!</p>
                    </motion.div>
                ) : (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {projects.map((project) => (
                            <motion.div
                                key={project._id}
                                variants={itemVariants}
                                whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
                                className="bg-white rounded-xl shadow-md p-6 flex flex-col justify-between cursor-pointer"
                                onClick={() => handleEditProject(project)} // Click to edit
                            >
                                <div>
                                    <h2 className="text-2xl font-bold mb-2 text-indigo-700">{project.title}</h2>
                                    <p className="text-gray-600 mb-4 line-clamp-3">{project.description}</p>
                                </div>
                                <div className="mt-4">
                                    <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                            project.status === 'completed' ? 'bg-green-100 text-green-800' :
                                            project.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                                            project.status === 'reviewed' ? 'bg-purple-100 text-purple-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {project.status.replace('-', ' ').toUpperCase()}
                                        </span>
                                        {project.dueDate && (
                                            <span className="text-gray-500">Due: {new Date(project.dueDate).toLocaleDateString()}</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-400">Created by: <span className="font-medium text-gray-600">{project.owner.username}</span></p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>

            {/* Create/Edit Project Modal */}
            {showCreateEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-3xl relative"
                    >
                        <CreateEditProjectPage projectToEdit={editingProject} onClose={handleModalClose} />
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default ProjectsPage;

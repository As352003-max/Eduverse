// frontend/src/pages/ProjectDetailPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../api/axiosClient'; // Use apiClient for authenticated requests
import { motion } from 'framer-motion'; // For animations
import {
    FolderOpenIcon,
    CalendarDaysIcon,
    TagIcon,
    UserIcon,
    LinkIcon,
    ArrowPathIcon,
    ExclamationCircleIcon,
    PencilSquareIcon,
    TrashIcon,
    UsersIcon // For team members
} from '@heroicons/react/24/outline'; // Icons

// Define a more comprehensive Project interface based on common project data
interface Project {
    _id: string;
    title: string; // Changed from 'name' to 'title' for consistency
    description: string;
    owner: { _id: string; username: string; email?: string; }; // Populated owner details
    status: 'pending' | 'in-progress' | 'completed' | 'reviewed' | 'planning' | 'on-hold'; // More statuses
    dueDate?: string; // Optional due date
    startDate?: string; // Optional start date
    endDate?: string; // Optional end date
    technologies?: string[]; // Array of technologies used
    githubLink?: string; // Optional GitHub link
    liveLink?: string; // Optional live demo link
    members?: { _id: string; username: string; role: string; }[]; // Array of team members
    createdAt: string;
    updatedAt: string;
}

const ProjectDetailsPage: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>(); // Use projectId for clarity
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                setLoading(true);
                setError(null);
                // Ensure your backend has a GET /api/projects/:id endpoint
                const response = await apiClient.get<Project>(`/projects/${projectId}`);
                setProject(response.data);
            } catch (err: any) {
                console.error("Error fetching project:", err.response?.data || err.message);
                setError('Failed to fetch project details. ' + (err.response?.data?.message || 'Please check your backend server.'));
            } finally {
                setLoading(false);
            }
        };

        if (projectId) {
            fetchProject();
        } else {
            setError("Project ID is missing from the URL.");
            setLoading(false);
        }
    }, [projectId]); // Re-fetch when the projectId changes

    // Helper to format dates
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    // Animation variants
    const sectionVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <ArrowPathIcon className="h-16 w-16 text-indigo-600 animate-spin" />
                <p className="ml-4 text-xl text-gray-700">Loading Project Details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
                <ExclamationCircleIcon className="h-20 w-20 text-red-500 mb-4" />
                <p className="text-red-600 text-center text-2xl font-semibold mb-4">{error}</p>
                <Link to="/projects" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 mt-4">
                    Go back to projects
                </Link>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
                <FolderOpenIcon className="h-20 w-20 text-gray-400 mb-4" />
                <p className="text-xl text-gray-600 mb-4">Project not found.</p>
                <Link to="/projects" className="text-blue-600 hover:underline font-semibold">
                    Go back to projects list
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-12">
            <div className="container mx-auto p-6">
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white shadow-lg rounded-xl p-8 mb-8"
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 flex items-center">
                        <FolderOpenIcon className="h-10 w-10 mr-4 text-indigo-600" />
                        {project.title}
                    </h1>
                    <p className="text-gray-700 text-lg mb-6 leading-relaxed">{project.description}</p>

                    <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-800 mb-3 flex items-center">
                                <TagIcon className="h-6 w-6 mr-2 text-gray-600" /> Details
                            </h2>
                            <p className="text-gray-700 mb-2">
                                <span className="font-medium">Status:</span>{' '}
                                <span
                                    className={`px-3 py-1 rounded-full text-sm font-semibold
                                        ${project.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                                        ${project.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : ''}
                                        ${project.status === 'planning' ? 'bg-yellow-100 text-yellow-800' : ''}
                                        ${project.status === 'on-hold' ? 'bg-red-100 text-red-800' : ''}
                                        ${project.status === 'reviewed' ? 'bg-purple-100 text-purple-800' : ''}
                                    `}
                                >
                                    {project.status.charAt(0).toUpperCase() + project.status.slice(1).replace('-', ' ')}
                                </span>
                            </p>
                            <p className="text-gray-700 mt-2 flex items-center"><UserIcon className="h-5 w-5 mr-2 text-gray-500" /><span className="font-medium">Owner:</span> {project.owner?.username || 'N/A'}</p>
                            <p className="text-gray-700 mt-2 flex items-center"><CalendarDaysIcon className="h-5 w-5 mr-2 text-gray-500" /><span className="font-medium">Created:</span> {formatDate(project.createdAt)}</p>
                            {project.startDate && (
                                <p className="text-gray-700 mt-2 flex items-center"><CalendarDaysIcon className="h-5 w-5 mr-2 text-gray-500" /><span className="font-medium">Start Date:</span> {formatDate(project.startDate)}</p>
                            )}
                            {project.dueDate && (
                                <p className="text-gray-700 mt-2 flex items-center"><CalendarDaysIcon className="h-5 w-5 mr-2 text-gray-500" /><span className="font-medium">Due Date:</span> {formatDate(project.dueDate)}</p>
                            )}
                            {project.endDate && (
                                <p className="text-gray-700 mt-2 flex items-center"><CalendarDaysIcon className="h-5 w-5 mr-2 text-gray-500" /><span className="font-medium">End Date:</span> {formatDate(project.endDate)}</p>
                            )}
                            <p className="text-gray-700 mt-2">
                                <span className="font-medium flex items-center"><TagIcon className="h-5 w-5 mr-2 text-gray-500" />Technologies:</span>{' '}
                                {project.technologies && project.technologies.length > 0 ? (
                                    <div className="flex flex-wrap mt-2">
                                        {project.technologies.map((tech, index) => (
                                            <span key={index} className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    'N/A'
                                )}
                            </p>
                        </div>

                        <div>
                            <h2 className="text-2xl font-semibold text-gray-800 mb-3 flex items-center">
                                <LinkIcon className="h-6 w-6 mr-2 text-gray-600" /> Links
                            </h2>
                            {project.githubLink && (
                                <p className="text-gray-700 mt-2 flex items-center">
                                    <LinkIcon className="h-5 w-5 mr-2 text-gray-500" /><span className="font-medium">GitHub:</span>{' '}
                                    <a href={project.githubLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                                        View Code
                                    </a>
                                </p>
                            )}
                            {project.liveLink && (
                                <p className="text-gray-700 mt-2 flex items-center">
                                    <LinkIcon className="h-5 w-5 mr-2 text-gray-500" /><span className="font-medium">Live Demo:</span>{' '}
                                    <a href={project.liveLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                                        View Live
                                    </a>
                                </p>
                            )}
                            {!project.githubLink && !project.liveLink && (
                                <p className="text-gray-700 mt-2 text-gray-600">No external links provided.</p>
                            )}
                        </div>
                    </motion.div>

                    {project.members && project.members.length > 0 && (
                        <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="mb-8 mt-8 border-t pt-8 border-gray-200">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-3 flex items-center">
                                <UsersIcon className="h-6 w-6 mr-2 text-gray-600" /> Team Members
                            </h2>
                            <ul className="list-disc list-inside text-gray-700">
                                {project.members.map((member) => (
                                    <li key={member._id} className="mb-1">
                                        <span className="font-medium">{member.username}</span> (<span className="text-gray-500">{member.role}</span>)
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    )}

                    <div className="flex justify-end mt-8 space-x-4 border-t pt-6 border-gray-200">
                        {/* Add buttons for editing, deleting, or joining project based on user roles */}
                        <Link
                            to={`/projects/edit/${project._id}`}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full shadow-md transition duration-300 ease-in-out flex items-center"
                        >
                            <PencilSquareIcon className="h-5 w-5 mr-2" /> Edit Project
                        </Link>
                        {/* Example of a delete button (implement confirmation dialog!) */}
                        <button
                            onClick={() => { if(window.confirm('Are you sure you want to delete this project?')) console.log('Delete project', project._id)}}
                            className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-full shadow-md transition duration-300 ease-in-out flex items-center"
                        >
                            <TrashIcon className="h-5 w-5 mr-2" /> Delete Project
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ProjectDetailsPage;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { XMarkIcon, DocumentTextIcon, CalendarDaysIcon, UserIcon, CheckCircleIcon, PlusCircleIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

interface Project {
    _id?: string;
    title: string;
    description: string;
    owner?: { _id: string; username: string; };
    status: 'pending' | 'in-progress' | 'completed' | 'reviewed';
    dueDate?: string;
}

interface CreateEditProjectPageProps {
    projectToEdit?: Project | null;
    onClose: () => void;
}

const CreateEditProjectPage: React.FC<CreateEditProjectPageProps> = ({ projectToEdit, onClose }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [title, setTitle] = useState(projectToEdit?.title || '');
    const [description, setDescription] = useState(projectToEdit?.description || '');
    const [status, setStatus] = useState<'pending' | 'in-progress' | 'completed' | 'reviewed'>(projectToEdit?.status || 'pending');
    const [dueDate, setDueDate] = useState(projectToEdit?.dueDate ? new Date(projectToEdit.dueDate).toISOString().split('T')[0] : '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        if (projectToEdit) {
            setTitle(projectToEdit.title);
            setDescription(projectToEdit.description);
            setStatus(projectToEdit.status);
            setDueDate(projectToEdit.dueDate ? new Date(projectToEdit.dueDate).toISOString().split('T')[0] : '');
        } else {
            setTitle('');
            setDescription('');
            setStatus('pending');
            setDueDate('');
        }
    }, [projectToEdit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setLoading(true);

        if (!user?._id) {
            setError('User not authenticated. Cannot create/edit project.');
            setLoading(false);
            return;
        }

        const projectData = {
            title,
            description,
            status,
            dueDate: dueDate || undefined,
            owner: user._id
        };

        try {
            if (projectToEdit?._id) {
                await apiClient.put(`/projects/${projectToEdit._id}`, projectData);
                setSuccessMessage('Project updated successfully!');
            } else {
                await apiClient.post('/projects', projectData);
                setSuccessMessage('Project created successfully!');
            }
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (err: any) {
            console.error('Error saving project:', err.response?.data || err.message);
            setError('Failed to save project: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative p-6 bg-white rounded-xl shadow-lg w-full max-w-2xl mx-auto">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition duration-200"
                aria-label="Close"
            >
                <XMarkIcon className="h-7 w-7" />
            </button>

            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center flex items-center justify-center">
                {projectToEdit ? (
                    <>
                        <PencilSquareIcon className="h-8 w-8 mr-3 text-indigo-600" /> Edit Project
                    </>
                ) : (
                    <>
                        <PlusCircleIcon className="h-8 w-8 mr-3 text-green-600" /> Create New Project
                    </>
                )}
            </h2>

            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            {successMessage && (
                <p className="text-green-600 text-center mb-4 flex items-center justify-center">
                    <CheckCircleIcon className="h-5 w-5 mr-2" /> {successMessage}
                </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label htmlFor="title" className="block text-gray-700 text-sm font-semibold mb-2">
                        <DocumentTextIcon className="inline-block h-5 w-5 mr-1 text-gray-500" /> Project Title
                    </label>
                    <input
                        type="text"
                        id="title"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                        placeholder="e.g., Interactive Math Game"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label htmlFor="description" className="block text-gray-700 text-sm font-semibold mb-2">
                        <DocumentTextIcon className="inline-block h-5 w-5 mr-1 text-gray-500" /> Description
                    </label>
                    <textarea
                        id="description"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 h-32 resize-y"
                        placeholder="Describe your project, its goals, and features."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    ></textarea>
                </div>

                <div>
                    <label htmlFor="status" className="block text-gray-700 text-sm font-semibold mb-2">
                        <CheckCircleIcon className="inline-block h-5 w-5 mr-1 text-gray-500" /> Status
                    </label>
                    <select
                        id="status"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                        value={status}
                        onChange={(e) => setStatus(e.target.value as 'pending' | 'in-progress' | 'completed' | 'reviewed')}
                    >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In-Progress</option>
                        <option value="completed">Completed</option>
                        <option value="reviewed">Reviewed</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="dueDate" className="block text-gray-700 text-sm font-semibold mb-2">
                        <CalendarDaysIcon className="inline-block h-5 w-5 mr-1 text-gray-500" /> Due Date (Optional)
                    </label>
                    <input
                        type="date"
                        id="dueDate"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-bold py-3 px-6 rounded-lg shadow-md flex items-center justify-center transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                >
                    {loading ? (
                        <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                    ) : projectToEdit ? (
                        <> <PencilSquareIcon className="h-5 w-5 mr-2" /> Update Project </>
                    ) : (
                        <> <PlusCircleIcon className="h-5 w-5 mr-2" /> Create Project </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default CreateEditProjectPage;

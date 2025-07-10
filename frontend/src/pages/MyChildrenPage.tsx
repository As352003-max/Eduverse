import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PlusCircleIcon, UserGroupIcon, PencilSquareIcon, TrashIcon, FaceSmileIcon, ArrowLeftIcon, CakeIcon, ClipboardDocumentListIcon, ChartBarIcon, PlayCircleIcon } from '@heroicons/react/24/outline'; // Added PlayCircleIcon
import { toast } from 'react-toastify';
import apiClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext'; // Updated import for useAuth
import { useAnalytics } from '../hooks/useAnalytics';
import { useNavigate } from 'react-router-dom';
import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/solid'; // Added XMarkIcon for modal close

// Define the interface for a Child, matching your backend schema
interface Child {
    _id: string;
    userId: string;
    name: string;
    dob?: string;
    avatar?: string;
    learningPreferences?: string[];
    gradeLevel?: string;
    currentXp: number;
    level: number;
    modulesCompleted: string[];
    lastActiveAt?: string;
    createdAt: string;
    updatedAt: string;
}

const MyChildrenPage: React.FC = () => {
    // Destructure selectedChild and setSelectedChild from useAuth
    const { user, selectedChild, setSelectedChild } = useAuth();
    const { trackEvent } = useAnalytics();
    const navigate = useNavigate();

    const [children, setChildren] = useState<Child[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddChildModal, setShowAddChildModal] = useState<boolean>(false);
    const [newChildName, setNewChildName] = useState<string>('');
    const [newChildDob, setNewChildDob] = useState<string>('');
    const [newChildAvatar, setNewChildAvatar] = useState<string>('');
    const [newChildGradeLevel, setNewChildGradeLevel] = useState<string>('');
    const [newChildLearningPreferences, setNewChildLearningPreferences] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState<boolean>(false);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            toast.error('Please log in to manage children.');
            return;
        }
        fetchChildren();
    }, [user, navigate]);

    const fetchChildren = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiClient.get('/children');
            setChildren(response.data.data);
            trackEvent('CHILDREN_LIST_VIEWED', {
                childCount: response.data.data.length
            });
        } catch (err: any) {
            console.error('Error fetching children:', err);
            setError(err.response?.data?.message || 'Failed to load children profiles.');
            toast.error('Error loading children profiles.');
            trackEvent('CHILDREN_LIST_LOAD_FAILED', {
                error: err.response?.data?.message || err.message
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAddChild = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const dobDate = newChildDob ? new Date(newChildDob) : undefined;
            const response = await apiClient.post('/children', {
                name: newChildName,
                dob: dobDate,
                avatar: newChildAvatar,
                gradeLevel: newChildGradeLevel,
                learningPreferences: newChildLearningPreferences,
            });
            const addedChild = response.data.data;
            setChildren([...children, addedChild]);
            toast.success(`${newChildName} added successfully!`);
            trackEvent('CHILD_ADDED', {
                childName: newChildName,
                dob: newChildDob,
                gradeLevel: newChildGradeLevel,
                learningPreferences: newChildLearningPreferences,
                newChildId: addedChild._id
            });
            setShowAddChildModal(false);
            setNewChildName('');
            setNewChildDob('');
            setNewChildAvatar('');
            setNewChildGradeLevel('');
            setNewChildLearningPreferences([]);
            // Automatically select the newly added child
            setSelectedChild({ _id: addedChild._id, name: addedChild.name });
            toast.info(`'${addedChild.name}' is now selected.`);

        } catch (err: any) {
            console.error('Error adding child:', err);
            toast.error(err.response?.data?.message || 'Failed to add child.');
            trackEvent('CHILD_ADD_FAILED', {
                childName: newChildName,
                error: err.response?.data?.message || err.message
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteChild = async (childId: string, childName: string) => {
        if (!window.confirm(`Are you sure you want to delete ${childName}'s profile? This action cannot be undone.`)) {
            return;
        }
        try {
            await apiClient.delete(`/children/${childId}`);
            setChildren(children.filter(child => child._id !== childId));
            toast.success(`${childName}'s profile deleted.`);
            trackEvent('CHILD_DELETED', {
                childId: childId,
                childName: childName
            });
            // If the deleted child was the selected one, clear selection
            if (selectedChild?._id === childId) {
                setSelectedChild(null);
                toast.info('Selected child profile has been deleted. Please select another child to continue.');
            }
        } catch (err: any) {
            console.error('Error deleting child:', err);
            toast.error(err.response?.data?.message || 'Failed to delete child profile.');
            trackEvent('CHILD_DELETE_FAILED', {
                childId: childId,
                childName: childName,
                error: err.response?.data?.message || err.message
            });
        }
    };

    // Function to handle child selection
    const handleSelectChild = (child: Child) => {
        setSelectedChild({ _id: child._id, name: child.name });
        toast.success(`'${child.name}' selected!`);
        trackEvent('CHILD_SELECTED', { childId: child._id, childName: child.name });
    };

    // Function to start the game for the selected child
    const handleStartGame = (childId: string, childName: string) => {
        trackEvent('START_GAME_CLICKED', { childId, childName });
        navigate('/game'); // Navigate to the game page
    };

    const getAge = (dobString: string | undefined): string => {
        if (!dobString) return 'N/A';
        const dob = new Date(dobString);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
            age--;
        }
        return `${age} years old`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <UserGroupIcon className="h-16 w-16 text-indigo-600 animate-pulse" />
                <p className="ml-4 text-xl text-gray-700">Loading Children Profiles...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
                <p className="text-red-600 text-center text-xl font-semibold mb-4">{error}</p>
                <button
                    onClick={fetchChildren}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition duration-300"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-2xl shadow-xl p-8 md:p-10 w-full max-w-5xl mx-auto"
            >
                <div className="flex items-center justify-between mb-8 border-b pb-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                        <ArrowLeftIcon className="h-5 w-5 mr-2" /> Back to Dashboard
                    </button>
                    <h1 className="text-4xl font-extrabold text-gray-900 text-center flex-grow">
                        <UserGroupIcon className="inline-block h-10 w-10 text-indigo-600 mr-3" />
                        My Children
                    </h1>
                    <button
                        onClick={() => {
                            setShowAddChildModal(true);
                            trackEvent('ADD_CHILD_MODAL_OPENED');
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300 flex items-center"
                    >
                        <PlusCircleIcon className="h-6 w-6 mr-2" /> Add Child
                    </button>
                </div>

                {children.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-10 text-gray-500"
                    >
                        <FaceSmileIcon className="h-24 w-24 mx-auto mb-4 text-gray-300" />
                        <p className="text-xl font-semibold mb-2">No child profiles found.</p>
                        <p className="text-md">Click "Add Child" to create your first child profile and start their learning journey!</p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {children.map((child) => (
                            <motion.div
                                key={child._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className={`bg-white border-2 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col p-6 text-center relative
                                    ${selectedChild?._id === child._id ? 'border-indigo-500 ring-4 ring-indigo-200' : 'border-gray-200'}`}
                            >
                                {selectedChild?._id === child._id && (
                                    <div className="absolute top-3 right-3 bg-indigo-500 text-white rounded-full p-1 shadow-md">
                                        <CheckCircleIcon className="h-5 w-5" />
                                    </div>
                                )}
                                {child.avatar ? (
                                    <img
                                        src={child.avatar}
                                        alt={child.name}
                                        className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-indigo-200"
                                    />
                                ) : (
                                    <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4 border-4 border-indigo-200">
                                        <FaceSmileIcon className="h-16 w-16 text-indigo-400" />
                                    </div>
                                )}
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">{child.name}</h2>
                                <p className="text-gray-600 text-sm mb-4">
                                    <CakeIcon className="inline-block h-4 w-4 mr-1" /> {getAge(child.dob)}
                                    {child.gradeLevel && ` | ${child.gradeLevel}`}
                                </p>

                                <div className="flex justify-center items-center text-gray-700 mb-4">
                                    <ChartBarIcon className="h-5 w-5 mr-2 text-green-500" />
                                    XP: <span className="font-semibold ml-1">{child.currentXp}</span> | Level: <span className="font-semibold ml-1">{child.level}</span>
                                </div>

                                {child.learningPreferences && child.learningPreferences.length > 0 && (
                                    <div className="mb-4">
                                        <p className="text-gray-700 text-sm font-semibold mb-1">Learning Styles:</p>
                                        <div className="flex flex-wrap justify-center gap-2">
                                            {child.learningPreferences.map((pref, i) => (
                                                <span key={i} className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full">{pref}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <p className="text-gray-500 text-xs mt-auto mb-4">
                                    Last active: {child.lastActiveAt ? new Date(child.lastActiveAt).toLocaleDateString() : 'Never'}
                                </p>

                                <div className="flex flex-col gap-3 mt-auto pt-4 border-t border-gray-100">
                                    {/* Select Child Button */}
                                    {selectedChild?._id !== child._id ? (
                                        <button
                                            onClick={() => handleSelectChild(child)}
                                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center"
                                        >
                                            <CheckCircleIcon className="h-5 w-5 mr-1" /> Select Child
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleStartGame(child._id, child.name)}
                                            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center"
                                        >
                                            <PlayCircleIcon className="h-5 w-5 mr-1" /> Start Learning!
                                        </button>
                                    )}

                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => {
                                                navigate(`/children/${child._id}/dashboard`);
                                                trackEvent('CHILD_DASHBOARD_VIEWED', { childId: child._id, childName: child.name });
                                            }}
                                            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center"
                                        >
                                            <ClipboardDocumentListIcon className="h-5 w-5 mr-1" /> Progress
                                        </button>
                                        <button
                                            onClick={() => {
                                                toast.info("Edit functionality coming soon!");
                                                trackEvent('CHILD_EDIT_CLICKED', { childId: child._id, childName: child.name });
                                            }}
                                            className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center"
                                        >
                                            <PencilSquareIcon className="h-5 w-5 mr-1" /> Edit
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteChild(child._id, child.name)}
                                        className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center"
                                    >
                                        <TrashIcon className="h-5 w-5 mr-1" /> Delete
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Add Child Modal */}
                {showAddChildModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">Add New Child</h2>
                                <button
                                    onClick={() => {
                                        setShowAddChildModal(false);
                                        trackEvent('ADD_CHILD_MODAL_CLOSED', { action: 'cancel' });
                                    }}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                            <form onSubmit={handleAddChild} className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Child's Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        value={newChildName}
                                        onChange={(e) => setNewChildName(e.target.value)}
                                        required
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="dob" className="block text-sm font-medium text-gray-700">Date of Birth</label>
                                    <input
                                        type="date"
                                        id="dob"
                                        value={newChildDob}
                                        onChange={(e) => setNewChildDob(e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="avatar" className="block text-sm font-medium text-gray-700">Avatar URL (Optional)</label>
                                    <input
                                        type="url"
                                        id="avatar"
                                        value={newChildAvatar}
                                        onChange={(e) => setNewChildAvatar(e.target.value)}
                                        placeholder="e.g., https://example.com/avatar.png"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="gradeLevel" className="block text-sm font-medium text-gray-700">Grade Level (Optional)</label>
                                    <input
                                        type="text"
                                        id="gradeLevel"
                                        value={newChildGradeLevel}
                                        onChange={(e) => setNewChildGradeLevel(e.target.value)}
                                        placeholder="e.g., 1st Grade, Primary"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Learning Preferences (Optional)</label>
                                    {['visual', 'auditory', 'reading/writing', 'kinesthetic'].map(pref => (
                                        <div key={pref} className="flex items-center mt-2">
                                            <input
                                                type="checkbox"
                                                id={`pref-${pref}`}
                                                value={pref}
                                                checked={newChildLearningPreferences.includes(pref)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setNewChildLearningPreferences([...newChildLearningPreferences, pref]);
                                                    } else {
                                                        setNewChildLearningPreferences(newChildLearningPreferences.filter(p => p !== pref));
                                                    }
                                                }}
                                                className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                            />
                                            <label htmlFor={`pref-${pref}`} className="ml-2 text-sm text-gray-700 capitalize">{pref.replace('/', ' / ')}</label>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-md shadow-md transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={submitting}
                                >
                                    {submitting ? 'Adding...' : 'Add Child'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default MyChildrenPage;
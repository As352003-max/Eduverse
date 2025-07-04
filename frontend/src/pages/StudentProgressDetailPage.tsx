// src/pages/StudentProgressDetailPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

interface ProgressItem {
    _id: string;
    moduleId: { title: string }; // Assuming module title is populated
    progress: number;
    score: number;
    completed: boolean;
    attempts: number;
    lastAttemptedAt: string;
}

interface StudentInfo {
    _id: string;
    username: string;
    email: string;
    grade: number;
    totalXp: number;
    currentLevel: number;
    badges: string[];
}

interface StudentAnalyticsData {
    studentInfo: StudentInfo;
    progress: ProgressItem[];
    completedModulesCount: number;
    strengthsAndWeaknesses: { [concept: string]: { totalScore: number; totalAttempts: number; completions: number; } };
}

const StudentProgressDetailPage: React.FC = () => {
    const { studentId } = useParams<{ studentId: string }>();
    const [studentData, setStudentData] = useState<StudentAnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStudentProgress = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await axiosClient.get<StudentAnalyticsData>(`/analytics/student/${studentId}`);
                setStudentData(res.data);
            } catch (err: any) {
                console.error(`Error fetching progress for student ${studentId}:`, err.response?.data || err.message);
                setError(`Failed to load student progress.`);
            } finally {
                setLoading(false);
            }
        };
        fetchStudentProgress();
    }, [studentId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500 text-center mt-8 text-lg">{error}</div>;
    }

    if (!studentData) {
        return <div className="text-red-500 text-center mt-8 text-lg">No data available for this student.</div>;
    }

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">
                {studentData.studentInfo.username}'s Learning Journey
            </h1>

            <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Overview</h2>
                <p className="text-lg text-gray-700 mb-2">Grade: <span className="font-semibold">{studentData.studentInfo.grade}</span></p>
                <p className="text-lg text-gray-700 mb-2">Total XP: <span className="font-semibold">{studentData.studentInfo.totalXp}</span></p>
                <p className="text-lg text-gray-700 mb-2">Current Level: <span className="font-semibold">{studentData.studentInfo.currentLevel}</span></p>
                <p className="text-lg text-gray-700 mb-4">Badges Earned: <span className="font-semibold">{studentData.studentInfo.badges.join(', ') || 'None'}</span></p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
                    Module Progress ({studentData.completedModulesCount} completed)
                </h2>
                {studentData.progress.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                        {studentData.progress.map((p) => (
                            <li key={p._id} className="py-3">
                                <p className="text-lg font-semibold text-blue-700">{p.moduleId?.title || 'Unknown Module'}</p>
                                <p className="text-gray-600 ml-4">Progress: {p.progress}%</p>
                                <p className="text-gray-600 ml-4">Score: {p.score}</p>
                                <p className="text-gray-600 ml-4">Completed: {p.completed ? 'Yes' : 'No'}</p>
                                <p className="text-gray-600 ml-4">Attempts: {p.attempts}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-gray-500 italic mt-4">No module progress recorded yet.</p>
                )}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Strengths & Weaknesses (Concepts)</h2>
                {Object.keys(studentData.strengthsAndWeaknesses).length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                        {Object.entries(studentData.strengthsAndWeaknesses).map(([concept, stats]) => (
                            <li key={concept} className="py-3 flex justify-between items-center text-gray-700">
                                <span className="font-semibold">{concept}:</span>
                                <div>
                                    <p>Avg Score: {stats.totalAttempts > 0 ? (stats.totalScore / stats.totalAttempts).toFixed(1) : 0}</p>
                                    <p>Completions: {stats.completions}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-gray-500 italic mt-4">No detailed concept data yet for this student.</p>
                )}
            </div>

            <div className="mt-8 text-center">
                <button
                    onClick={() => alert("This would trigger a backend recommendation based on weaknesses.")}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-md"
                >
                    Recommend Specific Modules
                </button>
            </div>
        </div>
    );
};

export default StudentProgressDetailPage;
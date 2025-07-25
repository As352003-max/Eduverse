import React, { useEffect, useState } from 'react';
import apiClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { Progress } from 'antd';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import {
  UserCircleIcon,
  StarIcon,
  AcademicCapIcon,
  EnvelopeIcon,
  IdentificationIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  TrophyIcon,
  ChartBarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import BadgeDisplay from '../components/BadgeDisplay';
import { calculateLevel } from '../utils/gamificationUtilsFrontend';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface VideoWatchData {
  timestamp: string; // Full ISO timestamp string e.g. '2025-07-20T12:53:41'
  secondsWatched: number;
}

interface UserProfile {
  _id: string;
  username: string;
  email: string;
  role: string;
  grade?: number;
  totalXp?: number;
  badges?: string[];
}

interface UserAnalytics {
  totalModulesAttempted: number;
  modulesCompleted: number;
  completionRate: number;
  totalAvailableModules: number;
  recentActivity: Array<{
    moduleId: string;
    score: number;
    completed: boolean;
    lastAttemptedAt: string;
  }>;
}

const motivationalQuotes = [
  'Every expert was once a beginner.',
  'Keep pushing your limits.',
  'Learning never exhausts the mind.',
  'Your journey matters more than perfection.',
];
const randomQuote =
  motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

const formatDate = (isoDate: string) => {
  const dateObj = new Date(isoDate);
  return dateObj.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
};

const UserProfilePage: React.FC = () => {
  const { user: authUser, loading: authLoading, firebaseUser } = useAuth();
  const userId = firebaseUser?.uid ?? null;

  // Profile and gamification data
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);

  // Video analytics data
  const [averageScore, setAverageScore] = useState<number | null>(null);
  const [videoWatchData, setVideoWatchData] = useState<VideoWatchData[]>([]);

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profile and learning analytics (modules, badges, etc)
  useEffect(() => {
    const fetchUserProfileAndAnalytics = async () => {
      setLoading(true);
      setError(null);

      if (authLoading) return;
      if (!authUser) {
        setError('You must be logged in to view your profile.');
        setLoading(false);
        return;
      }

      try {
        // Fetch profile
        const profileResponse = await apiClient.get<UserProfile>(
          `/users/${authUser._id}`
        );
        setProfile(profileResponse.data);

        // Fetch learning analytics only if student
        if (authUser.role === 'student') {
          const analyticsResponse = await apiClient.get<{
            analytics: UserAnalytics;
          }>(`/analytics/student/${authUser._id}`);
          setAnalytics(analyticsResponse.data.analytics);
        } else {
          setAnalytics(null);
        }
      } catch (err: any) {
        console.error('Error fetching user data:', err.response?.data || err.message);
        if (err.response?.status === 404 && authUser.role === 'student') {
          setError(
            'Student analytics data not found. Please ensure the student ID is correct and analytics exist for them.'
          );
        } else {
          setError('Failed to load profile data. ' + (err.response?.data?.message || ''));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfileAndAnalytics();
  }, [authUser, authLoading]);

  // Fetch quiz and video analytics data (average score, video watch)
  useEffect(() => {
    if (!userId) return;

    const fetchVideoAnalytics = async () => {
      try {
        const res = await apiClient.get(`/newanalytics/student/${userId}`);
        const { averageScore, videoWatchData } = res.data;

        // Sort video watch data by timestamp
        const sortedVideoWatchData = Array.isArray(videoWatchData)
          ? videoWatchData
              .slice()
              .sort(
                (a, b) =>
                  new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
              )
          : [];

        setVideoWatchData(sortedVideoWatchData);
        setAverageScore(typeof averageScore === 'number' ? averageScore : null);
      } catch (err) {
        console.error('Error fetching video analytics:', err);
        // Not blocking main UI on error
      }
    };

    fetchVideoAnalytics();
  }, [userId]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  };

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <ArrowPathIcon className="h-16 w-16 text-indigo-600 animate-spin" />
        <p className="ml-4 text-xl text-gray-700 font-semibold">Loading Profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
        <ExclamationCircleIcon className="h-20 w-20 text-red-600 mb-6" />
        <p className="text-red-700 text-center text-2xl font-semibold mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition duration-300"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-red-600 text-center mt-10 text-lg font-semibold">
        Profile data not available.
      </div>
    );
  }

  const userLevel =
    profile.totalXp !== undefined ? calculateLevel(profile.totalXp) : 1;

  return (
    <div className="min-h-screen bg-gray-50 py-14">
      <div className="container mx-auto px-6 max-w-6xl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-3xl shadow-lg p-10 md:p-12"
        >
          {/* USER PROFILE HEADER */}
          <div className="flex flex-col items-center mb-10">
            <UserCircleIcon className="h-28 w-28 text-indigo-600 mb-5" />
            <h1 className="text-5xl font-extrabold text-gray-900 mb-3 tracking-tight">
              {profile.username}
            </h1>
            <p className="text-lg text-gray-700 flex items-center space-x-2">
              <IdentificationIcon className="h-6 w-6 text-gray-500" />
              <span className="font-semibold capitalize">{profile.role}</span>
            </p>
            <p className="text-sm italic text-gray-500 mt-3">"{randomQuote}"</p>
          </div>

          {/* USER INFO GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 border-t pt-10 border-gray-200">
            <motion.div variants={itemVariants} className="flex items-center text-gray-700">
              <EnvelopeIcon className="h-6 w-6 mr-3 text-blue-500" />
              <span className="font-semibold">Email:</span> {profile.email}
            </motion.div>
            {profile.role === 'student' && profile.grade !== undefined && (
              <motion.div variants={itemVariants} className="flex items-center text-gray-700">
                <AcademicCapIcon className="h-6 w-6 mr-3 text-green-500" />
                <span className="font-semibold">Grade:</span> {profile.grade}
              </motion.div>
            )}
            {profile.totalXp !== undefined && (
              <motion.div variants={itemVariants} className="flex flex-col text-gray-700">
                <div className="flex items-center">
                  <StarIcon className="h-6 w-6 mr-3 text-yellow-500" />
                  <span className="font-semibold">Total XP:</span>{' '}
                  <CountUp end={profile.totalXp} duration={1.5} />
                </div>
                <div className="h-4 bg-gray-300 rounded-full overflow-hidden mt-3">
                  <div
                    className="bg-indigo-600 h-full transition-all duration-500"
                    style={{ width: `${(profile.totalXp % 1000) / 10}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  XP to next level: {1000 - (profile.totalXp % 1000)}
                </p>
              </motion.div>
            )}
            {profile.totalXp !== undefined && (
              <motion.div variants={itemVariants} className="flex items-center text-gray-700">
                <TrophyIcon className="h-6 w-6 mr-3 text-purple-500" />
                <span className="font-semibold">Current Level:</span> {userLevel}
              </motion.div>
            )}
          </div>

          {/* BADGES */}
          {profile.badges && profile.badges.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="mb-10 border-t pt-10 border-gray-200"
            >
              <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                <TrophyIcon className="h-8 w-8 mr-3 text-yellow-500" />
                Badges Earned
              </h2>
              <BadgeDisplay badges={profile.badges} />
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="mb-10 border-t pt-10 border-gray-200"
            >
              <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center justify-center">
                <TrophyIcon className="h-8 w-8 mr-3 text-yellow-500" />
                Badges Earned
              </h2>
              <div className="text-center text-gray-600 p-6 bg-gray-100 rounded-xl max-w-md mx-auto">
                <p>No badges earned yet. Keep playing to unlock them!</p>
              </div>
            </motion.div>
          )}

          {/* LEARNING PROGRESS STATS */}
          {analytics && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="mb-10 border-t pt-10 border-gray-200"
            >
              <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                <ChartBarIcon className="h-8 w-8 mr-3 text-blue-500" />
                Learning Progress
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-blue-50 bg-opacity-80 p-6 rounded-xl shadow-sm text-center">
                  <p className="text-sm text-blue-700 font-semibold uppercase tracking-wide mb-2">
                    Modules Attempted
                  </p>
                  <p className="text-4xl font-extrabold text-blue-900">
                    {analytics.totalModulesAttempted}
                  </p>
                </div>
                <div className="bg-green-50 bg-opacity-80 p-6 rounded-xl shadow-sm text-center">
                  <p className="text-sm text-green-700 font-semibold uppercase tracking-wide mb-2">
                    Modules Completed
                  </p>
                  <p className="text-4xl font-extrabold text-green-900">
                    {analytics.modulesCompleted}
                  </p>
                </div>
                <div className="bg-purple-50 bg-opacity-80 p-6 rounded-xl shadow-sm text-center">
                  <p className="text-sm text-purple-700 font-semibold uppercase tracking-wide mb-2">
                    Completion Rate
                  </p>
                  <p className="text-4xl font-extrabold text-purple-900">
                    {(analytics.completionRate?.toFixed(2) || 0) + '%'}
                  </p>
                </div>
                <div className="bg-yellow-50 bg-opacity-80 p-6 rounded-xl shadow-sm text-center">
                  <p className="text-sm text-yellow-700 font-semibold uppercase tracking-wide mb-2">
                    Total Available Modules
                  </p>
                  <p className="text-4xl font-extrabold text-yellow-900">
                    {analytics.totalAvailableModules}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* RECENT ACTIVITY */}
          {analytics && analytics.recentActivity && analytics.recentActivity.length > 0 && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="mb-10 border-t pt-10 border-gray-200"
            >
              <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                <ClockIcon className="h-8 w-8 mr-3 text-teal-500" />
                Recent Activity
              </h2>
              <ul className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {analytics.recentActivity.map((activity, index) => (
                  <li
                    key={index}
                    className="bg-gray-50 p-5 rounded-xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center text-gray-700"
                  >
                    <span className="font-medium text-lg sm:text-xl">
                      Module ID: {activity.moduleId}
                    </span>
                    <div className="flex flex-col sm:flex-row sm:space-x-6 mt-3 sm:mt-0 text-sm sm:text-base">
                      <span>Score: {activity.score ?? 'N/A'}</span>
                      <span className="font-semibold">
                        {activity.completed ? 'Completed' : 'Attempted'}
                      </span>
                      <span className="text-gray-500">
                        {new Date(activity.lastAttemptedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Average Score Dashboard */}
          {averageScore !== null && Number.isFinite(averageScore) && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="mb-12 border-t pt-10 border-gray-200 text-center"
            >
              <h3 className="text-3xl font-semibold text-gray-800 mb-8">
                Average Quiz Score
              </h3>
              <div className="flex justify-center">
                <div style={{ width: 240 }}>
                  <Progress
                    type="dashboard"
                    percent={Math.max(0, Math.min(100, averageScore))}
                    format={(p) => `${Math.round(p ?? 0)}% Avg`}
                    strokeColor={{
                      '0%': '#f43f5e',
                      '50%': '#f97316',
                      '100%': '#22c55e',
                    }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Video Watch Time Over Time */}
          {videoWatchData.length > 0 && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="bg-white shadow-md rounded-2xl border border-gray-200 p-8"
            >
              <h3 className="text-2xl font-semibold text-gray-800 mb-8 text-center">
                Video Watch Time Over Time
              </h3>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={videoWatchData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="timestamp"
                    interval="preserveStartEnd"
                    tickFormatter={(ts) => {
                      const dateObj = new Date(ts);
                      return dateObj.toLocaleTimeString(undefined, {
                        hour: '2-digit',
                        minute: '2-digit',
                      });
                    }}
                    minTickGap={20}
                    tick={{ fill: '#4b5563', fontWeight: 500 }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(v) => `${v}s`}
                    tick={{ fill: '#4b5563', fontWeight: 500 }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                    domain={['auto', 'auto']}
                  />
                  <Tooltip
                    labelFormatter={(label) => {
                      const dateObj = new Date(label);
                      return dateObj.toLocaleString();
                    }}
                    formatter={(value: any) => `${value}s`}
                  />
                  <Line
                    type="monotone"
                    dataKey="secondsWatched"
                    stroke="#f97316"
                    strokeWidth={3}
                    dot={{ r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* EDIT PROFILE BUTTON */}
          <div className="text-center mt-14 border-t pt-12 border-gray-200">
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-12 rounded-full shadow-xl transition duration-300 ease-in-out transform hover:scale-105">
              Edit Profile
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserProfilePage;

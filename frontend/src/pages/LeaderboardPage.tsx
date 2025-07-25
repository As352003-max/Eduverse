import React, { useEffect, useState } from 'react';
import apiClient from '../api/axiosClient';
import { motion } from 'framer-motion';
import {
  TrophyIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  UserCircleIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { LeaderboardEntry } from '../types';
import { get, ref } from 'firebase/database';
import { db } from '../firebase';

const LeaderboardPage: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'global' | 'shadow'>('global');

  useEffect(() => {
    const fetchGlobalLeaderboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get<LeaderboardEntry[]>('/games/leaderboard');
        setLeaderboard(response.data);
      } catch (err: any) {
        console.error('Error fetching global leaderboard:', err.message);
        setError('Failed to load leaderboard.');
      } finally {
        setLoading(false);
      }
    };

const fetchShadowLeaderboard = async () => {
  setLoading(true);
  setError(null);
  try {
    const snapshot = await get(ref(db, 'users'));
    const usersData = snapshot.val();

    const entries: LeaderboardEntry[] = [];
for (const uid in usersData) {
  const user = usersData[uid];
  const totalXp = user?.totalXp || 0;
const unlockedLevelsObj = user?.unlockedLevels || {};

const unlockedLevels = Object.values(unlockedLevelsObj)
  .map((v) => Number(v))
  .filter((n) => !isNaN(n));

const lastUnlockedLevel = unlockedLevels.length > 0
  ? Math.max(...unlockedLevels) + 1 // ➕ Add 1 here
  : 0;
    console.log("Unlocked levels for", uid, ":", user?.shadowMatch?.unlockedLevels);

  const progressLevel1 = user?.progress?.level_1 || {};
  const email = progressLevel1?.email || "Unknown";
  const correct = progressLevel1?.correct || 0;
  const wrong = progressLevel1?.wrong || 0;

  entries.push({
    _id: uid,
    username: email,
    totalXp,
    currentLevel: lastUnlockedLevel,
 
  
  });
}


    entries.sort((a, b) => b.totalXp - a.totalXp);
    setLeaderboard(entries);
  } catch (err: any) {
    console.error('Error fetching shadow leaderboard:', err.message);
    setError('Failed to load shadow game leaderboard.');
  } finally {
    setLoading(false);
  }
};



    view === 'global' ? fetchGlobalLeaderboard() : fetchShadowLeaderboard();
  }, [view]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
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
        <p className="ml-4 text-xl text-gray-700">Loading Leaderboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <ExclamationCircleIcon className="h-20 w-20 text-red-500 mb-4" />
        <p className="text-red-600 text-center text-2xl font-semibold mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-center mb-8 space-x-4">
          <button
            onClick={() => setView('global')}
            className={`px-6 py-2 rounded-full font-semibold transition ${
              view === 'global' ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600 border'
            }`}
          >
            Global Leaderboard
          </button>
          <button
            onClick={() => setView('shadow')}
            className={`px-6 py-2 rounded-full font-semibold transition ${
              view === 'shadow' ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600 border'
            }`}
          >
            Shadow Match Leaderboard
          </button>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-extrabold text-center mb-10"
        >
          <TrophyIcon className="h-10 w-10 inline-block text-yellow-500 mr-2" />
          {view === 'global' ? 'Global Leaderboard' : 'Shadow Match Leaderboard'}
        </motion.h1>

        {leaderboard.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-10 text-center">
            <UserCircleIcon className="h-24 w-24 text-gray-400 mb-6" />
            <p className="text-xl font-semibold text-gray-700 mb-4">No players ranked yet.</p>
            <p className="text-gray-600">Play to earn XP and rise in the leaderboard!</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {leaderboard.map((entry, index) => (
                <motion.div
                  key={entry._id}
                  variants={itemVariants}
                  className="bg-gradient-to-br from-indigo-50 to-blue-100 rounded-xl p-6 shadow-md flex items-center space-x-4"
                >
                  <div className="text-3xl font-bold text-indigo-700 w-10 text-center">
                    #{index + 1}
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                      {entry.username}
                      {index === 0 && <TrophyIcon className="h-5 w-5 ml-2 text-yellow-500" />}
                    </h3>
                    <p className="text-sm text-gray-600 flex items-center">
                      <StarIcon className="h-4 w-4 mr-1 text-yellow-600" />
                      XP: <span className="font-bold ml-1">{entry.totalXp}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Level: <span className="font-bold">{entry.currentLevel}</span>
                    </p>
                    {entry.badges?.length > 0 && (
                      <div className="flex flex-wrap mt-2">
                        {entry.badges.map((b) => (
                          <span
                            key={b}
                            className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-2 mb-1"
                          >
                            {b}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;

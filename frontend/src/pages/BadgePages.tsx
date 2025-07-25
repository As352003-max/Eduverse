// BadgePages.tsx
import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { auth } from "../config/firebase";
import axios from "axios";

import {
  AcademicCapIcon,
  SparklesIcon,
  BeakerIcon,
  GlobeAltIcon,
  StarIcon,
  UserGroupIcon,
  PuzzlePieceIcon,
  TrophyIcon,
  ChatBubbleBottomCenterTextIcon,
  LightBulbIcon,
} from "@heroicons/react/24/outline";

interface Badge {
  id: string;
  code: string;
  title: string;
  milestone: string;
}

const fallbackBadges: Badge[] = [
  { id: "1", code: "SA", title: "Curiosity Explorer", milestone: "Completed Level 1 Mission" },
  { id: "2", code: "SSM", title: "Global Thinker", milestone: "Visited 3 Learning Modules" },
  { id: "3", code: "SASM", title: "Logic Master", milestone: "Solved 10+ Puzzles" },
  { id: "4", code: "SP", title: "Math Genius", milestone: "Completed Math Maze Level 3" },
  { id: "5", code: "RTE", title: "Team Player", milestone: "Worked with a team on a project" },
  { id: "6", code: "SDP", title: "Innovation Champ", milestone: "Created a project idea" },
  { id: "7", code: "APM", title: "Word Wizard", milestone: "Won 5 games in Vocab Vanguard" },
  { id: "8", code: "LPM", title: "Puzzle Pro", milestone: "Completed all logic levels" },
  { id: "9", code: "POPM", title: "Leadership Badge", milestone: "Led a group project" },
  { id: "10", code: "SGP", title: "Quiz Hero", milestone: "Scored 90%+ in any quiz" },
];

const badgeIcons: Record<string, JSX.Element> = {
  SA: <AcademicCapIcon className="w-10 h-10 text-indigo-600" />,
  SSM: <GlobeAltIcon className="w-10 h-10 text-green-500" />,
  SASM: <BeakerIcon className="w-10 h-10 text-blue-500" />,
  SP: <StarIcon className="w-10 h-10 text-yellow-500" />,
  RTE: <UserGroupIcon className="w-10 h-10 text-pink-600" />,
  SDP: <LightBulbIcon className="w-10 h-10 text-orange-500" />,
  APM: <ChatBubbleBottomCenterTextIcon className="w-10 h-10 text-purple-500" />,
  LPM: <PuzzlePieceIcon className="w-10 h-10 text-fuchsia-500" />,
  POPM: <TrophyIcon className="w-10 h-10 text-amber-600" />,
  SGP: <SparklesIcon className="w-10 h-10 text-cyan-500" />,
  BANDAGE: <SparklesIcon className="w-10 h-10 text-rose-500" />,
  QUIZ: <StarIcon className="w-10 h-10 text-indigo-500" />,
};

const BadgePages: React.FC = () => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (!user) {
      setError("User not logged in.");
      setLoading(false);
      return;
    }

    const userId = user.uid;
    const baseUrl = import.meta.env.VITE_FIREBASE_DATABASE_URL;
    const userUrl = `${baseUrl}/users/${userId}.json`;

    try {
      const db = getFirestore();

      // ✅ 1. Realtime DB - Bandages
      const userSnap = await axios.get(userUrl);
      const userData = userSnap.data;
      const bandagesRTDB = typeof userData?.bandages === "number" ? userData.bandages : 0;

      // ✅ 2. Firestore Progress - Bandages + Quiz Scores
      const docRef = doc(db, "progress", userId);
      const docSnap = await getDoc(docRef);
      let bandagesFS = 0;
      let quizScores: number[] = [];

      if (docSnap.exists()) {
        const progressData = docSnap.data();
        bandagesFS = progressData?.bandages ?? 0;

        // Assuming quiz scores are stored like:
        // quizScores: [{ score: 80 }, { score: 90 }]
        const quizzes = progressData?.quizScores ?? [];
        if (Array.isArray(quizzes)) {
          quizScores = quizzes.map((q: any) => q.score).filter((s) => typeof s === "number");
        }
      }


     
      const bandageBadge: Badge = {
        id: "b0",
        code: "BANDAGE",
        title: "Shadow Match Game",
        milestone: `${bandagesRTDB} Bandages Earned`,
      };

      
    
      const quizBadge: Badge = {
        id: "quiz1",
        code: "QUIZ",
        title: "Interactive Content Quiz",
        milestone: `${bandagesFS} Bandages Earned`,
      };

    
      const apiRes = await axios.get(`/api/users/${userId}/badges`);
      const dynamicBadges: Badge[] = apiRes.data.badges || fallbackBadges;

      // ✅ 6. Final Badge List
      setBadges([bandageBadge, quizBadge, ...dynamicBadges]);
    } catch (err) {
      console.error("❌ Error fetching badge data:", err);

      // 🔻 Show fallback if error
      const fallbackBandageBadge: Badge = {
        id: "b0",
        code: "BANDAGE",
        title: "Shadow Match Game",
        milestone: `0 Bandages Earned`,
      };
      const fallbackQuizBadge: Badge = {
        id: "quiz1",
        code: "QUIZ",
        title: "Quiz Master",
        milestone: `No quizzes yet`,
      };

      setBadges([fallbackBandageBadge, fallbackQuizBadge, ...fallbackBadges]);
      setError("Could not load badge data.");
    } finally {
      setLoading(false);
    }
  });

  return () => unsubscribe();
}, []);


  if (loading) return <div className="text-center py-10">⏳ Loading your badge profile...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-center text-indigo-700 mb-8">🎖 Your Badges</h1>
      {error && <p className="text-center text-red-500 mb-4">{error}</p>}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className="bg-white rounded-xl shadow p-4 flex flex-col items-center text-center border hover:shadow-lg transition"
          >
            {badgeIcons[badge.code] || <AcademicCapIcon className="w-10 h-10 text-gray-400" />}
            <div className="mt-2 font-semibold text-gray-800">{badge.title}</div>
            <div className="text-sm text-gray-500 mt-1">🏆 {badge.milestone}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BadgePages;

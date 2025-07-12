import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
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
} from '@heroicons/react/24/outline';

interface Badge {
  id: string;
  code: string; // Like SA, SSM, etc.
  title: string;
  milestone: string;
}

const fallbackBadges: Badge[] = [
  {
    id: '1',
    code: 'SA',
    title: 'Curiosity Explorer',
    milestone: 'Completed Level 1 Mission',
  },
  {
    id: '2',
    code: 'SSM',
    title: 'Global Thinker',
    milestone: 'Visited 3 Learning Modules',
  },
  {
    id: '3',
    code: 'SASM',
    title: 'Logic Master',
    milestone: 'Solved 10+ Puzzles',
  },
  {
    id: '4',
    code: 'SP',
    title: 'Math Genius',
    milestone: 'Completed Math Maze Level 3',
  },
  {
    id: '5',
    code: 'RTE',
    title: 'Team Player',
    milestone: 'Worked with a team on a project',
  },
  {
    id: '6',
    code: 'SDP',
    title: 'Innovation Champ',
    milestone: 'Created a project idea',
  },
  {
    id: '7',
    code: 'APM',
    title: 'Word Wizard',
    milestone: 'Won 5 games in Vocab Vanguard',
  },
  {
    id: '8',
    code: 'LPM',
    title: 'Puzzle Pro',
    milestone: 'Completed all logic levels',
  },
  {
    id: '9',
    code: 'POPM',
    title: 'Leadership Badge',
    milestone: 'Led a group project',
  },
  {
    id: '10',
    code: 'SGP',
    title: 'Quiz Hero',
    milestone: 'Scored 90%+ in any quiz',
  },
];

// Associate logos/icons for each badge code
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
};

const BadgePages: React.FC = () => {
  const { user } = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  // Defaulting to true if classLevel not present
  const isLogoBadgeStudent = !user?.classLevel || Number(user.classLevel) < 10;

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const userId = user?.id || user?._id;
        if (!userId) throw new Error('User not found');
        const res = await axios.get(`/api/users/${userId}/badges`);
        setBadges(res.data.badges || fallbackBadges);
      } catch (err) {
        setBadges(fallbackBadges);
      } finally {
        setLoading(false);
      }
    };
    fetchBadges();
  }, [user]);

  if (loading) return <div className="text-center py-10">Loading badges...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-center text-indigo-700 mb-10">🎖 Your Badges</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className="bg-white rounded-xl shadow p-4 flex flex-col items-center text-center border hover:shadow-lg transition"
          >
            {isLogoBadgeStudent ? (
              badgeIcons[badge.code] || <AcademicCapIcon className="w-10 h-10 text-gray-400" />
            ) : (
              <div className="text-sm text-red-500">No logo available</div>
            )}
            <div className="mt-2 font-semibold text-gray-800">{badge.title}</div>
            <div className="text-sm text-gray-500 mt-1">🏆 {badge.milestone}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BadgePages;

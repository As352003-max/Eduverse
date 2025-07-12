// src/components/BadgeDisplay.tsx

import React from 'react';

const badgeDescriptions: Record<string, string> = {
  first_game_played: 'First Game Played',
  math_maze_rookie: 'Math Maze Rookie',
  level_5_achiever: 'Level 5 Achiever',
  project_submission_1: 'First Project Submitted',
  vocab_champion: 'Vocabulary Champion',
  logic_master: 'Logic Puzzle Master',
};

const BadgeDisplay: React.FC<{ badges: string[] }> = ({ badges }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
      {badges.map((badgeKey) => (
        <div
          key={badgeKey}
          className="bg-white p-4 shadow-md rounded-lg text-center border border-indigo-100 hover:shadow-lg transition"
        >
          <img
            src={`/badges/${badgeKey}.png`}
            alt={badgeDescriptions[badgeKey] || badgeKey}
            className="mx-auto h-16 w-16 object-contain mb-3"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/badges/default.png'; // fallback if image missing
            }}
          />
          <p className="text-sm font-medium text-gray-700">{badgeDescriptions[badgeKey] || badgeKey}</p>
        </div>
      ))}
    </div>
  );
};

export default BadgeDisplay;

const XP_TIERS = {
    1: 0,
    2: 500,
    3: 1500,
    4: 3000,
    5: 5000,
};

const BADGE_DEFINITIONS = {
    'first_game_played': { name: 'First Game Played', description: 'Completed your very first game!' },
    'math_maze_rookie': { name: 'Math Maze Rookie', description: 'Completed a Math Maze.' },
    'vocab_vanguard_rookie': { name: 'Vocab Vanguard Rookie', description: 'Completed a Vocab Vanguard game.' },
    'logic_circuit_rookie': { name: 'Logic Circuit Rookie', description: 'Completed a Logic Circuit challenge.' },
    'level_5_achiever': { name: 'Level 5 Achiever', description: 'Reached Level 5.' },
    'level_10_achiever': { name: 'Level 10 Achiever', description: 'Reached Level 10.' },
};

const calculateLevel = (totalXp) => {
    if (totalXp < 0) return 1;
    let level = 1;
    for (const tier in XP_TIERS) {
        if (totalXp >= XP_TIERS[tier]) {
            level = parseInt(tier);
        } else {
            break;
        }
    }
    return level;
};

function calculateXp(gameData) {
    const base_xp = 100;
    const time_bonus_multiplier = 0.5;
    const incorrect_penalty_xp = 10;

    let xp = base_xp;

    if (gameData.type === 'mathmaze') {
        const timeTaken = gameData.timeTaken || 0;
        const problemsSolved = gameData.problemsSolved || 0;
        const incorrectAttempts = gameData.incorrectAttempts || 0;

        xp += (problemsSolved * 5);
        xp -= (incorrectAttempts * incorrect_penalty_xp);

        const maxTime = 600;
        if (timeTaken < maxTime) {
            xp += (maxTime - timeTaken) * time_bonus_multiplier;
        }

        xp = Math.max(0, Math.round(xp));
    } else if (gameData.type === 'vocabvanguard') {
        if (gameData.won) {
            xp += 50;
            xp += (gameData.wordLength * 2);

            const timeTaken = gameData.timeTaken || 0;
            const maxTimeVocab = 120;
            if (timeTaken < maxTimeVocab) {
                xp += (maxTimeVocab - timeTaken) * 1;
            }
            
            xp -= (gameData.guessesMade * 5);
        } else {
            xp = Math.max(0, base_xp / 2 - (gameData.guessesMade * 2));
        }
        xp = Math.max(0, Math.round(xp));
    } else if (gameData.type === 'logiccircuit') {
        if (gameData.passed) {
            xp += 100;
            xp += (gameData.complexity * 10);

            const timeTaken = gameData.timeTaken || 0;
            const maxTimeCircuit = 300;
            if (timeTaken < maxTimeCircuit) {
                xp += (maxTimeCircuit - timeTaken) * 2;
            }
            xp -= (gameData.attempts * 5);
        } else {
            xp = Math.max(0, base_xp / 2 - (gameData.attempts * 3));
        }
        xp = Math.max(0, Math.round(xp));
    }
    else {
        xp = gameData.points || 0;
    }

    return xp;
}

const checkAndAwardBadges = (user, gameData) => {
    const awardedBadges = [];
    const currentLevel = calculateLevel(user.xp);

    if (!user.badges.includes('first_game_played')) {
        awardedBadges.push('first_game_played');
    }

    if (gameData.type === 'mathmaze' && gameData.completed && !user.badges.includes('math_maze_rookie')) {
        awardedBadges.push('math_maze_rookie');
    }

    if (gameData.type === 'vocabvanguard' && gameData.completed && gameData.won && !user.badges.includes('vocab_vanguard_rookie')) {
        awardedBadges.push('vocab_vanguard_rookie');
    }

    if (gameData.type === 'logiccircuit' && gameData.completed && gameData.passed && !user.badges.includes('logic_circuit_rookie')) {
        awardedBadges.push('logic_circuit_rookie');
    }

    if (currentLevel >= 5 && !user.badges.includes('level_5_achiever')) {
        awardedBadges.push('level_5_achiever');
    }
    if (currentLevel >= 10 && !user.badges.includes('level_10_achiever')) {
        awardedBadges.push('level_10_achiever');
    }

    awardedBadges.forEach(badgeId => {
        if (!user.badges.includes(badgeId)) {
            user.badges.push(badgeId);
        }
    });

    return awardedBadges;
};

module.exports = {
    XP_TIERS,
    BADGE_DEFINITIONS,
    calculateLevel,
    calculateXp,
    checkAndAwardBadges
};

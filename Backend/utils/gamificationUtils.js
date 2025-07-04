// utils/gamificationUtils.js

const XP_TIERS = {
    1: 0,
    2: 500,
    3: 1500,
    4: 3000,
    5: 5000,
    // ... define more XP thresholds for levels
};

const calculateLevel = (totalXp) => {
    // Simple linear leveling: 100 XP per level
    // You can make this more complex (e.g., exponential)
    if (totalXp < 0) return 1;
    return Math.floor(totalXp / 100) + 1;
};

// You can add more gamification utilities here, e.g., for badge logic, trophy logic.
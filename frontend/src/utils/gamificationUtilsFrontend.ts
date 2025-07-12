export const XP_TIERS = {
    1: 0,
    2: 500,
    3: 1500,
    4: 3000,
    5: 5000,
};

export const calculateLevel = (totalXp: number): number => {
    if (totalXp < 0) return 1;
    let level = 1;
    for (const tier in XP_TIERS) {
        if (totalXp >= XP_TIERS[tier as unknown as keyof typeof XP_TIERS]) {
            level = parseInt(tier);
        } else {
            break;
        }
    }
    return level;
};

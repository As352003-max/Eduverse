// frontend/src/types/index.ts (or wherever you manage your interfaces)

export interface ModuleContentPiece {
    type: 'text' | 'quiz' | 'puzzle' | 'simulation' | 'drag-and-drop';
    data: any; // Flexible for different content types
}

export interface Module {
    _id: string;
    title: string;
    description: string;
    content: ModuleContentPiece[];
    gradeLevel: { min: number; max: number }; // Added based on ModulesPage
    difficulty: 'beginner' | 'intermediate' | 'advanced'; // Added based on ModulesPage
    xpAward: number; // Added based on backend logic
}

export interface GameProgress {
    _id: string;
    userId: string;
    moduleId: string;
    progress: number;
    score: number;
    completed: boolean;
    attempts: number;
    hintsUsed: number;
    customData: any;
    lastAttemptedAt: string;
}

export interface User {
    _id: string;
    username: string;
    email: string;
    role: 'student' | 'teacher' | 'parent' | 'admin';
    grade?: number;
    parent_id?: string;
    totalXp?: number;
    badges?: string[];
    currentLevel?: number;
}

export interface LeaderboardEntry {
    _id: string;
    username: string;
    totalXp: number;
    currentLevel: number;
    badges: string[];
}

export interface ChatMessage {
    role: 'user' | 'model';
    parts: { text: string }[];
    timestamp: string;
}

export interface ChatSession {
    _id: string;
    userId: string;
    history: ChatMessage[];
    lastActive: string;
}

// Project Interface (from previous turn, ensure it's here)
export interface Project {
    _id: string;
    title: string;
    description: string;
    owner: { _id: string; username: string; };
    status: 'pending' | 'in-progress' | 'completed' | 'reviewed' | 'planning' | 'on-hold';
    dueDate?: string;
    startDate?: string;
    endDate?: string;
    technologies?: string[];
    githubLink?: string;
    liveLink?: string;
    members?: { _id: string; username: string; role: string; }[];
    createdAt: string;
    updatedAt: string;
}
export interface ModuleContentPiece {
    type: 'text' | 'quiz' | 'puzzle' | 'simulation' | 'drag-and-drop' | 'video';
    data: any;
}

export interface Module {
    _id: string;
    title: string;
    description: string;
    content: ModuleContentPiece[];
    gradeLevel: { min: number; max: number };
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    xpAward: number;
    category: string;
    thumbnailUrl?: string;
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
    customData: {
        gameType: string;
        contentIndex: number;
        [key: string]: any;
    };
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
    name?: string;
}

export interface ChildProfile {
    _id: string;
    parentId: string;
    name: string;
    avatar?: string;
    grade?: number;
    totalXp: number;
    currentLevel: number;
    badges: string[];
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

export interface QuizData {
    question: string;
    options: string[];
    correctAnswer: string;
    explanation?: string;
}

export interface TextData {
    text: string;
    estimatedReadingTime?: number;
}

export interface VideoData {
    url: string;
    duration?: number;
    thumbnailUrl?: string;
}

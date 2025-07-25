export interface Module {
  _id: string;
  title: string;
  description: string;
  gradeLevel: { min: number; max: number };
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  topics: Topic[];
    quizProjectId?: string; 
}

export interface Topic {
  title: string;
  level: string; // e.g., beginner, intermediate
  content: ModuleContent[];
}
// types.ts or inside AuthContext
export interface UserType {
    _id?: string; // or number, depending on your backend
  email?: string;
  name?: string;
  // any other fields
}

export interface AuthContextType {
  user: UserType | null;
}

export interface ModuleContent {
  type: 'text' | 'video' | 'quiz';
  data: {
    content?: string;       // for text
    url?: string;           // for video
    title?: string;         // optional, for video or section
    question?: string;      // for quiz
    options?: string[];     // for quiz
    correctAnswer?: string; // for quiz
  };
  topicTitle?: string; // optional: added during flattening
}

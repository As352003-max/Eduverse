// src/types/Project.ts

export interface Project {
  _id: string;
  name: string;
  description: string;
  technologies: string[];
  owner: {
    _id: string;
    username: string;
    email: string;
  };
  members?: { _id: string; username: string; role: string }[];
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold';
  startDate: string; // ISO Date string
  endDate?: string; // ISO Date string
  githubLink?: string;
  liveLink?: string;
  // Add any other fields your project object might have
  createdAt: string;
  updatedAt: string;
}
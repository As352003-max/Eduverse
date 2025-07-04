// src/types/User.ts

export interface User {
  _id: string;
  username: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
  createdAt: string; // ISO Date string
  updatedAt: string; // ISO Date string
  // Add any other user-specific fields like:
  firstName?: string;
  lastName?: string;
  bio?: string;
  profilePicture?: string; // URL to an image
  skills?: string[];
  education?: { degree: string; institution: string; year: number }[];
  contact?: { linkedin?: string; github?: string; website?: string };
}
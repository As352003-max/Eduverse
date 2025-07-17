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
  startDate: string; 
  endDate?: string; 
  githubLink?: string;
  liveLink?: string;
  createdAt: string;
  updatedAt: string;
}
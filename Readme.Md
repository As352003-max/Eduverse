# Eduverse: Your Personalized AI-Powered Learning Platform

## 1. Project Overview

Eduverse is an innovative educational platform designed to transform the learning experience through personalized AI-powered content, engaging gamified progress, and collaborative project opportunities. It provides a dynamic and adaptive environment where users can learn at their own pace, earn rewards, and collaborate with peers on creative projects.

---

## 2. Key Features

- **Personalized AI-Powered Learning:**  
    Leverages AI (Google Gemini API) to adapt content and recommendations to individual learning styles and paces.

- **Gamified Progress & Rewards:**  
    Users earn XP, level up, unlock badges, and climb a global leaderboard.

- **Interactive Modules:**  
    Includes text-based lessons, quizzes, puzzles, simulations, and drag-and-drop activities.

- **Collaborative Projects:**  
    Users can create, manage, and collaborate on educational projects.

- **Real-time Notifications:**  
    Instant feedback on achievements, level-ups, and other events via Socket.IO.

- **User Authentication & Authorization:**  
    Secure login and registration with Firebase Authentication and JWT, supporting roles (student, teacher, parent, admin).

- **Comprehensive Progress Tracking:**  
    Monitors user progress, scores, completion status, and attempts.

- **AI Chatbot:**  
    Intelligent chatbot for interactive support and learning assistance.

---

## 3. Technologies & APIs Used

### **Frontend**
- **React.js:** UI library
- **Vite:** Fast build tool
- **TypeScript:** Typed JavaScript
- **Tailwind CSS:** Utility-first CSS framework
- **Framer Motion:** Animations
- **React Router DOM:** Routing
- **Axios:** HTTP client (for API calls)
- **React Toastify:** Toast notifications
- **Heroicons:** SVG icons

### **Backend**
- **Node.js:** JavaScript runtime
- **Express.js:** Web framework
- **MongoDB:** NoSQL database
- **Mongoose:** ODM for MongoDB
- **Firebase Admin SDK:** Backend Firebase integration
- **JSON Web Token (JWT):** Authentication
- **Dotenv:** Environment variables
- **CORS:** Cross-origin resource sharing

### **Real-time Communication**
- **Socket.IO:** Real-time, bidirectional event-based communication

### **Authentication**
- **Firebase Authentication:** User authentication

### **AI Integration**
- **Google Gemini API:**  
    Used via `fetch` calls for AI chatbot and content generation

### **Database**
- **MongoDB Atlas:** Cloud database

---

## 4. Project Structure (High-Level)

```
Eduverse/
├── backend/
│   ├── config/             # Firebase Admin SDK setup, etc.
│   ├── middleware/         # Authentication middleware
│   ├── models/             # Mongoose schemas (User, Module, GameProgress, etc.)
│   ├── routes/             # API route definitions
│   ├── utils/              # Utility functions (gamificationUtils, seedDB)
│   ├── .env                # Backend environment variables
│   ├── server.js           # Main Express server, DB connection, Socket.IO setup
│   └── package.json
└── frontend/
        ├── public/
        ├── src/
        │   ├── api/            # Axios client configuration
        │   ├── assets/
        │   ├── components/     # Reusable React components
        │   ├── context/        # React Contexts (AuthContext, SocketContext)
        │   ├── hooks/
        │   ├── pages/          # Main application pages
        │   ├── types/          # TypeScript type definitions
        │   ├── App.tsx         # Main app component
        │   ├── main.tsx        # Entry point
        │   ├── index.css       # Tailwind CSS and global styles
        │   └── ...
        ├── .env                # Frontend environment variables
        └── package.json
```

---

## 5. Setup Instructions

### **Prerequisites**
- Node.js (v18+)
- npm or Yarn
- MongoDB Atlas account (or local MongoDB)
- Firebase Project (for Authentication)

### **5.1. Backend Setup**
1. Clone the repository:
        ```bash
        git clone <your-repo-link>
        cd Eduverse
        ```
2. Navigate to backend:
        ```bash
        cd backend
        ```
3. Install dependencies:
        ```bash
        npm install
        # or
        yarn install
        ```
4. Create a `.env` file in `backend/` with:
        ```
        MONGO_URI=your_mongodb_connection_string
        JWT_SECRET=a_very_secret_jwt_key
        FRONTEND_URL=http://localhost:5173
        PORT=5000
        FIREBASE_TYPE=service_account
        FIREBASE_PROJECT_ID=your_firebase_project_id
        FIREBASE_PRIVATE_KEY_ID=your_firebase_private_key_id
        FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_firebase_private_key\n-----END PRIVATE KEY-----\n"
        FIREBASE_CLIENT_EMAIL=your_firebase_client_email
        FIREBASE_CLIENT_ID=your_firebase_client_id
        FIREBASE_AUTH_URI=your_firebase_auth_uri
        FIREBASE_TOKEN_URI=your_firebase_token_uri
        FIREBASE_AUTH_PROVIDER_X509_CERT_URL=your_firebase_auth_provider_x509_cert_url
        FIREBASE_CLIENT_X509_CERT_URL=your_firebase_client_x509_cert_url
        FIREBASE_UNIVERSE_DOMAIN=your_firebase_universe_domain
        ```
5. (Optional) Seed the database:
        ```bash
        node utils/seedDB.js
        ```
        > **Important:** After running, comment out the `seedDatabase()` call in `backend/server.js`.

### **5.2. Frontend Setup**
1. Navigate to frontend:
        ```bash
        cd frontend
        ```
2. Install dependencies:
        ```bash
        npm install
        # or
        yarn install
        ```
3. Create a `.env` file in `frontend/` with:
        ```
        VITE_API_URL=http://localhost:5000
        ```

---

## 6. Running the Application

- **Start Backend:**
        ```bash
        cd backend
        npm start
        # or
        nodemon server.js
        ```
- **Start Frontend:**
        ```bash
        cd frontend
        npm run dev
        # or
        yarn dev
        ```
- The app will be available at [http://localhost:5173](http://localhost:5173).

---

## 7. API Endpoints

### **Authentication**
- `POST /api/auth/register` — Register user
- `POST /api/auth/login` — Login user
- `GET /api/auth/me` — Get current user

### **Modules**
- `GET /api/modules` — List modules
- `POST /api/modules` — Create module (admin/teacher)
- `GET /api/modules/:id` — Get module details

### **Game Progress**
- `GET /api/game/progress` — Get user progress
- `POST /api/game/progress` — Update progress

### **Projects**
- `GET /api/projects` — List projects
- `POST /api/projects` — Create project
- `PUT /api/projects/:id` — Update project

### **Leaderboard**
- `GET /api/leaderboard` — Get leaderboard data

### **AI Chatbot**
- `POST /api/ai/chat` — Interact with AI chatbot (uses Google Gemini API)

> **Note:** All endpoints are protected with JWT and role-based authorization where required.

---

## 8. Team Members

- **Vishwajeet Yadav:** Team Leader
- **Gulshan Kumar:** Full Stack Developer
- **Vaibhav Kumar:** Full Stack Developer
- **Amitanshu:** Full Stack Developer
- **Kashish Singhal:** AI & ML Specialist
- **Rutvik Chaudhari:** AI & ML Specialist

---

## 9. Future Enhancements

- Advanced AI features (personalization, dynamic content, AI-driven assessments)
- More interactive game types
- Teacher/Parent dashboards
- Enhanced mobile responsiveness
- Community features (forums, messaging, group study)
- Content creation tools for teachers/admins
- Payment gateway integration for premium features

---

## 10. License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

---

## 11. Recent Updates

- **Enhanced AI Chatbot:** Improved context retention and response accuracy using the latest Gemini API updates.
- **Project Collaboration:** Added real-time project editing and commenting with Socket.IO.
- **Progress Analytics:** New dashboard for users to visualize learning stats and achievements.
- **Role Management:** Admins can now assign and update user roles from the dashboard.
- **UI Improvements:** Refined navigation, added dark mode, and improved accessibility.
- **Bug Fixes:** Addressed issues with authentication edge cases and module progress tracking.

--- 
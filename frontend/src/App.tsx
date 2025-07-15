// App.tsx
import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import NotificationToasts from './components/NotificationToasts';

import AuthLoadingPage from './pages/AuthLoadingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import HomePage from './pages/HomePage';
import ModulesPage from './pages/ModulesPage';
import ModuleDetailPage from './pages/ModuleDetailPage';
import GamePage from './pages/GamePage';
import AIChatPage from './pages/AIChatPage';
import ProjectsPage from './pages/ProjectsPage';
import CreateEditProjectPage from './pages/CreateEditProjectPage';
import ProjectDetailPage from './pages/ProjectDetailsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import UserProfilePage from './pages/UserProfilePage';
import StudentProgressDetailPage from './pages/StudentProgressDetailPage';
import TeacherDashboardPage from './pages/TeacherDashboardPage';
import MyChildrenPage from './pages/MyChildrenPage';
import GamesHubPage from './pages/GamesHubPage';
import MathMazePage from './pages/MathMazePage';
import VocabVanguardPage from './pages/VocabVanguardPage';
import LogicCircuitPage from './pages/LogicCircuitPage';
import QuizPage from "./pages/QuizPage";
import BadgePages from './pages/BadgePages';

const PrivateRoute: React.FC<{ children: JSX.Element; allowedRoles?: string[] }> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <AuthLoadingPage />;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppContent: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        if (['/', '/login', '/register'].includes(window.location.pathname)) {
          navigate('/dashboard', { replace: true });
        }
      } else {
        if (!['/', '/login', '/register', '/quiz'].includes(window.location.pathname)) {
          navigate('/', { replace: true });
        }
      }
    }
  }, [user, authLoading, navigate]);

  if (authLoading) return <AuthLoadingPage />;

  return (
    <SocketProvider>
      <Navbar /> {/* Always show Navbar */}
      <NotificationToasts />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/quiz" element={<QuizPage />} />

        {/* Private Routes */}
        <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><UserProfilePage /></PrivateRoute>} />
        <Route path="/dashboard/students" element={<PrivateRoute><TeacherDashboardPage /></PrivateRoute>} />
        <Route path="/dashboard/students/:studentId" element={<PrivateRoute><StudentProgressDetailPage /></PrivateRoute>} />
        <Route path="/children" element={<PrivateRoute><MyChildrenPage /></PrivateRoute>} />
        <Route path="/children/:childId/dashboard" element={<PrivateRoute><StudentProgressDetailPage /></PrivateRoute>} />
        <Route path="/badges" element={<PrivateRoute><BadgePages /></PrivateRoute>} />
        <Route path="/modules" element={<PrivateRoute><ModulesPage /></PrivateRoute>} />
        <Route path="/modules/:moduleId" element={<PrivateRoute><ModuleDetailPage /></PrivateRoute>} />
        <Route path="/game/:moduleId/:contentPieceIndex" element={<PrivateRoute><GamePage /></PrivateRoute>} />
        <Route path="/games" element={<PrivateRoute><GamesHubPage /></PrivateRoute>} />
        <Route path="/game/mathmaze/:moduleId" element={<PrivateRoute><MathMazePage /></PrivateRoute>} />
        <Route path="/game/vocabvanguard/:moduleId" element={<PrivateRoute><VocabVanguardPage /></PrivateRoute>} />
        <Route path="/game/logiccircuit/:moduleId" element={<PrivateRoute><LogicCircuitPage /></PrivateRoute>} />
        <Route path="/ai-chat" element={<PrivateRoute><AIChatPage /></PrivateRoute>} />
        <Route path="/projects" element={<PrivateRoute><ProjectsPage /></PrivateRoute>} />
        <Route path="/projects/create" element={<PrivateRoute><CreateEditProjectPage /></PrivateRoute>} />
        <Route path="/projects/edit/:projectId" element={<PrivateRoute><CreateEditProjectPage /></PrivateRoute>} />
        <Route path="/projects/:projectId" element={<PrivateRoute><ProjectDetailPage /></PrivateRoute>} />
        <Route path="/leaderboard" element={<PrivateRoute><LeaderboardPage /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute><div>Admin Dashboard Content</div></PrivateRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </SocketProvider>
  );
};

const App: React.FC = () => <AppContent />;

export default App;

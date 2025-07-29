import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LevelMenu from './components/LevelMenu';
import { useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import NotificationToasts from './components/NotificationToasts';
import ShadowMatchGame from './components/game2';
import ErrorBoundary from './pages/ErrorBoundary';
import ModulesPage from './pages/ModulesPage';
import ModuleDetailPage from './pages/ModuleDetailPage';
import NewModuleQuizPage from './pages/NewModuleQuizPage';
import VideoPage from './pages/VideoPage';
import AuthLoadingPage from './pages/AuthLoadingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import HomePage from './pages/HomePage';
import NewModulesPage from './pages/NewModulesPage';
import NewModuleDetailPage from './pages/NewModuleDetailPage';
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
import BadgePages from './pages/BadgePages';
import QuizPage from './pages/QuizPage';
// ✅ Import the new PrivateLayout
import PrivateLayout from './components/PrivateLayout';

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
        if (!['/', '/login', '/register'].includes(window.location.pathname)) {
          navigate('/', { replace: true });
        }
      }
    }
  }, [user, authLoading, navigate]);

  if (authLoading) return <AuthLoadingPage />;

  return (
    <SocketProvider>
      <Navbar />
      <NotificationToasts />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ✅ Wrap all Private pages inside PrivateLayout */}
        <Route path="/dashboard" element={<PrivateRoute><PrivateLayout><DashboardPage /></PrivateLayout></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><PrivateLayout><UserProfilePage /></PrivateLayout></PrivateRoute>} />
        <Route path="/dashboard/students" element={<PrivateRoute><PrivateLayout><TeacherDashboardPage /></PrivateLayout></PrivateRoute>} />
        <Route path="/dashboard/students/:studentId" element={<PrivateRoute><PrivateLayout><StudentProgressDetailPage /></PrivateLayout></PrivateRoute>} />
        <Route path="/children" element={<PrivateRoute><PrivateLayout><MyChildrenPage /></PrivateLayout></PrivateRoute>} />
        <Route path="/children/:childId/dashboard" element={<PrivateRoute><PrivateLayout><StudentProgressDetailPage /></PrivateLayout></PrivateRoute>} />
        <Route path="/badges" element={<PrivateRoute><PrivateLayout><BadgePages /></PrivateLayout></PrivateRoute>} />
        <Route path="/modules" element={<PrivateRoute><PrivateLayout><ModulesPage /></PrivateLayout></PrivateRoute>} />
        <Route path="/modules/:moduleId" element={<PrivateRoute><PrivateLayout><ModuleDetailPage /></PrivateLayout></PrivateRoute>} />
        <Route path="/game/:moduleId/:contentPieceIndex" element={<PrivateRoute><PrivateLayout><GamePage /></PrivateLayout></PrivateRoute>} />
        <Route path="/games" element={<PrivateRoute><PrivateLayout><GamesHubPage /></PrivateLayout></PrivateRoute>} />
        <Route path="/game/mathmaze/:moduleId" element={<PrivateRoute><PrivateLayout><MathMazePage /></PrivateLayout></PrivateRoute>} />
        <Route path="/game/vocabvanguard/:moduleId" element={<PrivateRoute><PrivateLayout><VocabVanguardPage /></PrivateLayout></PrivateRoute>} />
        <Route path="/game/logiccircuit/:moduleId" element={<PrivateRoute><PrivateLayout><LogicCircuitPage /></PrivateLayout></PrivateRoute>} />
        <Route path="/shadow-game/:levelId" element={<PrivateRoute><PrivateLayout><LevelMenu totalLevels={5} /></PrivateLayout></PrivateRoute>} />
        <Route path="/ai-chat" element={<PrivateRoute><PrivateLayout><AIChatPage /></PrivateLayout></PrivateRoute>} />
        <Route path="/projects" element={<PrivateRoute><PrivateLayout><ProjectsPage /></PrivateLayout></PrivateRoute>} />
        <Route path="/projects/create" element={<PrivateRoute><PrivateLayout><CreateEditProjectPage /></PrivateLayout></PrivateRoute>} />
        <Route path="/projects/edit/:projectId" element={<PrivateRoute><PrivateLayout><CreateEditProjectPage /></PrivateLayout></PrivateRoute>} />
        <Route path="/projects/:projectId" element={<PrivateRoute><PrivateLayout><ProjectDetailPage /></PrivateLayout></PrivateRoute>} />
        <Route path="/leaderboard" element={<PrivateRoute><PrivateLayout><LeaderboardPage /></PrivateLayout></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute><PrivateLayout><div>Admin Dashboard Content</div></PrivateLayout></PrivateRoute>} />
        <Route path="/newmodules" element={<PrivateRoute><PrivateLayout><ErrorBoundary><NewModulesPage /></ErrorBoundary></PrivateLayout></PrivateRoute>} />
        <Route path="/newmodule/:moduleId/video/:videoIndex" element={<PrivateLayout><VideoPage /></PrivateLayout>} />
        <Route path="/newmodule/:moduleId/quiz" element={<PrivateLayout><NewModuleQuizPage /></PrivateLayout>} />
        <Route path="/newmodule/:moduleId" element={<PrivateRoute><PrivateLayout><NewModuleDetailPage /></PrivateLayout></PrivateRoute>} />
        <Route path="/quiz" element={<PrivateRoute><PrivateLayout><QuizPage /></PrivateLayout></PrivateRoute>} />
        
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </SocketProvider>
  );
};

const App: React.FC = () => <AppContent />;
export default App;

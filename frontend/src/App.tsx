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
 // <-- fixed import path
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

// If ModulesPage and ModuleDetailPage are missing imports, add them:
// import ModulesPage from './pages/ModulesPage';
// import ModuleDetailPage from './pages/ModuleDetailPage';

const PrivateRoute: React.FC<{ children: JSX.Element; allowedRoles?: string[] }> = ({
  children,
  allowedRoles,
}) => {
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

        <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route
          path="/profile"
          element={
            <PrivateRoute allowedRoles={['student', 'teacher', 'parent', 'admin']}>
              <UserProfilePage />
            </PrivateRoute>
          }
        />

        <Route
          path="/dashboard/students"
          element={
            <PrivateRoute allowedRoles={['teacher', 'admin']}>
              <TeacherDashboardPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/dashboard/students/:studentId"
          element={
            <PrivateRoute allowedRoles={['teacher', 'parent', 'admin']}>
              <StudentProgressDetailPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/children"
          element={
            <PrivateRoute allowedRoles={['parent', 'admin']}>
              <MyChildrenPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/children/:childId/dashboard"
          element={
            <PrivateRoute allowedRoles={['parent', 'admin']}>
              <StudentProgressDetailPage />
            </PrivateRoute>
          }
        />

        <Route path="/badges" element={<PrivateRoute><BadgePages /></PrivateRoute>} />

        {/* Uncomment and import ModulesPage and ModuleDetailPage if you have them */}
        {/* <Route path="/modules" element={<PrivateRoute><ModulesPage /></PrivateRoute>} /> */}
        {/* <Route path="/modules/:moduleId" element={<PrivateRoute><ModuleDetailPage /></PrivateRoute>} /> */}

        <Route path="/game/:moduleId/:contentPieceIndex" element={<PrivateRoute><GamePage /></PrivateRoute>} />
        <Route path="/games" element={<PrivateRoute><GamesHubPage /></PrivateRoute>} />

        <Route path="/game/mathmaze/:moduleId" element={<PrivateRoute><MathMazePage /></PrivateRoute>} />
        <Route path="/game/vocabvanguard/:moduleId" element={<PrivateRoute><VocabVanguardPage /></PrivateRoute>} />
        <Route path="/game/logiccircuit/:moduleId" element={<PrivateRoute><LogicCircuitPage /></PrivateRoute>} />

        <Route
          path="/shadow-game/:levelId"
          element={<PrivateRoute><LevelMenu totalLevels={5} /></PrivateRoute>}
        />

        <Route path="/game/:levelId" element={<ShadowMatchGame />} />

        <Route path="/ai-chat" element={<PrivateRoute><AIChatPage /></PrivateRoute>} />
        <Route path="/projects" element={<PrivateRoute><ProjectsPage /></PrivateRoute>} />
        <Route
          path="/projects/create"
          element={
            <PrivateRoute allowedRoles={['student']}>
              <CreateEditProjectPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/projects/edit/:projectId"
          element={
            <PrivateRoute allowedRoles={['student']}>
              <CreateEditProjectPage />
            </PrivateRoute>
          }
        />
        <Route path="/projects/:projectId" element={<PrivateRoute><ProjectDetailPage /></PrivateRoute>} />
        <Route path="/leaderboard" element={<PrivateRoute><LeaderboardPage /></PrivateRoute>} />
        <Route
          path="/admin"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <div>Admin Dashboard Content</div>
            </PrivateRoute>
          }
        />
 <Route path="/modules" element={<PrivateRoute><ModulesPage /></PrivateRoute>} />
        <Route path="/modules/:moduleId" element={<PrivateRoute><ModuleDetailPage /></PrivateRoute>} />
        <Route path="/game/:moduleId/:contentPieceIndex" element={<PrivateRoute><GamePage /></PrivateRoute>} />
        <Route
          path="/newmodules"
          element={
            <PrivateRoute>
              <ErrorBoundary>
                <NewModulesPage />
              </ErrorBoundary>
            </PrivateRoute>
          }
        />

        <Route path="/newmodule/:moduleId/video/:videoIndex" element={<VideoPage />} />
        <Route path="/newmodule/:moduleId/quiz" element={<NewModuleQuizPage />} />
<Route
  path="/newmodule/:moduleId"
  element={
    <PrivateRoute>
      <NewModuleDetailPage />
    </PrivateRoute>
  }
/>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </SocketProvider>
  );
};

const App: React.FC = () => <AppContent />;

export default App;

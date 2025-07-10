// frontend/src/App.tsx
import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';

// Pages
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
import CreateEditProjectPage from './pages/CreateEditProjectPage'; // ✅ No props needed
import ProjectDetailPage from './pages/ProjectDetailsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import UserProfilePage from './pages/UserProfilePage';
import StudentProgressDetailPage from './pages/StudentProgressDetailPage';

// 🔒 PrivateRoute wrapper
const PrivateRoute: React.FC<{ children: JSX.Element; allowedRoles?: string[] }> = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) return <AuthLoadingPage />;
    if (!user) return <Navigate to="/login" replace />;
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

// 🌐 AppContent controls initial redirection and main routes
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
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Protected Routes */}
                <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
                <Route path="/profile" element={<PrivateRoute allowedRoles={['student', 'teacher', 'parent', 'admin']}><UserProfilePage /></PrivateRoute>} />
                <Route path="/student-progress/:studentId" element={<PrivateRoute allowedRoles={['teacher', 'parent']}><StudentProgressDetailPage /></PrivateRoute>} />
                <Route path="/modules" element={<PrivateRoute><ModulesPage /></PrivateRoute>} />
                <Route path="/modules/:moduleId" element={<PrivateRoute><ModuleDetailPage /></PrivateRoute>} />
                <Route path="/game/:moduleId/:contentPieceIndex" element={<PrivateRoute><GamePage /></PrivateRoute>} />
                <Route path="/ai-chat" element={<PrivateRoute><AIChatPage /></PrivateRoute>} />
                <Route path="/projects" element={<PrivateRoute><ProjectsPage /></PrivateRoute>} />
                <Route path="/projects/create" element={<PrivateRoute allowedRoles={['student']}><CreateEditProjectPage /></PrivateRoute>} />
                <Route path="/projects/edit/:projectId" element={<PrivateRoute allowedRoles={['student']}><CreateEditProjectPage /></PrivateRoute>} />
                <Route path="/projects/:projectId" element={<PrivateRoute><ProjectDetailPage /></PrivateRoute>} />
                <Route path="/leaderboard" element={<PrivateRoute><LeaderboardPage /></PrivateRoute>} />
                <Route path="/admin" element={<PrivateRoute allowedRoles={['admin']}><div>Admin Dashboard Content</div></PrivateRoute>} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </SocketProvider>
    );
};

const App: React.FC = () => <AppContent />;

export default App;

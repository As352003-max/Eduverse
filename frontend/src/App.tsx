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
import GamePage from './pages/GamePage'; // Ensure GamePage is imported
import AIChatPage from './pages/AIChatPage';
import ProjectsPage from './pages/ProjectsPage';
import CreateEditProjectPage from './pages/CreateEditProjectPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import LeaderboardPage from './pages/LeaderboardPage';
import UserProfilePage from './pages/UserProfilePage';
import StudentProgressDetailPage from './pages/StudentProgressDetailPage';


// PrivateRoute component
const PrivateRoute: React.FC<{ children: JSX.Element; allowedRoles?: string[] }> = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <AuthLoadingPage />;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

// New component to handle authentication-based routing logic
const AppContent: React.FC = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    // This useEffect handles the initial redirection when the app loads
    useEffect(() => {
        if (!authLoading) {
            if (user) {
                if (window.location.pathname === '/' || window.location.pathname === '/login' || window.location.pathname === '/register') {
                    navigate('/dashboard', { replace: true });
                }
            } else {
                if (window.location.pathname !== '/login' && window.location.pathname !== '/register' && window.location.pathname !== '/') {
                     navigate('/', { replace: true });
                }
            }
        }
    }, [user, authLoading, navigate]);

    if (authLoading) {
        return <AuthLoadingPage />;
    }

    return (
        <SocketProvider>
            <Navbar />
            <Routes>
                <Route path="/" element={<HomePage />} />

                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
                <Route path="/profile" element={<PrivateRoute allowedRoles={['student', 'teacher', 'parent', 'admin']}><UserProfilePage /></PrivateRoute>} />
                <Route path="/student-progress/:studentId" element={<PrivateRoute allowedRoles={['teacher', 'parent']}><StudentProgressDetailPage /></PrivateRoute>} />
                <Route path="/modules" element={<PrivateRoute><ModulesPage /></PrivateRoute>} />
                <Route path="/modules/:moduleId" element={<PrivateRoute><ModuleDetailPage /></PrivateRoute>} />
                {/* Ensure this route is EXACTLY as below, with both parameters */}
                <Route path="/game/:moduleId/:contentPieceIndex" element={<PrivateRoute><GamePage /></PrivateRoute>} />
                <Route path="/ai-chat" element={<PrivateRoute><AIChatPage /></PrivateRoute>} />
                <Route path="/projects" element={<PrivateRoute><ProjectsPage /></PrivateRoute>} />
                <Route path="/projects/create" element={<PrivateRoute allowedRoles={['student']}><CreateEditProjectPage /></PrivateRoute>} />
                <Route path="/projects/edit/:projectId" element={<PrivateRoute allowedRoles={['student']}><CreateEditProjectPage /></PrivateRoute>} />
                <Route path="/projects/:projectId" element={<PrivateRoute><ProjectDetailPage /></PrivateRoute>} />
                <Route path="/leaderboard" element={<PrivateRoute><LeaderboardPage /></PrivateRoute>} />
                <Route path="/admin" element={<PrivateRoute allowedRoles={['admin']}><div>Admin Dashboard Content</div></PrivateRoute>} />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </SocketProvider>
    );
};


const App: React.FC = () => {
    return (
        <AppContent />
    );
};

export default App;

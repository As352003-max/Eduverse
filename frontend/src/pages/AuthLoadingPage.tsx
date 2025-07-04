// src/pages/AuthLoadingPage.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthLoadingPage: React.FC = () => {
    const { loading, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading) {
            if (user) {
                navigate('/dashboard', { replace: true });
            } else {
                navigate('/login', { replace: true });
            }
        }
    }, [loading, user, navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-lg text-gray-700">Loading application...</p>
            </div>
        </div>
    );
};

export default AuthLoadingPage;
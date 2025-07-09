// frontend/src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '../config/firebase'; // Your Firebase auth instance
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    User as FirebaseUser,
    getIdToken,
} from 'firebase/auth';
import localforage from 'localforage'; // For client-side storage
import apiClient from '../api/axiosClient'; // Your custom Axios client
import { User } from '../types'; // Import your User type

// Define the shape of the AuthContext
interface AuthContextType {
    user: User | null;
    firebaseUser: FirebaseUser | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string, role: 'student' | 'teacher' | 'parent') => Promise<void>;
    logout: () => Promise<void>;
    refreshAuthToken: () => Promise<string | null>;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null); // Your backend user object
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null); // Firebase user object
    const [loading, setLoading] = useState(true); // Initial loading state for auth

    // Function to fetch or refresh the custom token from your backend
    const refreshAuthToken = async (): Promise<string | null> => {
        try {
            const idToken = await firebaseUser?.getIdToken(true); // Force refresh
            if (idToken) {
                const res = await apiClient.post('/auth/firebase-auth', { token: idToken });
                const backendToken = res.data.token;
                await localforage.setItem('userToken', backendToken);
                // Set the Authorization header for all subsequent requests
                apiClient.defaults.headers.common['Authorization'] = `Bearer ${backendToken}`;
                return backendToken;
            }
            return null;
        } catch (error) {
            console.error('Failed to refresh custom auth token:', error);
            await localforage.removeItem('userToken');
            await signOut(auth); // Sign out Firebase user on token refresh failure
            setUser(null);
            setFirebaseUser(null);
            return null;
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
            setFirebaseUser(fbUser);
            if (fbUser) {
                try {
                    // Attempt to refresh or get the backend token
                    const backendToken = await refreshAuthToken();
                    if (backendToken) {
                        // Fetch the full user profile from your backend using the new token
                        const userProfileRes = await apiClient.get('/users/profile');
                        setUser(userProfileRes.data);
                    } else {
                        // If no backend token, clear user
                        setUser(null);
                    }
                } catch (error) {
                    console.error('Error fetching user profile after Firebase auth:', error);
                    setUser(null);
                    await localforage.removeItem('userToken');
                    await signOut(auth);
                }
            } else {
                // No Firebase user, clear everything
                setUser(null);
                await localforage.removeItem('userToken');
                delete apiClient.defaults.headers.common['Authorization'];
            }
            setLoading(false); // Auth state determined
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [firebaseUser]); // Re-run when firebaseUser changes (e.g., login/logout)

    const login = async (email: string, password: string) => {
        setLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password.trim());
            const fbUser = userCredential.user;
            // The onAuthStateChanged listener will handle setting the backend user and token
        } catch (error) {
            console.error('Firebase Login Error:', error);
            throw error; // Re-throw to be caught by UI components
        } finally {
            setLoading(false);
        }
    };

    const register = async (username: string, email: string, password: string, role: 'student' | 'teacher' | 'parent') => {
        setLoading(true);
        try {
            // IMPORTANT: Trim email and password before sending to Firebase
            const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password.trim());
            const fbUser = userCredential.user;

            // Send Firebase UID and other user data to your backend
            const res = await apiClient.post('/auth/register', {
                username,
                email: email.trim(), // Ensure trimmed email is sent to backend too
                role,
                firebaseId: fbUser.uid,
                authType: 'firebase', // Indicate Firebase auth type
            });

            const backendToken = res.data.token;
            await localforage.setItem('userToken', backendToken);
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${backendToken}`;
            setUser(res.data.user); // Set the backend user data
            setFirebaseUser(fbUser); // Set the Firebase user data
        } catch (error) {
            console.error('Firebase Registration Error:', error);
            throw error; // Re-throw to be caught by UI components
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);
        try {
            await signOut(auth); // Sign out from Firebase
            await localforage.removeItem('userToken'); // Clear token from storage
            setUser(null);
            setFirebaseUser(null);
            delete apiClient.defaults.headers.common['Authorization']; // Remove auth header
        } catch (error) {
            console.error('Firebase Logout Error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const value = {
        user,
        firebaseUser,
        loading,
        login,
        register,
        logout,
        refreshAuthToken,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the AuthContext
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};



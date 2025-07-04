// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import localforage from 'localforage'; // Using localforage for better async storage
import axios from 'axios';
import { auth } from '../config/firebase'; // Ensure your firebase.js config is correct
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { FirebaseError } from 'firebase/app'; // <-- Add this line for FirebaseError

interface User {
    _id: string;
    username: string;
    email: string;
    role: 'student' | 'teacher' | 'parent' | 'admin';
    grade?: number;
    parent_id?: string;
    totalXp?: number; // Added as it's returned by backend
    currentLevel?: number; // Added as it's returned by backend
    // Add other user properties from your backend here (e.g., isActive, achievements, etc.)
}

interface AuthContextType {
    user: User | null; // This is your backend-managed user object
    firebaseUser: FirebaseUser | null; // This is the user object directly from Firebase Auth
    loading: boolean;
    register: (email: string, password: string, username: string, role: string, grade?: number, parent_id?: string) => Promise<User>;
    login: (email: string, password: string) => Promise<FirebaseUser>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Ensure this matches your backend URL
const API_URL = 'http://localhost:5000/api';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null); // State for your backend user object
    const [loading, setLoading] = useState(true); // State to manage loading during auth checks
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null); // State for the Firebase user object

    // This useEffect hook runs whenever the Firebase authentication state changes
    useEffect(() => {
        const unsubscribeFirebase = onAuthStateChanged(auth, async (fbUser) => {
            setFirebaseUser(fbUser); // Update the Firebase user state
            if (fbUser) {
                // If a Firebase user is logged in
                try {
                    const idToken = await fbUser.getIdToken(); // Get the Firebase ID token

                    // IMPORTANT FIX: Send the ID token to your backend's Firebase verification endpoint
                    // NOT to the standard /auth/login endpoint (which expects email/password)
                    const res = await axios.post(`${API_URL}/auth/firebase-auth`, { idToken }, {
                        headers: {
                            Authorization: `Bearer ${idToken}` // Send Firebase ID token as a Bearer token
                        }
                    });

                    // If backend successfully validates and returns your internal user
                    setUser(res.data.user); // Set your backend user object
                    await localforage.setItem('userToken', res.data.token); // Store your internal backend JWT

                } catch (error: any) {
                    // Handle errors during backend synchronization (e.g., backend token verification failed)
                    console.error('Backend synchronization failed after Firebase auth:', error.response?.data || error.message);
                    setUser(null); // Clear backend user state
                    await localforage.removeItem('userToken'); // Clear stored token
                    await signOut(auth); // Sign out from Firebase to ensure consistency
                }
            } else {
                // If no Firebase user is logged in
                setUser(null); // Clear backend user state
                await localforage.removeItem('userToken'); // Clear stored token
            }
            setLoading(false); // Set loading to false once the initial check is complete
        });

        // Cleanup function for the useEffect: unsubscribe from Firebase auth changes
        return () => {
            unsubscribeFirebase();
        };
    }, []); // Empty dependency array means this runs once on component mount

    // Function to handle user registration (creates user in Firebase, then syncs with backend)
    const register = async (email: string, password: string, username: string, role: string, grade?: number, parent_id?: string): Promise<User> => {
        try {
            // 1. Create user in Firebase Authentication
            const fbUserCredential = await createUserWithEmailAndPassword(auth, email, password);
            const idToken = await fbUserCredential.user.getIdToken();

            // 2. Send user data to your backend to create/sync a user record in your MongoDB
            // IMPORTANT FIX: Include 'password' in the payload sent to backend /auth/register
            const res = await axios.post(`${API_URL}/auth/register`, {
                email,
                password, // <-- ADDED PASSWORD HERE
                username,
                role,
                grade,
                parent_id
            }, {
                headers: { Authorization: `Bearer ${idToken}` } // Send Firebase ID token for authorization
            });

            // On successful backend registration, update local state and storage
            setUser(res.data.user);
            await localforage.setItem('userToken', res.data.token);
            return res.data.user; // Return the backend user object
        } catch (error: any) {
            // Log and re-throw Firebase or Axios errors for the component to handle
            console.error('Registration error:', error.response?.data || error.message);
            throw error;
        }
    };

    // Function to handle user login (authenticates with Firebase)
    const login = async (email: string, password: string): Promise<FirebaseUser> => {
        try {
            // Authenticate user with Firebase
            const fbUserCredential = await signInWithEmailAndPassword(auth, email, password);
            // The onAuthStateChanged listener (in useEffect) will automatically handle:
            // 1. Setting firebaseUser state
            // 2. Getting idToken
            // 3. Sending idToken to backend for synchronization
            // 4. Setting your internal 'user' state and 'userToken' in localforage
            return fbUserCredential.user; // Return the Firebase user object
        } catch (error: any) {
            // Log and re-throw Firebase errors (e.g., auth/invalid-credential)
            if (error instanceof FirebaseError) {
                console.error('Firebase Login error:', error.code, error.message);
            } else {
                console.error('Login error:', error.message);
            }
            throw error;
        }
    };

    // Function to handle user logout (signs out from Firebase, clears local state/storage)
    const logout = async () => {
        try {
            await signOut(auth); // Sign out from Firebase
            setUser(null); // Clear backend user state
            await localforage.removeItem('userToken'); // Clear stored token
            // Additional backend logout call can be added here if needed for session invalidation
        } catch (error: any) {
            console.error('Logout error:', error.message);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, firebaseUser, loading, register, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to easily consume the AuthContext in components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '../config/firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    User as FirebaseUser,
    getIdToken,
} from 'firebase/auth';
import localforage from 'localforage';
import apiClient from '../api/axiosClient';
import { User } from '../types';

interface SelectedChild {
    _id: string;
    name: string;
}

interface AuthContextType {
    user: User | null;
    firebaseUser: FirebaseUser | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string, role: 'student' | 'teacher' | 'parent') => Promise<void>;
    logout: () => Promise<void>;
    refreshAuthToken: () => Promise<string | null>;
    selectedChild: SelectedChild | null;
    setSelectedChild: (child: SelectedChild | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedChild, setSelectedChild] = useState<SelectedChild | null>(() => {
        const savedChild = localStorage.getItem('selectedChild');
        try {
            return savedChild ? JSON.parse(savedChild) : null;
        } catch (e) {
            localStorage.removeItem('selectedChild');
            return null;
        }
    });

    useEffect(() => {
        if (selectedChild) {
            localStorage.setItem('selectedChild', JSON.stringify(selectedChild));
        } else {
            localStorage.removeItem('selectedChild');
        }
    }, [selectedChild]);

    const refreshAuthToken = async (): Promise<string | null> => {
        try {
            const idToken = await firebaseUser?.getIdToken(true);
            if (idToken) {
                const res = await apiClient.post('/auth/firebase-auth', { token: idToken });
                const backendToken = res.data.token;
                await localforage.setItem('userToken', backendToken);
                apiClient.defaults.headers.common['Authorization'] = `Bearer ${backendToken}`;
                return backendToken;
            }
            return null;
        } catch (error) {
            await localforage.removeItem('userToken');
            await signOut(auth);
            setUser(null);
            setFirebaseUser(null);
            setSelectedChild(null);
            return null;
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
            setFirebaseUser(fbUser);
            if (fbUser) {
                try {
                    const backendToken = await refreshAuthToken();
                    if (backendToken) {
                        const userProfileRes = await apiClient.get('/users/profile');
                        setUser(userProfileRes.data);
                    } else {
                        setUser(null);
                        await localforage.removeItem('userToken');
                        await signOut(auth);
                    }
                } catch (error) {
                    setUser(null);
                    await localforage.removeItem('userToken');
                    await signOut(auth);
                    setSelectedChild(null);
                }
            } else {
                setUser(null);
                await localforage.removeItem('userToken');
                delete apiClient.defaults.headers.common['Authorization'];
                setSelectedChild(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [firebaseUser]);

    const login = async (email: string, password: string) => {
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email.trim(), password.trim());
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const register = async (username: string, email: string, password: string, role: 'student' | 'teacher' | 'parent') => {
        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password.trim());
            const fbUser = userCredential.user;
            const res = await apiClient.post('/auth/register', {
                username,
                email: email.trim(),
                role,
                firebaseId: fbUser.uid,
                authType: 'firebase',
            });
            const backendToken = res.data.token;
            await localforage.setItem('userToken', backendToken);
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${backendToken}`;
            setUser(res.data.user);
            setFirebaseUser(fbUser);
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);
        try {
            await signOut(auth);
            await localforage.removeItem('userToken');
            setUser(null);
            setFirebaseUser(null);
            delete apiClient.defaults.headers.common['Authorization'];
            setSelectedChild(null);
        } catch (error) {
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
        selectedChild,
        setSelectedChild,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

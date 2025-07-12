import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '../config/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import localforage from 'localforage';
import apiClient from '../api/axiosClient';
import { User } from '../types';

interface SelectedChild {
  _id: string;
  name: string;
}

interface AuthContextType {
  user: (User & { token: string }) | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<(User & { token: string }) | null>;
  register: (
    username: string,
    email: string,
    password: string,
    role: 'student' | 'teacher' | 'parent',
    studentClass?: number
  ) => Promise<(User & { token: string }) | null>;
  logout: () => Promise<void>;
  refreshAuthToken: () => Promise<string | null>;
  selectedChild: SelectedChild | null;
  setSelectedChild: (child: SelectedChild | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<(User & { token: string }) | null>(() => {
    const cached = localStorage.getItem('user');
    try {
      return cached ? JSON.parse(cached) : null;
    } catch {
      localStorage.removeItem('user');
      return null;
    }
  });

  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedChild, setSelectedChild] = useState<SelectedChild | null>(() => {
    const savedChild = localStorage.getItem('selectedChild');
    try {
      return savedChild ? JSON.parse(savedChild) : null;
    } catch {
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
      if (!firebaseUser) return null;
      const idToken = await firebaseUser.getIdToken(true);
      if (!idToken) return null;
      const res = await apiClient.post('/auth/firebase-auth', { token: idToken });
      const backendToken = res.data.token;
      await localforage.setItem('userToken', backendToken);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${backendToken}`;
      return backendToken;
    } catch (error) {
      console.error('Error refreshing auth token:', error);
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
      if (!fbUser) {
        setUser(null);
        localStorage.removeItem('user');
        setLoading(false);
        return;
      }
      try {
        const token = await fbUser.getIdToken(true);
        const res = await apiClient.post('/auth/firebase-auth', { token });
        const backendToken = res.data.token;
        await localforage.setItem('userToken', backendToken);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${backendToken}`;
        const profileRes = await apiClient.get('/users/profile');
        const fullUser = { ...profileRes.data, token: backendToken };
        setUser(fullUser);
        localStorage.setItem('user', JSON.stringify(fullUser));
      } catch (error) {
        console.error('Error during initial auth state check:', error);
        await signOut(auth);
        await localforage.removeItem('userToken');
        setUser(null);
        setSelectedChild(null);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<(User & { token: string }) | null> => {
    setLoading(true);
    try {
      const trimmedEmail = email.trim();
      const trimmedPassword = password.trim();
      if (!trimmedEmail || !trimmedPassword) {
        throw new Error('Email and password are required.');
      }
      const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);
      const fbUser = userCredential.user;
      const idToken = await fbUser.getIdToken(true);
      const res = await apiClient.post('/auth/firebase-auth', { token: idToken });
      const backendToken = res.data.token;
      await localforage.setItem('userToken', backendToken);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${backendToken}`;
      const profileRes = await apiClient.get('/users/profile');
      const fullUser = { ...profileRes.data, token: backendToken };
      setUser(fullUser);
      localStorage.setItem('user', JSON.stringify(fullUser));
      setFirebaseUser(fbUser);
      return fullUser;
    } catch (error: any) {
      console.error('Login failed:', error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        throw new Error('Invalid email or password.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address format.');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many failed login attempts. Please try again later.');
      } else if (error.response && error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error(error.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string,
    role: 'student' | 'teacher' | 'parent',
    studentClass?: number
  ): Promise<(User & { token: string }) | null> => {
    setLoading(true);
    try {
      const trimmedUsername = username.trim();
      const trimmedEmail = email.trim();
      const trimmedPassword = password.trim();
      if (role === 'student') {
        if (studentClass === undefined || studentClass < 1 || studentClass > 8) {
          throw new Error('Student class is required and must be a number between 1 and 8 for student role.');
        }
      }
      const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);
      const fbUser = userCredential.user;
      const postData: any = {
        username: trimmedUsername,
        email: trimmedEmail,
        role,
        firebaseId: fbUser.uid,
        authType: 'firebase',
      };
      if (role === 'student') {
        postData.studentClass = studentClass;
      }
      const res = await apiClient.post('/auth/register', postData);
      const backendToken = res.data.token;
      const fullUser = { ...res.data.user, token: backendToken };
      await localforage.setItem('userToken', backendToken);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${backendToken}`;
      setUser(fullUser);
      localStorage.setItem('user', JSON.stringify(fullUser));
      setFirebaseUser(fbUser);
      return fullUser;
    } catch (error: any) {
      console.error('Registration failed:', error);
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('This email address is already in use.');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password should be at least 6 characters.');
      } else if (error.response && error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error(error.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      await signOut(auth);
      await localforage.removeItem('userToken');
      setUser(null);
      setFirebaseUser(null);
      localStorage.removeItem('user');
      delete apiClient.defaults.headers.common['Authorization'];
      setSelectedChild(null);
    } catch (error) {
      console.error('Logout failed:', error);
      setUser(null);
      setFirebaseUser(null);
      localStorage.removeItem('user');
      delete apiClient.defaults.headers.common['Authorization'];
      setSelectedChild(null);
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

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

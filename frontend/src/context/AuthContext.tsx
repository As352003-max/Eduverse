// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import localforage from 'localforage';
import axios from 'axios';
import { auth } from '../config/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';

interface User {
  _id: string;
  username: string;
  email: string;
  role: 'student' | 'teacher' | 'parent' | 'admin';
  grade?: number;
  parent_id?: string;
  totalXp?: number;
  currentLevel?: number;
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  register: (
  username: string,
  email: string,
  password: string,
    role: string,
    grade?: number,
    parent_id?: string
  ) => Promise<User>;
  login: (email: string, password: string) => Promise<FirebaseUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = `${import.meta.env.VITE_BASE_API}/api`;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    const unsubscribeFirebase = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          const idToken = await fbUser.getIdToken();
          const res = await axios.post(`${API_URL}/auth/firebase-auth`, { idToken }, {
            headers: { Authorization: `Bearer ${idToken}` }
          });
          setUser(res.data.user);
          await localforage.setItem('userToken', res.data.token);
        } catch (error: any) {
          console.error('Backend sync error:', error.response?.data || error.message);
          setUser(null);
          await localforage.removeItem('userToken');
          await signOut(auth);
        }
      } else {
        setUser(null);
        await localforage.removeItem('userToken');
      }
      setLoading(false);
    });

    return () => unsubscribeFirebase();
  }, []);

  const register = async (
    email: string,
    password: string,
    username: string,
    role: string,
    grade?: number,
    parent_id?: string
  ): Promise<User> => {
    try {
      const fbUserCredential = await createUserWithEmailAndPassword(auth, email, password);
      const idToken = await fbUserCredential.user.getIdToken();
      const res = await axios.post(`${API_URL}/auth/register`, {
        email,
        password,
        username,
        role,
        grade,
        parent_id
      }, {
        headers: { Authorization: `Bearer ${idToken}` }
      });
      setUser(res.data.user);
      await localforage.setItem('userToken', res.data.token);
      return res.data.user;
    } catch (error: any) {
      console.error('Registration error:', error.response?.data || error.message);
      throw error;
    }
  };

  const login = async (email: string, password: string): Promise<FirebaseUser> => {
    try {
      const fbUserCredential = await signInWithEmailAndPassword(auth, email, password);
      return fbUserCredential.user;
    } catch (error: any) {
      if (error instanceof FirebaseError) {
        console.error('Firebase login error:', error.code, error.message);
      } else {
        console.error('Login error:', error.message);
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      await localforage.removeItem('userToken');
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

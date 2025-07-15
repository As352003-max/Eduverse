

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'teacher' | 'parent'>('student');
  const [studentClass, setStudentClass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const registeredUser = await register(
        username.trim(),
        email.trim(),
        password.trim(),
        role,
        role === 'student' ? Number(studentClass) : undefined
      );

      if (registeredUser) {
        navigate('/login');
      } else {
        setError('Registration failed. Please try again.');
      }
    } catch (err: any) {
      console.error('Registration failed:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EAF2FD]">
      <div className="flex w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden">
      {/* Left Side Banner */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden md:flex flex-col justify-center items-center w-1/2 bg-gradient-to-br from-indigo-700 to-purple-600 text-white p-10 relative"
      >
        <div className="absolute inset-0 bg-indigo-900 bg-opacity-40 pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center">
        <AcademicCapIcon className="h-16 w-16 mb-6 text-white drop-shadow-lg" />
        <h2 className="text-4xl font-extrabold mb-4 drop-shadow-lg">Welcome to Eduverse</h2>
        <p className="text-lg font-medium mb-8 text-indigo-100 text-center">
          Unlock your learning potential.
          <br />
          Join a vibrant community of students, teachers, and parents.
        </p>
        <ul className="space-y-3 text-indigo-100 text-base">
          <li className="flex items-center">
          <span className="h-3 w-3 rounded-full bg-pink-400 mr-2" /> Personalized dashboard
          </li>
          <li className="flex items-center">
          <span className="h-3 w-3 rounded-full bg-yellow-400 mr-2" /> Interactive courses & resources
          </li>
          <li className="flex items-center">
          <span className="h-3 w-3 rounded-full bg-green-400 mr-2" /> Progress tracking & achievements
          </li>
        </ul>
        </div>
      </motion.div>

      {/* Right Side Registration Form */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full md:w-1/2 bg-white p-8 md:p-10 flex flex-col justify-center"
      >
        <h2 className="text-3xl font-extrabold text-gray-900 mb-4 text-center">Create Account</h2>
        <p className="text-gray-500 text-center mb-6">Start your personalized learning journey.</p>

        {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md flex items-center"
        >
          <ExclamationCircleIcon className="h-6 w-6 mr-3" />
          {error}
        </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="username" className="block text-gray-700 text-sm font-semibold mb-2">
          <UserIcon className="inline-block h-5 w-5 mr-1 text-indigo-500" /> Username
          </label>
          {/* Suggest autocomplete for username */}
          <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoComplete="username"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-gray-50"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-2">
          <EnvelopeIcon className="inline-block h-5 w-5 mr-1 text-indigo-500" /> Email
          </label>
          {/* Suggest autocomplete for email */}
          <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-gray-50"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-2">
          <LockClosedIcon className="inline-block h-5 w-5 mr-1 text-indigo-500" /> Password
          </label>
          {/* Suggest autocomplete for new password */}
          <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-gray-50"
          />
        </div>

        <div>
          <label htmlFor="role" className="block text-gray-700 text-sm font-semibold mb-2">
          <AcademicCapIcon className="inline-block h-5 w-5 mr-1 text-indigo-500" /> I am a...
          </label>
          <select
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value as 'student' | 'teacher' | 'parent')}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-gray-50"
          >
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="parent">Parent</option>
          </select>
        </div>

        {role === 'student' && (
          <div>
          <label htmlFor="studentClass" className="block text-gray-700 text-sm font-semibold mb-2">
            🎓 Enter Your Class (1–8)
          </label>
          <input
            type="number"
            id="studentClass"
            min="1"
            max="8"
            value={studentClass}
            onChange={(e) => setStudentClass(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-gray-50"
            placeholder="e.g. 5"
          />
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-full shadow-lg flex items-center justify-center disabled:opacity-50"
        >
          {loading ? <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" /> : 'Register'}
        </motion.button>
        </form>

        <p className="text-center text-gray-600 mt-8">
        Already have an account?{' '}
        <Link to="/login" className="text-indigo-600 hover:text-indigo-800 font-semibold">Login</Link>
        </p>
      </motion.div>
      </div>
    </div>
    );
};

export default RegisterPage;

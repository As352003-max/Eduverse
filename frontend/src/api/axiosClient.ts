// frontend/src/api/axiosClient.ts
import axios from 'axios';
import localforage from 'localforage';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';

const API_URL = `${import.meta.env.VITE_BASE_API}/api` || 'http://localhost:5000/api';

const axiosClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await localforage.getItem<string>('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Token retrieval error:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const idToken = await currentUser.getIdToken(true);

          const res = await axios.post(`${API_URL}/auth/firebase-auth`, {
            token: idToken, // ✅ send as 'token' not 'idToken'
          });

          const newToken = res.data.token;
          await localforage.setItem('userToken', newToken);

          axiosClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

          return axiosClient(originalRequest);
        }
      } catch (refreshError: any) {
        console.error('Token refresh failed:', refreshError.response?.data || refreshError.message);
        await localforage.removeItem('userToken');
        await signOut(auth);

        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;

// frontend/src/api/axiosClient.ts
import axios from 'axios';
import localforage from 'localforage';
import { auth } from '../config/firebase'; // Ensure this path is correct
import { signOut } from 'firebase/auth'; // Firebase sign-out

const API_URL = 'http://localhost:5000/api'; // CONFIRM THIS IS YOUR BACKEND URL

const axiosClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add JWT token from localforage
axiosClient.interceptors.request.use(
    async (config) => {
        try {
            const token = await localforage.getItem<string>('userToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error('Error retrieving token for Axios request interceptor:', error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token expiration/invalidity and refresh
axiosClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        // Check if error is 401 Unauthorized AND it's not a request that's already being retried
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // Mark as retried to prevent infinite loops

            try {
                const currentUser = auth.currentUser;
                if (currentUser) {
                    // Force refresh the Firebase ID token
                    const idToken = await currentUser.getIdToken(true); 
                    
                    // Send this fresh Firebase ID token to your backend to get a new internal JWT
                    const res = await axios.post(`${API_URL}/auth/firebase-auth`, { idToken }); // <-- IMPORTANT: this endpoint is correct
                    const newToken = res.data.token;
                    
                    // Store the new backend JWT
                    await localforage.setItem('userToken', newToken);
                    
                    // Update the default Authorization header for axiosClient
                    axiosClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
                    // Update the Authorization header for the original failed request
                    originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                    
                    // Retry the original request with the new token
                    return axiosClient(originalRequest);
                }
            } catch (refreshError: any) {
                console.error('Token refresh (via Firebase ID token sync) failed:', refreshError.response?.data || refreshError.message);
                
                // If refresh fails, clear everything and sign user out
                await localforage.removeItem('userToken');
                await signOut(auth); // Sign out from Firebase

                // Redirect to login page if refresh fails and not already on it
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login'; 
                }
            }
        }
        // For any other error (or if 401 but no refresh was possible/needed), just reject
        return Promise.reject(error);
    }
);

export default axiosClient;
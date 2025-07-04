// frontend/src/context/SocketContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import io, { Socket } from 'socket.io-client';
import { useAuth } from './AuthContext'; // To get user ID for joining rooms
import { toast } from 'react-toastify'; // For notifications, you'll need to install this
import 'react-toastify/dist/ReactToastify.css'; // And its CSS

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

// Backend URL for Socket.IO connection
const SOCKET_SERVER_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const SocketProvider = ({ children }: { children: ReactNode }) => {
    const { user, loading: authLoading } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Only attempt to connect if auth is loaded and a user is present
        if (!authLoading && user) {
            const newSocket = io(SOCKET_SERVER_URL, {
                withCredentials: true, // Important for CORS and session cookies if used
                transports: ['websocket', 'polling'], // Ensure compatibility
            });

            newSocket.on('connect', () => {
                setIsConnected(true);
                console.log('Socket.IO connected:', newSocket.id);
                // Join a user-specific room for private notifications
                newSocket.emit('joinUserRoom', user._id);
            });

            newSocket.on('disconnect', () => {
                setIsConnected(false);
                console.log('Socket.IO disconnected');
            });

            // Listen for gamification notifications
            newSocket.on('achievementUnlocked', (data: { type: string; name?: string; newLevel?: number; description?: string; message: string }) => {
                console.log('Achievement Unlocked:', data);
                if (data.type === 'levelUp') {
                    toast.success(data.message, { autoClose: 5000 });
                } else if (data.type === 'badge') {
                    toast.info(data.message, { autoClose: 5000 });
                }
            });

            newSocket.on('leaderboardUpdate', (data: any) => {
                console.log('Leaderboard Updated:', data);
                // You might want to trigger a re-fetch of the leaderboard on the LeaderboardPage
                // Or update a global state if you have one
                toast.success('Leaderboard has been updated!', { autoClose: 3000 });
            });

            // Add other real-time listeners here (e.g., chat messages, project updates)

            setSocket(newSocket);

            return () => {
                newSocket.off('connect');
                newSocket.off('disconnect');
                newSocket.off('achievementUnlocked');
                newSocket.off('leaderboardUpdate');
                newSocket.disconnect();
            };
        } else if (!authLoading && !user && socket) {
            // If user logs out, disconnect socket
            socket.disconnect();
            setSocket(null);
            setIsConnected(false);
        }
    }, [user, authLoading]); // Re-run when user or authLoading changes

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};

import React, { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import io, { Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

interface AchievementPayload {
    type: 'levelUp' | 'badge';
    name?: string;
    newLevel?: number;
    description?: string;
    message: string;
}

interface LeaderboardUpdatePayload {
    message?: string;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

const SOCKET_SERVER_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const SocketProvider = ({ children }: { children: ReactNode }) => {
    const { user, loading: authLoading } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!authLoading && user && !socketRef.current) {
            const token = localStorage.getItem('token');

            const newSocket = io(SOCKET_SERVER_URL, {
                query: { userId: user._id },
                auth: { token: token },
                transports: ['websocket', 'polling'],
            });

            newSocket.on('connect', () => {
                setIsConnected(true);
                console.log('Socket.IO connected:', newSocket.id);
                if (user && newSocket.connected) {
                    newSocket.emit('joinUserRoom', user._id);
                }
            });

            newSocket.on('disconnect', (reason) => {
                setIsConnected(false);
                console.log('Socket.IO disconnected:', reason);
            });

            newSocket.on('connect_error', (error) => {
                console.error('Socket.IO connection error:', error.message);
                // toast removed
            });

            newSocket.on('achievementUnlocked', (data: AchievementPayload) => {
                console.log('Achievement Unlocked:', data);
                // toast removed
            });

            newSocket.on('leaderboardUpdate', (data: LeaderboardUpdatePayload) => {
                console.log('Leaderboard Updated:', data);
                // toast removed
            });

            setSocket(newSocket);
            socketRef.current = newSocket;

        } else if (!authLoading && !user && socketRef.current) {
            socketRef.current.off('connect');
            socketRef.current.off('disconnect');
            socketRef.current.off('connect_error');
            socketRef.current.off('achievementUnlocked');
            socketRef.current.off('leaderboardUpdate');
            socketRef.current.disconnect();
            socketRef.current = null;
            setSocket(null);
            setIsConnected(false);
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.off('connect');
                socketRef.current.off('disconnect');
                socketRef.current.off('connect_error');
                socketRef.current.off('achievementUnlocked');
                socketRef.current.off('leaderboardUpdate');
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [user, authLoading]);

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

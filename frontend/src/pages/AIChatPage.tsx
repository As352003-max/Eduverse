// frontend/src/pages/AIChatPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { ChatBubbleLeftRightIcon, PaperAirplaneIcon, SparklesIcon, UserCircleIcon, ArrowPathIcon, ExclamationCircleIcon, HandRaisedIcon } from '@heroicons/react/24/outline';
import { ChatMessage, ChatSession } from '../types'; // Import types

const AIChatPage: React.FC = () => {
    const { user, loading: authLoading } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [loadingAI, setLoadingAI] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom of chat
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (!authLoading && !user) {
            setError('Please log in to use the AI Chat.');
            return;
        }

        // Optional: Fetch previous session history if available
        const fetchSessionHistory = async () => {
            if (user && currentSessionId) { // Only fetch if user and session ID are known
                setLoadingAI(true);
                try {
                    const response = await apiClient.get<ChatSession>(`/chatbot/session/${currentSessionId}`);
                    setMessages(response.data.history);
                } catch (err: any) {
                    console.error('Error fetching chat session history:', err.response?.data || err.message);
                    // If session not found, just start a new one
                    setCurrentSessionId(null);
                    setMessages([]);
                } finally {
                    setLoadingAI(false);
                }
            }
        };

        fetchSessionHistory();
    }, [user, authLoading, currentSessionId]); // Re-fetch if user or session changes

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputMessage.trim() || loadingAI || !user) return;

        setError(null);
        const newMessage: ChatMessage = {
            role: 'user',
            parts: [{ text: inputMessage.trim() }],
            timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, newMessage]);
        setInputMessage('');
        setLoadingAI(true);

        try {
            const payload: { message: string; sessionId?: string } = { message: newMessage.parts[0].text };
            if (currentSessionId) {
                payload.sessionId = currentSessionId;
            }

            const response = await apiClient.post<{ response: string; sessionId: string; history: ChatMessage[] }>('/chatbot/message', payload);
            setCurrentSessionId(response.data.sessionId); // Update session ID
            setMessages(response.data.history); // Use the history returned by the backend for consistency
        } catch (err: any) {
            console.error('Error sending message to AI:', err.response?.data || err.message);
            setError('Failed to get AI response. Please try again.');
            setMessages(prev => [...prev, {
                role: 'model',
                parts: [{ text: 'Oops! I encountered an error. Please try again.' }],
                timestamp: new Date().toISOString(),
            }]);
        } finally {
            setLoadingAI(false);
        }
    };

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <ArrowPathIcon className="h-16 w-16 text-indigo-600 animate-spin" />
                <p className="ml-4 text-xl text-gray-700">Loading Chat...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
                <HandRaisedIcon className="h-20 w-20 text-red-500 mb-4" />
                <p className="text-red-600 text-center text-2xl font-semibold mb-4">Access Denied</p>
                <p className="text-lg text-gray-700">Please log in to use the AI Chat feature.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-12 flex flex-col">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col flex-grow bg-white rounded-2xl shadow-lg overflow-hidden">
                <motion.h1
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-3xl md:text-4xl font-extrabold text-gray-900 pt-8 pb-4 text-center border-b border-gray-200 flex items-center justify-center"
                >
                    <ChatBubbleLeftRightIcon className="h-9 w-9 mr-4 text-purple-600" />
                    AI Learning Assistant
                </motion.h1>

                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mt-4 mx-4 rounded-md" role="alert">
                        <ExclamationCircleIcon className="inline h-5 w-5 mr-2" /> {error}
                    </div>
                )}

                <div className="flex-grow p-6 overflow-y-auto custom-scrollbar">
                    {messages.length === 0 && !loadingAI ? (
                        <div className="text-center text-gray-500 mt-10">
                            <SparklesIcon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                            <p className="text-lg">Start a conversation with your AI learning assistant!</p>
                            <p className="text-sm">Ask me anything about your modules, concepts, or general knowledge.</p>
                        </div>
                    ) : (
                        messages.map((msg, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className={`flex items-start mb-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                {msg.role === 'model' && (
                                    <SparklesIcon className="h-8 w-8 text-purple-500 flex-shrink-0 mr-3 mt-1" />
                                )}
                                <div className={`p-4 rounded-lg shadow-sm max-w-[80%] ${
                                    msg.role === 'user'
                                        ? 'bg-indigo-500 text-white rounded-br-none'
                                        : 'bg-gray-200 text-gray-800 rounded-bl-none'
                                }`}>
                                    <p className="text-sm">{msg.parts[0].text}</p>
                                    <span className="block text-right text-xs mt-1 opacity-80">
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                {msg.role === 'user' && (
                                    <UserCircleIcon className="h-8 w-8 text-blue-500 flex-shrink-0 ml-3 mt-1" />
                                )}
                            </motion.div>
                        ))
                    )}
                    {loadingAI && (
                        <div className="flex justify-start mb-4">
                            <SparklesIcon className="h-8 w-8 text-purple-500 flex-shrink-0 mr-3 mt-1 animate-pulse" />
                            <div className="bg-gray-200 text-gray-800 p-4 rounded-lg shadow-sm rounded-bl-none max-w-[80%]">
                                <p className="text-sm animate-pulse">AI is typing...</p>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="p-6 border-t border-gray-200 flex items-center">
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Ask your AI assistant..."
                        className="flex-grow px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 text-gray-800"
                        disabled={loadingAI}
                    />
                    <button
                        type="submit"
                        className="ml-4 bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-full shadow-md transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loadingAI || !inputMessage.trim()}
                    >
                        <PaperAirplaneIcon className="h-6 w-6" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AIChatPage;
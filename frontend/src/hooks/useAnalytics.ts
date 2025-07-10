// useAnalytics.ts
import { useCallback } from 'react';
import apiClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';

export const useAnalytics = () => {
    const { user, selectedChild } = useAuth();

    const trackEvent = useCallback(
        async (
            eventName: string,
            eventData?: Record<string, any>
        ) => {
            const targetProfileType = selectedChild ? 'Child' : user ? 'User' : 'Anonymous';
            const targetProfileId = selectedChild?._id || user?._id;

            if (!targetProfileType || !targetProfileId) {
                console.warn('Analytics: Missing target profile info. Skipping event.');
                return;
            }

            const payload = {
                eventName,
                eventData: {
                    targetProfileType,
                    targetProfileId,
                    ...eventData,
                    path: window.location.pathname,
                    browser: navigator.userAgent,
                },
            };

            try {
                await apiClient.post('/analytics/event', payload);
                console.log(`Analytics event tracked: ${eventName}`, payload);
            } catch (error) {
                console.error(`Failed to track analytics event ${eventName}:`, error);
            }
        },
        [user, selectedChild]
    );

    return { trackEvent };
};

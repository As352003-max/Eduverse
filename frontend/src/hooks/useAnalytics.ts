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
            const profileKind = selectedChild ? 'child' : user ? 'user' : 'anonymous';
            const profileId = selectedChild?._id || user?._id || null; 

            if (profileKind === 'anonymous' && !profileId) {
                console.log('Analytics: Tracking anonymous event without specific ID.');
            } else if (!profileKind || (profileKind !== 'anonymous' && !profileId)) {
                console.warn('Analytics: Missing profile kind or ID for non-anonymous user. Skipping event.', { profileKind, profileId, eventName });
                return;
            }

            const payload = {
                eventName,
                profile: {
                    kind: profileKind,
                    ...(profileId && { id: profileId }), 
                },
                eventData: {
                    ...eventData,
                    path: window.location.pathname,
                    browser: navigator.userAgent,
                },
                initiatedByUserId: user?._id || null, 
            };

            console.log(`[Analytics] Preparing to send event: ${eventName} with payload:`, JSON.stringify(payload, null, 2));

            try {
                const response = await apiClient.post('/analytics/event', payload);
                console.log(`[Analytics] Event tracked: ${eventName}`, response.data);
            } catch (error: any) {
                console.error(`[Analytics] Failed to track analytics event ${eventName}:`, error);
                if (error.response && error.response.data) {
                    console.error('[Analytics] Backend error details:', error.response.data);
                }
            }
        },
        [user, selectedChild]
    );

    return { trackEvent };
};

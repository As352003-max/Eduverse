const AnalyticsEvent = require('../models/AnalyticsEvent');

exports.trackEvent = async (req, res) => {
    try {
        const {
            eventName,
            targetProfileType,
            targetProfileId,
            ...eventData
        } = req.body;

        if (!eventName || typeof eventName !== 'string' || eventName.trim() === '') {
            return res.status(400).json({ message: 'Event name is required and must be a non-empty string.' });
        }

        const initiatedByUserId = req.user ? req.user._id : null;

        const ipAddress = req.headers['x-forwarded-for']?.split(',')[0].trim() ||
                          req.connection.remoteAddress ||
                          req.socket.remoteAddress;

        const validProfileKinds = ['user', 'child', 'anonymous'];
        let finalProfileKind = targetProfileType;

        if (finalProfileKind && !validProfileKinds.includes(finalProfileKind)) {
            return res.status(400).json({ message: `Invalid profile kind provided: "${targetProfileType}". Must be one of: ${validProfileKinds.join(', ')}.` });
        } else if (!finalProfileKind) {
            finalProfileKind = 'anonymous';
        }

        const finalProfileId = (finalProfileKind === 'anonymous' || !targetProfileId) ? null : targetProfileId;

        const newEvent = new AnalyticsEvent({
            eventName,
            profile: {
                id: finalProfileId,
                kind: finalProfileKind,
            },
            eventData: eventData,
            ipAddress,
            initiatedByUserId,
        });

        await newEvent.save();

        res.status(200).json({ message: 'Analytics event tracked successfully.' });

    } catch (error) {
        console.error('Error tracking analytics event:', error);

        const errorMessage = process.env.NODE_ENV === 'development' ? error.message : 'Internal server error while tracking analytics event.';
        const errorStack = process.env.NODE_ENV === 'development' ? error.stack : undefined;

        res.status(500).json({
            message: errorMessage,
            details: errorStack,
        });
    }
};

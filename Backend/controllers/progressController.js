const asyncHandler = require('express-async-handler');
const { getUserDoc } = require('../utils/firestoreHelpers');
const admin = require('firebase-admin');

exports.markTextAsRead = asyncHandler(async (req, res) => {
    const { moduleId, contentId } = req.body;
    const userId = req.user?.uid;

    if (!userId) {
        console.error("markTextAsRead: User ID missing from authenticated request.");
        return res.status(401).json({ message: "Not authorized: User ID missing or invalid." });
    }

    try {
        const userDocRef = getUserDoc(userId);
        await userDocRef.update({
            [`progress.${moduleId}.readContent.${contentId}`]: true,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        res.status(200).json({ message: 'Text marked as read successfully' });
    } catch (error) {
        console.error('🔥 markTextAsRead ERROR:', error);
        if (error.message.includes("Invalid userId")) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: "Failed to mark text as read", details: error.message });
    }
});

exports.updateVideoWatchTime = asyncHandler(async (req, res) => {
    const { moduleId, contentId, secondsWatched } = req.body;
    const userId = req.user?.uid;

    if (!userId) {
        console.error("updateVideoWatchTime: User ID missing from authenticated request.");
        return res.status(401).json({ message: "Not authorized: User ID missing or invalid." });
    }

    if (typeof secondsWatched !== 'number' || secondsWatched < 0) {
        return res.status(400).json({ message: "Invalid secondsWatched value." });
    }

    try {
        const userDocRef = getUserDoc(userId);
        await userDocRef.update({
            [`progress.${moduleId}.videoWatchTime.${contentId}`]: admin.firestore.FieldValue.increment(secondsWatched),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        res.status(200).json({ message: 'Video watch time updated successfully' });
    } catch (error) {
        console.error('🔥 updateVideoWatchTime ERROR:', error);
        if (error.message.includes("Invalid userId")) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: "Failed to update video watch time", details: error.message });
    }
});
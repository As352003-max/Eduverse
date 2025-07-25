const admin = require('firebase-admin');
const db = admin.firestore();

exports.getUserDoc = (userId) => {
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
        console.error('🔥 FirestoreHelper Error: Invalid userId provided to getUserDoc:', userId);
        throw new Error("Invalid userId: User ID must be a non-empty string.");
    }
    return db.collection('users').doc(userId);
};
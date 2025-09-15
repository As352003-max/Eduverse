const admin = require('firebase-admin');

// ✅ Ensure Firebase is initialized
if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });

    console.log("✅ Firebase initialized successfully");
  } catch (err) {
    console.error("❌ Firebase initialization failed:", err.message);
  }
}

const db = admin.firestore();

/**
 * Get a Firestore document reference for a user
 * @param {string} userId
 * @returns {FirebaseFirestore.DocumentReference}
 */
function getUserDoc(userId) {
  if (!userId || typeof userId !== 'string' || userId.trim() === '') {
    console.error('🔥 FirestoreHelper Error: Invalid userId provided to getUserDoc:', userId);
    throw new Error("Invalid userId: User ID must be a non-empty string.");
  }

  if (!db) {
    throw new Error("Firestore not initialized. Check Firebase config.");
  }

  return db.collection('users').doc(userId);
}

module.exports = { getUserDoc, db };

const admin = require("firebase-admin");

let serviceAccount;

try {
  if (process.env.FIREBASE_CONFIG) {
    // ✅ Parse ENV and fix escaped newlines
    serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
    console.log("✅ Firebase credentials loaded from Render ENV");
  } else {
    // ✅ Local fallback for development
    // serviceAccount = require("../config/serviceAccountKey.json");
    console.log("✅ Firebase credentials loaded from local file");
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
} catch (err) {
  console.error("❌ Firebase initialization failed:", err);
}

const db = admin.firestore();
module.exports = { admin, db };

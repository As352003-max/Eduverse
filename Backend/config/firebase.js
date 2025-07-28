const admin = require("firebase-admin");

let serviceAccount;

try {
  if (process.env.FIREBASE_CONFIG) {
    serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);
    console.log("✅ Firebase credentials loaded from ENV");
  } else {
    serviceAccount = require("../config/serviceAccountKey.json");
    console.log("✅ Firebase credentials loaded from local file");
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
} catch (err) {
  console.error("❌ Firebase initialization failed:", err.message);
}

const db = admin.firestore();
module.exports = { admin, db };

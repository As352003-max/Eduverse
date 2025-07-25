const admin = require('firebase-admin');
const dotenv = require('dotenv');
dotenv.config();

let serviceAccount;
try {
  serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);
} catch (e) {
  console.error("Error parsing FIREBASE_CONFIG. Please ensure it is a valid stringified JSON for your Firebase service account key.");
  console.error("The error was:", e.message);
  process.exit(1);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });
}

module.exports = admin;
const admin = require('firebase-admin');
const dotenv = require('dotenv');
dotenv.config();

let serviceAccount;
try {
  serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);
} catch (e) {
  console.error("Invalid FIREBASE_CONFIG JSON:", e.message);
  process.exit(1);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });
}

module.exports = admin;

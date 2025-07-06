const admin = require('firebase-admin');
const dotenv = require('dotenv');
dotenv.config();

const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig),
  });
}

module.exports = admin;

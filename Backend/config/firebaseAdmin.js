
require('dotenv').config();

const admin = require('firebase-admin');

// Parse the FIREBASE_CONFIG environment variable
const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;

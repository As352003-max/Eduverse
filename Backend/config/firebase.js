const admin = require('firebase-admin');

let serviceAccount;

if (process.env.NODE_ENV === 'production') {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);
  } catch (err) {
    console.error('❌ Failed to parse FIREBASE_CONFIG environment variable', err);
    process.exit(1);
  }
} else {
  serviceAccount = require('../config/serviceAccountKey.json');
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

module.exports = { admin, db };

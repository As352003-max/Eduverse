const admin = require('firebase-admin');
const { getDatabase } = require('firebase-admin/database');
const serviceAccount = require('../config/serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://your-project-id.firebaseio.com', // Replace this!
  });
}

const db = admin.firestore();
const rtdb = getDatabase();

module.exports = { admin, db, rtdb };

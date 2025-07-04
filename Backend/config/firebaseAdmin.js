// config/firebaseAdmin.js
const admin = require('firebase-admin');

// Corrected path to your service account key.
// IMPORTANT: Make sure 'serviceAccountKey.json' is in a 'secrets' subfolder
// inside your 'config' folder, or adjust this path accordingly.
const serviceAccount = require('./secrets/serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
    // You might also add a databaseURL here if you're using Realtime Database
    // databaseURL: "https://YOUR-PROJECT-ID.firebaseio.com"
});

module.exports = admin;

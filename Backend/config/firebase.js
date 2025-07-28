
const admin = require('firebase-admin');

if (!process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  console.error('ERROR: FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.');
  console.error('Please ensure you have configured this environment variable on your Render service.');
  process.exit(1);
}

let serviceAccount;
try {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
} catch (e) {
  console.error('ERROR: Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY environment variable. It might not be valid JSON.', e);
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;

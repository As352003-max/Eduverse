// routes/users.js
const express = require('express');
const admin = require('firebase-admin');

const router = express.Router();

router.get('/auth-users', async (req, res) => {
  try {
    const users = [];
    let nextPageToken;

    do {
      const result = await admin.auth().listUsers(1000, nextPageToken);
      result.users.forEach((userRecord) => {
        users.push({
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName
        });
      });
      nextPageToken = result.pageToken;
    } while (nextPageToken);

    res.json(users);
  } catch (error) {
    console.error('Error fetching auth users:', error);
    res.status(500).json({ error: 'Failed to fetch auth users' });
  }
});

module.exports = router; // ✅ CommonJS export

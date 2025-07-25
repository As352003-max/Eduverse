// routes/users.js or similar
import express from 'express';
import admin from 'firebase-admin';

const router = express.Router();

// GET all users' UID + email or name
router.get('/auth-users', async (req, res) => {
  try {
 const users = []; // ✅ JavaScript version

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

export default router;

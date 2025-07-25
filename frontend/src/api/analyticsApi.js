import { db } from '../utils/firebase';

export async function getUserAnalytics(userId) {
  try {
    const doc = await db.collection('progress').doc(userId).get();
    if (doc.exists) {
      return doc.data();
    } else {
      return {
        quizProgress: {},
        recentActivity: []
      };
    }
  } catch (error) {
    console.error("🔥 getUserAnalytics failed:", error);
    throw error;
  }
}

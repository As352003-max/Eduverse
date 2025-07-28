const { db } = require('../utils/firebase'); // Firestore instance

const getToday = () => new Date().toISOString().split('T')[0];
const getCurrentTime = () => new Date().toTimeString().split(' ')[0];

async function markTextAsRead(userId, moduleId, contentId) {
  if (!userId || !moduleId || !contentId) throw new Error("Missing required fields");
  try {
    const today = getToday();
    const fieldPath = `textProgress.${moduleId}.${contentId}.${today}`;
    await db.collection('progress').doc(userId).set({ [fieldPath]: true }, { merge: true });
    console.log(`✅ Text marked as read: ${fieldPath}`);
  } catch (error) {
    console.error("🔥 markTextAsRead ERROR:", error);
    throw new Error("Failed to mark text as read");
  }
}

async function updateVideoProgress(userId, moduleId, contentId, watchTime) {
  if (!userId || !moduleId || !contentId || watchTime == null) throw new Error("Missing required fields");
  try {
    const today = getToday();
    const currentTime = getCurrentTime();
    const fieldPath = `videoProgress.${moduleId}.${contentId}.${today}.${currentTime}`;
    await db.collection('progress').doc(userId).set({ [fieldPath]: watchTime }, { merge: true });
    console.log(`✅ Video watch time saved: ${fieldPath}`);
  } catch (error) {
    console.error("🔥 updateVideoProgress ERROR:", error);
    throw new Error("Failed to update video progress");
  }
}

async function saveQuizResult(userId, moduleId, contentId, correctAnswers, answers) {
  if (!userId || !moduleId || !contentId || correctAnswers == null || !Array.isArray(answers)) {
    throw new Error("Missing or invalid required fields");
  }
  try {
    const today = getToday();
    const currentTime = getCurrentTime();
    const timestampId = `${today}_${currentTime}`;
    const fieldPath = `quizProgress.${moduleId}.${contentId}.${timestampId}`;

    const data = {
      correctAnswers,
      totalQuestions: answers.length,
      answers,
      submittedAt: new Date().toISOString(),
    };

    const progressRef = db.collection('progress').doc(userId);
    const batch = db.batch();
    batch.set(progressRef, { [fieldPath]: data }, { merge: true });

    if (correctAnswers === answers.length) {
      const doc = await progressRef.get();
      const currentBandages = doc.exists && doc.data().bandages ? doc.data().bandages : 0;
      batch.set(progressRef, { bandages: currentBandages + 1 }, { merge: true });
      console.log("🎉 Bandage awarded in Firestore progress!");
    }

    await batch.commit();
    console.log(`✅ Quiz progress saved: ${fieldPath}`);
  } catch (error) {
    console.error("🔥 saveQuizResult ERROR:", error);
    throw new Error("Failed to save quiz result");
  }
}

module.exports = { markTextAsRead, updateVideoProgress, saveQuizResult };

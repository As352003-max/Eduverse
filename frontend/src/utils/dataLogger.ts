// src/utils/dataLogger.ts

import { db } from "../firebase";
import { ref, set, push } from "firebase/database"; // ✅ make sure you use `push` for unique IDs

export const logDataExample = async ({
  level,
  grade,
  hint,
  category,
  options,
  correctAnswer,
  aiGuess,
  userSelected,
  isCorrect,
  responseTime,
  explanation, // ✅ NEW
}: {
  level: number;
  grade: number;
  hint: string;
  category: string;
  options: string[];
  correctAnswer: string;
  aiGuess: string;
  userSelected: string;
  isCorrect: boolean;
  responseTime: number;
  explanation?: string; // ✅ Make optional if not always available
}) => {
  const entry = {
    timestamp: Date.now(),
    level,
    grade,
    category,
    hint,
    options,
    correctAnswer,
    aiGuess,
    userSelected,
    isCorrect,
    responseTime,
    explanation, // ✅ Log explanation
  };


console.log("📅 Logged training example:", entry);

  try {
    const logRef = ref(db, "trainingLogs");
    await push(logRef, entry); // 🔥 push auto-generates unique ID
    console.log("✅ Log saved to Firebase");
  } catch (error) {
    console.error("❌ Failed to save log:", error);
  }
};


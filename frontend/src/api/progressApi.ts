import axios from './axiosClient';

export async function markTextAsRead(userId: string, moduleId: string, contentId: number) {
  return axios.post('/progress/read', { userId, moduleId, contentId });
}

export async function updateVideoWatchTime(userId: string, moduleId: string, contentId: number, watchTime: number) {
  return axios.post('/progress/watch', { userId, moduleId, contentId, watchTime });
}

export async function recordQuizResult(
  userId: string,
  moduleId: string,
  contentId: string,
  score: number,
  total: number,
  answers: string[],
  bandage?: boolean
) {
  return axios.post('/progress/quiz', {
    userId,
    moduleId,
    contentId,
    score,
    total,
    answers,
    bandage, // ✅ include in payload
  });
}




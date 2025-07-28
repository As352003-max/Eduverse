import axios from './axiosClient';

// ✅ Mark text as read
export async function markTextAsRead(userId: string, moduleId: string, contentId: string) {
  return axios.post('/progress/read', { userId, moduleId, contentId });
}

// ✅ Update video watch time
export async function updateVideoWatchTime(userId: string, moduleId: string, contentId: string, watchTime: number) {
  return axios.post('/progress/watch', { userId, moduleId, contentId, watchTime });
}

// ✅ Record quiz result
export async function recordQuizResult(
  userId: string,
  moduleId: string,
  contentId: string,
  score: number,
  total: number,
  answers: string[],
  badge?: boolean
) {
  return axios.post('/progress/quiz', {
    userId,
    moduleId,
    contentId,
    score,
    total,
    answers,
    badge,
  });
}

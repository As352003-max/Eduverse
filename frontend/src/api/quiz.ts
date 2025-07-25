import apiClient from './axiosClient';

export async function recordQuizResult(
  userId: string,
  moduleId: string,
  contentIndex: number,
  isCorrect: boolean
) {
  return apiClient.post('/progress/record-quiz', {
    userId,
    moduleId,
    contentIndex,
    isCorrect,
  });
}

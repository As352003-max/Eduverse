import axiosClient from './axiosClient';
import { MathMazeGame, SubmitAnswerResponse } from '../types/mathMazeTypes';

export const startMathMazeGame = async (moduleId: string): Promise<MathMazeGame> => {
    const response = await axiosClient.post(`/game/mathmaze/start/${moduleId}`);
    return response.data;
};

export const submitMathMazeAnswer = async (
    gameId: string,
    answer: string,
    attemptedMove: { row: number, col: number }
): Promise<SubmitAnswerResponse> => {
    const response = await axiosClient.post(`/game/mathmaze/submit-answer/${gameId}`, { answer, attemptedMove });
    return response.data;
};

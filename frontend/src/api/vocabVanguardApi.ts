import axiosClient from './axiosClient';
import { VocabVanguardGame, VocabGuessResponse } from '../types/vocabVanguardTypes';

export const startVocabVanguardGame = async (moduleId: string): Promise<VocabVanguardGame> => {
    const response = await axiosClient.post(`/game/vocabvanguard/start/${moduleId}`);
    return response.data;
};

export const submitVocabVanguardGuess = async (
    gameId: string,
    guess: string
): Promise<VocabGuessResponse> => {
    const response = await axiosClient.post(`/game/vocabvanguard/guess/${gameId}`, { guess });
    return response.data;
};

export const getVocabVanguardGameStatus = async (gameId: string): Promise<VocabVanguardGame> => {
    const response = await axiosClient.get(`/game/vocabvanguard/status/${gameId}`);
    return response.data;
};

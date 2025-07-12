import axiosClient from './axiosClient';
import {
    LogicCircuitGame,
    LogicCircuitActionResponse,
    CircuitGate,
    CircuitWire,
} from '../types/logicCircuitTypes';

export const startLogicCircuitGame = async (moduleId: string, difficulty: string): Promise<LogicCircuitGame> => {
    const response = await axiosClient.post(`/game/logiccircuit/start/${moduleId}`, { difficulty });
    return response.data;
};

export const saveLogicCircuit = async (
    gameId: string,
    userCircuit: { gates: CircuitGate[], wires: CircuitWire[] }
): Promise<LogicCircuitActionResponse> => {
    const response = await axiosClient.post(`/game/logiccircuit/save/${gameId}`, { userCircuit });
    return response.data;
};

export const testLogicCircuit = async (
    gameId: string,
    userCircuit: { gates: CircuitGate[], wires: CircuitWire[] }
): Promise<LogicCircuitActionResponse> => {
    const response = await axiosClient.post(`/game/logiccircuit/test/${gameId}`, { userCircuit });
    return response.data;
};

export const getLogicCircuitGameStatus = async (gameId: string): Promise<LogicCircuitGame> => {
    const response = await axiosClient.get(`/game/logiccircuit/status/${gameId}`);
    return response.data;
};

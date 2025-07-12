export interface Position {
    row: number;
    col: number;
}

export interface Problem {
    question: string;
    answer: string;
    problemType: string;
}

export interface MathMazeGame {
    _id: string;
    userId: string;
    moduleId: string;
    mazeId: string;
    mazeLayout: number[][];
    currentPosition: Position;
    targetPosition: Position;
    currentProblem: Problem;
    pathTaken: Position[];
    movesCount: number;
    problemsSolved: number;
    incorrectAttempts: number;
    startTime: string;
    endTime?: string;
    completed: boolean;
    xpEarned: number;
    createdAt: string;
    updatedAt: string;
}

export interface SubmitAnswerResponse {
    msg: string;
    correct: boolean;
    game: MathMazeGame;
}
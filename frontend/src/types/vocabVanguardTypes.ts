export interface VocabVanguardProblem {
    word: string;
    definition: string;
    hint: string;
    imageUrl: string | null;
}

export interface VocabVanguardGame {
    _id: string;
    userId: string;
    moduleId: string;
    currentWord: VocabVanguardProblem;
    guessesMade: number;
    maxGuesses: number;
    incorrectLetters: string[];
    correctlyGuessedLetters: string[];
    completed: boolean;
    won: boolean;
    startTime: string;
    endTime?: string;
    xpEarned: number;
    createdAt: string;
    updatedAt: string;
}

export interface VocabGuessResponse {
    msg: string;
    game: VocabVanguardGame;
}
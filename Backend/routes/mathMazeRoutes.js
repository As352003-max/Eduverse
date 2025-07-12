const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const MathMazeGame = require('../models/MathMazeGame');
const User = require('../models/User');
const { generateMaze } = require('../utils/mazeGenerator');
const { generateProblem } = require('../utils/problemGenerator');
const { calculateXp, checkAndAwardBadges } = require('../utils/gamificationUtils');
const mongoose = require('mongoose');

router.post('/start/:moduleId', authMiddleware.protect, async (req, res) => {
    try {
        const userId = req.user.id;
        const moduleId = req.params.moduleId;

        const mazeRows = 10;
        const mazeCols = 10;
        const problemDifficulty = 'easy';

        const mazeLayout = generateMaze(mazeRows, mazeCols);
        const startPosition = { row: 0, col: 0 };
        const targetPosition = { row: mazeRows - 1, col: mazeCols - 1 };

        const initialProblem = generateProblem('addition', problemDifficulty);

        const newGame = new MathMazeGame({
            userId,
            moduleId,
            mazeId: new mongoose.Types.ObjectId().toString(),
            mazeLayout,
            currentPosition: startPosition,
            targetPosition,
            currentProblem: initialProblem,
            pathTaken: [startPosition]
        });

        await newGame.save();
        res.status(201).json(newGame);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.post('/submit-answer/:gameId', authMiddleware.protect, async (req, res) => {
    const { answer, attemptedMove } = req.body;
    const gameId = req.params.gameId;
    const userId = req.user.id;

    try {
        let game = await MathMazeGame.findById(gameId);

        if (!game || game.userId.toString() !== userId || game.completed) {
            return res.status(404).json({ msg: 'Game not found or already completed' });
        }

        const isCorrect = game.currentProblem.answer.toLowerCase() === String(answer).toLowerCase();

        if (isCorrect) {
            game.problemsSolved++;

            const newRow = game.currentPosition.row + attemptedMove.row;
            const newCol = game.currentPosition.col + attemptedMove.col;

            if (newRow >= 0 && newRow < game.mazeLayout.length &&
                newCol >= 0 && newCol < game.mazeLayout[0].length &&
                game.mazeLayout[newRow][newCol] === 0) {
                
                game.currentPosition = { row: newRow, col: newCol };
                game.pathTaken.push(game.currentPosition);
                game.movesCount++;

                if (game.currentPosition.row === game.targetPosition.row &&
                    game.currentPosition.col === game.targetPosition.col) {
                    game.completed = true;
                    game.endTime = Date.now();
                    game.xpEarned = calculateXp({
                        type: 'mathmaze',
                        completed: true,
                        problemsSolved: game.problemsSolved,
                        incorrectAttempts: game.incorrectAttempts,
                        timeTaken: (game.endTime - game.startTime) / 1000
                    });

                    const user = await User.findById(userId);
                    if (user) {
                        user.totalXp = (user.totalXp || 0) + game.xpEarned; // Use totalXp
                        const newlyAwardedBadges = checkAndAwardBadges(user, { type: 'mathmaze', completed: true });
                        await user.save();
                        res.status(200).json({ msg: 'Correct!', correct: true, game, newlyAwardedBadges });
                        return;
                    }
                } else {
                    game.currentProblem = generateProblem(game.currentProblem.problemType, 'easy');
                }
            } else {
                return res.status(400).json({ msg: 'Invalid move attempted, even with correct answer.' });
            }

        } else {
            game.incorrectAttempts++;
            await game.save();
            return res.status(200).json({ msg: 'Incorrect answer. Try again!', correct: false, game });
        }

        await game.save();
        res.status(200).json({ msg: isCorrect ? 'Correct!' : 'Incorrect!', correct: isCorrect, game });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
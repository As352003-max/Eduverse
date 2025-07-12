const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const LogicCircuitGame = require('../models/LogicCircuitGame');
const User = require('../models/User');
const { evaluateCircuit, generateLogicChallenge } = require('../utils/circuitEvaluator');
const { calculateXp, checkAndAwardBadges } = require('../utils/gamificationUtils');

router.post('/start/:moduleId', authMiddleware.protect, async (req, res) => {
    try {
        const userId = req.user.id;
        const moduleId = req.params.moduleId;

        const difficulty = req.body.difficulty || 'easy';
        const challenge = generateLogicChallenge(difficulty);

        const newGame = new LogicCircuitGame({
            userId,
            moduleId,
            challenge,
            userCircuit: { gates: [], wires: [] }
        });

        await newGame.save();
        res.status(201).json(newGame);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.post('/save/:gameId', authMiddleware.protect, async (req, res) => {
    const { userCircuit } = req.body;
    const gameId = req.params.gameId;
    const userId = req.user.id;

    try {
        let game = await LogicCircuitGame.findById(gameId);

        if (!game || game.userId.toString() !== userId || game.completed) {
            return res.status(404).json({ msg: 'Game not found or already completed' });
        }

        game.userCircuit = userCircuit;
        await game.save();
        res.status(200).json({ msg: 'Circuit saved!', game });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error'); // Corrected: Removed duplicate code here
    }
});

router.post('/test/:gameId', authMiddleware.protect, async (req, res) => {
    const { userCircuit } = req.body;
    const gameId = req.params.gameId;
    const userId = req.user.id;

    try {
        let game = await LogicCircuitGame.findById(gameId);

        if (!game || game.userId.toString() !== userId || game.completed) {
            return res.status(404).json({ msg: 'Game not found or already completed' });
        }

        game.attempts++;
        const testResults = [];
        let passedAllTests = true;

        for (const testCase of game.challenge.truthTable) {
            const userOutput = evaluateCircuit(userCircuit, testCase.inputs);
            const correct = JSON.stringify(userOutput) === JSON.stringify(testCase.expectedOutput);
            testResults.push({ inputs: testCase.inputs, userOutput, correct });
            if (!correct) {
                passedAllTests = false;
            }
        }

        game.testResults = testResults;

        if (passedAllTests) {
            game.completed = true;
            game.passedAllTests = true;
            game.endTime = Date.now();
            game.xpEarned = calculateXp({
                type: 'logiccircuit',
                passed: true,
                timeTaken: (game.endTime - game.startTime) / 1000,
                attempts: game.attempts,
                complexity: game.challenge.truthTable.length
            });

            const user = await User.findById(userId);
            if (user) {
                user.totalXp = (user.totalXp || 0) + game.xpEarned;
                const newlyAwardedBadges = checkAndAwardBadges(user, { type: 'logiccircuit', completed: true, passed: true });
                await user.save();
                res.status(200).json({ msg: 'All tests passed!', game, newlyAwardedBadges });
                return;
            }
        } else {
            game.xpEarned = calculateXp({
                type: 'logiccircuit',
                passed: false,
                attempts: game.attempts,
                complexity: game.challenge.truthTable.length
            });
        }

        await game.save();
        res.status(200).json({ msg: passedAllTests ? 'All tests passed!' : 'Tests failed. Keep trying!', game });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.get('/status/:gameId', authMiddleware.protect, async (req, res) => {
    try {
        const game = await LogicCircuitGame.findById(req.params.gameId);
        if (!game || game.userId.toString() !== req.user.id) {
            return res.status(404).json({ msg: 'Game not found or unauthorized' });
        }
        res.json(game);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
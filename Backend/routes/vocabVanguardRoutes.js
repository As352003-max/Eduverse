const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware'); // This imports an object { protect, authorizeRoles }
const VocabVanguardGame = require('../models/VocabVanguardGame');
const User = require('../models/User');
const { generateVocabProblem } = require('../utils/vocabGenerator');
const { calculateXp } = require('../utils/gamificationUtils');

router.post('/start/:moduleId', authMiddleware.protect, async (req, res) => {
    try {
        const userId = req.user.id;
        const moduleId = req.params.moduleId;

        const moduleTopic = 'default';
        const difficulty = 'easy';

        const problem = generateVocabProblem(moduleTopic, difficulty);

        const newGame = new VocabVanguardGame({
            userId,
            moduleId,
            currentWord: {
                word: problem.word,
                definition: problem.definition,
                hint: problem.hint,
                imageUrl: problem.imageUrl
            }
        });

        await newGame.save();
        res.status(201).json(newGame);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.post('/guess/:gameId', authMiddleware.protect, async (req, res) => {
    const { guess } = req.body;
    const gameId = req.params.gameId;
    const userId = req.user.id;

    try {
        let game = await VocabVanguardGame.findById(gameId);

        if (!game || game.userId.toString() !== userId || game.completed) {
            return res.status(404).json({ msg: 'Game not found or already completed' });
        }

        const normalizedGuess = String(guess).toLowerCase();
        const targetWord = game.currentWord.word.toLowerCase(); // Ensure target word is also lowercase for consistent comparison
        let message = '';
        let hintArray = game.currentWord.hint.split('');
        let updatedCorrectLetters = [...game.correctlyGuessedLetters];
        let updatedIncorrectLetters = [...game.incorrectLetters];
        let won = false;
        let completed = false;

        if (normalizedGuess.length === 1) {
            if (targetWord.includes(normalizedGuess)) {
                if (!updatedCorrectLetters.includes(normalizedGuess)) {
                    updatedCorrectLetters.push(normalizedGuess);
                }
                // Update the hint array based on the actual word and correctly guessed letters
                hintArray = targetWord.split('').map(char => updatedCorrectLetters.includes(char) ? char : '_');
                message = 'Correct letter!';
            } else {
                if (!updatedIncorrectLetters.includes(normalizedGuess)) {
                    updatedIncorrectLetters.push(normalizedGuess);
                    game.guessesMade++;
                }
                message = 'Incorrect letter!';
            }
        } else if (normalizedGuess.length > 1) {
            if (normalizedGuess === targetWord) {
                won = true;
                completed = true;
                hintArray = targetWord.split(''); // Reveal the entire word
                message = 'You guessed the word!';
            } else {
                game.guessesMade++;
                message = 'Incorrect word guess!';
            }
        } else {
            return res.status(400).json({ msg: 'Invalid guess.' });
        }

        game.currentWord.hint = hintArray.join('');
        game.correctlyGuessedLetters = updatedCorrectLetters;
        game.incorrectLetters = updatedIncorrectLetters;

        // Check if the word is fully guessed by letters
        if (!won && hintArray.join('') === targetWord) {
            won = true;
            completed = true;
            message = 'You correctly revealed the word!';
        }

        if (game.guessesMade >= game.maxGuesses && !won) {
            completed = true;
            message = `Game Over! The word was "${game.currentWord.word}".`; // Use original word for display
        }

        if (completed) {
            game.completed = true;
            game.won = won;
            game.endTime = Date.now();
            game.xpEarned = calculateXp({
                type: 'vocabvanguard',
                won: won,
                timeTaken: (game.endTime - game.startTime) / 1000,
                guessesMade: game.guessesMade,
                maxGuesses: game.maxGuesses,
                wordLength: targetWord.length
            });

            const user = await User.findById(userId);
            if (user) {
                user.xp = (user.xp || 0) + game.xpEarned;
                await user.save();
            }
        }

        await game.save();
        res.status(200).json({ msg: message, game });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.get('/status/:gameId', authMiddleware.protect, async (req, res) => {
    try {
        const game = await VocabVanguardGame.findById(req.params.gameId);
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
const express = require('express');
const router = express.Router();
const { getQuizzes, submitQuiz } = require('../controllers/quizController');

router.get('/:moduleId', getQuizzes);   // Fetch quizzes for a module
router.post('/submit', submitQuiz);     // Submit quiz answers

module.exports = router;

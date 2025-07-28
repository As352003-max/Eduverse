const LearningModule = require('../models/LearningModule');
const ModuleProgress = require('../models/ModuleProgress');

// ✅ Get all quizzes for a module
exports.getQuizzes = async (req, res) => {
  try {
    const module = await LearningModule.findById(req.params.moduleId);
    if (!module) return res.status(404).json({ error: 'Module not found' });

    const quizzes = [];
    module.topics.forEach(topic => {
      topic.content.forEach(item => {
        if (item.type === 'quiz') quizzes.push(item);
      });
    });

    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
};

// ✅ Submit quiz results
exports.submitQuiz = async (req, res) => {
  const { userId, moduleId, score, total, answers } = req.body;

  if (!userId || !moduleId || score == null || total == null) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    let progress = await ModuleProgress.findOne({ userId, moduleId });
    if (!progress) {
      progress = new ModuleProgress({ userId, moduleId });
    }

    progress.score = score;
    progress.totalQuestions = total;
    progress.answers = answers || [];
    progress.progress = Math.round((score / total) * 100);
    progress.completed = score === total;

    await progress.save();
    res.json({ message: 'Quiz result saved', progress });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save quiz result' });
  }
};

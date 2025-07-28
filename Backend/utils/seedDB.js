const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const User = require('../models/User');
const LearningModule = require('../models/LearningModule');
const GameProgress = require('../models/GameProgress');
const ChatSession = require('../models/ChatSession');
const Project = require('../models/Project');
const Reward = require('../models/Reward');

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected for seeding...');

        console.log('🗑️ Clearing existing data...');
        await User.deleteMany({});
        await LearningModule.deleteMany({});
        await GameProgress.deleteMany({});
        await ChatSession.deleteMany({});
        await Project.deleteMany({});
        await Reward.deleteMany({});
        console.log('✅ Existing data cleared.');

        const hashedPassword = await bcrypt.hash('password123', 10);

        console.log('👤 Creating sample users...');
        const adminUser = await User.create({
            username: 'adminuser',
            email: 'admin@example.com',
            password: hashedPassword,
            role: 'admin',
            totalXp: 1500,
            currentLevel: 15,
            badges: ['First Login', 'Super Admin'],
        });

        const studentUser = await User.create({
            username: 'studentuser',
            email: 'student@example.com',
            password: hashedPassword,
            role: 'student',
            grade: 8,
            totalXp: 350,
            currentLevel: 4,
            badges: ['First Completion', 'Quiz Master'],
        });

        console.log('✅ Users created.');

        console.log('📚 Creating learning modules...');

        const modules = [
         {
    title: 'Foundations of AI',
    description: 'Learn the basics of Artificial Intelligence through interactive lessons.',
    gradeLevel: { min: 1, max: 3 },
    xpAward: 120,
    thumbnailUrl: 'https://img.youtube.com/vi/kQPC4_DsJ8I/0.jpg',
    topics: [{
      title: 'AI Basics',
      level: 'beginner',
      content: [
        { type: 'text', data: { text: 'Artificial Intelligence (AI) is when computers can think and learn like humans.' } },
        { type: 'video', title: 'What is AI?', data: { url: 'https://www.youtube.com/watch?v=kQPC4_DsJ8I' } },
        { type: 'quiz', title: 'AI Quiz', data: { question: 'What does AI stand for?', options: ['Artificial Information','Automated Intelligence','Artificial Intelligence','Advanced Interaction'], correctAnswer: 'Artificial Intelligence' } }
      ]
    }]
  },
            {
                title: 'Machine Learning Basics',
                description: 'Explore how machines learn from data and improve over time.',
                gradeLevel: { min: 4, max: 6 },
                xpAward: 180,
                thumbnailUrl: "https://img.youtube.com/vi/kCc8FmEb1nY/0.jpg",
                topics: [{
                    title: 'ML Overview',
                    level: 'intermediate',
                    content: [
                        { type: 'text', data: { text: 'Machine Learning is a subset of AI where computers learn from examples.' } },
                        { type: 'video', title: 'How Machines Learn', data: { url: 'https://www.youtube.com/watch?v=kCc8FmEb1nY' } },
                        { type: 'quiz', title: 'ML Basics Quiz', data: { question: 'How is ML different from traditional programming?', options: ['It uses more math','It learns from data','It is faster','It needs less memory'], answer: 'It learns from data' } }
                    ]
                }]
            },
            {
    title: 'Deep Learning & Neural Networks',
    description: 'Understand how deep learning and neural networks power AI applications.',
    gradeLevel: { min: 7, max: 10 },
    xpAward: 250,
    thumbnailUrl: 'https://img.youtube.com/vi/aircAruvnKk/0.jpg',
    topics: [{
      title: 'Deep Learning Intro',
      level: 'advanced',
      content: [
        { type: 'text', data: { text: 'Deep Learning uses layers of neural networks inspired by the human brain.' } },
        { type: 'video', title: 'Neural Networks Explained', data: { url: 'https://www.youtube.com/watch?v=aircAruvnKk' } },
        { type: 'quiz', title: 'Deep Learning Quiz', data: { question: 'What biological system inspires Neural Networks?', options: ['Heart','Brain','Roots','Wings'], correctAnswer: 'Brain' } }
      ]
    }]
  }
];
        

        const createdModules = await LearningModule.insertMany(modules);
        console.log('✅ Learning modules created.');

        await GameProgress.create({
            userId: studentUser._id,
            moduleId: createdModules[0]._id,
            progress: 100,
            score: 95,
            completed: true
        });

        console.log('🏆 Creating rewards...');
        await Reward.create([
            { name: 'First Completion', description: 'Awarded for completing your first module.', type: 'badge' },
            { name: 'Quiz Master', description: 'Awarded for achieving a high quiz score.', type: 'badge' }
        ]);

        console.log('🎉 Database seeding complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Database seeding failed:', error);
        process.exit(1);
    } finally {
        mongoose.disconnect();
    }
};

if (require.main === module) seedDatabase();

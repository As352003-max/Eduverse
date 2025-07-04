// backend/utils/seedDB.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

// Import Models
const User = require('../models/User');
const Module = require('../models/Module');
const GameProgress = require('../models/GameProgress');
const ChatSession = require('../models/ChatSession'); // If you want to clear chat sessions too
const Project = require('../models/Project'); // If you want to clear projects too
const Reward = require('../models/Reward'); // Assuming you have a Reward model for badges

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for seeding...');

        // --- 1. Clear existing data ---
        console.log('Clearing existing data...');
        await User.deleteMany({});
        await Module.deleteMany({});
        await GameProgress.deleteMany({});
        await ChatSession.deleteMany({});
        await Project.deleteMany({});
        await Reward.deleteMany({});
        console.log('Existing data cleared.');

        // --- 2. Create Users ---
        console.log('Creating sample users...');
        const hashedPassword = await bcrypt.hash('password123', 10);

        const adminUser = await User.create({
            username: 'adminuser',
            email: 'admin@example.com',
            password: hashedPassword,
            authType: 'email_password',
            role: 'admin',
            totalXp: 1500,
            currentLevel: 15,
            badges: ['First Login', 'Super Admin'],
        });

        const studentUser = await User.create({
            username: 'studentuser',
            email: 'student@example.com',
            password: hashedPassword,
            authType: 'email_password',
            role: 'student',
            grade: 8,
            totalXp: 350,
            currentLevel: 4,
            badges: ['First Completion', 'Quiz Master'],
        });

        const teacherUser = await User.create({
            username: 'teacheruser',
            email: 'teacher@example.com',
            password: hashedPassword,
            authType: 'email_password',
            role: 'teacher',
            totalXp: 800,
            currentLevel: 8,
            badges: ['Educator Badge'],
        });

        console.log('Sample users created.');

        // --- 3. Create Modules with various content types ---
        console.log('Creating sample modules...');

        const module1 = await Module.create({
            title: 'Introduction to AI',
            description: 'Learn the basics of Artificial Intelligence and its applications.',
            gradeLevel: { min: 7, max: 9 },
            difficulty: 'beginner',
            xpAward: 150,
            content: [
                { type: 'text', data: { text: 'Artificial Intelligence (AI) is a broad field of computer science that gives computers the ability to perform human-like tasks such as learning, problem-solving, and decision-making. It encompasses machine learning, deep learning, natural language processing, and more.' } },
                { type: 'quiz', data: {
                    question: 'What does AI stand for?',
                    options: ['Artificial Intelligence', 'Automated Information', 'Advanced Integration'],
                    correctAnswer: 'Artificial Intelligence'
                }},
                { type: 'text', data: { text: 'AI is used in everyday life, from recommendation systems on streaming platforms to voice assistants like Siri and Alexa. It powers self-driving cars, medical diagnostics, and fraud detection.' } }
            ]
        });

        const module2 = await Module.create({
            title: 'Machine Learning Fundamentals',
            description: 'Dive into the core concepts of Machine Learning algorithms.',
            gradeLevel: { min: 8, max: 10 },
            difficulty: 'intermediate',
            xpAward: 200,
            content: [
                { type: 'text', data: { text: 'Machine Learning (ML) is a subset of AI that enables systems to learn from data without being explicitly programmed. It involves building models that can make predictions or decisions based on patterns identified in data.' } },
                { type: 'puzzle', data: { puzzleName: 'Algorithm Sort', description: 'Drag and drop the algorithms into their correct categories (Supervised, Unsupervised, Reinforcement).' } },
                { type: 'text', data: { text: 'Common ML algorithms include Linear Regression, Decision Trees, Support Vector Machines, and K-Means Clustering.' } }
            ]
        });

        const module3 = await Module.create({
            title: 'Neural Networks & Deep Learning',
            description: 'Explore the fascinating world of neural networks and deep learning.',
            gradeLevel: { min: 9, max: 12 },
            difficulty: 'advanced',
            xpAward: 250,
            content: [
                { type: 'text', data: { text: 'Deep Learning is a specialized branch of ML that uses artificial neural networks with multiple layers to learn complex patterns from data. It has revolutionized areas like image recognition and natural language processing.' } },
                { type: 'simulation', data: { simulationName: 'Neural Network Training', description: 'Simulate the training process of a simple neural network and observe how weights are adjusted.' } },
                { type: 'drag-and-drop', data: { activityName: 'Layer Connection', description: 'Connect the input, hidden, and output layers of a neural network.' } }
            ]
        });

        console.log('Sample modules created.');

        // --- 4. Create Game Progress ---
        console.log('Creating sample game progress...');
        await GameProgress.create({
            userId: studentUser._id,
            moduleId: module1._id,
            progress: 100,
            score: 95,
            completed: true,
            attempts: 2,
            hintsUsed: 0,
            customData: { quizAttempts: 1 },
            lastAttemptedAt: Date.now(),
        });

        await GameProgress.create({
            userId: studentUser._id,
            moduleId: module2._id,
            progress: 60,
            score: 0,
            completed: false,
            attempts: 1,
            hintsUsed: 1,
            customData: {},
            lastAttemptedAt: Date.now(),
        });
        console.log('Sample game progress created.');

        // --- 5. Create Sample Rewards (Badges) ---
        console.log('Creating sample rewards (badges)...');
        await Reward.create({
            name: 'First Completion',
            description: 'Awarded for completing your first module.',
            type: 'badge',
            moduleCompletion: null, // This badge is generic
        });
        await Reward.create({
            name: 'Quiz Master',
            description: 'Awarded for achieving a high score in quizzes.',
            type: 'badge',
            moduleCompletion: null,
        });
        await Reward.create({
            name: 'AI Explorer',
            description: 'Awarded for completing the "Introduction to AI" module.',
            type: 'badge',
            moduleCompletion: module1._id, // Specific module completion badge
        });
        console.log('Sample rewards created.');


        console.log('Database seeding complete!');
    } catch (error) {
        console.error('Database seeding failed:', error);
        process.exit(1);
    } finally {
        mongoose.disconnect();
        console.log('MongoDB Disconnected after seeding.');
    }
};

// Only run if this script is executed directly
if (require.main === module) {
    seedDatabase();
} else {
    // Export for use in server.js
    module.exports = seedDatabase;
}

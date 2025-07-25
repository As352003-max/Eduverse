const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load environment variables
dotenv.config();

// Import Models
const User = require('../models/User');
// Ensure you are importing the correct model name for your modules,
// whether it's 'Module' or 'LearningModule'.
// Based on your last block, it seems you intend to use 'LearningModule'.
const LearningModule = require('../models/LearningModule');
const GameProgress = require('../models/GameProgress');
const ChatSession = require('../models/ChatSession');
const Project = require('../models/Project');
const Reward = require('../models/Reward');

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for seeding...');

        // --- 1. Clear existing data ---
        console.log('Clearing existing data...');
        await User.deleteMany({});
        // Clear the correct module collection
        await LearningModule.deleteMany({});
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

        // --- 3. Create Learning Modules with the new 'topics' structure ---
        console.log('Creating sample learning modules...');

        const learningModule1 = await LearningModule.create({
            title: 'Foundations of AI',
            description: 'Learn the very basics of Artificial Intelligence through interactive lessons for beginners.',
            gradeLevel: { min: 1, max: 3 },
            xpAward: 120,
            thumbnailUrl: "https://example.com/thumbnails/ai_beginner.jpg",
            topics: [
                {
                    title: 'What is AI?',
                    level: 'beginner',
                    content: [
                        {
                            title: 'Introduction to AI Text',
                            type: 'text',
                            data: { text: 'Artificial Intelligence (AI) is when computers can think and learn like people. It helps computers solve problems, understand language, and even see things! Think of smart assistants or games that learn as you play.' }
                        },
                        {
                            title: 'AI Basic Concepts Video',
                            type: 'video',
                            data: {
                                url: 'https://www.youtube.com/watch?v=JmlYs0s2WlQ', // Example beginner-friendly AI video
                                duration: '03:15',
                                description: 'A short video explaining AI in simple terms for kids.'
                            }
                        },
                        {
                            title: 'AI Introduction Quiz',
                            type: 'quiz',
                            data: {
                                question: 'What does AI stand for?',
                                options: ['Artificial Information', 'Automated Intelligence', 'Artificial Intelligence', 'Advanced Interaction'],
                                correctAnswer: 'Artificial Intelligence'
                            }
                        }
                    ]
                }
            ]
        });

        const learningModule2 = await LearningModule.create({
            title: 'Machine Learning Basics',
            description: 'Explore fundamental concepts of Machine Learning, how machines learn from data.',
            gradeLevel: { min: 4, max: 6 },
            xpAward: 180,
            thumbnailUrl: "https://example.com/thumbnails/ml_intermediate.jpg",
            topics: [
                {
                    title: 'How Machines Learn',
                    level: 'intermediate',
                    content: [
                        {
                            title: 'Machine Learning Introduction Text',
                            type: 'text',
                            data: { text: 'Machine Learning is a part of AI where computers learn from examples, instead of being told exactly what to do. They find patterns in data to make predictions or decisions. For instance, an ML model can learn to recognize cats after seeing many cat pictures.' }
                        },
                        {
                            title: 'Code.org - How Machines Learn',
                            type: 'video',
                            data: {
                                url: 'https://www.youtube.com/watch?v=R9OHn5ZF4Uo', // Example Code.org ML video
                                duration: '05:30',
                                description: 'Explains how computers learn from data, make predictions, and improve over time using examples like sorting photos or playing games.'
                            }
                        },
                        {
                            title: 'ML Concepts Quiz',
                            type: 'quiz',
                            data: {
                                question: 'What is a key way Machine Learning differs from traditional programming?',
                                options: ['It uses more complex math', 'It learns from data', 'It runs faster', 'It requires less memory'],
                                correctAnswer: 'It learns from data'
                            }
                        }
                    ]
                }
            ]
        });

        const learningModule3 = await LearningModule.create({
            title: 'Deep Learning & Neural Networks',
            description: 'Dive into advanced AI topics like Deep Learning and how Neural Networks function.',
            gradeLevel: { min: 7, max: 10 },
            xpAward: 250,
            thumbnailUrl: "https://example.com/thumbnails/deep_learning_advanced.jpg",
            topics: [
                {
                    title: 'Introduction to Neural Networks',
                    level: 'advanced',
                    content: [
                        {
                            title: 'Deep Learning Overview Text',
                            type: 'text',
                            data: { text: 'Deep Learning uses layers of artificial neural networks, inspired by the human brain, to process complex patterns in data. This technology powers things like face recognition, speech translation, and self-driving cars.' }
                        },
                        {
                            title: 'Neural Networks Explained',
                            type: 'video',
                            data: {
                                url: 'https://www.youtube.com/watch?v=aircA Ruiz_E', // Example Neural Network explanation video
                                duration: '07:00',
                                description: 'Explains how neural networks are inspired by the human brain and how they help machines learn patterns and make decisions.'
                            }
                        },
                        {
                            title: 'Deep Learning Quiz',
                            type: 'quiz',
                            data: {
                                question: 'What biological system inspires Neural Networks?',
                                options: ['The human heart', 'The human brain', 'Plant roots', 'Bird wings'],
                                correctAnswer: 'The human brain'
                            }
                        }
                    ]
                }
            ]
        });

        console.log('Sample learning modules created.');

        // --- 4. Create Game Progress (Adjusted for LearningModule structure) ---
        console.log('Creating sample game progress...');
        await GameProgress.create({
            userId: studentUser._id,
            moduleId: learningModule1._id, // Link to the new LearningModule's ID
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
            moduleId: learningModule2._id,
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
            moduleCompletion: null,
        });
        await Reward.create({
            name: 'Quiz Master',
            description: 'Awarded for achieving a high score in quizzes.',
            type: 'badge',
            moduleCompletion: null,
        });
        await Reward.create({
            name: 'AI Explorer',
            description: 'Awarded for completing the "Foundations of AI" module.',
            type: 'badge',
            moduleCompletion: learningModule1._id, // Specific module completion badge
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
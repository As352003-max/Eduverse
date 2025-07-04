// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http'); // Required for Socket.IO
const { Server } = require('socket.io'); // Import Server from socket.io

// Load environment variables
dotenv.config();

// Initialize Firebase Admin SDK
require('./config/firebaseAdmin');

const app = express();
const server = http.createServer(app); // Create HTTP server from express app

// Initialize Socket.IO
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Your frontend URL
        methods: ['GET', 'POST', 'PUT', 'DELETE'], // Added PUT, DELETE for full CRUD
        credentials: true,
    },
});

// Export io for use in other modules (e.g., gameRoutes for notifications)
module.exports.io = io;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB Connected');
        // --- Optional: Call seedDatabase here for initial setup ---
        // const seedDatabase = require('./utils/seedDB');
        // seedDatabase(); // Uncomment this line to seed your database once.
                         // REMEMBER TO COMMENT IT OUT AFTER THE FIRST SUCCESSFUL RUN!
    })
    .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Allow your frontend to access
    credentials: true,
}));
app.use(express.json()); // Body parser for JSON data

// Import Routes
const authRoutes = require('./routes/authRoutes');
const gameRoutes = require('./routes/gameRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const moduleRoutes = require('./routes/moduleRoutes');
const projectRoutes = require('./routes/projectRoutes');
const userRoutes = require('./routes/userRoutes');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/users', userRoutes);

// Basic route for testing
app.get('/', (req, res) => {
    res.send('Eduware Backend API is running!');
});

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('joinUserRoom', (userId) => {
        socket.join(userId);
        console.log(`Socket ${socket.id} joined room ${userId}`);
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

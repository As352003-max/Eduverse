const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const rateLimit = require('express-rate-limit');

dotenv.config();

require('./config/firebaseAdmin');

const app = express();
const server = http.createServer(app);

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')
    .map(origin => origin.trim());

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('CORS Not Allowed'));
        }
    },
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        credentials: true,
    }
});

module.exports.io = io;

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB connection error:', err));

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
});

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many login attempts from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api/', apiLimiter);
app.use('/api/auth/login', loginLimiter);

const authRoutes = require('./routes/authRoutes');
const gameRoutes = require('./routes/gameRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const moduleRoutes = require('./routes/moduleRoutes');
const projectRoutes = require('./routes/projectRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const userRoutes = require('./routes/userRoutes');
const aiChatRoutes = require('./routes/aiChatRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const childRoutes = require('./routes/childRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai-chat', aiChatRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/children', childRoutes);

app.get('/', (req, res) => {
    res.send('Eduverse Backend API is running!');
});

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('joinUserRoom', (userId) => {
        socket.join(userId);
        console.log(`Socket ${socket.id} joined room ${userId}`);
    });

    socket.on('joinGameRoom', (gameId) => {
        socket.join(gameId);
        console.log(`Socket ${socket.id} joined game room ${gameId}`);
        socket.to(gameId).emit('playerJoinedGame', { userId: socket.handshake.query.userId || 'Guest' });
    });

    socket.on('gameUpdate', (data) => {
        socket.to(data.gameId).emit('gameStateChanged', data.newState);
    });

    socket.on('sendChatMessage', ({ sessionId, message, userId, username }) => {
        io.to(sessionId).emit('newChatMessage', { message, userId, username, timestamp: new Date() });
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
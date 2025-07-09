const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

require('./config/firebaseAdmin');

const app = express();
const server = http.createServer(app);

// Unified CORS Configuration
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
    origin: ['http://localhost:5173', 'https://eduverse-ebon.vercel.app'], // <-- It's already here!
    credentials: true,
  }
});

module.exports.io = io;

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB connection error:', err));

app.use(cors({
    origin: allowedOrigins, // Use the dynamically generated allowedOrigins array
    credentials: true,
}));
app.use(express.json());

const authRoutes = require('./routes/authRoutes');
const gameRoutes = require('./routes/gameRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const moduleRoutes = require('./routes/moduleRoutes');
const projectRoutes = require('./routes/projectRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const userRoutes = require('./routes/userRoutes');
const aiChatRoutes = require('./routes/aiChatRoutes'); 


app.use('/api/auth', authRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai-chat', aiChatRoutes); 

app.get('/', (req, res) => {
    res.send('Eduware Backend API is running!');
});

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

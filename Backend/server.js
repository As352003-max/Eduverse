const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const rateLimit = require('express-rate-limit');
const axios = require('axios');
const { initSocket } = require('./socket');

dotenv.config();
const app = express();
const server = http.createServer(app);

const newAnalyticsRoutes = require('./routes/newanalyticsRoutes');
const usersRoutes = require('./routes/users');
const learningModuleRoutes = require('./routes/learningModuleRoutes');
const progressRoutes = require('./routes/progress');
const authRoutes = require('./routes/authRoutes');
const gameRoutes = require('./routes/gameRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const moduleRoutes = require('./routes/moduleRoutes');
const projectRoutes = require('./routes/projectRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const aiChatRoutes = require('./routes/aiChatRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const childRoutes = require('./routes/childRoutes');
const mathMazeRoutes = require('./routes/mathMazeRoutes');
const vocabVanguardRoutes = require('./routes/vocabVanguardRoutes');
const logicCircuitRoutes = require('./routes/logicCircuitRoutes');

require('./config/firebaseAdmin');

app.use(express.json());

// ✅ Allowed origins (both local & deployed frontend)
const allowedOrigins = [
  'http://localhost:5173',
  'https://eduverse-ebon.vercel.app'
];

// ✅ Global CORS fix (handles preflight OPTIONS as well)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// ✅ Keep cors() middleware for extra safety
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// ✅ Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () =>
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} - ${Date.now() - start}ms`)
  );
  next();
});

// ✅ Rate limiting
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use('/api/auth/login', rateLimit({ windowMs: 15 * 60 * 1000, max: 5 }));

// ✅ Database connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// ✅ API routes
app.use('/api/users', usersRoutes);
app.use('/api/learning-modules', learningModuleRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai-chat', aiChatRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/children', childRoutes);
app.use('/api/game/mathmaze', mathMazeRoutes);
app.use('/api/game/vocabvanguard', vocabVanguardRoutes);
app.use('/api/game/logiccircuit', logicCircuitRoutes);
app.use('/api/newanalytics', newAnalyticsRoutes);

// ✅ Classification endpoint
app.post('/api/classify', async (req, res) => {
  const { hint, options } = req.body;
  if (!hint || !Array.isArray(options)) return res.status(400).json({ error: 'Hint and options required.' });

  const normalizedHint = hint.trim().toLowerCase();
  const normalizedOptions = options.map(opt => opt.toLowerCase());

  if (normalizedOptions.includes(normalizedHint)) return res.json({ guess: normalizedHint });

  try {
    const hfRes = await axios.post(
      'https://api-inference.huggingface.co/models/facebook/bart-large-mnli',
      { inputs: hint, parameters: { candidate_labels: options, multi_label: false } },
      { headers: { Authorization: `Bearer ${process.env.HF_API_TOKEN}` } }
    );
    res.json({ guess: hfRes.data?.labels?.[0] || 'unknown' });
  } catch {
    res.status(500).json({ error: 'Classification failed.' });
  }
});

// ✅ Root route
app.get('/', (req, res) => res.send('🌐 Eduverse Backend API is running!'));

// ✅ Socket.IO initialization
initSocket(server, allowedOrigins);

// ✅ Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));

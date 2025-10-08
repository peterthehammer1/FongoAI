const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const path = require('path');
const session = require('express-session');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'fongo-nucleus-ai-secret-key-2025',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to false for HTTP (no HTTPS yet)
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax'
  }
}));

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for dashboard inline scripts
}));
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Serve static files (dashboard)
app.use(express.static(path.join(__dirname, 'public')));

// Import routes
const webhookRoutes = require('./routes/webhook');
const { router: llmRoutes, initializeWebSocketServer } = require('./routes/llm');
const dashboardRoutes = require('./routes/dashboard');
const authRoutes = require('./routes/auth');
const { requireAuth } = require('./middleware/auth');

// Public routes (no authentication required)
app.use('/auth', authRoutes);
app.use('/webhook', webhookRoutes); // Retell AI webhooks don't need auth
app.use('/llm-websocket', llmRoutes); // WebSocket for LLM

// Login page (public)
app.get('/login', (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect('/');
  }
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Protected routes (authentication required)
app.use('/dashboard', requireAuth, dashboardRoutes);

// Initialize WebSocket server
initializeWebSocketServer(server);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Dashboard homepage (protected)
app.get('/', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Fongo Credit Card Agent server running on port ${PORT}`);
  console.log(`📞 NUCLEUS Webhook endpoint: http://0.0.0.0:${PORT}/webhook`);
  console.log(`🤖 NUCLEUS LLM WebSocket endpoint: ws://0.0.0.0:${PORT}/llm-websocket`);
  console.log(`📊 Dashboard: http://0.0.0.0:${PORT}/`);
});

module.exports = { app, server };

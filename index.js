const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const path = require('path');
const session = require('express-session');
const { logger, errorHandler, requestLogger, setupGracefulShutdown } = require('./services/logger');
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
app.use(requestLogger);
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

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
server.listen(PORT, '0.0.0.0', () => {
  logger.info('Server started', { 
    port: PORT, 
    environment: process.env.NODE_ENV,
    webhookUrl: `http://0.0.0.0:${PORT}/webhook`,
    dashboardUrl: `http://0.0.0.0:${PORT}/`
  });
});

// Setup graceful shutdown
setupGracefulShutdown();

module.exports = { app, server };

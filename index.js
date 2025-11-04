const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const path = require('path');
const fs = require('fs');
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
// Increase body size limit for Retell AI webhooks (they can be large with transcripts)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
// System monitoring (optional - only if file exists)
const monitoringPath = path.join(__dirname, 'routes', 'monitoring.js');
if (fs.existsSync(monitoringPath)) {
  try {
    app.use('/monitoring', requireAuth, require('./routes/monitoring'));
  } catch (error) {
    logger.warn('Monitoring route not available', { error: error.message });
  }
} else {
  logger.info('Monitoring route not available (file does not exist)');
}

// Login page (public)
app.get('/login', (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect('/');
  }
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Dashboard routes - specific routes must come before router mounting
// Call details page (served as static file, but protected by auth)
app.get('/dashboard/call/:callId', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'call-details.html'));
});

// Comprehensive call details page (served as static file, but protected by auth)
app.get('/dashboard/comprehensive-call/:callId', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'comprehensive-call-details.html'));
});

// Dashboard homepage route (serve at /dashboard)
app.get('/dashboard', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Protected routes (authentication required)
// Mount dashboard API routes - they already have /api prefix in their definitions
app.use('/dashboard/api', requireAuth, dashboardRoutes);

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

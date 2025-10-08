const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for dashboard inline scripts
}));
app.use(cors());
app.use(express.json());

// Serve static files (dashboard)
app.use(express.static(path.join(__dirname, 'public')));

// Import routes
const webhookRoutes = require('./routes/webhook');
const { router: llmRoutes, initializeWebSocketServer } = require('./routes/llm');
const dashboardRoutes = require('./routes/dashboard');

// Routes
app.use('/webhook', webhookRoutes);
app.use('/llm-websocket', llmRoutes);
app.use('/dashboard', dashboardRoutes);

// Initialize WebSocket server
initializeWebSocketServer(server);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Dashboard homepage
app.get('/', (req, res) => {
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

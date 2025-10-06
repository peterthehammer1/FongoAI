const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Import routes
const webhookRoutes = require('./routes/webhook');
const { router: llmRoutes, initializeWebSocketServer } = require('./routes/llm');

// Routes
app.use('/webhook', webhookRoutes);
app.use('/llm-websocket', llmRoutes);

// Initialize WebSocket server
initializeWebSocketServer(server);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// For Vercel deployment
if (process.env.NODE_ENV === 'production') {
  // Export for Vercel
  module.exports = app;
} else {
  // Start server for local development
  server.listen(PORT, () => {
    console.log(`🚀 Fongo Credit Card Agent server running on port ${PORT}`);
    console.log(`📞 Webhook endpoint: http://localhost:${PORT}/webhook`);
    console.log(`🤖 LLM WebSocket endpoint: ws://localhost:${PORT}/llm-websocket`);
  });
  
  module.exports = { app, server };
}

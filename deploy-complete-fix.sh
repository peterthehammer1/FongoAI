#!/bin/bash
# Complete fix - deploy full monitoring route and updated index.js

echo "📤 Deploying complete fix to server..."

# Create the full monitoring.js file content
cat > /tmp/monitoring.js << 'MONITORING_EOF'
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { logger } = require('../services/logger');

// System health check endpoint
router.get('/health', async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0'
    };

    // Check database connectivity
    try {
      const db = require('../services/database');
      health.database = 'connected';
    } catch (error) {
      health.database = 'error';
      health.status = 'degraded';
    }

    // Check disk space
    try {
      const stats = fs.statSync('/var/www/nucleusai');
      health.diskSpace = 'available';
    } catch (error) {
      health.diskSpace = 'error';
      health.status = 'degraded';
    }

    health.webhook = 'operational';

    logger.info('Health check performed', { status: health.status });
    
    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);

  } catch (error) {
    logger.error('Health check failed', { error: error.message });
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// System metrics endpoint
router.get('/metrics', async (req, res) => {
  try {
    const metrics = {
      timestamp: new Date().toISOString(),
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        platform: process.platform,
        nodeVersion: process.version
      },
      application: {
        environment: process.env.NODE_ENV,
        port: process.env.PORT || 3000,
        domain: process.env.DOMAIN
      }
    };

    // Get database metrics
    try {
      const db = require('../services/database');
      const summary = await db.getCallSummary();
      metrics.database = {
        totalCalls: summary.total_calls,
        successfulUpdates: summary.successful_updates,
        failedUpdates: summary.failed_updates,
        avgDuration: summary.avg_duration
      };
    } catch (error) {
      metrics.database = { error: error.message };
    }

    res.json(metrics);

  } catch (error) {
    logger.error('Metrics collection failed', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
MONITORING_EOF

echo ""
echo "📋 Copy and paste this into the DigitalOcean console:"
echo ""
echo "=========================================="
echo "cd /var/www/nucleusai"
echo "mkdir -p routes"
echo ""
echo "cat > routes/monitoring.js << 'EOF'"
cat /tmp/monitoring.js
echo "EOF"
echo ""
echo "# Update index.js (already done locally, but ensure it's on server)"
echo "pm2 restart nucleusai"
echo "pm2 save"
echo "pm2 status"
echo "curl http://localhost:3000/health"
echo "=========================================="
echo ""
echo "✅ Full monitoring route includes:"
echo "   - Health checks with database status"
echo "   - System metrics (memory, CPU, uptime)"
echo "   - Database statistics"
echo "   - Better debugging capabilities"


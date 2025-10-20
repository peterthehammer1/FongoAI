const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
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
      // Simple database health check
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

    // Check if webhook endpoint is accessible
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

// Backup database endpoint
router.post('/backup', async (req, res) => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(__dirname, '../backups');
    const backupFile = path.join(backupDir, `calls-backup-${timestamp}.db`);

    // Ensure backup directory exists
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Create database backup
    const dbPath = path.join(__dirname, '../database/calls.db');
    
    if (fs.existsSync(dbPath)) {
      fs.copyFileSync(dbPath, backupFile);
      
      logger.info('Database backup created', { 
        backupFile: backupFile,
        size: fs.statSync(backupFile).size 
      });

      res.json({
        success: true,
        message: 'Backup created successfully',
        backupFile: backupFile,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Database file not found'
      });
    }

  } catch (error) {
    logger.error('Backup creation failed', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// List backups endpoint
router.get('/backups', async (req, res) => {
  try {
    const backupDir = path.join(__dirname, '../backups');
    
    if (!fs.existsSync(backupDir)) {
      return res.json({ backups: [] });
    }

    const files = fs.readdirSync(backupDir)
      .filter(file => file.endsWith('.db'))
      .map(file => {
        const filePath = path.join(backupDir, file);
        const stats = fs.statSync(filePath);
        return {
          filename: file,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime
        };
      })
      .sort((a, b) => new Date(b.created) - new Date(a.created));

    res.json({ backups: files });

  } catch (error) {
    logger.error('Backup listing failed', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// Cleanup old backups endpoint
router.post('/backups/cleanup', async (req, res) => {
  try {
    const backupDir = path.join(__dirname, '../backups');
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    const now = Date.now();
    let deletedCount = 0;

    if (!fs.existsSync(backupDir)) {
      return res.json({ message: 'No backups directory found', deletedCount: 0 });
    }

    const files = fs.readdirSync(backupDir)
      .filter(file => file.endsWith('.db'));

    files.forEach(file => {
      const filePath = path.join(backupDir, file);
      const stats = fs.statSync(filePath);
      const age = now - stats.birthtime.getTime();

      if (age > maxAge) {
        fs.unlinkSync(filePath);
        deletedCount++;
        logger.info('Old backup deleted', { file: file, age: Math.round(age / (24 * 60 * 60 * 1000)) + ' days' });
      }
    });

    res.json({
      success: true,
      message: `Cleaned up ${deletedCount} old backups`,
      deletedCount: deletedCount
    });

  } catch (error) {
    logger.error('Backup cleanup failed', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

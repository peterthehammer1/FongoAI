const fs = require('fs');
const path = require('path');

// Logging configuration
const LOG_CONFIG = {
  level: process.env.LOG_LEVEL || 'info',
  file: process.env.LOG_FILE || '/var/log/nucleusai/app.log',
  maxSize: process.env.LOG_MAX_SIZE || '10MB',
  maxFiles: process.env.LOG_MAX_FILES || 5
};

// Log levels
const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

// Ensure log directory exists
const logDir = path.dirname(LOG_CONFIG.file);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Create log stream
let logStream = null;
try {
  logStream = fs.createWriteStream(LOG_CONFIG.file, { flags: 'a' });
} catch (error) {
  console.error('Failed to create log file:', error.message);
}

// Format log message
function formatLog(level, message, meta = {}) {
  const timestamp = new Date().toISOString();
  const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
}

// Write to both console and file
function writeLog(level, message, meta = {}) {
  const formattedMessage = formatLog(level, message, meta);
  
  // Console output
  console.log(formattedMessage);
  
  // File output
  if (logStream) {
    logStream.write(formattedMessage + '\n');
  }
}

// Logger class
class Logger {
  constructor(context = '') {
    this.context = context;
  }
  
  _log(level, message, meta = {}) {
    if (LOG_LEVELS[level] <= LOG_LEVELS[LOG_CONFIG.level]) {
      const contextMessage = this.context ? `[${this.context}] ${message}` : message;
      writeLog(level, contextMessage, meta);
    }
  }
  
  error(message, meta = {}) {
    this._log('error', message, meta);
  }
  
  warn(message, meta = {}) {
    this._log('warn', message, meta);
  }
  
  info(message, meta = {}) {
    this._log('info', message, meta);
  }
  
  debug(message, meta = {}) {
    this._log('debug', message, meta);
  }
}

// Create default logger
const logger = new Logger();

// Enhanced error handling
class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handler middleware
function errorHandler(err, req, res, next) {
  const error = {
    message: err.message,
    statusCode: err.statusCode || 500,
    timestamp: err.timestamp || new Date().toISOString(),
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  };
  
  // Log error
  logger.error('Unhandled error', error);
  
  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production') {
    delete error.stack;
  }
  
  res.status(error.statusCode).json({
    success: false,
    error: error.message,
    ...(process.env.NODE_ENV === 'development' && { details: error })
  });
}

// Request logging middleware
function requestLogger(req, res, next) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    };
    
    if (res.statusCode >= 400) {
      logger.warn('HTTP Request', logData);
    } else {
      logger.info('HTTP Request', logData);
    }
  });
  
  next();
}

// Async error wrapper
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Database error handler
function handleDatabaseError(error, operation = 'database operation') {
  logger.error(`Database error during ${operation}`, {
    error: error.message,
    code: error.code,
    errno: error.errno,
    sqlState: error.sqlState
  });
  
  // Return user-friendly error
  if (error.code === 'SQLITE_CONSTRAINT') {
    return new AppError('Data validation failed', 400);
  } else if (error.code === 'SQLITE_BUSY') {
    return new AppError('Database is busy, please try again', 503);
  } else {
    return new AppError('Database operation failed', 500);
  }
}

// API error handler
function handleApiError(error, apiName = 'external API') {
  logger.error(`API error calling ${apiName}`, {
    error: error.message,
    status: error.response?.status,
    statusText: error.response?.statusText,
    data: error.response?.data
  });
  
  if (error.response?.status >= 500) {
    return new AppError(`${apiName} is temporarily unavailable`, 503);
  } else if (error.response?.status === 404) {
    return new AppError('Resource not found', 404);
  } else if (error.response?.status === 401) {
    return new AppError('Authentication failed', 401);
  } else if (error.response?.status === 403) {
    return new AppError('Access denied', 403);
  } else {
    return new AppError(`${apiName} request failed`, 500);
  }
}

// Validation error handler
function handleValidationError(errors) {
  logger.warn('Validation error', { errors });
  return new AppError('Validation failed', 400);
}

// Graceful shutdown handler
function setupGracefulShutdown() {
  const shutdown = (signal) => {
    logger.info(`Received ${signal}, shutting down gracefully`);
    
    // Close log stream
    if (logStream) {
      logStream.end();
    }
    
    // Close database connections
    // Add any cleanup here
    
    process.exit(0);
  };
  
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  
  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  });
  
  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled promise rejection', {
      reason: reason?.message || reason,
      promise: promise
    });
    process.exit(1);
  });
}

module.exports = {
  Logger,
  logger,
  AppError,
  errorHandler,
  requestLogger,
  asyncHandler,
  handleDatabaseError,
  handleApiError,
  handleValidationError,
  setupGracefulShutdown,
  LOG_CONFIG
};

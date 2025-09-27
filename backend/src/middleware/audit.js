const winston = require('winston');
const pool = require('../config/database');

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'kol-platform' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Audit logging middleware
const auditLogger = (action) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Log the action
      logAuditEvent({
        userId: req.user?.id,
        action,
        resource: req.originalUrl,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        success: res.statusCode < 400,
        statusCode: res.statusCode,
        timestamp: new Date()
      });

      originalSend.call(this, data);
    };

    next();
  };
};

// Log audit events to database
const logAuditEvent = async (event) => {
  try {
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, resource, method, ip_address, user_agent, success, status_code, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        event.userId,
        event.action,
        event.resource,
        event.method,
        event.ip,
        event.userAgent,
        event.success,
        event.statusCode,
        event.timestamp
      ]
    );
  } catch (error) {
    logger.error('Failed to log audit event:', error);
  }
};

// Security event logger
const logSecurityEvent = (event) => {
  logger.warn('Security Event', {
    type: event.type,
    userId: event.userId,
    ip: event.ip,
    details: event.details,
    timestamp: new Date()
  });
};

module.exports = {
  logger,
  auditLogger,
  logAuditEvent,
  logSecurityEvent
};
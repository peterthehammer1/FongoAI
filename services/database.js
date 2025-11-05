const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Database file path
const dbPath = path.join(__dirname, '../database/calls.db');
const schemaPath = path.join(__dirname, '../database/schema.sql');

// Ensure database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('📊 Database connected');
    initializeSchema();
  }
});

// Initialize schema
function initializeSchema() {
  const schema = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schema, (err) => {
    if (err) {
      console.error('Error initializing schema:', err);
    } else {
      console.log('✅ Database schema initialized');
    }
  });
}

/**
 * Log a new call start
 */
function logCallStart(callId, callerNumber, callerName = null) {
  return new Promise((resolve, reject) => {
    const now = new Date();
    const callDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const callTime = now.toTimeString().split(' ')[0]; // HH:MM:SS
    
    const sql = `
      INSERT INTO call_logs (call_id, caller_number, caller_name, call_date, call_time)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(call_id) DO UPDATE SET
        caller_name = COALESCE(excluded.caller_name, caller_name),
        updated_at = CURRENT_TIMESTAMP
    `;
    
    db.run(sql, [callId, callerNumber, callerName, callDate, callTime], function(err) {
      if (err) {
        console.error('Error logging call start:', err);
        reject(err);
      } else {
        console.log(`📞 Call logged: ${callId} from ${callerNumber}`);
        resolve(this.lastID);
      }
    });
  });
}

/**
 * Update call with credit card information and result
 */
function updateCallResult(callId, data) {
  return new Promise((resolve, reject) => {
    const {
      cardType,
      cardNumber, // full number, we'll extract last 4
      expiryMonth,
      expiryYear,
      cardholderName = null,
      updateSuccessful,
      errorMessage = null,
      language = 'en'
    } = data;
    
    // Extract last 4 digits only
    const cardLast4 = cardNumber ? cardNumber.slice(-4) : null;
    
    const sql = `
      UPDATE call_logs
      SET card_type = ?,
          card_last_4 = ?,
          card_expiry_month = ?,
          card_expiry_year = ?,
          cardholder_name = ?,
          update_successful = ?,
          error_message = ?,
          language_used = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE call_id = ?
    `;
    
    db.run(
      sql,
      [cardType, cardLast4, expiryMonth, expiryYear, cardholderName, updateSuccessful ? 1 : 0, errorMessage, language, callId],
      function(err) {
        if (err) {
          console.error('Error updating call result:', err);
          reject(err);
        } else {
          console.log(`✅ Call result updated: ${callId} - Success: ${updateSuccessful}`);
          resolve(this.changes);
        }
      }
    );
  });
}

/**
 * Update call duration when call ends
 */
function updateCallDuration(callId, durationSeconds) {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE call_logs
      SET call_duration = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE call_id = ?
    `;
    
    db.run(sql, [durationSeconds, callId], function(err) {
      if (err) {
        console.error('Error updating call duration:', err);
        reject(err);
      } else {
        console.log(`⏱️  Call duration updated: ${callId} - ${durationSeconds}s`);
        resolve(this.changes);
      }
    });
  });
}

/**
 * Update call transcript when call is analyzed
 */
function updateCallTranscript(callId, transcript) {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE call_logs
      SET transcript = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE call_id = ?
    `;
    
    db.run(sql, [transcript, callId], function(err) {
      if (err) {
        console.error('Error updating call transcript:', err);
        reject(err);
      } else {
        console.log(`📝 Call transcript updated: ${callId}`);
        resolve(this.changes);
      }
    });
  });
}

/**
 * Store full webhook data
 */
function updateWebhookData(callId, webhookData) {
  return new Promise((resolve, reject) => {
    const webhookDataJson = typeof webhookData === 'string' ? webhookData : JSON.stringify(webhookData);
    
    const sql = `
      UPDATE call_logs
      SET webhook_data = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE call_id = ?
    `;
    
    db.run(sql, [webhookDataJson, callId], function(err) {
      if (err) {
        console.error('Error updating webhook data:', err);
        reject(err);
      } else {
        console.log(`📦 Webhook data stored: ${callId}`);
        resolve(this.changes);
      }
    });
  });
}

/**
 * Get all calls with pagination
 */
function getAllCalls(limit = 50, offset = 0) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        c.id,
        c.call_id,
        c.caller_name,
        c.caller_number,
        c.call_date,
        c.call_time,
        c.call_duration,
        c.card_type,
        c.card_last_4,
        c.card_expiry_month,
        c.card_expiry_year,
        c.cardholder_name,
        c.update_successful,
        c.error_message,
        c.language_used,
        c.transcript,
        c.webhook_data,
        c.created_at,
        CASE WHEN MAX(s.sms_sent) = 1 THEN 1 ELSE 0 END as sms_sent
      FROM call_logs c
      LEFT JOIN sms_logs s ON c.call_id = s.call_id
      WHERE (c.call_date >= '2025-11-04' OR (c.call_date < '2025-11-04' AND c.update_successful = 1))
      GROUP BY c.id
      ORDER BY c.call_date DESC, c.call_time DESC
      LIMIT ? OFFSET ?
    `;
    
    db.all(sql, [limit, offset], (err, rows) => {
      if (err) {
        console.error('Error getting calls:', err);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

/**
 * Get call summary statistics
 */
function getCallSummary() {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM call_summary';
    
    db.get(sql, [], (err, row) => {
      if (err) {
        console.error('Error getting call summary:', err);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

/**
 * Search calls by phone number or date
 */
function searchCalls(searchTerm) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        c.id,
        c.call_id,
        c.caller_name,
        c.caller_number,
        c.call_date,
        c.call_time,
        c.call_duration,
        c.card_type,
        c.card_last_4,
        c.card_expiry_month,
        c.card_expiry_year,
        c.cardholder_name,
        c.update_successful,
        c.error_message,
        c.language_used,
        c.created_at,
        CASE WHEN MAX(s.sms_sent) = 1 THEN 1 ELSE 0 END as sms_sent
      FROM call_logs c
      LEFT JOIN sms_logs s ON c.call_id = s.call_id
      WHERE (c.call_date >= '2025-11-04' OR (c.call_date < '2025-11-04' AND c.update_successful = 1))
         AND (c.caller_number LIKE ? 
         OR c.caller_name LIKE ?
         OR c.cardholder_name LIKE ?
         OR c.call_date LIKE ?)
      GROUP BY c.id
      ORDER BY c.call_date DESC, c.call_time DESC
      LIMIT 100
    `;
    
    const term = `%${searchTerm}%`;
    db.all(sql, [term, term, term, term], (err, rows) => {
      if (err) {
        console.error('Error searching calls:', err);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

/**
 * Log SMS request and result
 */
function logSmsRequest(callId, callerNumber, smsNumber, smsResult) {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO sms_logs (
        call_id, 
        caller_number, 
        sms_number, 
        sms_sent, 
        sms_message_id, 
        sms_provider, 
        sms_error
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      callId,
      callerNumber,
      smsNumber,
      smsResult.success ? 1 : 0,
      smsResult.messageId || null,
      smsResult.provider || null,
      smsResult.error || null
    ];
    
    db.run(sql, values, function(err) {
      if (err) {
        console.error('Error logging SMS request:', err);
        reject(err);
      } else {
        console.log(`📱 SMS logged: ${callId} -> ${smsNumber} (${smsResult.success ? 'Success' : 'Failed'})`);
        resolve(this.lastID);
      }
    });
  });
}

/**
 * Get all SMS logs with pagination
 */
function getAllSmsLogs(limit = 50, offset = 0) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        s.id,
        s.call_id,
        s.caller_number,
        s.sms_number,
        s.sms_sent,
        s.sms_message_id,
        s.sms_provider,
        s.sms_error,
        s.link_clicked,
        s.payment_updated_after_sms,
        s.payment_updated_date,
        s.created_at,
        c.caller_name,
        c.cardholder_name,
        c.update_successful as call_successful
      FROM sms_logs s
      LEFT JOIN call_logs c ON s.call_id = c.call_id
      ORDER BY s.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    db.all(sql, [limit, offset], (err, rows) => {
      if (err) {
        console.error('Error getting SMS logs:', err);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

/**
 * Get all failed calls with error details
 */
function getFailedCalls() {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        id,
        call_id,
        caller_name,
        caller_number,
        call_date,
        call_time,
        call_duration,
        card_type,
        card_last_4,
        card_expiry_month,
        card_expiry_year,
        error_message,
        language_used,
        transcript,
        webhook_data,
        created_at
      FROM call_logs
      WHERE update_successful = 0 OR update_successful IS NULL
      ORDER BY call_date DESC, call_time DESC
    `;
    
    db.all(sql, [], (err, rows) => {
      if (err) {
        console.error('Error getting failed calls:', err);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

/**
 * Get single call by call_id
 */
function getCallById(callId) {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        id,
        call_id,
        caller_name,
        caller_number,
        call_date,
        call_time,
        call_duration,
        card_type,
        card_last_4,
        card_expiry_month,
        card_expiry_year,
        cardholder_name,
        update_successful,
        error_message,
        language_used,
        transcript,
        webhook_data,
        created_at,
        updated_at
      FROM call_logs
      WHERE call_id = ?
    `;
    
    db.get(sql, [callId], (err, row) => {
      if (err) {
        console.error('Error getting call by ID:', err);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

/**
 * Get SMS analytics
 */
function getSmsAnalytics() {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        COUNT(*) as total_sms_requests,
        SUM(CASE WHEN sms_sent = 1 THEN 1 ELSE 0 END) as sms_sent_successfully,
        SUM(CASE WHEN sms_sent = 0 THEN 1 ELSE 0 END) as sms_failed,
        SUM(CASE WHEN link_clicked = 1 THEN 1 ELSE 0 END) as links_clicked,
        SUM(CASE WHEN payment_updated_after_sms = 1 THEN 1 ELSE 0 END) as payments_updated_after_sms,
        COUNT(DISTINCT sms_number) as unique_sms_numbers
      FROM sms_logs
    `;
    
    db.get(sql, [], (err, row) => {
      if (err) {
        console.error('Error getting SMS analytics:', err);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

/**
 * Get analytics data for charts and reports
 */
function getAnalytics() {
  return new Promise((resolve, reject) => {
    const analytics = {};
    
      // Get hourly call distribution for the last 24 hours
      const hourlyQuery = `
        SELECT 
          strftime('%H', datetime(call_date || ' ' || call_time)) as hour,
          COUNT(*) as call_count
        FROM call_logs 
        WHERE datetime(call_date || ' ' || call_time) >= datetime('now', '-24 hours')
          AND (call_date >= '2025-11-04' OR (call_date < '2025-11-04' AND update_successful = 1))
        GROUP BY hour
        ORDER BY hour
      `;
    
    db.all(hourlyQuery, [], (err, hourlyRows) => {
      if (err) {
        reject(err);
        return;
      }
      
      // Create hourly labels and data arrays
      const hourlyLabels = [];
      const hourlyCalls = [];
      
      // Initialize all 24 hours
      for (let i = 0; i < 24; i++) {
        const hour = i.toString().padStart(2, '0');
        hourlyLabels.push(hour + ':00');
        hourlyCalls.push(0);
      }
      
      // Fill in actual data
      hourlyRows.forEach(row => {
        const hourIndex = parseInt(row.hour);
        hourlyCalls[hourIndex] = row.call_count;
      });
      
      analytics.hourly_labels = hourlyLabels;
      analytics.hourly_calls = hourlyCalls;
      
      // Get success/failure counts
      const successQuery = `
        SELECT 
          SUM(CASE WHEN update_successful = 1 THEN 1 ELSE 0 END) as successful_calls,
          SUM(CASE WHEN update_successful = 0 THEN 1 ELSE 0 END) as failed_calls
        FROM call_logs 
        WHERE update_successful IS NOT NULL
          AND (call_date >= '2025-11-04' OR (call_date < '2025-11-04' AND update_successful = 1))
      `;
      
      db.get(successQuery, [], (err, successRow) => {
        if (err) {
          reject(err);
          return;
        }
        
        analytics.successful_calls = successRow.successful_calls || 0;
        analytics.failed_calls = successRow.failed_calls || 0;
        
        // Get card type distribution
        const cardTypeQuery = `
          SELECT 
            SUM(CASE WHEN card_type = 'visa' THEN 1 ELSE 0 END) as visa_count,
            SUM(CASE WHEN card_type = 'mastercard' THEN 1 ELSE 0 END) as mastercard_count,
            SUM(CASE WHEN card_type = 'amex' THEN 1 ELSE 0 END) as amex_count
          FROM call_logs 
          WHERE card_type IS NOT NULL
            AND (call_date >= '2025-11-04' OR (call_date < '2025-11-04' AND update_successful = 1))
        `;
        
        db.get(cardTypeQuery, [], (err, cardTypeRow) => {
          if (err) {
            reject(err);
            return;
          }
          
          analytics.visa_count = cardTypeRow.visa_count || 0;
          analytics.mastercard_count = cardTypeRow.mastercard_count || 0;
          analytics.amex_count = cardTypeRow.amex_count || 0;
          
          // Get average call duration
          const durationQuery = `
            SELECT AVG(call_duration) as avg_duration
            FROM call_logs 
            WHERE call_duration IS NOT NULL AND call_duration > 0
              AND (call_date >= '2025-11-04' OR (call_date < '2025-11-04' AND update_successful = 1))
          `;
          
          db.get(durationQuery, [], (err, durationRow) => {
            if (err) {
              reject(err);
              return;
            }
            
            analytics.avg_duration = Math.round(durationRow.avg_duration || 0);
            
            resolve(analytics);
          });
        });
      });
    });
  });
}

/**
 * Check if SMS was sent for a call and update call result if needed
 */
function checkAndUpdateSmsStatus(callId) {
  return new Promise((resolve, reject) => {
    // First, check if SMS was sent for this call
    const smsCheckSql = `
      SELECT COUNT(*) as sms_count
      FROM sms_logs
      WHERE call_id = ? AND sms_sent = 1
    `;
    
    db.get(smsCheckSql, [callId], (err, smsRow) => {
      if (err) {
        console.error('Error checking SMS status:', err);
        reject(err);
        return;
      }
      
      if (smsRow && smsRow.sms_count > 0) {
        // SMS was sent, check if no credit card update occurred
        const callCheckSql = `
          SELECT update_successful, card_type
          FROM call_logs
          WHERE call_id = ?
        `;
        
        db.get(callCheckSql, [callId], (err, callRow) => {
          if (err) {
            console.error('Error checking call status:', err);
            reject(err);
            return;
          }
          
          // If no credit card update occurred (update_successful is NULL and no card_type)
          if (callRow && (callRow.update_successful === null || callRow.update_successful === undefined) && !callRow.card_type) {
            // Update call with special status indicating SMS was sent
            const updateSql = `
              UPDATE call_logs
              SET update_successful = NULL,
                  error_message = 'Payment Link Sent',
                  updated_at = CURRENT_TIMESTAMP
              WHERE call_id = ?
            `;
            
            db.run(updateSql, [callId], function(updateErr) {
              if (updateErr) {
                console.error('Error updating call with SMS status:', updateErr);
                reject(updateErr);
              } else {
                console.log(`✅ Updated call ${callId} with SMS status: Payment Link Sent`);
                resolve(true);
              }
            });
          } else {
            resolve(false);
          }
        });
      } else {
        resolve(false);
      }
    });
  });
}

module.exports = {
  logCallStart,
  updateCallResult,
  updateCallDuration,
  updateCallTranscript,
  updateWebhookData,
  checkAndUpdateSmsStatus,
  getAllCalls,
  getCallSummary,
  searchCalls,
  getAnalytics,
  logSmsRequest,
  getAllSmsLogs,
  getSmsAnalytics,
  getFailedCalls,
  getCallById
};


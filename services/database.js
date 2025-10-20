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
 * Get all calls with pagination
 */
function getAllCalls(limit = 50, offset = 0) {
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
        created_at
      FROM call_logs
      ORDER BY call_date DESC, call_time DESC
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
        created_at
      FROM call_logs
      WHERE caller_number LIKE ? 
         OR caller_name LIKE ?
         OR cardholder_name LIKE ?
         OR call_date LIKE ?
      ORDER BY call_date DESC, call_time DESC
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
          SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful_calls,
          SUM(CASE WHEN success = 0 THEN 1 ELSE 0 END) as failed_calls
        FROM call_logs 
        WHERE success IS NOT NULL
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
            SUM(CASE WHEN card_type = 'Visa' THEN 1 ELSE 0 END) as visa_count,
            SUM(CASE WHEN card_type = 'Mastercard' THEN 1 ELSE 0 END) as mastercard_count,
            SUM(CASE WHEN card_type = 'American Express' THEN 1 ELSE 0 END) as amex_count
          FROM call_logs 
          WHERE card_type IS NOT NULL
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
            SELECT AVG(duration_seconds) as avg_duration
            FROM call_logs 
            WHERE duration_seconds IS NOT NULL AND duration_seconds > 0
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

module.exports = {
  logCallStart,
  updateCallResult,
  updateCallDuration,
  getAllCalls,
  getCallSummary,
  searchCalls,
  getAnalytics
};


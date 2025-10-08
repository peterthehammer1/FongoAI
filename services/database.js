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
          update_successful = ?,
          error_message = ?,
          language_used = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE call_id = ?
    `;
    
    db.run(
      sql,
      [cardType, cardLast4, expiryMonth, expiryYear, updateSuccessful ? 1 : 0, errorMessage, language, callId],
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
        update_successful,
        error_message,
        language_used,
        created_at
      FROM call_logs
      WHERE caller_number LIKE ? 
         OR caller_name LIKE ?
         OR call_date LIKE ?
      ORDER BY call_date DESC, call_time DESC
      LIMIT 100
    `;
    
    const term = `%${searchTerm}%`;
    db.all(sql, [term, term, term], (err, rows) => {
      if (err) {
        console.error('Error searching calls:', err);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

module.exports = {
  logCallStart,
  updateCallResult,
  updateCallDuration,
  getAllCalls,
  getCallSummary,
  searchCalls
};


#!/usr/bin/env node

/**
 * Script to fix call duration by calculating it from webhook data or timestamps
 * Usage: node scripts/fix-call-duration.js call_1f51a81b24eccedb5ca33879175
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const callId = process.argv[2];

if (!callId) {
  console.error('❌ Please provide a call_id');
  console.log('Usage: node scripts/fix-call-duration.js <call_id>');
  process.exit(1);
}

const dbPath = path.join(__dirname, '..', 'database', 'calls.db');
const comprehensiveDbPath = path.join(__dirname, '..', 'database', 'fongo_comprehensive.db');

console.log(`🔍 Fixing duration for call: ${callId}`);
console.log('');

// Try main database first
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening main database:', err);
    process.exit(1);
  }

  // Get call data
  db.get(
    `SELECT call_id, call_duration, webhook_data, call_date, call_time FROM call_logs WHERE call_id = ?`,
    [callId],
    (err, row) => {
      if (err) {
        console.error('Error querying database:', err);
        db.close();
        process.exit(1);
      }

      if (!row) {
        console.log(`⚠️  Call not found in main database`);
        db.close();
        checkComprehensiveDatabase();
        return;
      }

      console.log(`📊 Current duration: ${row.call_duration || 0} seconds`);
      
      let newDuration = null;

      // Try to get duration from webhook_data
      if (row.webhook_data) {
        try {
          const webhookData = JSON.parse(row.webhook_data);
          
          // Check for duration_ms in call object
          if (webhookData.call?.duration_ms) {
            newDuration = Math.floor(webhookData.call.duration_ms / 1000);
            console.log(`📦 Found duration_ms in webhook: ${webhookData.call.duration_ms}ms = ${newDuration}s`);
          }
          // Check for duration_ms at root level
          else if (webhookData.duration_ms) {
            newDuration = Math.floor(webhookData.duration_ms / 1000);
            console.log(`📦 Found duration_ms at root: ${webhookData.duration_ms}ms = ${newDuration}s`);
          }
          // Try to calculate from timestamps
          else if (webhookData.call?.end_timestamp && webhookData.call?.start_timestamp) {
            newDuration = Math.floor((webhookData.call.end_timestamp - webhookData.call.start_timestamp) / 1000);
            console.log(`📦 Calculated from timestamps: ${newDuration}s`);
            console.log(`   Start: ${new Date(webhookData.call.start_timestamp).toISOString()}`);
            console.log(`   End: ${new Date(webhookData.call.end_timestamp).toISOString()}`);
          }
          // Check event data array
          else if (Array.isArray(webhookData) && webhookData.length > 0) {
            const callEndedEvent = webhookData.find(e => e.event === 'call_ended' && e.call);
            if (callEndedEvent?.call?.duration_ms) {
              newDuration = Math.floor(callEndedEvent.call.duration_ms / 1000);
              console.log(`📦 Found duration_ms in call_ended event: ${newDuration}s`);
            } else if (callEndedEvent?.call?.end_timestamp && callEndedEvent?.call?.start_timestamp) {
              newDuration = Math.floor((callEndedEvent.call.end_timestamp - callEndedEvent.call.start_timestamp) / 1000);
              console.log(`📦 Calculated from call_ended event timestamps: ${newDuration}s`);
            }
          }
        } catch (parseErr) {
          console.log(`⚠️  Could not parse webhook_data: ${parseErr.message}`);
        }
      }

      // If we found a duration, update it
      if (newDuration !== null && newDuration > 0) {
        db.run(
          `UPDATE call_logs SET call_duration = ?, updated_at = CURRENT_TIMESTAMP WHERE call_id = ?`,
          [newDuration, callId],
          function(updateErr) {
            if (updateErr) {
              console.error('❌ Error updating duration:', updateErr);
            } else {
              console.log(`✅ Updated duration to ${newDuration} seconds (${Math.floor(newDuration / 60)}:${String(newDuration % 60).padStart(2, '0')})`);
            }
            db.close();
            checkComprehensiveDatabase();
          }
        );
      } else {
        console.log(`⚠️  Could not determine duration from webhook data`);
        db.close();
        checkComprehensiveDatabase();
      }
    }
  );
});

function checkComprehensiveDatabase() {
  const compDb = new sqlite3.Database(comprehensiveDbPath, (err) => {
    if (err) {
      if (err.code === 'ENOENT') {
        console.log('');
        console.log('⚠️  Comprehensive database not found');
        console.log('');
        console.log('✅ Script complete!');
        process.exit(0);
      }
      console.error('Error opening comprehensive database:', err);
      process.exit(1);
    }

    compDb.get(
      `SELECT call_id, duration_ms, start_timestamp, end_timestamp FROM call_logs_comprehensive WHERE call_id = ?`,
      [callId],
      (err, row) => {
        if (err) {
          console.error('Error querying comprehensive database:', err);
          compDb.close();
          process.exit(1);
        }

        if (!row) {
          console.log(`⚠️  Call not found in comprehensive database`);
          compDb.close();
          console.log('');
          console.log('✅ Script complete!');
          process.exit(0);
        }

        let duration = null;
        
        if (row.duration_ms) {
          duration = Math.floor(row.duration_ms / 1000);
          console.log(`📦 Found duration_ms in comprehensive DB: ${row.duration_ms}ms = ${duration}s`);
        } else if (row.end_timestamp && row.start_timestamp) {
          duration = Math.floor((row.end_timestamp - row.start_timestamp) / 1000);
          console.log(`📦 Calculated from comprehensive DB timestamps: ${duration}s`);
        }

        if (duration !== null && duration > 0) {
          // Update main database
          const mainDb = new sqlite3.Database(dbPath, (err) => {
            if (err) {
              console.error('Error opening main database for update:', err);
              compDb.close();
              process.exit(1);
            }

            mainDb.run(
              `UPDATE call_logs SET call_duration = ?, updated_at = CURRENT_TIMESTAMP WHERE call_id = ?`,
              [duration, callId],
              function(updateErr) {
                if (updateErr) {
                  console.error('❌ Error updating duration:', updateErr);
                } else {
                  console.log(`✅ Updated duration from comprehensive DB: ${duration} seconds (${Math.floor(duration / 60)}:${String(duration % 60).padStart(2, '0')})`);
                }
                mainDb.close();
                compDb.close();
                console.log('');
                console.log('✅ Script complete!');
                process.exit(0);
              }
            );
          });
        } else {
          compDb.close();
          console.log('');
          console.log('✅ Script complete!');
          process.exit(0);
        }
      }
    );
  });
}


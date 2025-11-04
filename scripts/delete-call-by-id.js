#!/usr/bin/env node

/**
 * Script to delete a specific call by call_id
 * Usage: node scripts/delete-call-by-id.js call_f71323ec875af1dff8c5102ebaf
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const callId = process.argv[2];

if (!callId) {
  console.error('❌ Please provide a call_id');
  console.log('Usage: node scripts/delete-call-by-id.js <call_id>');
  process.exit(1);
}

const dbPath = path.join(__dirname, '..', 'database', 'calls.db');
const comprehensiveDbPath = path.join(__dirname, '..', 'database', 'fongo_comprehensive.db');

console.log(`🗑️  Deleting call: ${callId}`);
console.log('');

// Delete from main database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening main database:', err);
    return;
  }

  // First delete SMS logs
  db.run(
    `DELETE FROM sms_logs WHERE call_id = ?`,
    [callId],
    function(smsErr) {
      if (smsErr) {
        console.error('Error deleting SMS logs:', smsErr);
      } else {
        console.log(`✅ Deleted ${this.changes} SMS log entry/entries`);
      }

      // Then delete from call_logs
      db.run(
        `DELETE FROM call_logs WHERE call_id = ?`,
        [callId],
        function(callErr) {
          if (callErr) {
            console.error('Error deleting from call_logs:', callErr);
          } else {
            if (this.changes > 0) {
              console.log(`✅ Deleted call from main database (calls.db)`);
            } else {
              console.log(`⚠️  Call not found in main database`);
            }
          }

          db.close();
          deleteFromComprehensiveDatabase();
        }
      );
    }
  );
});

function deleteFromComprehensiveDatabase() {
  const compDb = new sqlite3.Database(comprehensiveDbPath, (err) => {
    if (err) {
      if (err.code === 'ENOENT') {
        console.log('');
        console.log('⚠️  Comprehensive database not found, skipping...');
        console.log('');
        console.log('✅ Deletion complete!');
        process.exit(0);
      }
      console.error('Error opening comprehensive database:', err);
      process.exit(1);
    }

    // First delete webhook events
    compDb.run(
      `DELETE FROM webhook_events WHERE call_id = ?`,
      [callId],
      function(webhookErr) {
        if (webhookErr) {
          console.error('Error deleting webhook events:', webhookErr);
        } else {
          console.log(`✅ Deleted ${this.changes} webhook event entry/entries`);
        }

        // Then delete from call_logs_comprehensive
        compDb.run(
          `DELETE FROM call_logs_comprehensive WHERE call_id = ?`,
          [callId],
          function(compErr) {
            if (compErr) {
              console.error('Error deleting from comprehensive database:', compErr);
            } else {
              if (this.changes > 0) {
                console.log(`✅ Deleted call from comprehensive database`);
              } else {
                console.log(`⚠️  Call not found in comprehensive database`);
              }
            }

            compDb.close();
            console.log('');
            console.log('✅ Deletion complete!');
            process.exit(0);
          }
        );
      }
    );
  });
}


#!/usr/bin/env node

/**
 * Script to delete test calls from specific phone numbers
 * Usage: node scripts/delete-test-calls.js
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'calls.db');
const comprehensiveDbPath = path.join(__dirname, '..', 'database', 'fongo_comprehensive.db');

// Phone numbers to delete (with and without + prefix)
const testNumbers = [
  '+15199918959',
  '15199918959',
  '+1-519-991-8959',
  '1-519-991-8959',
  '519-991-8959',
  '+15198040969',
  '15198040969',
  '+1-519-804-0969',
  '1-519-804-0969',
  '519-804-0969',
  '+14169131417',
  '14169131417',
  '+1-416-913-1417',
  '1-416-913-1417',
  '416-913-1417'
];

function normalizePhoneNumber(num) {
  // Remove all non-digit characters except leading +
  return num.replace(/[^\d+]/g, '');
}

// Extract just the digits from a phone number (for LIKE queries)
function extractDigits(num) {
  return num.replace(/\D/g, '');
}

function deleteCallsFromDatabase(dbPath, dbName) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        if (err.code === 'ENOENT') {
          console.log(`⚠️  ${dbName} database not found, skipping...`);
          resolve({ deleted: 0, smsDeleted: 0 });
          return;
        }
        reject(err);
        return;
      }
    });

    // First, get all matching call_ids
    // Use digit-only pattern matching for robust matching
    const digits1 = extractDigits(testNumbers[0]); // +15199918959
    const digits2 = extractDigits(testNumbers[5]); // +15198040969
    const digits3 = extractDigits(testNumbers[10]); // +14169131417
    
    db.all(
      `SELECT call_id, caller_number FROM call_logs 
       WHERE caller_number LIKE ? 
          OR caller_number LIKE ? 
          OR caller_number LIKE ?
          OR REPLACE(REPLACE(REPLACE(REPLACE(caller_number, '+', ''), '-', ''), ' ', ''), '(', '') LIKE ?
          OR REPLACE(REPLACE(REPLACE(REPLACE(caller_number, '+', ''), '-', ''), ' ', ''), '(', '') LIKE ?
          OR REPLACE(REPLACE(REPLACE(REPLACE(caller_number, '+', ''), '-', ''), ' ', ''), '(', '') LIKE ?`,
      [
        `%${digits1}%`, 
        `%${digits2}%`, 
        `%${digits3}%`,
        `%${digits1}%`,
        `%${digits2}%`,
        `%${digits3}%`
      ],
      (err, rows) => {
        if (err) {
          db.close();
          reject(err);
          return;
        }

        if (rows.length === 0) {
          console.log(`   No calls found in ${dbName} for these numbers`);
          db.close();
          resolve({ deleted: 0, smsDeleted: 0 });
          return;
        }

        const callIds = rows.map(r => r.call_id);
        console.log(`   Found ${callIds.length} calls in ${dbName}`);

        // Delete from SMS logs first (foreign key constraint)
        const smsPlaceholders = callIds.map(() => '?').join(',');
        db.run(
          `DELETE FROM sms_logs WHERE call_id IN (${smsPlaceholders})`,
          callIds,
          function(smsErr) {
            if (smsErr) {
              console.error(`   Error deleting SMS logs:`, smsErr);
            } else {
              console.log(`   Deleted ${this.changes} SMS log entries`);
            }

            // Delete from call_logs using the same pattern
            const digits1 = extractDigits(testNumbers[0]);
            const digits2 = extractDigits(testNumbers[5]);
            const digits3 = extractDigits(testNumbers[10]);
            
            db.run(
              `DELETE FROM call_logs 
               WHERE caller_number LIKE ? 
                  OR caller_number LIKE ? 
                  OR caller_number LIKE ?
                  OR REPLACE(REPLACE(REPLACE(REPLACE(caller_number, '+', ''), '-', ''), ' ', ''), '(', '') LIKE ?
                  OR REPLACE(REPLACE(REPLACE(REPLACE(caller_number, '+', ''), '-', ''), ' ', ''), '(', '') LIKE ?
                  OR REPLACE(REPLACE(REPLACE(REPLACE(caller_number, '+', ''), '-', ''), ' ', ''), '(', '') LIKE ?`,
              [
                `%${digits1}%`, 
                `%${digits2}%`, 
                `%${digits3}%`,
                `%${digits1}%`,
                `%${digits2}%`,
                `%${digits3}%`
              ],
              function(callErr) {
                if (callErr) {
                  db.close();
                  reject(callErr);
                  return;
                }

                console.log(`   ✅ Deleted ${this.changes} calls from ${dbName}`);
                db.close();
                resolve({ deleted: this.changes, smsDeleted: this.changes });
              }
            );
          }
        );
      }
    );
  });
}

function deleteCallsFromComprehensiveDatabase(dbPath, dbName) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        if (err.code === 'ENOENT') {
          console.log(`⚠️  ${dbName} database not found, skipping...`);
          resolve({ deleted: 0, webhookDeleted: 0 });
          return;
        }
        reject(err);
        return;
      }
    });

    const digits1 = extractDigits(testNumbers[0]);
    const digits2 = extractDigits(testNumbers[5]);
    const digits3 = extractDigits(testNumbers[10]);
    
    db.all(
      `SELECT call_id, from_number FROM call_logs_comprehensive 
       WHERE from_number LIKE ? 
          OR from_number LIKE ? 
          OR from_number LIKE ?
          OR REPLACE(REPLACE(REPLACE(REPLACE(from_number, '+', ''), '-', ''), ' ', ''), '(', '') LIKE ?
          OR REPLACE(REPLACE(REPLACE(REPLACE(from_number, '+', ''), '-', ''), ' ', ''), '(', '') LIKE ?
          OR REPLACE(REPLACE(REPLACE(REPLACE(from_number, '+', ''), '-', ''), ' ', ''), '(', '') LIKE ?`,
      [
        `%${digits1}%`, 
        `%${digits2}%`, 
        `%${digits3}%`,
        `%${digits1}%`,
        `%${digits2}%`,
        `%${digits3}%`
      ],
      (err, rows) => {
        if (err) {
          db.close();
          reject(err);
          return;
        }

        if (rows.length === 0) {
          console.log(`   No calls found in ${dbName} for these numbers`);
          db.close();
          resolve({ deleted: 0, webhookDeleted: 0 });
          return;
        }

        const callIds = rows.map(r => r.call_id);
        console.log(`   Found ${callIds.length} calls in ${dbName}`);

        // Delete from webhook_events first
        const webhookPlaceholders = callIds.map(() => '?').join(',');
        db.run(
          `DELETE FROM webhook_events WHERE call_id IN (${webhookPlaceholders})`,
          callIds,
          function(webhookErr) {
            if (webhookErr) {
              console.error(`   Error deleting webhook events:`, webhookErr);
            } else {
              console.log(`   Deleted ${this.changes} webhook event entries`);
            }

            // Delete from call_logs_comprehensive using the same pattern
            const digits1 = extractDigits(testNumbers[0]);
            const digits2 = extractDigits(testNumbers[5]);
            const digits3 = extractDigits(testNumbers[10]);
            
            db.run(
              `DELETE FROM call_logs_comprehensive 
               WHERE from_number LIKE ? 
                  OR from_number LIKE ? 
                  OR from_number LIKE ?
                  OR REPLACE(REPLACE(REPLACE(REPLACE(from_number, '+', ''), '-', ''), ' ', ''), '(', '') LIKE ?
                  OR REPLACE(REPLACE(REPLACE(REPLACE(from_number, '+', ''), '-', ''), ' ', ''), '(', '') LIKE ?
                  OR REPLACE(REPLACE(REPLACE(REPLACE(from_number, '+', ''), '-', ''), ' ', ''), '(', '') LIKE ?`,
              [
                `%${digits1}%`, 
                `%${digits2}%`, 
                `%${digits3}%`,
                `%${digits1}%`,
                `%${digits2}%`,
                `%${digits3}%`
              ],
              function(compErr) {
                if (compErr) {
                  db.close();
                  reject(compErr);
                  return;
                }

                console.log(`   ✅ Deleted ${this.changes} calls from ${dbName}`);
                db.close();
                resolve({ deleted: this.changes, webhookDeleted: this.changes });
              }
            );
          }
        );
      }
    );
  });
}

async function main() {
  console.log('🗑️  Deleting test calls from:');
  console.log('   - +15199918959');
  console.log('   - +15198040969');
  console.log('   - +14169131417');
  console.log('');

  try {
    // Delete from main database
    console.log('📊 Processing main database (calls.db)...');
    const mainResult = await deleteCallsFromDatabase(dbPath, 'main database');
    
    // Delete from comprehensive database
    console.log('');
    console.log('📊 Processing comprehensive database (fongo_comprehensive.db)...');
    const comprehensiveResult = await deleteCallsFromComprehensiveDatabase(comprehensiveDbPath, 'comprehensive database');

    console.log('');
    console.log('✅ Test call deletion complete!');
    
  } catch (error) {
    console.error('❌ Error deleting test calls:', error);
    process.exit(1);
  }
}

main();


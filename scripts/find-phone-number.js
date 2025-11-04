#!/usr/bin/env node

/**
 * Script to find how a phone number is stored in the database
 * Usage: node scripts/find-phone-number.js +14169131417
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'calls.db');
const comprehensiveDbPath = path.join(__dirname, '..', 'database', 'fongo_comprehensive.db');

const phoneNumber = process.argv[2] || '+14169131417';

console.log(`🔍 Searching for phone number: ${phoneNumber}`);
console.log('');

// Main database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening main database:', err);
    return;
  }

  console.log('📊 Main Database (calls.db):');
  console.log('----------------------------------------');
  
  // Try various formats
  const formats = [
    phoneNumber,
    phoneNumber.replace('+', ''),
    phoneNumber.replace(/^\+1/, ''),
    phoneNumber.replace(/^\+1/, '').replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3'),
    phoneNumber.replace(/^\+1/, '').replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3'),
    `1${phoneNumber.replace('+', '').replace(/^1/, '')}`,
    phoneNumber.replace('+', '1')
  ];

  db.all(
    `SELECT call_id, caller_number, call_date, call_time FROM call_logs WHERE caller_number LIKE ?`,
    [`%${phoneNumber.replace(/[^\d]/g, '')}%`],
    (err, rows) => {
      if (err) {
        console.error('Error:', err);
      } else {
        console.log(`Found ${rows.length} calls with LIKE pattern:`);
        rows.forEach(row => {
          console.log(`  - Call ID: ${row.call_id}`);
          console.log(`    Number: "${row.caller_number}"`);
          console.log(`    Date: ${row.call_date} ${row.call_time}`);
          console.log('');
        });

        // Also try exact matches with different formats
        console.log('Trying exact matches with different formats:');
        formats.forEach(format => {
          db.all(
            `SELECT call_id, caller_number FROM call_logs WHERE caller_number = ?`,
            [format],
            (err, exactRows) => {
              if (!err && exactRows.length > 0) {
                console.log(`  ✓ Exact match with format "${format}": ${exactRows.length} calls`);
                exactRows.forEach(row => {
                  console.log(`    - ${row.call_id}: "${row.caller_number}"`);
                });
              }
            }
          );
        });
      }

      // Wait a bit for async queries, then check comprehensive database
      setTimeout(() => {
        checkComprehensiveDatabase();
      }, 1000);
    }
  );
});

function checkComprehensiveDatabase() {
  const compDb = new sqlite3.Database(comprehensiveDbPath, (err) => {
    if (err) {
      if (err.code === 'ENOENT') {
        console.log('');
        console.log('⚠️  Comprehensive database not found');
        process.exit(0);
      }
      console.error('Error opening comprehensive database:', err);
      return;
    }

    console.log('');
    console.log('📊 Comprehensive Database (fongo_comprehensive.db):');
    console.log('----------------------------------------');

    compDb.all(
      `SELECT call_id, from_number, call_date, call_time FROM call_logs_comprehensive WHERE from_number LIKE ?`,
      [`%${phoneNumber.replace(/[^\d]/g, '')}%`],
      (err, rows) => {
        if (err) {
          console.error('Error:', err);
        } else {
          console.log(`Found ${rows.length} calls with LIKE pattern:`);
          rows.forEach(row => {
            console.log(`  - Call ID: ${row.call_id}`);
            console.log(`    Number: "${row.from_number}"`);
            console.log(`    Date: ${row.call_date} ${row.call_time}`);
            console.log('');
          });
        }

        compDb.close();
        process.exit(0);
      }
    );
  });
}


#!/usr/bin/env node

/**
 * Script to inspect all data for a specific call
 * Usage: node scripts/inspect-call-data.js call_1f51a81b24eccedb5ca33879175
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const callId = process.argv[2];

if (!callId) {
  console.error('❌ Please provide a call_id');
  console.log('Usage: node scripts/inspect-call-data.js <call_id>');
  process.exit(1);
}

const dbPath = path.join(__dirname, '..', 'database', 'calls.db');
const comprehensiveDbPath = path.join(__dirname, '..', 'database', 'fongo_comprehensive.db');

console.log(`🔍 Inspecting call: ${callId}`);
console.log('');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening main database:', err);
    process.exit(1);
  }

  // Get all call data
  db.get(
    `SELECT * FROM call_logs WHERE call_id = ?`,
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

      console.log('📊 Main Database (calls.db):');
      console.log('----------------------------------------');
      console.log(`Call ID: ${row.call_id}`);
      console.log(`Caller: ${row.caller_number} (${row.caller_name || 'No name'})`);
      console.log(`Date: ${row.call_date} ${row.call_time}`);
      console.log(`Duration: ${row.call_duration || 0} seconds`);
      console.log(`Update Successful: ${row.update_successful || 0}`);
      console.log(`Error: ${row.error_message || 'None'}`);
      console.log('');

      // Try to parse webhook_data
      if (row.webhook_data) {
        console.log('📦 Webhook Data (first 500 chars):');
        console.log('----------------------------------------');
        try {
          const webhookData = JSON.parse(row.webhook_data);
          console.log(JSON.stringify(webhookData, null, 2).substring(0, 1000));
          
          // Look for duration-related fields
          console.log('');
          console.log('🔍 Duration-related fields:');
          if (webhookData.call?.duration_ms) {
            console.log(`  call.duration_ms: ${webhookData.call.duration_ms}ms`);
          }
          if (webhookData.call?.start_timestamp) {
            console.log(`  call.start_timestamp: ${webhookData.call.start_timestamp} (${new Date(webhookData.call.start_timestamp).toISOString()})`);
          }
          if (webhookData.call?.end_timestamp) {
            console.log(`  call.end_timestamp: ${webhookData.call.end_timestamp} (${new Date(webhookData.call.end_timestamp).toISOString()})`);
          }
          if (webhookData.duration_ms) {
            console.log(`  duration_ms (root): ${webhookData.duration_ms}ms`);
          }
          if (webhookData.event) {
            console.log(`  Event type: ${webhookData.event}`);
          }
          if (Array.isArray(webhookData)) {
            console.log(`  Webhook data is an array with ${webhookData.length} events`);
            webhookData.forEach((event, idx) => {
              if (event.event) console.log(`    [${idx}] Event: ${event.event}`);
              if (event.call?.duration_ms) console.log(`    [${idx}] duration_ms: ${event.call.duration_ms}ms`);
            });
          }
        } catch (parseErr) {
          console.log(`⚠️  Could not parse webhook_data: ${parseErr.message}`);
          console.log(`Raw data (first 500 chars): ${row.webhook_data.substring(0, 500)}`);
        }
      } else {
        console.log('⚠️  No webhook_data stored');
      }

      db.close();
      checkComprehensiveDatabase();
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
        console.log('✅ Inspection complete!');
        process.exit(0);
      }
      console.error('Error opening comprehensive database:', err);
      process.exit(1);
    }

    compDb.get(
      `SELECT call_id, duration_ms, start_timestamp, end_timestamp, call_date, call_time FROM call_logs_comprehensive WHERE call_id = ?`,
      [callId],
      (err, row) => {
        if (err) {
          console.error('Error querying comprehensive database:', err);
          compDb.close();
          process.exit(1);
        }

        if (!row) {
          console.log('');
          console.log('⚠️  Call not found in comprehensive database');
          compDb.close();
          console.log('');
          console.log('✅ Inspection complete!');
          process.exit(0);
        }

        console.log('');
        console.log('📊 Comprehensive Database:');
        console.log('----------------------------------------');
        console.log(`Call ID: ${row.call_id}`);
        console.log(`Date: ${row.call_date} ${row.call_time}`);
        console.log(`Duration (ms): ${row.duration_ms || 'Not set'}`);
        if (row.start_timestamp) {
          console.log(`Start: ${row.start_timestamp} (${new Date(row.start_timestamp).toISOString()})`);
        }
        if (row.end_timestamp) {
          console.log(`End: ${row.end_timestamp} (${new Date(row.end_timestamp).toISOString()})`);
        }
        if (row.start_timestamp && row.end_timestamp) {
          const calculated = Math.floor((row.end_timestamp - row.start_timestamp) / 1000);
          console.log(`Calculated duration: ${calculated} seconds`);
        }

        compDb.close();
        console.log('');
        console.log('✅ Inspection complete!');
        process.exit(0);
      }
    );
  });
}


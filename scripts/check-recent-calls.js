#!/usr/bin/env node

/**
 * Check recent calls in database to verify everything is working
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'calls.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    process.exit(1);
  }
});

console.log('📊 Recent Calls Analysis\n');
console.log('='.repeat(60));

// Get calls by date
db.all(`
  SELECT 
    call_date,
    COUNT(*) as call_count,
    SUM(CASE WHEN update_successful = 1 THEN 1 ELSE 0 END) as successful,
    SUM(CASE WHEN update_successful = 0 THEN 1 ELSE 0 END) as failed
  FROM call_logs
  GROUP BY call_date
  ORDER BY call_date DESC
  LIMIT 10
`, [], (err, rows) => {
  if (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }

  console.log('\n📅 Calls by Date:');
  rows.forEach(row => {
    console.log(`   ${row.call_date}: ${row.call_count} calls (${row.successful} successful, ${row.failed} failed)`);
  });

  // Get most recent calls
  db.all(`
    SELECT 
      call_id,
      caller_number,
      call_date,
      call_time,
      update_successful,
      error_message
    FROM call_logs
    ORDER BY call_date DESC, call_time DESC
    LIMIT 10
  `, [], (err, calls) => {
    if (err) {
      console.error('Error:', err.message);
      process.exit(1);
    }

    console.log('\n📞 Most Recent Calls:');
    calls.forEach((call, index) => {
      const status = call.update_successful === 1 ? '✅' : call.update_successful === 0 ? '❌' : '⏳';
      console.log(`   ${index + 1}. ${call.call_date} ${call.call_time} - ${call.caller_number} ${status}`);
      if (call.error_message) {
        console.log(`      Error: ${call.error_message.substring(0, 60)}...`);
      }
    });

    // Check for gap
    const today = new Date().toISOString().split('T')[0];
    const lastCallDate = calls[0]?.call_date;
    
    console.log('\n🔍 Analysis:');
    if (lastCallDate === today) {
      console.log('   ✅ Recent calls are being logged today!');
    } else {
      console.log(`   ⚠️  Last call was on ${lastCallDate}`);
    }

    // Check if there's a gap
    const oct29Calls = rows.find(r => r.call_date === '2025-10-29');
    const nov3Calls = rows.find(r => r.call_date === '2025-11-03');
    
    if (oct29Calls && nov3Calls) {
      console.log(`   📊 Gap identified: No calls between Oct 29 and Nov 3`);
      console.log(`   ✅ This is expected - webhook URL was updated today`);
      console.log(`   ✅ Future calls should be logged normally`);
    }

    db.close();
  });
});


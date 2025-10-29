const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

// Database path - adjust if needed
const dbPath = path.join(__dirname, '..', 'database', 'calls.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to database');
});

// Query statistics
const sql = `
  SELECT 
    COUNT(*) as total_calls,
    SUM(CASE WHEN update_successful = 1 THEN 1 ELSE 0 END) as successful_updates,
    SUM(CASE WHEN update_successful = 0 AND update_successful IS NOT NULL THEN 1 ELSE 0 END) as failed_updates,
    COUNT(CASE WHEN update_successful IS NULL THEN 1 END) as pending_calls,
    COUNT(DISTINCT caller_number) as unique_callers
  FROM call_logs
`;

db.get(sql, [], (err, row) => {
  if (err) {
    console.error('❌ Error querying database:', err.message);
    db.close();
    process.exit(1);
  }

  console.log('\n📊 CALL STATISTICS\n');
  console.log(`Total Calls: ${row.total_calls || 0}`);
  console.log(`✅ Successful Updates: ${row.successful_updates || 0}`);
  console.log(`❌ Failed Updates: ${row.failed_updates || 0}`);
  console.log(`⏳ Pending Calls: ${row.pending_calls || 0}`);
  console.log(`👥 Unique Callers: ${row.unique_callers || 0}`);
  
  if (row.total_calls > 0) {
    const successRate = ((row.successful_updates || 0) / row.total_calls * 100).toFixed(1);
    console.log(`📈 Success Rate: ${successRate}%`);
  }

  console.log('\n');

  db.close();
});


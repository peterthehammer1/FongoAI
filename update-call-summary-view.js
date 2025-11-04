// Update call_summary view to filter failed calls before Nov 4, 2025
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'calls.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
  
  console.log('Connected to database');
  
  // Drop existing view
  db.run('DROP VIEW IF EXISTS call_summary', (err) => {
    if (err) {
      console.error('Error dropping view:', err);
      process.exit(1);
    }
    
    console.log('✓ Dropped old view');
    
    // Create new view with filter
    const createViewSQL = `
      CREATE VIEW call_summary AS
      SELECT 
          COUNT(*) as total_calls,
          SUM(CASE WHEN update_successful = 1 THEN 1 ELSE 0 END) as successful_updates,
          SUM(CASE WHEN update_successful = 0 THEN 1 ELSE 0 END) as failed_updates,
          AVG(call_duration) as avg_duration,
          COUNT(DISTINCT caller_number) as unique_callers,
          COUNT(CASE WHEN card_type = 'visa' THEN 1 END) as visa_count,
          COUNT(CASE WHEN card_type = 'mastercard' THEN 1 END) as mastercard_count,
          COUNT(CASE WHEN card_type = 'amex' THEN 1 END) as amex_count
      FROM call_logs
      WHERE (call_date >= '2025-11-04' OR (call_date < '2025-11-04' AND update_successful = 1));
    `;
    
    db.run(createViewSQL, (err) => {
      if (err) {
        console.error('Error creating view:', err);
        process.exit(1);
      }
      
      console.log('✓ Created new view with filter');
      console.log('  - Shows all calls from Nov 4, 2025 forward');
      console.log('  - Shows only successful calls from before Nov 4, 2025');
      
      db.close((err) => {
        if (err) {
          console.error('Error closing database:', err);
          process.exit(1);
        }
        console.log('✓ Database updated successfully');
        process.exit(0);
      });
    });
  });
});


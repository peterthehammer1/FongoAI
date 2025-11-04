// Delete ALL failed calls before Nov 4, 2025
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'calls.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
  
  console.log('Connected to database');
  
  // First, check how many failed calls before Nov 4 exist
  const checkSQL = `
    SELECT COUNT(*) as count 
    FROM call_logs 
    WHERE call_date < '2025-11-04'
      AND (update_successful = 0 OR update_successful IS NULL)
  `;
  
  db.get(checkSQL, [], (err, row) => {
    if (err) {
      console.error('Error checking calls:', err);
      process.exit(1);
    }
    
    const count = row.count;
    console.log(`Found ${count} failed calls before Nov 4, 2025`);
    
    if (count === 0) {
      console.log('No failed calls found to delete');
      db.close();
      process.exit(0);
    }
    
    // Show breakdown
    const breakdownSQL = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN error_message IS NOT NULL AND error_message != '' THEN 1 END) as with_error_msg,
        COUNT(CASE WHEN error_message IS NULL OR error_message = '' THEN 1 END) as no_error_msg
      FROM call_logs 
      WHERE call_date < '2025-11-04'
        AND (update_successful = 0 OR update_successful IS NULL)
    `;
    
    db.get(breakdownSQL, [], (err, breakdown) => {
      if (!err && breakdown) {
        console.log(`  - ${breakdown.with_error_msg} with error messages`);
        console.log(`  - ${breakdown.no_error_msg} without error messages`);
      }
      
      // Show sample of what will be deleted
      const sampleSQL = `
        SELECT call_id, call_date, call_time, caller_number, error_message, update_successful
        FROM call_logs 
        WHERE call_date < '2025-11-04'
          AND (update_successful = 0 OR update_successful IS NULL)
        ORDER BY call_date DESC, call_time DESC
        LIMIT 10
      `;
      
      db.all(sampleSQL, [], (err, rows) => {
        if (!err && rows.length > 0) {
          console.log('\nSample calls to be deleted:');
          rows.forEach(row => {
            const status = row.update_successful === 0 ? 'Failed' : 'No Status';
            const error = row.error_message ? row.error_message.substring(0, 50) : 'No error message';
            console.log(`  - ${row.call_id}: ${row.call_date} ${row.call_time || ''} (${row.caller_number || 'N/A'}) - ${status}`);
            if (row.error_message) {
              console.log(`    Error: ${error}${row.error_message.length > 50 ? '...' : ''}`);
            }
          });
          if (count > 10) {
            console.log(`  ... and ${count - 10} more`);
          }
        }
        
        // Delete ALL failed calls before Nov 4
        const deleteSQL = `
          DELETE FROM call_logs 
          WHERE call_date < '2025-11-04'
            AND (update_successful = 0 OR update_successful IS NULL)
        `;
        
        db.run(deleteSQL, [], function(err) {
          if (err) {
            console.error('Error deleting calls:', err);
            process.exit(1);
          }
          
          console.log(`\n✓ Deleted ${this.changes} failed calls before Nov 4, 2025`);
          
          // Verify deletion
          db.get(`SELECT COUNT(*) as remaining FROM call_logs 
            WHERE call_date < '2025-11-04'
              AND (update_successful = 0 OR update_successful IS NULL)`, [], (err, verify) => {
            if (!err) {
              console.log(`✓ Verification: ${verify.remaining} failed calls remaining before Nov 4`);
            }
            
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
    });
  });
});


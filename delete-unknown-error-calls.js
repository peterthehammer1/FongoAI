// Delete all calls with "UNKNOWN ERROR" status before Nov 4, 2025
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'calls.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
  
  console.log('Connected to database');
  
  // First, check how many calls will be deleted
  // Looking for calls with error_message containing "UNKNOWN ERROR" or similar
  const checkSQL = `
    SELECT COUNT(*) as count 
    FROM call_logs 
    WHERE (error_message LIKE '%UNKNOWN ERROR%' 
      OR error_message LIKE '%Unknown Error%'
      OR error_message LIKE '%unknown error%'
      OR error_message = 'UNKNOWN ERROR'
      OR error_message = 'Unknown Error')
    AND call_date < '2025-11-04'
    AND (update_successful = 0 OR update_successful IS NULL)
  `;
  
  db.get(checkSQL, [], (err, row) => {
    if (err) {
      console.error('Error checking calls:', err);
      process.exit(1);
    }
    
    const count = row.count;
    console.log(`Found ${count} calls with "UNKNOWN ERROR" before Nov 4, 2025`);
    
    if (count === 0) {
      console.log('No calls found to delete');
      db.close();
      process.exit(0);
    }
    
    // Show details of what will be deleted
    const detailsSQL = `
      SELECT call_id, call_date, call_time, caller_number, error_message, update_successful
      FROM call_logs 
      WHERE (error_message LIKE '%UNKNOWN ERROR%' 
        OR error_message LIKE '%Unknown Error%'
        OR error_message LIKE '%unknown error%'
        OR error_message = 'UNKNOWN ERROR'
        OR error_message = 'Unknown Error')
      AND call_date < '2025-11-04'
      AND (update_successful = 0 OR update_successful IS NULL)
      ORDER BY call_date DESC, call_time DESC
      LIMIT 10
    `;
    
    db.all(detailsSQL, [], (err, rows) => {
      if (err) {
        console.error('Error getting details:', err);
      } else {
        console.log('\nSample calls to be deleted:');
        rows.forEach(row => {
          console.log(`  - ${row.call_id}: ${row.call_date} ${row.call_time || ''} (${row.caller_number || 'N/A'})`);
          console.log(`    Error: ${row.error_message || 'N/A'}`);
        });
        if (count > 10) {
          console.log(`  ... and ${count - 10} more`);
        }
      }
      
      // Delete the calls
      const deleteSQL = `
        DELETE FROM call_logs 
        WHERE (error_message LIKE '%UNKNOWN ERROR%' 
          OR error_message LIKE '%Unknown Error%'
          OR error_message LIKE '%unknown error%'
          OR error_message = 'UNKNOWN ERROR'
          OR error_message = 'Unknown Error')
        AND call_date < '2025-11-04'
        AND (update_successful = 0 OR update_successful IS NULL)
      `;
      
      db.run(deleteSQL, [], function(err) {
        if (err) {
          console.error('Error deleting calls:', err);
          process.exit(1);
        }
        
        console.log(`\n✓ Deleted ${this.changes} calls with "UNKNOWN ERROR" before Nov 4, 2025`);
        
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


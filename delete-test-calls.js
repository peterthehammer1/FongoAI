// Delete test calls from 519-991-8959 before Nov 4, 2025
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
  const checkSQL = `
    SELECT COUNT(*) as count 
    FROM call_logs 
    WHERE caller_number LIKE '%5199918959%' 
      OR caller_number LIKE '%519-991-8959%'
      OR caller_number = '5199918959'
      OR caller_number = '519-991-8959'
      OR caller_number = '15199918959'
      OR caller_number = '1-519-991-8959'
    AND call_date < '2025-11-04'
  `;
  
  db.get(checkSQL, [], (err, row) => {
    if (err) {
      console.error('Error checking calls:', err);
      process.exit(1);
    }
    
    const count = row.count;
    console.log(`Found ${count} calls to delete from 519-991-8959 before Nov 4, 2025`);
    
    if (count === 0) {
      console.log('No calls found to delete');
      db.close();
      process.exit(0);
    }
    
    // Show details of what will be deleted
    const detailsSQL = `
      SELECT call_id, call_date, call_time, update_successful, caller_number
      FROM call_logs 
      WHERE (caller_number LIKE '%5199918959%' 
        OR caller_number LIKE '%519-991-8959%'
        OR caller_number = '5199918959'
        OR caller_number = '519-991-8959'
        OR caller_number = '15199918959'
        OR caller_number = '1-519-991-8959')
      AND call_date < '2025-11-04'
      ORDER BY call_date DESC, call_time DESC
      LIMIT 10
    `;
    
    db.all(detailsSQL, [], (err, rows) => {
      if (err) {
        console.error('Error getting details:', err);
      } else {
        console.log('\nSample calls to be deleted:');
        rows.forEach(row => {
          console.log(`  - ${row.call_id}: ${row.call_date} ${row.call_time} (${row.caller_number}) - ${row.update_successful ? 'Success' : 'Failed'}`);
        });
        if (count > 10) {
          console.log(`  ... and ${count - 10} more`);
        }
      }
      
      // Delete the calls
      const deleteSQL = `
        DELETE FROM call_logs 
        WHERE (caller_number LIKE '%5199918959%' 
          OR caller_number LIKE '%519-991-8959%'
          OR caller_number = '5199918959'
          OR caller_number = '519-991-8959'
          OR caller_number = '15199918959'
          OR caller_number = '1-519-991-8959')
        AND call_date < '2025-11-04'
      `;
      
      db.run(deleteSQL, [], function(err) {
        if (err) {
          console.error('Error deleting calls:', err);
          process.exit(1);
        }
        
        console.log(`\n✓ Deleted ${this.changes} calls from 519-991-8959 before Nov 4, 2025`);
        
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


# Delete Calls with "UNKNOWN ERROR" Before Nov 4

This script will permanently delete all calls with "Failed UNKNOWN ERROR" status that occurred before November 4, 2025.

## Run on Server:

```bash
cd /var/www/nucleusai

# Option 1: Use the script file
node delete-unknown-error-calls.js

# Option 2: Run inline
node << 'EOF'
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'database', 'calls.db');
const db = new sqlite3.Database(dbPath);

// Check how many to delete
db.get(`SELECT COUNT(*) as count FROM call_logs 
  WHERE (error_message LIKE '%UNKNOWN ERROR%' 
    OR error_message LIKE '%Unknown Error%'
    OR error_message LIKE '%unknown error%'
    OR error_message = 'UNKNOWN ERROR'
    OR error_message = 'Unknown Error')
  AND call_date < '2025-11-04'
  AND (update_successful = 0 OR update_successful IS NULL)`, [], (err, row) => {
  if (err) {
    console.error('Error:', err);
    db.close();
    process.exit(1);
  }
  console.log(`Found ${row.count} calls with "UNKNOWN ERROR" to delete`);
  
  if (row.count === 0) {
    console.log('No calls found to delete');
    db.close();
    process.exit(0);
  }
  
  // Delete them
  db.run(`DELETE FROM call_logs 
    WHERE (error_message LIKE '%UNKNOWN ERROR%' 
      OR error_message LIKE '%Unknown Error%'
      OR error_message LIKE '%unknown error%'
      OR error_message = 'UNKNOWN ERROR'
      OR error_message = 'Unknown Error')
    AND call_date < '2025-11-04'
    AND (update_successful = 0 OR update_successful IS NULL)`, [], function(err) {
    if (err) {
      console.error('Error:', err);
      db.close();
      process.exit(1);
    }
    console.log(`✓ Deleted ${this.changes} calls`);
    db.close();
    process.exit(0);
  });
});
EOF

# Restart app to refresh
pm2 restart nucleusai
```

**Warning:** This permanently deletes the calls from the database. They cannot be recovered.


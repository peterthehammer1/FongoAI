# Delete ALL Failed Calls Before Nov 4, 2025

This script will permanently delete ALL failed calls (update_successful = 0 or NULL) that occurred before November 4, 2025.

## Run on Server:

```bash
cd /var/www/nucleusai

# Option 1: Use the script file
node delete-all-failed-before-nov4.js

# Option 2: Run inline
node << 'EOF'
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'database', 'calls.db');
const db = new sqlite3.Database(dbPath);

// Check how many to delete
db.get(`SELECT COUNT(*) as count FROM call_logs 
  WHERE call_date < '2025-11-04'
    AND (update_successful = 0 OR update_successful IS NULL)`, [], (err, row) => {
  if (err) {
    console.error('Error:', err);
    db.close();
    process.exit(1);
  }
  console.log(`Found ${row.count} failed calls before Nov 4`);
  
  if (row.count === 0) {
    console.log('No failed calls found to delete');
    db.close();
    process.exit(0);
  }
  
  // Delete them
  db.run(`DELETE FROM call_logs 
    WHERE call_date < '2025-11-04'
      AND (update_successful = 0 OR update_successful IS NULL)`, [], function(err) {
    if (err) {
      console.error('Error:', err);
      db.close();
      process.exit(1);
    }
    console.log(`✓ Deleted ${this.changes} failed calls`);
    db.close();
    process.exit(0);
  });
});
EOF

# Restart app to refresh
pm2 restart nucleusai
```

**Warning:** This permanently deletes ALL failed calls before Nov 4, 2025 from the database. They cannot be recovered.


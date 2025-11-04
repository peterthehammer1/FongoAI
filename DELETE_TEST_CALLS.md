# Delete Test Calls from 519-991-8959

This script will permanently delete all calls from phone number 519-991-8959 that occurred before November 4, 2025.

## Run on Server:

```bash
cd /var/www/nucleusai

# Option 1: Use the script file
node delete-test-calls.js

# Option 2: Run inline
node << 'EOF'
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'database', 'calls.db');
const db = new sqlite3.Database(dbPath);

// Check how many to delete
db.get(`SELECT COUNT(*) as count FROM call_logs 
  WHERE (caller_number LIKE '%5199918959%' OR caller_number LIKE '%519-991-8959%' 
    OR caller_number = '5199918959' OR caller_number = '519-991-8959'
    OR caller_number = '15199918959' OR caller_number = '1-519-991-8959')
  AND call_date < '2025-11-04'`, [], (err, row) => {
  if (err) {
    console.error('Error:', err);
    process.exit(1);
  }
  console.log(`Found ${row.count} calls to delete`);
  
  // Delete them
  db.run(`DELETE FROM call_logs 
    WHERE (caller_number LIKE '%5199918959%' OR caller_number LIKE '%519-991-8959%'
      OR caller_number = '5199918959' OR caller_number = '519-991-8959'
      OR caller_number = '15199918959' OR caller_number = '1-519-991-8959')
    AND call_date < '2025-11-04'`, [], function(err) {
    if (err) {
      console.error('Error:', err);
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


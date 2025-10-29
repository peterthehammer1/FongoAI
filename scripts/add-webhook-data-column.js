const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database path
const dbPath = path.join(__dirname, '..', 'database', 'calls.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to database');
});

// Check if column already exists
db.all("PRAGMA table_info(call_logs)", [], (err, columns) => {
  if (err) {
    console.error('Error checking table info:', err.message);
    db.close();
    process.exit(1);
  }

  const hasWebhookData = columns.some(col => col.name === 'webhook_data');
  
  if (hasWebhookData) {
    console.log('✅ webhook_data column already exists');
    db.close();
    process.exit(0);
  }

  // Add webhook_data column
  console.log('Adding webhook_data column...');
  db.run(
    'ALTER TABLE call_logs ADD COLUMN webhook_data TEXT',
    (err) => {
      if (err) {
        console.error('❌ Error adding webhook_data column:', err.message);
        db.close();
        process.exit(1);
      } else {
        console.log('✅ webhook_data column added successfully');
        db.close();
      }
    }
  );
});


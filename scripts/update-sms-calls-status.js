/**
 * Script to update existing calls that have SMS sent but are marked as failed
 * Changes status from "Not a Fongo Phone. Sent SMS." or "Failed" to "Payment Link Sent"
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'calls.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
});

console.log('🔄 Updating calls with SMS sent status...\n');

// First, get all calls where SMS was sent but status might be wrong
db.all(`
  SELECT 
    c.call_id,
    c.error_message,
    c.update_successful,
    c.card_type,
    COUNT(s.id) as sms_count
  FROM call_logs c
  LEFT JOIN sms_logs s ON c.call_id = s.call_id AND s.sms_sent = 1
  WHERE s.sms_sent = 1
    AND (c.update_successful IS NULL OR c.update_successful = 0)
    AND (c.card_type IS NULL OR c.card_type = '')
    AND (c.error_message IS NULL 
         OR c.error_message != 'Payment Link Sent'
         OR c.error_message = 'Not a Fongo Phone. Sent SMS.')
  GROUP BY c.call_id
`, [], (err, rows) => {
  if (err) {
    console.error('Error querying calls:', err);
    db.close();
    process.exit(1);
  }

  if (rows.length === 0) {
    console.log('✅ No calls need updating.');
    db.close();
    process.exit(0);
  }

  console.log(`Found ${rows.length} call(s) to update:\n`);

  let updated = 0;
  let errors = 0;

  rows.forEach((row, index) => {
    const updateSql = `
      UPDATE call_logs
      SET error_message = 'Payment Link Sent',
          updated_at = CURRENT_TIMESTAMP
      WHERE call_id = ?
    `;

    db.run(updateSql, [row.call_id], function(updateErr) {
      if (updateErr) {
        console.error(`❌ Error updating call ${row.call_id}:`, updateErr.message);
        errors++;
      } else {
        console.log(`✅ Updated call ${row.call_id} - Status: Payment Link Sent`);
        updated++;
      }

      // When all updates are done
      if (index === rows.length - 1) {
        console.log(`\n📊 Summary:`);
        console.log(`   ✅ Updated: ${updated}`);
        console.log(`   ❌ Errors: ${errors}`);
        console.log(`   📝 Total: ${rows.length}`);
        db.close();
      }
    });
  });
});


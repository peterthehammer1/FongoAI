# Deploy Failed Calls Filter

This update filters out failed calls from November 3, 2025 and earlier, showing only successful calls from that period. From November 4, 2025 forward, all calls (both successful and failed) are displayed.

## Changes Made:
1. Updated `getAllCalls()` - filters failed calls before Nov 4
2. Updated `searchCalls()` - filters failed calls before Nov 4
3. Updated `getAnalytics()` - all queries filter failed calls before Nov 4
4. Updated `call_summary` view - filters failed calls before Nov 4

## Deployment Steps:

Run this on your server:

```bash
cd /var/www/nucleusai

# 1. Update database.js
curl -o services/database.js https://raw.githubusercontent.com/peterthehammer1/FongoAI/main/services/database.js

# 2. Update database view (drop and recreate)
sqlite3 database/calls.db << 'EOF'
DROP VIEW IF EXISTS call_summary;
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
EOF

# 3. Restart the app
pm2 restart nucleusai

echo "✓ Filter applied - failed calls before Nov 4 are now hidden"
```

## What This Does:
- **Before Nov 4, 2025**: Only shows successful calls (filters out failed calls)
- **Nov 4, 2025 and forward**: Shows all calls (both successful and failed)

The filter is applied to:
- Dashboard call list
- Call search
- Summary statistics
- Analytics data


#!/bin/bash
# Script to investigate why calls between Oct 29 and Nov 3 weren't logged
# Run this in DigitalOcean console

echo "🔍 Investigating Missing Calls Between Oct 29 - Nov 3"
echo "=================================================="
echo ""

cd /var/www/nucleusai

echo "1️⃣  Checking all calls in database..."
echo "----------------------------------------"
sqlite3 database/calls.db "SELECT COUNT(*) as total_calls FROM call_logs;"
echo ""

echo "2️⃣  Calls by date (last 2 weeks)..."
echo "----------------------------------------"
sqlite3 database/calls.db "SELECT call_date, COUNT(*) as count FROM call_logs WHERE call_date >= date('now', '-14 days') GROUP BY call_date ORDER BY call_date DESC;"
echo ""

echo "3️⃣  Checking for calls with errors..."
echo "----------------------------------------"
sqlite3 database/calls.db "SELECT call_date, COUNT(*) as failed_count FROM call_logs WHERE update_successful = 0 AND call_date >= '2025-10-29' GROUP BY call_date ORDER BY call_date DESC;"
echo ""

echo "4️⃣  Checking PM2 logs for webhook activity (Oct 29 - Nov 3)..."
echo "----------------------------------------"
echo "Looking for webhook activity during the gap period..."
pm2 logs nucleusai --lines 1000 | grep -E "2025-10-2[9]|2025-10-3[0-1]|2025-11-0[1-2]" | grep -iE "webhook|call_started|call_ended" | head -20
echo ""

echo "5️⃣  Checking for webhook errors..."
echo "----------------------------------------"
pm2 logs nucleusai --err --lines 500 | grep -E "2025-10-2[9]|2025-10-3[0-1]|2025-11-0[1-2]" | head -20
echo ""

echo "6️⃣  Checking if old webhook URL was accessible..."
echo "----------------------------------------"
echo "Testing old webhook URL: http://134.122.37.50:3000/webhook"
curl -s -X POST http://134.122.37.50:3000/webhook \
  -H "Content-Type: application/json" \
  -d '{"event":"test","call":{"call_id":"test-old-url"}}' || echo "❌ Old URL not accessible"
echo ""

echo "7️⃣  Checking server uptime history..."
echo "----------------------------------------"
echo "When was the server last restarted?"
last reboot | head -5
echo ""

echo "8️⃣  Checking PM2 process history..."
echo "----------------------------------------"
pm2 list
echo ""
echo "Check if process was restarted frequently:"
pm2 logs nucleusai --lines 50 | grep -i "restart\|error\|crash" | tail -10
echo ""

echo "9️⃣  Checking database for any webhook data stored..."
echo "----------------------------------------"
sqlite3 database/calls.db "SELECT call_id, call_date, CASE WHEN webhook_data IS NULL THEN 'No' ELSE 'Yes' END as has_webhook_data FROM call_logs WHERE call_date >= '2025-10-29' ORDER BY call_date DESC LIMIT 10;"
echo ""

echo "✅ Investigation complete!"
echo ""
echo "📋 Next Steps:"
echo "   1. Check if Retell AI has logs for calls made during the gap"
echo "   2. Verify if the old webhook URL was accessible from Retell AI"
echo "   3. Check Retell AI dashboard for webhook delivery errors"
echo "   4. Verify if calls were actually made during that period"


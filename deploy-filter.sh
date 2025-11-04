#!/bin/bash
# Deploy failed calls filter to server

cd /var/www/nucleusai

echo "=== 1. Updating database.js ==="
curl -o services/database.js https://raw.githubusercontent.com/peterthehammer1/FongoAI/main/services/database.js
if [ $? -eq 0 ]; then
    echo "✓ database.js updated"
else
    echo "❌ Failed to update database.js"
    exit 1
fi

echo ""
echo "=== 2. Updating database view ==="
node update-call-summary-view.js
if [ $? -eq 0 ]; then
    echo "✓ Database view updated"
else
    echo "❌ Failed to update view"
    exit 1
fi

echo ""
echo "=== 3. Restarting app ==="
pm2 restart nucleusai

echo ""
echo "✓ Deployment complete!"
echo ""
echo "Filter applied:"
echo "  - Before Nov 4, 2025: Only successful calls shown"
echo "  - Nov 4, 2025 and forward: All calls shown (successful + failed)"


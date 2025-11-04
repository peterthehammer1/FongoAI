#!/bin/bash
# Check what's actually in the server's routes file

cd /var/www/nucleusai

echo "=== Checking for /call/:callId route definition ==="
grep -n "router.get.*call.*:callId" routes/dashboard.js

echo ""
echo "=== Checking line count ==="
wc -l routes/dashboard.js

echo ""
echo "=== Checking for syntax errors ==="
node -c routes/dashboard.js && echo "✓ No syntax errors" || echo "❌ Syntax error found"

echo ""
echo "=== Checking if route is before module.exports ==="
CALL_LINE=$(grep -n "router.get('/call/:callId" routes/dashboard.js | cut -d: -f1)
EXPORT_LINE=$(grep -n "module.exports" routes/dashboard.js | cut -d: -f1)

if [ -n "$CALL_LINE" ] && [ -n "$EXPORT_LINE" ]; then
  if [ "$CALL_LINE" -lt "$EXPORT_LINE" ]; then
    echo "✓ Route is defined before module.exports (line $CALL_LINE vs $EXPORT_LINE)"
  else
    echo "❌ Route is defined AFTER module.exports!"
  fi
else
  echo "Could not find route or export line"
fi

echo ""
echo "=== Checking route definition context ==="
if [ -n "$CALL_LINE" ]; then
  sed -n "$((CALL_LINE - 2)),$((CALL_LINE + 10))p" routes/dashboard.js
fi


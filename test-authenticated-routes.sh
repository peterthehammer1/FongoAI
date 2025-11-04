#!/bin/bash
# Test routes with authentication

cd /var/www/nucleusai

echo "=== Testing login ==="
LOGIN_RESPONSE=$(curl -s -c /tmp/test-cookies.txt -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"pete@nucleus.com","password":"NucleusAI2025!Secure"}')

echo "$LOGIN_RESPONSE" | head -3

if echo "$LOGIN_RESPONSE" | grep -q "success.*true"; then
    echo "✓ Login successful"
    
    echo ""
    echo "=== Testing /dashboard/api/calls ==="
    CALLS_RESPONSE=$(curl -s -b /tmp/test-cookies.txt 'http://localhost:3000/dashboard/api/calls?limit=5')
    echo "$CALLS_RESPONSE" | head -10
    
    if echo "$CALLS_RESPONSE" | grep -q "success"; then
        echo "✓ Calls endpoint works!"
    else
        echo "❌ Calls endpoint failed"
        echo "Full response:"
        echo "$CALLS_RESPONSE"
    fi
    
    echo ""
    echo "=== Testing /dashboard/api/summary ==="
    SUMMARY_RESPONSE=$(curl -s -b /tmp/test-cookies.txt 'http://localhost:3000/dashboard/api/summary')
    echo "$SUMMARY_RESPONSE"
    
    if echo "$SUMMARY_RESPONSE" | grep -q "success"; then
        echo "✓ Summary endpoint works!"
    else
        echo "❌ Summary endpoint failed"
    fi
else
    echo "❌ Login failed"
    echo "Response: $LOGIN_RESPONSE"
fi


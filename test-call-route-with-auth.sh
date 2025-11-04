#!/bin/bash
# Test call route with authentication

cd /var/www/nucleusai

echo "=== Testing login ==="
LOGIN=$(curl -s -c /tmp/test-auth-cookies.txt -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"pete@nucleus.com","password":"NucleusAI2025!Secure"}')

if echo "$LOGIN" | grep -q "success.*true"; then
    echo "✓ Login successful"
    
    echo ""
    echo "=== Testing /dashboard/api/call route ==="
    CALL_RESPONSE=$(curl -s -b /tmp/test-auth-cookies.txt 'http://localhost:3000/dashboard/api/call/call_a0c4cc5b6ee7442064d81ae2497')
    
    echo "Response:"
    echo "$CALL_RESPONSE" | head -20
    
    if echo "$CALL_RESPONSE" | grep -q "success"; then
        echo ""
        echo "✓ Call route works!"
    else
        echo ""
        echo "❌ Call route failed"
        echo "HTTP Status:"
        curl -s -o /dev/null -w "%{http_code}\n" -b /tmp/test-auth-cookies.txt 'http://localhost:3000/dashboard/api/call/call_a0c4cc5b6ee7442064d81ae2497'
    fi
else
    echo "❌ Login failed"
fi


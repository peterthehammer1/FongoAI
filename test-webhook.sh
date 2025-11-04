#!/bin/bash

# Test Fongo AI Webhook Endpoint
echo "🧪 Testing Fongo AI Webhook..."
echo ""

# Test 1: Health Check
echo "1️⃣ Testing Health Endpoint..."
HEALTH=$(curl -s http://134.122.37.50:3000/health)
if [ $? -eq 0 ]; then
    echo "✅ Health check passed:"
    echo "$HEALTH"
else
    echo "❌ Health check failed - server may be down"
    exit 1
fi

echo ""
echo "2️⃣ Testing Webhook Endpoint with call_started event..."
WEBHOOK_TEST=$(curl -s -X POST http://134.122.37.50:3000/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "call_started",
    "call": {
      "call_id": "test_call_123",
      "from_number": "+15199918959",
      "from_name": "Test Caller"
    }
  }')

if [ $? -eq 0 ]; then
    echo "✅ Webhook response:"
    echo "$WEBHOOK_TEST"
else
    echo "❌ Webhook test failed"
    exit 1
fi

echo ""
echo "3️⃣ Testing update_credit_card function call..."
UPDATE_TEST=$(curl -s -X POST http://134.122.37.50:3000/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "name": "update_credit_card",
    "args": {
      "cardType": "visa",
      "cardNumber": "4532015128303669",
      "expiryMonth": "12",
      "expiryYear": "2027"
    },
    "call": {
      "call_id": "test_call_123",
      "from_number": "+15199918959"
    }
  }')

if [ $? -eq 0 ]; then
    echo "✅ Update credit card function response:"
    echo "$UPDATE_TEST"
else
    echo "❌ Update credit card test failed"
    exit 1
fi

echo ""
echo "✅ All tests completed!"


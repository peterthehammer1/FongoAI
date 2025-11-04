# Fix Missing Calls After Oct 29, 2025

## Problem
No calls showing in dashboard after Oct 29, 2025 at 3:19 PM

## Root Cause
The Retell AI agent is configured with the old IP-based webhook URL:
- **Current**: `http://134.122.37.50:3000/webhook`
- **Should be**: `http://fongoai.com/webhook`

If the webhook URL isn't accessible, Retell AI can't send call data, so calls aren't logged.

## Solution: Update Retell AI Agent Configuration

### Option 1: Update via Retell AI Dashboard (Recommended)

1. **Go to Retell AI Dashboard**
   - https://dashboard.retellai.com

2. **Find your agent**: "Fongo Credit Card Update Agent"

3. **Update Webhook URL**:
   - Change from: `http://134.122.37.50:3000/webhook`
   - Change to: `http://fongoai.com/webhook`

4. **Update LLM WebSocket URL**:
   - Change from: `ws://134.122.37.50:3000/llm-websocket`
   - Change to: `ws://fongoai.com/llm-websocket`

5. **Save changes**

### Option 2: Update via API Script

If you have your API key, run:

```bash
NUCLEUS_API_KEY=your_api_key_here \
NUCLEUS_AGENT_ID=your_agent_id_here \
node scripts/update-retell-webhook-url.js
```

## Verify Webhook is Working

After updating, check server logs:

```bash
# In DigitalOcean console
pm2 logs nucleusai --lines 100 | grep -E "webhook|call_started"
```

You should see:
- `Webhook received` messages
- `Call started: [call_id]` messages

## Test Webhook Endpoint

```bash
# Test from server
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d '{"event":"call_started","call":{"call_id":"test-123","from_number":"+1234567890"}}'
```

## Check Database for Missing Calls

If calls were made but not logged, check:

```bash
# In DigitalOcean console
cd /var/www/nucleusai
sqlite3 database/calls.db "SELECT COUNT(*) as total, MIN(call_date) as first_call, MAX(call_date) as last_call FROM call_logs;"
sqlite3 database/calls.db "SELECT call_id, caller_number, call_date, call_time FROM call_logs WHERE call_date >= '2025-10-29' ORDER BY call_date DESC, call_time DESC LIMIT 20;"
```

## Important Notes

1. **Webhook URL must be accessible** - Retell AI needs to reach your server
2. **Domain must resolve** - `fongoai.com` should point to `134.122.37.50`
3. **Server must be running** - PM2 process should be online
4. **Port 3000 must be accessible** - Nginx should proxy correctly

## After Fixing

1. **Make a test call** to verify webhooks are received
2. **Check dashboard** - new calls should appear
3. **Monitor logs** - watch for webhook activity

## Why This Happened

When you set up reporting on Oct 29, the webhook URL might have:
- Been pointing to the wrong location
- Not been updated when the server moved
- Been inaccessible due to DNS/firewall issues

The webhook code itself is correct - it just wasn't receiving data from Retell AI.


# Check Webhook Status - Instructions for DigitalOcean Console

## Problem
No calls showing after Oct 29, 2025 at 3:19 PM

## Quick Checks

### 1. Check Recent Webhook Activity

In DigitalOcean console, run:

```bash
cd /var/www/nucleusai
pm2 logs nucleusai --lines 200 | grep -E "webhook|call_started|call_ended|update_credit_card"
```

This will show if webhooks are being received.

### 2. Check Database for Recent Calls

```bash
cd /var/www/nucleusai
sqlite3 database/calls.db "SELECT call_id, caller_number, call_date, call_time, update_successful FROM call_logs ORDER BY call_date DESC, call_time DESC LIMIT 20;"
```

### 3. Check for Errors

```bash
pm2 logs nucleusai --err --lines 100
```

### 4. Test Webhook Endpoint Manually

```bash
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d '{"event":"call_started","call":{"call_id":"test-123","from_number":"+1234567890","from_name":"Test"}}'
```

Should return: `{"success":true}` or similar

## Most Likely Issue: Retell AI Webhook URL

The Retell AI agent configuration shows:
- **Current webhook**: `http://134.122.37.50:3000/webhook`
- **Should be**: `http://fongoai.com/webhook`

### Update Retell AI Configuration

1. Go to Retell AI Dashboard
2. Find your agent: "Fongo Credit Card Update Agent"
3. Update webhook URL to: `http://fongoai.com/webhook`
4. Update LLM WebSocket URL to: `ws://fongoai.com/llm-websocket`
5. Save changes

## Verify Webhook is Working

After updating, make a test call and check:

```bash
# In DigitalOcean console
pm2 logs nucleusai --lines 50 --nostream | tail -20
```

You should see:
- `Webhook received` messages
- `Call started: [call_id]` messages
- `Call ended: [call_id]` messages

## If No Webhooks Are Coming

1. **Check Retell AI agent status** - Is it active?
2. **Check Retell AI logs** - Are calls being made?
3. **Verify webhook URL** - Is it correct in Retell dashboard?
4. **Check firewall** - Is port 3000 accessible?
5. **Test from Retell** - Use Retell's webhook test feature

## Common Issues

### Issue: Webhook URL changed but Retell wasn't updated
**Fix**: Update webhook URL in Retell AI dashboard

### Issue: Server was down during calls
**Fix**: Check server uptime: `uptime` and `pm2 status`

### Issue: Database errors preventing storage
**Fix**: Check error logs: `pm2 logs nucleusai --err`

### Issue: Webhook endpoint returning errors
**Fix**: Test manually (see above) and check response


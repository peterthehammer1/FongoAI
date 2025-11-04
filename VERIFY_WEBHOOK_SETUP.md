# Verify Webhook Setup is Complete

## ✅ What You've Updated

1. **Agent Webhook URL**: `http://fongoai.com/webhook` ✅
2. **Custom Function: send_sms_link**: Updated to domain ✅
3. **Custom Function: update_credit_card**: Updated to domain ✅

## 🧪 Testing the Setup

### 1. Test Webhook Endpoint

Run this in the DigitalOcean console to test:

```bash
curl -X POST http://localhost:3000/webhook \
  -H "Content-Type: application/json" \
  -d '{"event":"call_started","call":{"call_id":"test-123","from_number":"+1234567890","from_name":"Test"}}'
```

Should return: `{"success":true}` or similar

### 2. Check Webhook Logs

```bash
pm2 logs nucleusai --lines 50 | grep -i webhook
```

You should see webhook activity when calls come in.

### 3. Make a Test Call

1. Call your Retell AI phone number
2. Complete a credit card update (or just start a call)
3. Check the dashboard - the call should appear

### 4. Monitor Real-Time Activity

In DigitalOcean console, watch for webhook activity:

```bash
pm2 logs nucleusai --lines 0
```

This will show real-time logs including:
- `Webhook received` - when Retell sends data
- `Call started: [call_id]` - when a call begins
- `Call ended: [call_id]` - when a call ends
- `update_credit_card` - when payment is updated

## 📋 What to Check

### Database Query
Check if calls are being stored:

```bash
cd /var/www/nucleusai
sqlite3 database/calls.db "SELECT call_id, caller_number, call_date, call_time, update_successful FROM call_logs ORDER BY call_date DESC, call_time DESC LIMIT 10;"
```

### Check Recent Activity
```bash
# Count calls by date
sqlite3 database/calls.db "SELECT call_date, COUNT(*) as count FROM call_logs GROUP BY call_date ORDER BY call_date DESC LIMIT 10;"
```

## ✅ Expected Behavior

After updating the webhook URLs:

1. **New calls will be logged** - Every call should create a database entry
2. **Webhooks will be received** - Server logs will show "Webhook received"
3. **Dashboard will update** - Calls appear in real-time (refreshes every 30 seconds)
4. **Payment updates will work** - Credit card updates will be processed

## 🔍 Troubleshooting

### If calls still don't appear:

1. **Check Nucleus AI Dashboard**:
   - Verify webhook URL is saved: `http://fongoai.com/webhook`
   - Check if there are any webhook delivery errors

2. **Check Server Logs**:
   ```bash
   pm2 logs nucleusai --err --lines 50
   ```

3. **Test Webhook Manually**:
   ```bash
   curl -X POST http://fongoai.com/webhook \
     -H "Content-Type: application/json" \
     -d '{"event":"call_started","call":{"call_id":"manual-test","from_number":"+1234567890"}}'
   ```

4. **Verify Domain Resolution**:
   ```bash
   dig fongoai.com +short
   # Should show: 134.122.37.50
   ```

## 📞 Next Steps

1. ✅ Webhook URLs updated
2. ⏳ Make a test call
3. ⏳ Verify call appears in dashboard
4. ⏳ Monitor for a few days to ensure all calls are logged

## 🎉 Success Indicators

- ✅ Webhook endpoint returns 200 OK
- ✅ Server logs show "Webhook received" messages
- ✅ Calls appear in dashboard within seconds
- ✅ Payment updates are processed correctly
- ✅ Transcripts are captured and displayed

Your setup should now be fully functional!


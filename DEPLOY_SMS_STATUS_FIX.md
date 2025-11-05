# Deploy SMS Status Fix to Server

## Quick Deployment Steps

SSH into your server and run these commands:

```bash
# SSH into server
ssh root@134.122.37.50

# Navigate to app directory
cd /var/www/nucleusai

# Pull latest code from GitHub
git pull origin main

# Restart the application to load new code
pm2 restart nucleusai

# Check that it's running
pm2 status

# View logs to verify no errors
pm2 logs nucleusai --lines 20 --nostream
```

## What Changed

This update adds:
1. **New function**: `checkAndUpdateSmsStatus()` in `services/database.js`
   - Checks if SMS was sent for a call
   - Updates call status to "Not a Fongo Phone. Sent SMS." if SMS sent but no payment update occurred

2. **Webhook handler**: Updated `call_ended` event in `routes/webhook.js`
   - Automatically checks SMS status when call ends
   - Updates call record appropriately

3. **Dashboard display**: Updated `formatPaymentStatus()` in `public/dashboard.html`
   - Shows "Not a Fongo Phone. Sent SMS." with gray badge instead of "Failed"
   - Hides this message from error column (shown in status column)

## Verification

After deployment, test by:
1. Making a test call where you say you're NOT calling from a Fongo Home Phone
2. Accept the SMS offer
3. Check the dashboard - should show "Not a Fongo Phone. Sent SMS." instead of "Failed"

## Troubleshooting

If changes don't appear:
```bash
# Check git status
cd /var/www/nucleusai
git status

# Check if files are updated
ls -la services/database.js routes/webhook.js public/dashboard.html

# Check PM2 logs for errors
pm2 logs nucleusai --lines 50

# Force reload if needed
pm2 reload nucleusai
```


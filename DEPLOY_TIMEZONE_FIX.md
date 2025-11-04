# Deploy EST Timezone Fix

## Quick Deploy (Copy-Paste Method)

Run these commands in the DigitalOcean console to update the files:

### 1. Update dashboard.html

```bash
cd /var/www/nucleusai/public
cp dashboard.html dashboard.html.backup
```

Then copy the updated `formatDateTime` and `formatDate` functions from your local `public/dashboard.html` file.

### 2. Update call-details.html

```bash
cp call-details.html call-details.html.backup
```

Then copy the updated `formatDateTime` and `formatTime` functions.

### 3. Update comprehensive-call-details.html

```bash
cp comprehensive-call-details.html comprehensive-call-details.html.backup
```

Then copy the updated `formatDateTime` and `formatTime` functions.

## Alternative: Use SCP from Your Local Machine

If you have SSH access from your local machine, run:

```bash
cd "/Users/petercross/Fongo Credit Card Updates"
scp public/dashboard.html root@134.122.37.50:/var/www/nucleusai/public/dashboard.html
scp public/call-details.html root@134.122.37.50:/var/www/nucleusai/public/call-details.html
scp public/comprehensive-call-details.html root@134.122.37.50:/var/www/nucleusai/public/comprehensive-call-details.html
```

## What Changed

All date/time formatting now uses `timeZone: 'America/New_York'` to display in EST/EDT.

No server restart needed - just refresh your browser!


# Deploy Missing Files to Server

## Issue
The server is missing `services/databaseComprehensive.js` and the directory is not a git repository.

## Solution: Download Missing Files from GitHub

Run these commands on your server:

```bash
# Navigate to app directory
cd /var/www/nucleusai

# Download the missing databaseComprehensive.js file
curl -o services/databaseComprehensive.js https://raw.githubusercontent.com/peterthehammer1/FongoAI/main/services/databaseComprehensive.js

# Also download the updated files we just changed
curl -o services/database.js https://raw.githubusercontent.com/peterthehammer1/FongoAI/main/services/database.js
curl -o routes/webhook.js https://raw.githubusercontent.com/peterthehammer1/FongoAI/main/routes/webhook.js
curl -o public/dashboard.html https://raw.githubusercontent.com/peterthehammer1/FongoAI/main/public/dashboard.html

# Also check if nucleusDataProcessor.js exists (renamed from retellDataProcessor.js)
if [ ! -f "services/nucleusDataProcessor.js" ]; then
    curl -o services/nucleusDataProcessor.js https://raw.githubusercontent.com/peterthehammer1/FongoAI/main/services/nucleusDataProcessor.js
fi

# Restart the application
pm2 restart nucleusai

# Check status
pm2 status
pm2 logs nucleusai --lines 20 --nostream
```

## Alternative: Initialize Git Repository

If you prefer to use git in the future:

```bash
cd /var/www/nucleusai

# Initialize git (if not already done)
git init

# Add remote
git remote add origin https://github.com/peterthehammer1/FongoAI.git

# Pull latest code
git pull origin main

# Restart
pm2 restart nucleusai
```


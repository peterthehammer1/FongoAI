# Fix Deployment Issues

## Current Issues
1. ✅ Files downloaded successfully
2. ❌ Missing schema file: `database/nucleus-comprehensive-schema.sql`
3. ⚠️ PM2 might need a full reload

## Solution

Run these commands on the server:

```bash
cd /var/www/nucleusai

# Verify files were downloaded
ls -la services/databaseComprehensive.js
ls -la services/database.js
ls -la routes/webhook.js

# Download the missing schema file (renamed during Tier 2)
curl -o database/nucleus-comprehensive-schema.sql https://raw.githubusercontent.com/peterthehammer1/FongoAI/main/database/nucleus-comprehensive-schema.sql

# Verify the schema file exists
ls -la database/nucleus-comprehensive-schema.sql

# Do a full PM2 reload (not just restart)
pm2 reload nucleusai

# Or if that doesn't work, stop and start
pm2 stop nucleusai
pm2 start nucleusai

# Check status
pm2 status
pm2 logs nucleusai --lines 30 --nostream
```


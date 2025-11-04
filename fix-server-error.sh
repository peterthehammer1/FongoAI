#!/bin/bash
# Commands to fix the server error
# Copy and paste these into the DigitalOcean console

cat << 'EOF'
# Run these commands in the DigitalOcean console:

# 1. Check error logs
cd /var/www/nucleusai
pm2 logs nucleusai --err --lines 50

# 2. Check if the app directory exists and has the right files
ls -la /var/www/nucleusai/
ls -la /var/www/nucleusai/index.js

# 3. Check Node.js version
node --version
npm --version

# 4. Try to install dependencies
cd /var/www/nucleusai
npm install

# 5. Try to start the app manually to see the error
cd /var/www/nucleusai
node index.js

# 6. If it starts, stop it (Ctrl+C) and restart with PM2
pm2 delete nucleusai
pm2 start index.js --name nucleusai
pm2 save

# 7. Check status again
pm2 status

# 8. Test health endpoint
curl http://localhost:3000/health
EOF


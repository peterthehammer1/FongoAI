#!/bin/bash
# Upload dashboard.html to server using curl
# This creates a temporary file on the server with the base64 content

echo "Uploading dashboard.html..."
echo "This will create the file on the server from base64 encoded content"

# Read the base64 file and create a script on the server
cat > /tmp/create-dashboard.js << 'JS_EOF'
const fs = require('fs');
const base64 = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
fs.writeFileSync('public/dashboard.html', Buffer.from(base64, 'base64').toString('utf8'));
console.log('✅ dashboard.html created');
console.log('Size:', fs.statSync('public/dashboard.html').size, 'bytes');
JS_EOF

echo "Now run this on the server:"
echo "cd /var/www/nucleusai"
echo "cat dashboard-base64.txt | node /tmp/create-dashboard.js"


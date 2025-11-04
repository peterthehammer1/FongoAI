#!/bin/bash
# Deploy timezone fix to server (EST timezone)

SERVER_IP="134.122.37.50"

echo "📤 Deploying EST timezone fix to server..."

# Copy updated HTML files
echo "Copying dashboard files..."
scp public/dashboard.html root@${SERVER_IP}:/var/www/nucleusai/public/dashboard.html
scp public/call-details.html root@${SERVER_IP}:/var/www/nucleusai/public/call-details.html
scp public/comprehensive-call-details.html root@${SERVER_IP}:/var/www/nucleusai/public/comprehensive-call-details.html

echo ""
echo "✅ Files copied!"
echo ""
echo "No restart needed - static HTML files are served directly."
echo "Refresh your browser to see the changes."


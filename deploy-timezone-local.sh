#!/bin/bash
# Deploy timezone fix from local machine
# Run this from your local machine (not on the server)

SERVER_IP="134.122.37.50"
SERVER_PATH="/var/www/nucleusai/public"

echo "📤 Deploying EST timezone fix to server..."
echo ""

# Check if files exist
if [ ! -f "public/dashboard.html" ]; then
    echo "❌ Error: public/dashboard.html not found"
    echo "   Make sure you're running this from the project root directory"
    exit 1
fi

echo "Copying files to server..."
scp public/dashboard.html root@${SERVER_IP}:${SERVER_PATH}/dashboard.html
scp public/call-details.html root@${SERVER_IP}:${SERVER_PATH}/call-details.html
scp public/comprehensive-call-details.html root@${SERVER_IP}:${SERVER_PATH}/comprehensive-call-details.html

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Files deployed successfully!"
    echo ""
    echo "No server restart needed - just refresh your browser at http://fongoai.com/dashboard"
else
    echo ""
    echo "❌ Deployment failed. Make sure you have SSH access configured."
    echo ""
    echo "If you don't have SSH keys set up, you can manually copy the files:"
    echo "1. Open DigitalOcean console"
    echo "2. Use nano to edit each file"
    echo "3. Copy/paste the updated content from your local files"
fi


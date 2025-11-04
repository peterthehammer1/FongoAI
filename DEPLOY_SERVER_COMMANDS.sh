#!/bin/bash
# Run this ON YOUR SERVER (DigitalOcean console)

cd /var/www/nucleusai

echo "🚀 Deploying error message improvements..."
echo ""

# Create services directory
mkdir -p services

# Download files from GitHub (these will work once you allow the secret and push)
echo "📥 Downloading files from GitHub..."
curl -o routes/webhook.js https://raw.githubusercontent.com/peterthehammer1/FongoAI/main/routes/webhook.js
curl -o public/dashboard.html https://raw.githubusercontent.com/peterthehammer1/FongoAI/main/public/dashboard.html
curl -o public/call-details.html https://raw.githubusercontent.com/peterthehammer1/FongoAI/main/public/call-details.html
curl -o services/errorMessages.js https://raw.githubusercontent.com/peterthehammer1/FongoAI/main/services/errorMessages.js

# Check if files downloaded successfully
if [ -f "services/errorMessages.js" ] && [ -f "routes/webhook.js" ]; then
    echo ""
    echo "✅ Files downloaded successfully"
    echo ""
    echo "🔄 Restarting application..."
    pm2 restart nucleusai
    echo ""
    echo "✅ Deployment complete!"
    echo ""
    echo "🧪 Test: https://fongoai.com/dashboard"
else
    echo ""
    echo "⚠️  Files not found on GitHub yet"
    echo "Please allow the secret and push to GitHub first, then run this script again"
fi


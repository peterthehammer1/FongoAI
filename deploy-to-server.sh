#!/bin/bash
# Run this script ON THE SERVER to deploy error message improvements

cd /var/www/nucleusai

echo "🚀 Deploying error message improvements..."
echo ""

# Pull latest changes from GitHub
echo "📥 Pulling latest changes from GitHub..."
git pull origin main

if [ $? -ne 0 ]; then
    echo "❌ Failed to pull from GitHub"
    echo "⚠️  You may need to manually download files from GitHub"
    exit 1
fi

# Verify files exist
echo ""
echo "✅ Verifying files..."
FILES=(
    "routes/webhook.js"
    "public/dashboard.html"
    "public/call-details.html"
    "services/errorMessages.js"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✓ $file"
    else
        echo "   ❌ $file - MISSING"
    fi
done

echo ""
echo "🔄 Restarting Node.js application..."
pm2 restart nucleusai

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment complete!"
    echo ""
    echo "📋 Changes deployed:"
    echo "   ✓ Enhanced error messages with technical + actionable format"
    echo "   ✓ Dashboard shows clear error details for billing department"
    echo "   ✓ Call details page shows both technical and user-facing errors"
    echo ""
    echo "🧪 Test the dashboard at: https://fongoai.com/dashboard"
else
    echo ""
    echo "❌ Failed to restart application"
    exit 1
fi


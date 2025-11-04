#!/bin/bash

# Deploy error message improvements to server
# This script uploads the updated files to the DigitalOcean server

echo "🚀 Deploying error message improvements to server..."
echo ""

SERVER="root@134.122.37.50"
SERVER_PATH="/var/www/nucleusai"

# Files to deploy
FILES=(
    "routes/webhook.js"
    "public/dashboard.html"
    "public/call-details.html"
    "services/errorMessages.js"
)

echo "📦 Files to deploy:"
for file in "${FILES[@]}"; do
    echo "   - $file"
done
echo ""

# Check if files exist locally
for file in "${FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Error: File $file not found locally"
        exit 1
    fi
done

echo "📤 Uploading files to server..."
echo ""

# Upload each file
for file in "${FILES[@]}"; do
    echo "Uploading $file..."
    # Use base64 encoding to transfer file content
    cat "$file" | ssh "$SERVER" "cat > $SERVER_PATH/$file"
    
    if [ $? -eq 0 ]; then
        echo "✅ $file uploaded successfully"
    else
        echo "❌ Failed to upload $file"
        echo ""
        echo "⚠️  Manual upload required:"
        echo "   scp $file $SERVER:$SERVER_PATH/$file"
        exit 1
    fi
done

echo ""
echo "🔄 Restarting Node.js application..."
ssh "$SERVER" "cd $SERVER_PATH && pm2 restart nucleusai"

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
    echo "Please manually restart: ssh $SERVER 'cd $SERVER_PATH && pm2 restart nucleusai'"
    exit 1
fi


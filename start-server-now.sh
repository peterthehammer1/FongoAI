#!/bin/bash
# One-command server startup script
# Run this: bash start-server-now.sh

ssh root@134.122.37.50 << 'ENDSSH'
cd /var/www/nucleusai
echo "📋 Current PM2 status:"
pm2 status

echo ""
echo "🚀 Starting/Restarting application..."
if pm2 list | grep -q "nucleusai"; then
    pm2 restart nucleusai
else
    if [ -f "ecosystem.config.js" ]; then
        pm2 start ecosystem.config.js --name nucleusai
    else
        pm2 start index.js --name nucleusai
    fi
fi

pm2 save

echo ""
echo "✅ Application status:"
pm2 status

echo ""
echo "📝 Recent logs:"
pm2 logs nucleusai --lines 10 --nostream

echo ""
echo "🧪 Testing health endpoint:"
sleep 2
curl -s http://localhost:3000/health || echo "❌ Health check failed - check logs above"

echo ""
echo "✅ Done!"
ENDSSH


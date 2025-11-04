#!/bin/bash
# Quick server diagnostic - Run this in DigitalOcean console

echo "🔍 Checking server status..."
echo ""

echo "1. PM2 Status:"
pm2 status
echo ""

echo "2. Recent PM2 Logs (last 20 lines):"
pm2 logs nucleusai --lines 20 --nostream
echo ""

echo "3. Nginx Status:"
sudo systemctl status nginx --no-pager | head -10
echo ""

echo "4. Test localhost:3000:"
curl -s http://localhost:3000/health || echo "❌ App not responding on port 3000"
echo ""

echo "5. Test domain:"
curl -s http://fongoai.com/health || echo "❌ Domain not responding"
echo ""

echo "6. Check if port 3000 is listening:"
sudo netstat -tlnp | grep 3000 || echo "❌ Port 3000 not listening"
echo ""

echo "7. Check Nginx error log:"
sudo tail -10 /var/log/nginx/error.log
echo ""

echo "✅ Diagnostic complete!"


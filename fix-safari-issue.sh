#!/bin/bash
# Fix Safari connection issues - Run on your Mac

echo "🔧 Fixing Safari Connection Issues..."
echo ""

# 1. Clear DNS cache
echo "1. Clearing DNS cache..."
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
echo "✅ DNS cache cleared"
echo ""

# 2. Disable HSTS (if Safari is forcing HTTPS)
echo "2. Disabling HSTS for fongoai.com..."
defaults write com.apple.Safari HSTSEnabled -bool false
echo "✅ HSTS disabled"
echo ""

# 3. Test connection
echo "3. Testing connection..."
if curl -s -o /dev/null -w "%{http_code}" http://fongoai.com/login | grep -q "200"; then
    echo "✅ Server is accessible!"
else
    echo "❌ Server connection failed"
fi

echo ""
echo "📋 Next Steps:"
echo "1. Quit Safari completely (Cmd+Q)"
echo "2. Reopen Safari"
echo "3. Go to: http://fongoai.com/login"
echo "4. If it still doesn't work, try Chrome/Firefox"


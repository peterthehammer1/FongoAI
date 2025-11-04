#!/bin/bash
# Deploy EST timezone fix - Run this on the server
# Copy and paste this entire script into DigitalOcean console

cd /var/www/nucleusai/public

echo "📤 Deploying EST timezone fix..."

# Backup files
cp dashboard.html dashboard.html.backup.$(date +%Y%m%d_%H%M%S)
cp call-details.html call-details.html.backup.$(date +%Y%m%d_%H%M%S)
cp comprehensive-call-details.html comprehensive-call-details.html.backup.$(date +%Y%m%d_%H%M%S)

echo "✅ Backups created"

# Update dashboard.html formatDateTime function
sed -i 's|const d = new Date(`\${date}T\${time || '\''00:00:00'\''}`);|const d = new Date(`\${date}T\${time || '\''00:00:00'\''}Z`);|' dashboard.html
sed -i '/formatDateTime.*{/,/}/ {
    s/hour: '\''2-digit'\''/hour: '\''2-digit'\'',\
                timeZone: '\''America\/New_York'\'',\
                hour12: true/
}' dashboard.html

# Update dashboard.html formatDate function  
sed -i 's|const d = new Date(date);|const d = new Date(date + '\''T00:00:00Z'\'');|' dashboard.html
sed -i '/formatDate.*{/,/}/ {
    s/toLocaleDateString('\''en-US'\'', { weekday: '\''short'\'' })/toLocaleDateString('\''en-US'\'', { \
                weekday: '\''short'\'',\
                timeZone: '\''America\/New_York'\''\
            })/
}' dashboard.html

# Update call-details.html formatDateTime
sed -i 's|const d = new Date(`\${date}T\${time || '\''00:00:00'\''}`);|const d = new Date(`\${date}T\${time || '\''00:00:00'\''}Z`);|' call-details.html
sed -i '/formatDateTime.*{/,/}/ {
    /second: '\''2-digit'\''/a\
                timeZone: '\''America\/New_York'\'',\
                hour12: true
}' call-details.html

# Update call-details.html formatTime
sed -i '/formatTime.*timestamp.*{/,/}/ {
    /minute: '\''2-digit'\''/a\
                timeZone: '\''America\/New_York'\'',\
                hour12: true
}' call-details.html

# Update comprehensive-call-details.html formatDateTime
sed -i 's|return `\${date} \${time}`;|// Parse as UTC since database stores in UTC\
            const d = new Date(`\${date}T\${time}Z`);\
            return d.toLocaleString('\''en-US'\'', { \
                month: '\''long'\'', \
                day: '\''numeric'\'', \
                year: '\''numeric'\'',\
                hour: '\''2-digit'\'',\
                minute: '\''2-digit'\'',\
                second: '\''2-digit'\'',\
                timeZone: '\''America\/New_York'\'',\
                hour12: true\
            });|' comprehensive-call-details.html

# Update comprehensive-call-details.html formatTime
sed -i '/formatTime.*timestamp.*{/,/}/ {
    s|return date.toLocaleTimeString();|return date.toLocaleTimeString('\''en-US'\'', {\
                hour: '\''2-digit'\'',\
                minute: '\''2-digit'\'',\
                timeZone: '\''America\/New_York'\'',\
                hour12: true\
            });|
}' comprehensive-call-details.html

echo "✅ Files updated!"
echo ""
echo "Refresh your browser to see the changes in EST timezone."


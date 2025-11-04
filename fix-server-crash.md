# Fix Server Crash - Run This in DigitalOcean Console

The app is crashing because `routes/monitoring.js` is missing. Copy and paste this to fix it:

```bash
cd /var/www/nucleusai

# Backup index.js
cp index.js index.js.backup.$(date +%Y%m%d_%H%M%S)

# Update the monitoring route check to check if file exists first
cat > /tmp/fix-monitoring.js << 'FIXSCRIPT'
const fs = require('fs');
const path = require('path');

const indexPath = '/var/www/nucleusai/index.js';
let indexContent = fs.readFileSync(indexPath, 'utf8');

// Replace the monitoring route section
const oldPattern = /\/\/ System monitoring \(optional - only if file exists\)[\s\S]*?logger\.warn\('Monitoring route not available', \{ error: error\.message \}\);/;
const newCode = `// System monitoring (optional - only if file exists)
const fs = require('fs');
const path = require('path');
const monitoringPath = path.join(__dirname, 'routes', 'monitoring.js');
if (fs.existsSync(monitoringPath)) {
  try {
    app.use('/monitoring', requireAuth, require('./routes/monitoring'));
  } catch (error) {
    logger.warn('Monitoring route not available', { error: error.message });
  }
} else {
  logger.info('Monitoring route not available (file does not exist)');
}`;

indexContent = indexContent.replace(oldPattern, newCode);

// Check if fs is already imported
if (!indexContent.includes("const fs = require('fs');") || indexContent.indexOf("const fs = require('fs');") === indexContent.lastIndexOf("const fs = require('fs');")) {
  // Only add fs if it's not already imported (or only appears once - in the monitoring section)
  // We'll add it near path since path is already imported
  indexContent = indexContent.replace(
    /const path = require\('path'\);[\s\n]*const session = require\('express-session'\);/,
    "const path = require('path');\nconst fs = require('fs');\nconst session = require('express-session');"
  );
}

fs.writeFileSync(indexPath, indexContent, 'utf8');
console.log('✅ Fixed index.js');
FIXSCRIPT

node /tmp/fix-monitoring.js

# Restart the app
pm2 restart nucleusai

# Check status
pm2 status
pm2 logs nucleusai --lines 20
```


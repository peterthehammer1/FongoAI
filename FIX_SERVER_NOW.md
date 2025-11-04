# Fix Server - Copy and Paste This

## Run this in DigitalOcean console:

```bash
cd /var/www/nucleusai

# Backup
cp index.js index.js.backup.$(date +%Y%m%d_%H%M%S)

# Apply fix using sed
sed -i '/const path = require/a const fs = require('\''fs'\'');' index.js
sed -i '/\/\/ System monitoring/,/logger\.warn.*Monitoring route not available.*}/c\
// System monitoring (optional - only if file exists)\
const monitoringPath = path.join(__dirname, '\''routes'\'', '\''monitoring.js'\'');\
if (fs.existsSync(monitoringPath)) {\
  try {\
    app.use('\''/monitoring'\'', requireAuth, require('\''./routes/monitoring'\''));\
  } catch (error) {\
    logger.warn('\''Monitoring route not available'\'', { error: error.message });\
  }\
} else {\
  logger.info('\''Monitoring route not available (file does not exist)'\'');\
}' index.js

# Restart
pm2 restart nucleusai

# Check
pm2 status
curl http://localhost:3000/health
```

## Or manually edit:

```bash
nano index.js
```

Find line 5 (where `path` is imported) and add after it:
```javascript
const fs = require('fs');
```

Then find the monitoring section (around line 54-59) and replace it with:
```javascript
// System monitoring (optional - only if file exists)
const monitoringPath = path.join(__dirname, 'routes', 'monitoring.js');
if (fs.existsSync(monitoringPath)) {
  try {
    app.use('/monitoring', requireAuth, require('./routes/monitoring'));
  } catch (error) {
    logger.warn('Monitoring route not available', { error: error.message });
  }
} else {
  logger.info('Monitoring route not available (file does not exist)');
}
```

Save (Ctrl+X, Y, Enter) then:
```bash
pm2 restart nucleusai
```


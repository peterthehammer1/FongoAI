# Deploy EST Timezone Fix - One Command

## Copy and paste this entire command into DigitalOcean console:

```bash
cd /var/www/nucleusai && cat > deploy-timezone.js << 'DEPLOYSCRIPT'
#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const publicDir = '/var/www/nucleusai/public';

console.log('📤 Deploying EST timezone fix...');

// Backup files
['dashboard.html', 'call-details.html', 'comprehensive-call-details.html'].forEach(file => {
    const filePath = path.join(publicDir, file);
    if (fs.existsSync(filePath)) {
        const backupPath = filePath + '.backup.' + Date.now();
        fs.copyFileSync(filePath, backupPath);
        console.log(`✅ Backed up ${file}`);
    }
});

// Update dashboard.html
const dashboardPath = path.join(publicDir, 'dashboard.html');
let dashboardContent = fs.readFileSync(dashboardPath, 'utf8');

dashboardContent = dashboardContent.replace(
    /const d = new Date\(`\${date}T\${time \|\| '00:00:00'}`\);/g,
    "const d = new Date(`${date}T${time || '00:00:00'}Z`);"
);

dashboardContent = dashboardContent.replace(
    /(toLocaleString\('en-US', \{[\s\S]*?hour: '2-digit',[\s\S]*?minute: '2-digit')(\s*\}\);)/,
    "$1,\n                timeZone: 'America/New_York',\n                hour12: true$2"
);

dashboardContent = dashboardContent.replace(
    /const d = new Date\(date\);/g,
    "const d = new Date(date + 'T00:00:00Z');"
);

dashboardContent = dashboardContent.replace(
    /(toLocaleDateString\('en-US', \{[\s\S]*?weekday: 'short')(\s*\}\);)/,
    "$1,\n                timeZone: 'America/New_York'$2"
);

fs.writeFileSync(dashboardPath, dashboardContent, 'utf8');
console.log('✅ Updated dashboard.html');

// Update call-details.html
const callDetailsPath = path.join(publicDir, 'call-details.html');
let callDetailsContent = fs.readFileSync(callDetailsPath, 'utf8');

callDetailsContent = callDetailsContent.replace(
    /const d = new Date\(`\${date}T\${time \|\| '00:00:00'}`\);/g,
    "const d = new Date(`${date}T${time || '00:00:00'}Z`);"
);

callDetailsContent = callDetailsContent.replace(
    /(toLocaleString\('en-US', \{[\s\S]*?second: '2-digit')(\s*\}\);)/,
    "$1,\n                timeZone: 'America/New_York',\n                hour12: true$2"
);

callDetailsContent = callDetailsContent.replace(
    /(toLocaleTimeString\('en-US', \{[\s\S]*?minute: '2-digit')(\s*\}\);)/,
    "$1,\n                timeZone: 'America/New_York',\n                hour12: true$2"
);

fs.writeFileSync(callDetailsPath, callDetailsContent, 'utf8');
console.log('✅ Updated call-details.html');

// Update comprehensive-call-details.html
const comprehensivePath = path.join(publicDir, 'comprehensive-call-details.html');
let comprehensiveContent = fs.readFileSync(comprehensivePath, 'utf8');

comprehensiveContent = comprehensiveContent.replace(
    /function formatDateTime\(date, time\) \{[\s\S]*?return `\${date} \${time}`;[\s\S]*?\}/,
    `function formatDateTime(date, time) {
            if (!date || !time) return '-';
            const d = new Date(\`\${date}T\${time}Z\`);
            return d.toLocaleString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZone: 'America/New_York',
                hour12: true
            });
        }`
);

comprehensiveContent = comprehensiveContent.replace(
    /return date\.toLocaleTimeString\(\);/g,
    `return date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'America/New_York',
                hour12: true
            });`
);

fs.writeFileSync(comprehensivePath, comprehensiveContent, 'utf8');
console.log('✅ Updated comprehensive-call-details.html');

console.log('\n✅ All files updated!');
console.log('Refresh your browser to see the changes in EST timezone.');
DEPLOYSCRIPT
node deploy-timezone.js
```

This will:
1. Create the deployment script
2. Run it automatically
3. Update all three HTML files with EST timezone
4. Create backups before making changes

**No server restart needed** - just refresh your browser!


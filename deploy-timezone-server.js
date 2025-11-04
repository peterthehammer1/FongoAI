#!/usr/bin/env node
// Deploy EST timezone fix - Run this on the server
// Copy and paste this entire file into DigitalOcean console, then run: node deploy-timezone-server.js

const fs = require('fs');
const path = require('path');

const publicDir = '/var/www/nucleusai/public';

console.log('📤 Deploying EST timezone fix...');

// Backup files
const files = ['dashboard.html', 'call-details.html', 'comprehensive-call-details.html'];
files.forEach(file => {
    const filePath = path.join(publicDir, file);
    if (fs.existsSync(filePath)) {
        const backupPath = filePath + '.backup.' + new Date().toISOString().replace(/[:.]/g, '-');
        fs.copyFileSync(filePath, backupPath);
        console.log(`✅ Backed up ${file}`);
    }
});

// Update dashboard.html
const dashboardPath = path.join(publicDir, 'dashboard.html');
let dashboardContent = fs.readFileSync(dashboardPath, 'utf8');

// Update formatDateTime
dashboardContent = dashboardContent.replace(
    /const d = new Date\(`\${date}T\${time \|\| '00:00:00'}`\);/g,
    "const d = new Date(`${date}T${time || '00:00:00'}Z`);"
);

dashboardContent = dashboardContent.replace(
    /(toLocaleString\('en-US', \{[\s\S]*?hour: '2-digit',[\s\S]*?minute: '2-digit')(\s*\}\);)/,
    "$1,\n                timeZone: 'America/New_York',\n                hour12: true$2"
);

// Update formatDate
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

// Update formatDateTime
callDetailsContent = callDetailsContent.replace(
    /const d = new Date\(`\${date}T\${time \|\| '00:00:00'}`\);/g,
    "const d = new Date(`${date}T${time || '00:00:00'}Z`);"
);

callDetailsContent = callDetailsContent.replace(
    /(toLocaleString\('en-US', \{[\s\S]*?second: '2-digit')(\s*\}\);)/,
    "$1,\n                timeZone: 'America/New_York',\n                hour12: true$2"
);

// Update formatTime
callDetailsContent = callDetailsContent.replace(
    /(toLocaleTimeString\('en-US', \{[\s\S]*?minute: '2-digit')(\s*\}\);)/,
    "$1,\n                timeZone: 'America/New_York',\n                hour12: true$2"
);

fs.writeFileSync(callDetailsPath, callDetailsContent, 'utf8');
console.log('✅ Updated call-details.html');

// Update comprehensive-call-details.html
const comprehensivePath = path.join(publicDir, 'comprehensive-call-details.html');
let comprehensiveContent = fs.readFileSync(comprehensivePath, 'utf8');

// Update formatDateTime
comprehensiveContent = comprehensiveContent.replace(
    /function formatDateTime\(date, time\) \{[\s\S]*?return `\${date} \${time}`;[\s\S]*?\}/,
    `function formatDateTime(date, time) {
            if (!date || !time) return '-';
            // Parse as UTC since database stores in UTC
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

// Update formatTime
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

console.log('');
console.log('✅ All files updated!');
console.log('Refresh your browser to see the changes in EST timezone.');


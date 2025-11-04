#!/bin/bash
# Add /call/:callId route to server's dashboard.js

cd /var/www/nucleusai

echo "=== Current file ends at ==="
tail -5 routes/dashboard.js

echo ""
echo "=== Adding /call/:callId route before module.exports ==="

# Backup
cp routes/dashboard.js routes/dashboard.js.backup

# Add the route before module.exports
node << 'EOF'
const fs = require('fs');
const content = fs.readFileSync('routes/dashboard.js', 'utf8');
const lines = content.split('\n');

// Find module.exports line
const exportLine = lines.findIndex(line => line.includes('module.exports'));

if (exportLine === -1) {
  console.error('Could not find module.exports');
  process.exit(1);
}

// Insert the route before module.exports
const routeCode = [
  '',
  '// Get call details by ID',
  "router.get('/call/:callId', async (req, res) => {",
  "  try {",
  "    const { callId } = req.params;",
  "    const call = await db.getCallById(callId);",
  "    ",
  "    if (!call) {",
  "      return res.status(404).json({ success: false, error: 'Call not found' });",
  "    }",
  "    ",
  "    res.json({ success: true, call });",
  "  } catch (error) {",
  "    console.error('Error fetching call details:', error);",
  "    res.status(500).json({ success: false, error: error.message });",
  "  }",
  "});",
  ''
];

lines.splice(exportLine, 0, ...routeCode);
fs.writeFileSync('routes/dashboard.js', lines.join('\n'));
console.log(`✓ Added /call/:callId route before line ${exportLine + 1}`);
EOF

echo ""
echo "=== Verifying ==="
grep -n "router.get('/call/:callId" routes/dashboard.js

echo ""
echo "=== Testing load ==="
node << 'EOF'
try {
  const dashboardRoutes = require('./routes/dashboard');
  const callRoute = dashboardRoutes.stack.find(r => r.route && r.route.path === '/call/:callId');
  if (callRoute) {
    console.log('✓ /call/:callId route is now registered!');
  } else {
    console.log('❌ Route still not registered');
    console.log('Available routes:');
    dashboardRoutes.stack.forEach(r => {
      if (r.route) console.log('  -', r.route.path);
    });
  }
} catch (e) {
  console.error('Error:', e.message);
}
EOF


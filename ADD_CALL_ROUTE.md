# Add Missing /call/:callId Route

Run this on the server to add the missing route:

```bash
cd /var/www/nucleusai && node << 'EOF'
const fs = require('fs');
const content = fs.readFileSync('routes/dashboard.js', 'utf8');
const lines = content.split('\n');

// Find module.exports line
const exportLine = lines.findIndex(line => line.includes('module.exports'));

if (exportLine === -1) {
  console.error('Could not find module.exports');
  process.exit(1);
}

// Check if route already exists
if (content.includes("router.get('/call/:callId")) {
  console.log('Route already exists');
  process.exit(0);
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
  "});"
];

lines.splice(exportLine, 0, ...routeCode);
fs.writeFileSync('routes/dashboard.js', lines.join('\n'));
console.log(`✓ Added /call/:callId route`);
EOF
pm2 restart nucleusai && echo "✓ Route added and app restarted"
```


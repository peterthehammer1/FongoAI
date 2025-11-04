# Fix Missing /call/:callId Route

The route is defined but not registered. The server's routes/dashboard.js file might be missing routes or have a syntax error.

## Solution: Download the complete routes file from GitHub

Run this on the server:

```bash
cd /var/www/nucleusai && curl -o routes/dashboard.js https://raw.githubusercontent.com/peterthehammer1/FongoAI/main/routes/dashboard.js && pm2 restart nucleusai && echo "✓ Routes file updated"
```

This will replace the entire routes file with the correct version from GitHub, which includes all routes including `/call/:callId`.

After this, verify the route is registered:

```bash
node << 'EOF'
const dashboardRoutes = require('./routes/dashboard');
const callRoute = dashboardRoutes.stack.find(r => r.route && r.route.path === '/call/:callId');
if (callRoute) {
  console.log('✓ /call/:callId route is registered');
} else {
  console.log('❌ Route still missing');
  console.log('Available routes:');
  dashboardRoutes.stack.forEach(r => {
    if (r.route) console.log('  -', r.route.path);
  });
}
EOF
```


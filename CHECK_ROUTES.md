# Check Registered Routes

Run this on the server:

```bash
cd /var/www/nucleusai && node << 'EOF'
const dashboardRoutes = require('./routes/dashboard');

console.log('=== Dashboard Routes ===');
console.log('Total stack items:', dashboardRoutes.stack.length);

dashboardRoutes.stack.forEach((r, i) => {
  if (r.route) {
    console.log(`${i + 1}. ${Object.keys(r.route.methods).join(', ').toUpperCase()} ${r.route.path}`);
  } else if (r.name === 'router') {
    console.log(`${i + 1}. Nested router: ${r.regexp}`);
  } else {
    console.log(`${i + 1}. Middleware: ${r.name || 'unnamed'}`);
  }
});

console.log('\n=== Looking for /call route ===');
const callRoute = dashboardRoutes.stack.find(r => r.route && r.route.path.includes('call'));
if (callRoute) {
  console.log('✓ Found call route:');
  console.log('  Path:', callRoute.route.path);
  console.log('  Methods:', Object.keys(callRoute.route.methods));
} else {
  console.log('❌ Call route NOT found in stack!');
}
EOF
```


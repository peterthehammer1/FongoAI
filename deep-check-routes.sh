#!/bin/bash
# Deep check of routes file

cd /var/www/nucleusai

echo "=== Checking if /call/:callId route exists ==="
grep -n "call.*:callId" routes/dashboard.js

echo ""
echo "=== Line count ==="
wc -l routes/dashboard.js

echo ""
echo "=== Checking module.exports position ==="
grep -n "module.exports" routes/dashboard.js

echo ""
echo "=== All router.get definitions ==="
grep -n "router.get" routes/dashboard.js

echo ""
echo "=== Trying to require and check ==="
node << 'EOF'
try {
  const dashboardRoutes = require('./routes/dashboard');
  console.log('✓ File loads successfully');
  console.log('Stack length:', dashboardRoutes.stack.length);
  
  // Check each route
  dashboardRoutes.stack.forEach((r, i) => {
    if (r.route) {
      console.log(`  ${i + 1}. ${r.route.path}`);
    }
  });
  
  // Try to find the call route
  const callRoute = dashboardRoutes.stack.find(r => 
    r.route && (r.route.path.includes('call') || r.route.path.includes(':callId'))
  );
  
  if (callRoute) {
    console.log('\n✓ Found call-related route:', callRoute.route.path);
  } else {
    console.log('\n❌ No call route found');
  }
} catch (e) {
  console.error('❌ Error loading routes:', e.message);
  console.error(e.stack);
}
EOF


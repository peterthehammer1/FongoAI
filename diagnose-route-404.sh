#!/bin/bash
# Diagnose why routes return 404

cd /var/www/nucleusai

echo "=== 1. Check if routes/dashboard.js loads without errors ==="
node -e "try { require('./routes/dashboard'); console.log('✓ Routes file loads OK'); } catch(e) { console.error('❌ Error loading routes:', e.message); }"

echo ""
echo "=== 2. Check route definitions ==="
node -e "
const router = require('./routes/dashboard');
const routes = router.stack || [];
console.log('Routes registered:', routes.length);
routes.forEach(r => {
  if (r.route) {
    console.log('  ', r.route.methods, r.route.path);
  }
});
"

echo ""
echo "=== 3. Check if index.js loads routes correctly ==="
grep -A 5 "dashboardRoutes = require" index.js

echo ""
echo "=== 4. Check route mounting ==="
grep -B 2 -A 2 "app.use('/dashboard/api'" index.js

echo ""
echo "=== 5. Test route directly with Node ==="
node << 'EOF'
const express = require('express');
const app = express();
const router = require('./routes/dashboard');
app.use('/dashboard/api', router);
app.listen(3001, () => {
  console.log('Test server on 3001');
  setTimeout(() => {
    const http = require('http');
    http.get('http://localhost:3001/dashboard/api/calls', (res) => {
      console.log('Status:', res.statusCode);
      process.exit(0);
    });
  }, 500);
});
EOF


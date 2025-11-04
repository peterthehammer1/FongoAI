#!/usr/bin/env node
/**
 * Test script to verify dashboard route configuration
 * Run on server: node test-dashboard-route.js
 */

const fs = require('fs');
const path = require('path');

console.log('=== Dashboard Route Diagnostics ===\n');

// Check if dashboard.html exists
const dashboardPath = path.join(__dirname, 'public', 'dashboard.html');
console.log('1. Checking dashboard.html file:');
if (fs.existsSync(dashboardPath)) {
  const stats = fs.statSync(dashboardPath);
  console.log(`   ✅ File exists: ${dashboardPath}`);
  console.log(`   Size: ${stats.size} bytes`);
  console.log(`   Permissions: ${stats.mode.toString(8)}`);
} else {
  console.log(`   ❌ File NOT found: ${dashboardPath}`);
}

// Check index.js for route definition
console.log('\n2. Checking route definitions in index.js:');
const indexPath = path.join(__dirname, 'index.js');
const indexContent = fs.readFileSync(indexPath, 'utf8');

const dashboardRouteMatch = indexContent.match(/app\.get\(['"]\/dashboard['"].*?\{[\s\S]*?res\.sendFile\([^)]+\);/);
if (dashboardRouteMatch) {
  console.log('   ✅ Dashboard route found');
  console.log('   Route definition:');
  console.log('   ' + dashboardRouteMatch[0].split('\n').slice(0, 3).join('\n   '));
} else {
  console.log('   ❌ Dashboard route NOT found');
}

// Check for requireAuth middleware
if (indexContent.includes("app.get('/dashboard', requireAuth")) {
  console.log('   ✅ Route uses requireAuth middleware');
} else {
  console.log('   ⚠️  Route may not use requireAuth');
}

// Check middleware/auth.js
console.log('\n3. Checking auth middleware:');
const authMiddlewarePath = path.join(__dirname, 'middleware', 'auth.js');
if (fs.existsSync(authMiddlewarePath)) {
  console.log('   ✅ auth.js exists');
  const authContent = fs.readFileSync(authMiddlewarePath, 'utf8');
  if (authContent.includes('requireAuth')) {
    console.log('   ✅ requireAuth function found');
  }
} else {
  console.log('   ❌ auth.js NOT found');
}

// Check static file middleware order
console.log('\n4. Checking middleware order:');
const staticIndex = indexContent.indexOf("app.use(express.static");
const dashboardRouteIndex = indexContent.indexOf("app.get('/dashboard'");
if (staticIndex !== -1 && dashboardRouteIndex !== -1) {
  if (staticIndex < dashboardRouteIndex) {
    console.log('   ⚠️  Static middleware comes BEFORE dashboard route');
    console.log('   This is OK - Express routes take precedence');
  } else {
    console.log('   ✅ Dashboard route comes before static middleware');
  }
}

console.log('\n=== Test Complete ===');
console.log('\nNext steps:');
console.log('1. Check PM2 logs: pm2 logs nucleusai --lines 20');
console.log('2. Test route: curl -v http://localhost:3000/dashboard');
console.log('3. Check if session cookie is set after login');


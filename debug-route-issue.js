// Debug route registration
const express = require('express');
const app = express();
const dashboardRoutes = require('./routes/dashboard');
const { requireAuth } = require('./middleware/auth');

// Mount the routes
app.use('/dashboard/api', requireAuth, dashboardRoutes);

// List all registered routes
function printRoutes() {
  console.log('\n=== Registered Routes ===');
  dashboardRoutes.stack.forEach((r) => {
    if (r.route) {
      console.log(`  ${Object.keys(r.route.methods).join(', ').toUpperCase()} /dashboard/api${r.route.path}`);
    }
  });
  console.log('\n=== Testing Route Match ===');
  
  // Simulate a request
  const req = {
    method: 'GET',
    url: '/dashboard/api/call/call_a0c4cc5b6ee7442064d81ae2497',
    path: '/dashboard/api/call/call_a0c4cc5b6ee7442064d81ae2497',
    baseUrl: '/dashboard/api',
    originalUrl: '/dashboard/api/call/call_a0c4cc5b6ee7442064d81ae2497'
  };
  
  // Check if route matches
  const matched = dashboardRoutes.stack.find(r => {
    if (r.route) {
      const path = r.route.path;
      const pattern = path.replace(/:callId/g, '[^/]+');
      const regex = new RegExp(`^${pattern}$`);
      return regex.test('/call/call_a0c4cc5b6ee7442064d81ae2497');
    }
    return false;
  });
  
  if (matched) {
    console.log('✓ Route would match');
  } else {
    console.log('❌ Route would NOT match');
  }
}

printRoutes();


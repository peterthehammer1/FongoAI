// Fix missing leading slash in route paths
const fs = require('fs');
let content = fs.readFileSync('routes/dashboard.js', 'utf8');

// Fix routes that are missing leading slash
// Pattern: router.get('calls -> router.get('/calls
content = content.replace(/router\.get\((['"])([^\/'"]+['"])/g, (match, quote, path) => {
  // If path doesn't start with /, add it
  if (!path.startsWith('/')) {
    return `router.get(${quote}/${path}`;
  }
  return match;
});

// Also fix router.get("path -> router.get("/path
content = content.replace(/router\.get\((['"])([^\/'"]+['"])/g, (match, quote, path) => {
  if (!path.startsWith('/')) {
    return `router.get(${quote}/${path}`;
  }
  return match;
});

fs.writeFileSync('routes/dashboard.js', content);
console.log('✓ Fixed missing leading slashes in routes');

// Verify
const routes = content.match(/router\.get\(['"]\/[^'"]+['"]/g);
if (routes) {
  console.log('Routes found:');
  routes.slice(0, 10).forEach(r => console.log('  ', r));
}


const fs = require('fs');
const file = 'index.js';
let content = fs.readFileSync(file, 'utf8');

// Check if route exists
if (content.includes("app.get('/dashboard', requireAuth")) {
  console.log('✓ Route already exists');
  
  // But verify it's in the right place
  const routeLine = content.split('\n').findIndex(line => line.includes("app.get('/dashboard', requireAuth"));
  const apiLine = content.split('\n').findIndex(line => line.includes("app.use('/dashboard/api'"));
  
  if (routeLine > apiLine && apiLine !== -1) {
    console.log('⚠️  Route exists but is in wrong order (after /dashboard/api)');
    console.log('Route is at line', routeLine + 1, 'but API is at', apiLine + 1);
    console.log('The route should come BEFORE the API routes');
  } else {
    console.log('✓ Route is in correct position');
    process.exit(0);
  }
}

const lines = content.split('\n');
let insertAfter = -1;

// Strategy 1: Find after /dashboard/call route
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("app.get('/dashboard/call/:callId'")) {
    // Find the closing }); - look for it within next 10 lines
    for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
      if (lines[j] && lines[j].trim() === '});') {
        insertAfter = j;
        console.log(`Found insertion point after line ${j + 1} (dashboard/call route)`);
        break;
      }
    }
    if (insertAfter !== -1) break;
  }
}

// Strategy 2: If not found, look for comprehensive-call
if (insertAfter === -1) {
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("app.get('/dashboard/comprehensive-call/:callId'")) {
      for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
        if (lines[j] && lines[j].trim() === '});') {
          insertAfter = j;
          console.log(`Found insertion point after line ${j + 1} (comprehensive-call route)`);
          break;
        }
      }
      if (insertAfter !== -1) break;
    }
  }
}

// Strategy 3: Find before /dashboard/api
if (insertAfter === -1) {
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("app.use('/dashboard/api'")) {
      insertAfter = i - 1;
      console.log(`Found insertion point before line ${i + 1} (dashboard/api route)`);
      break;
    }
  }
}

if (insertAfter === -1) {
  console.error('❌ Could not find insertion point');
  console.log('File structure:');
  lines.forEach((line, i) => {
    if (line.includes('dashboard') || line.includes('app.get') || line.includes('app.use')) {
      console.log(`${i + 1}: ${line.trim()}`);
    }
  });
  process.exit(1);
}

// Insert the route
const routeCode = [
  '',
  '// Dashboard homepage route (serve at /dashboard)',
  "app.get('/dashboard', requireAuth, (req, res) => {",
  "  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));",
  '});'
];

lines.splice(insertAfter + 1, 0, ...routeCode);
fs.writeFileSync(file, lines.join('\n'));
console.log(`✓ Route added after line ${insertAfter + 1}`);


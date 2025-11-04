#!/bin/bash
# Find syntax error in routes file

cd /var/www/nucleusai

echo "=== Checking syntax error details ==="
node -c routes/dashboard.js 2>&1

echo ""
echo "=== Checking around line 232 (where /call/:callId should be) ==="
sed -n '230,250p' routes/dashboard.js

echo ""
echo "=== Checking for missing brackets or braces ==="
node << 'EOF'
const fs = require('fs');
try {
  const content = fs.readFileSync('routes/dashboard.js', 'utf8');
  const lines = content.split('\n');
  
  // Check for common issues
  let openBraces = 0;
  let openParens = 0;
  let openBrackets = 0;
  
  lines.forEach((line, i) => {
    const lineNum = i + 1;
    for (const char of line) {
      if (char === '{') openBraces++;
      if (char === '}') openBraces--;
      if (char === '(') openParens++;
      if (char === ')') openParens--;
      if (char === '[') openBrackets++;
      if (char === ']') openBrackets--;
    }
    
    // Check around route definition
    if (line.includes("router.get('/call/:callId") || 
        (lineNum >= 230 && lineNum <= 250)) {
      if (openBraces < 0 || openParens < 0 || openBrackets < 0) {
        console.log(`Line ${lineNum}: Possible bracket mismatch`);
      }
    }
  });
  
  if (openBraces !== 0) console.log(`Mismatched braces: ${openBraces}`);
  if (openParens !== 0) console.log(`Mismatched parens: ${openParens}`);
  if (openBrackets !== 0) console.log(`Mismatched brackets: ${openBrackets}`);
} catch (e) {
  console.error('Error:', e.message);
}
EOF


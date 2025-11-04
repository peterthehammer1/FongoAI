# Add Cody User - Fixed Command

Run this from `/var/www/nucleusai`:

```bash
cd /var/www/nucleusai && cat > add-cody-temp.js << 'EOF'
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

async function addCodyUser() {
  const email = 'cody@fongo.com';
  const password = 'Fongo2025!Cody';
  const name = 'Cody';
  const role = 'Admin';
  
  console.log('Generating password hash...');
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const usersFilePath = path.join(__dirname, 'auth', 'users.js');
  let usersFile = fs.readFileSync(usersFilePath, 'utf8');
  
  if (usersFile.includes(`email: '${email}'`)) {
    console.log('User exists, updating password...');
    const lines = usersFile.split('\n');
    let inCodyUser = false;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(`email: '${email}'`)) inCodyUser = true;
      if (inCodyUser && lines[i].includes('password:')) {
        lines[i] = `    password: '${hashedPassword}', // ${password}`;
        break;
      }
      if (inCodyUser && lines[i].includes('}')) break;
    }
    usersFile = lines.join('\n');
    fs.writeFileSync(usersFilePath, usersFile, 'utf8');
    console.log('✅ Updated!');
  } else {
    console.log('Adding new user...');
    const insertPoint = usersFile.lastIndexOf('];');
    const userObject = `  {
    email: '${email}',
    password: '${hashedPassword}', // ${password}
    name: '${name}',
    role: '${role}'
  }`;
    const beforeInsert = usersFile.substring(0, insertPoint);
    const lastBrace = beforeInsert.lastIndexOf('}');
    let newUsersFile;
    if (lastBrace !== -1 && !beforeInsert.substring(lastBrace + 1).trim().startsWith(',')) {
      newUsersFile = usersFile.substring(0, lastBrace + 1) + ',\n' + userObject + usersFile.substring(insertPoint);
    } else {
      newUsersFile = usersFile.substring(0, insertPoint) + userObject + ',\n' + usersFile.substring(insertPoint);
    }
    fs.writeFileSync(usersFilePath, newUsersFile, 'utf8');
    console.log('✅ Added!');
  }
  console.log(`\nEmail: ${email}\nPassword: ${password}`);
}

addCodyUser();
EOF
node add-cody-temp.js && rm add-cody-temp.js && pm2 restart nucleusai && echo "✓ Done! Cody can login at http://fongoai.com/login"
```

The key fix: run the script from `/var/www/nucleusai` where `node_modules` is located, so `bcrypt` can be found.


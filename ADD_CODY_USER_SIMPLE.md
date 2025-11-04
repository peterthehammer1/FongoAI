# Add Cody User - Simple Instructions

## Option 1: Copy/Paste This Script (Recommended)

Copy this entire block and paste it into your DigitalOcean console:

```bash
cd /var/www/nucleusai && cat > /tmp/add-cody.js << 'EOF'
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
cd /var/www/nucleusai && node /tmp/add-cody.js && pm2 restart nucleusai && echo "✓ Done!"
```

## Option 2: Manual Edit

1. Generate hash:
   ```bash
   cd /var/www/nucleusai
   node -e "const bcrypt = require('bcrypt'); bcrypt.hash('Fongo2025!Cody', 10).then(h => console.log(h));"
   ```

2. Copy the hash output

3. Edit the file:
   ```bash
   nano auth/users.js
   ```

4. Add this entry before the closing `];`:
   ```javascript
   {
     email: 'cody@fongo.com',
     password: 'PASTE_HASH_HERE', // Fongo2025!Cody
     name: 'Cody',
     role: 'Admin'
   },
   ```

5. Save (Ctrl+X, Y, Enter)

6. Restart:
   ```bash
   pm2 restart nucleusai
   ```

## Credentials

- **Email**: cody@fongo.com  
- **Password**: Fongo2025!Cody  
- **Name**: Cody  
- **Role**: Admin


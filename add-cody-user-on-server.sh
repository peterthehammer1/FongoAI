#!/bin/bash
# Add Cody user - Run this on DigitalOcean server

cd /var/www/nucleusai

# Generate hash and add user
node << 'NODE_SCRIPT'
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

async function addCodyUser() {
  try {
    const email = 'cody@fongo.com';
    const password = 'Fongo2025!Cody';
    const name = 'Cody';
    const role = 'Admin';
    
    console.log('Generating password hash...');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const usersFilePath = path.join(__dirname, 'auth', 'users.js');
    let usersFile = fs.readFileSync(usersFilePath, 'utf8');
    
    // Check if user already exists
    if (usersFile.includes(`email: '${email}'`)) {
      console.log(`User ${email} already exists. Updating password...`);
      // Update the password hash - find the line with cody@fongo.com and replace password
      const lines = usersFile.split('\n');
      let inCodyUser = false;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(`email: '${email}'`)) {
          inCodyUser = true;
        }
        if (inCodyUser && lines[i].includes("password:")) {
          lines[i] = `    password: '${hashedPassword}', // ${password}`;
          break;
        }
        if (inCodyUser && lines[i].includes('}')) {
          break;
        }
      }
      usersFile = lines.join('\n');
      fs.writeFileSync(usersFilePath, usersFile, 'utf8');
      console.log('✅ User password updated!');
    } else {
      console.log(`Adding new user ${email}...`);
      // Find the closing bracket of the users array
      const insertPoint = usersFile.lastIndexOf('];');
      if (insertPoint === -1) {
        console.error('❌ Could not find users array');
        process.exit(1);
      }
      
      // Insert new user before closing bracket
      const userObject = `  {
    email: '${email}',
    password: '${hashedPassword}', // ${password}
    name: '${name}',
    role: '${role}'
  }`;
      
      // Add comma to previous entry if needed
      const beforeInsert = usersFile.substring(0, insertPoint);
      const lastBrace = beforeInsert.lastIndexOf('}');
      let newUsersFile;
      if (lastBrace !== -1 && !beforeInsert.substring(lastBrace + 1).trim().startsWith(',')) {
        newUsersFile = usersFile.substring(0, lastBrace + 1) + ',' + 
                       '\n' + userObject + 
                       usersFile.substring(insertPoint);
      } else {
        newUsersFile = usersFile.substring(0, insertPoint) + 
                       userObject + ',\n' + 
                       usersFile.substring(insertPoint);
      }
      
      fs.writeFileSync(usersFilePath, newUsersFile, 'utf8');
      console.log('✅ User added successfully!');
    }
    
    console.log('');
    console.log('User Details:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Name: ${name}`);
    console.log(`   Role: ${role}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addCodyUser();
NODE_SCRIPT

echo ""
echo "Restarting application..."
pm2 restart nucleusai

sleep 2
pm2 status nucleusai

echo ""
echo "✓ Done! Cody can now login at http://fongoai.com/login"
echo "   Email: cody@fongo.com"
echo "   Password: Fongo2025!Cody"


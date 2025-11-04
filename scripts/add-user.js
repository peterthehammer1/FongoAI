#!/usr/bin/env node
/**
 * Script to add a new user to the authentication system
 * Usage: node scripts/add-user.js <email> <password> <name> [role]
 * Example: node scripts/add-user.js cody@fongo.com "MyPassword123!" "Cody" "Admin"
 */

const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

async function addUser(email, password, name, role = 'Admin') {
  try {
    // Hash the password
    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Read current users file
    const usersFilePath = path.join(__dirname, '..', 'auth', 'users.js');
    let usersFile = fs.readFileSync(usersFilePath, 'utf8');
    
    // Check if user already exists
    if (usersFile.includes(`email: '${email}'`)) {
      console.error(`❌ User ${email} already exists!`);
      process.exit(1);
    }
    
    // Find the users array and add new user
    // Pattern: users = [ ... ]
    const userObject = `  {
    email: '${email}',
    password: '${hashedPassword}', // ${password}
    name: '${name}',
    role: '${role}'
  }`;
    
    // Insert before the closing bracket of the users array
    const insertPoint = usersFile.lastIndexOf('];');
    if (insertPoint === -1) {
      console.error('❌ Could not find users array in file');
      process.exit(1);
    }
    
    // Add comma to previous entry if needed
    const beforeInsert = usersFile.substring(0, insertPoint);
    if (!beforeInsert.trim().endsWith(',')) {
      // Find the last } and add comma
      const lastBrace = beforeInsert.lastIndexOf('}');
      if (lastBrace !== -1) {
        usersFile = usersFile.substring(0, lastBrace + 1) + ',' + usersFile.substring(lastBrace + 1);
      }
    }
    
    // Insert new user
    const newUsersFile = usersFile.substring(0, insertPoint) + 
                        userObject + ',\n' + 
                        usersFile.substring(insertPoint);
    
    // Write back to file
    fs.writeFileSync(usersFilePath, newUsersFile, 'utf8');
    
    console.log('✅ User added successfully!');
    console.log(`   Email: ${email}`);
    console.log(`   Name: ${name}`);
    console.log(`   Role: ${role}`);
    console.log(`   Password: ${password}`);
    console.log('');
    console.log('⚠️  Remember to deploy this file to the server:');
    console.log(`   scp auth/users.js root@134.122.37.50:/var/www/nucleusai/auth/`);
    console.log(`   ssh root@134.122.37.50 "pm2 restart nucleusai"`);
    
  } catch (error) {
    console.error('❌ Error adding user:', error.message);
    process.exit(1);
  }
}

// Get command line arguments
const [,, email, password, name, role] = process.argv;

if (!email || !password || !name) {
  console.error('Usage: node scripts/add-user.js <email> <password> <name> [role]');
  console.error('Example: node scripts/add-user.js cody@fongo.com "MyPassword123!" "Cody" "Admin"');
  process.exit(1);
}

addUser(email, password, name, role || 'Admin');


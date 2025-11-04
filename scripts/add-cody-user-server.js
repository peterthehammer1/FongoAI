#!/usr/bin/env node
/**
 * Run this script on the DigitalOcean server to add Cody user
 * Usage: node scripts/add-cody-user-server.js
 */

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
    
    const usersFilePath = path.join(__dirname, '..', 'auth', 'users.js');
    let usersFile = fs.readFileSync(usersFilePath, 'utf8');
    
    // Check if user already exists
    if (usersFile.includes(`email: '${email}'`)) {
      console.log(`User ${email} already exists. Updating password...`);
      // Update the password hash
      const regex = new RegExp(`(email: '${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}',[^}]*password: ')[^']+`, 'g');
      usersFile = usersFile.replace(regex, `$1${hashedPassword}`);
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
      
      // Add comma to previous entry
      const beforeInsert = usersFile.substring(0, insertPoint);
      const lastEntryEnd = beforeInsert.lastIndexOf('}');
      if (lastEntryEnd !== -1 && !beforeInsert.substring(lastEntryEnd).includes(',')) {
        usersFile = usersFile.substring(0, lastEntryEnd + 1) + ',' + usersFile.substring(lastEntryEnd + 1);
      }
      
      // Insert new user
      const userObject = `  {
    email: '${email}',
    password: '${hashedPassword}', // ${password}
    name: '${name}',
    role: '${role}'
  }`;
      
      const newUsersFile = usersFile.substring(0, insertPoint) + 
                          userObject + ',\n' + 
                          usersFile.substring(insertPoint);
      
      fs.writeFileSync(usersFilePath, newUsersFile, 'utf8');
      console.log('✅ User added successfully!');
    }
    
    console.log('');
    console.log('User Details:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Name: ${name}`);
    console.log(`   Role: ${role}`);
    console.log('');
    console.log('⚠️  Remember to restart the app:');
    console.log('   pm2 restart nucleusai');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

addCodyUser();


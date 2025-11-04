#!/usr/bin/env node

/**
 * Script to start the server remotely using DigitalOcean API
 * This creates a script that can be executed on the server
 */

const axios = require('axios');
require('dotenv').config();

const DO_API_TOKEN = process.env.DIGITALOCEAN_API_TOKEN;
if (!DO_API_TOKEN) {
  console.error('❌ DIGITALOCEAN_API_TOKEN environment variable is required');
  process.exit(1);
}
const DO_API_BASE = 'https://api.digitalocean.com/v2';
const SERVER_IP = '134.122.37.50';

async function getDropletID() {
  try {
    const response = await axios.get(
      `${DO_API_BASE}/droplets`,
      {
        headers: {
          'Authorization': `Bearer ${DO_API_TOKEN}`
        },
        params: {
          per_page: 100
        }
      }
    );
    
    const droplet = response.data.droplets.find(d => 
      d.networks.v4.some(n => n.ip_address === SERVER_IP)
    );
    
    if (!droplet) {
      throw new Error('Droplet not found with IP ' + SERVER_IP);
    }
    
    return droplet.id;
  } catch (error) {
    console.error('Error finding droplet:', error.message);
    throw error;
  }
}

async function executeCommand(dropletId, command) {
  try {
    // Note: DigitalOcean API doesn't have direct command execution
    // This would require SSH or using DO's console feature
    console.log('⚠️  DigitalOcean API doesn\'t support direct command execution.');
    console.log('📋 Please run these commands manually via SSH:');
    console.log('');
    console.log('SSH Command:');
    console.log(`  ssh root@${SERVER_IP}`);
    console.log('');
    console.log('Then run:');
    console.log('  cd /var/www/nucleusai');
    console.log('  pm2 status');
    console.log('  pm2 restart nucleusai || pm2 start index.js --name nucleusai');
    console.log('  pm2 save');
    console.log('  pm2 logs nucleusai --lines 20');
    console.log('');
    console.log('Or use the script:');
    console.log(`  curl -s https://raw.githubusercontent.com/your-repo/scripts/start-server.sh | bash`);
    
    return false;
  } catch (error) {
    console.error('Error:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Fongo AI Agent Server...\n');
  
  try {
    const dropletId = await getDropletID();
    console.log(`✅ Found droplet ID: ${dropletId}\n`);
    
    const commands = [
      'cd /var/www/nucleusai',
      'pm2 restart nucleusai || (pm2 start index.js --name nucleusai && pm2 save)',
      'pm2 logs nucleusai --lines 10 --nostream'
    ];
    
    await executeCommand(dropletId, commands.join(' && '));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Manual Instructions:');
    console.log('   1. SSH into server: ssh root@134.122.37.50');
    console.log('   2. Run: cd /var/www/nucleusai');
    console.log('   3. Run: pm2 restart nucleusai || pm2 start index.js --name nucleusai');
    console.log('   4. Run: pm2 save');
    process.exit(1);
  }
}

main();


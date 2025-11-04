#!/usr/bin/env node

/**
 * Check DigitalOcean server status and provide console access instructions
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

async function checkServerStatus() {
  try {
    console.log('🔍 Checking DigitalOcean server status...\n');
    
    // Get droplet info
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
      console.log('❌ Droplet not found with IP', SERVER_IP);
      return;
    }
    
    console.log('✅ Found Droplet:');
    console.log(`   ID: ${droplet.id}`);
    console.log(`   Name: ${droplet.name}`);
    console.log(`   Status: ${droplet.status}`);
    console.log(`   Region: ${droplet.region.name}`);
    console.log(`   Size: ${droplet.size_slug}`);
    console.log(`   IP: ${SERVER_IP}`);
    console.log('');
    
    if (droplet.status === 'active') {
      console.log('✅ Server is running!');
      console.log('');
      console.log('📋 Next Steps:');
      console.log('   1. Access the web console:');
      console.log(`      https://cloud.digitalocean.com/droplets/${droplet.id}/console`);
      console.log('');
      console.log('   2. Or check if the app is running:');
      console.log('      In the console, run: pm2 status');
      console.log('');
      console.log('   3. If app is not running:');
      console.log('      cd /var/www/nucleusai');
      console.log('      pm2 restart nucleusai || pm2 start index.js --name nucleusai');
      console.log('      pm2 save');
      console.log('');
      console.log('   4. Test the health endpoint:');
      console.log('      curl http://localhost:3000/health');
    } else {
      console.log(`⚠️  Server status: ${droplet.status}`);
      console.log('   The server may need to be powered on.');
    }
    
    console.log('');
    console.log('🌐 DigitalOcean Dashboard:');
    console.log(`   https://cloud.digitalocean.com/droplets/${droplet.id}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
  }
}

checkServerStatus();


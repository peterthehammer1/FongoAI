#!/usr/bin/env node

/**
 * Script to add DNS A records to DigitalOcean using their API
 * 
 * Usage:
 *   DIGITALOCEAN_API_TOKEN=your_token_here node scripts/add-dns-records.js
 * 
 * Or set it in your .env file:
 *   DIGITALOCEAN_API_TOKEN=your_token_here
 */

const axios = require('axios');
require('dotenv').config();

const DO_API_TOKEN = process.env.DIGITALOCEAN_API_TOKEN;
const DOMAIN = 'fongoai.com';
const SERVER_IP = '134.122.37.50';

const DO_API_BASE = 'https://api.digitalocean.com/v2';

async function addDNSRecord(domain, type, name, data) {
  try {
    const response = await axios.post(
      `${DO_API_BASE}/domains/${domain}/records`,
      {
        type,
        name,
        data,
        ttl: 3600
      },
      {
        headers: {
          'Authorization': `Bearer ${DO_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(`API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    }
    throw error;
  }
}

async function getExistingRecords(domain) {
  try {
    const response = await axios.get(
      `${DO_API_BASE}/domains/${domain}/records`,
      {
        headers: {
          'Authorization': `Bearer ${DO_API_TOKEN}`
        }
      }
    );
    return response.data.domain_records || [];
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log('⚠️  Domain not found in DigitalOcean. You may need to add it first.');
      return [];
    }
    throw error;
  }
}

async function main() {
  if (!DO_API_TOKEN) {
    console.error('❌ Error: DIGITALOCEAN_API_TOKEN environment variable is required');
    console.log('\n📋 How to get your API token:');
    console.log('   1. Go to: https://cloud.digitalocean.com/account/api/tokens');
    console.log('   2. Click "Generate New Token"');
    console.log('   3. Give it a name (e.g., "DNS Management")');
    console.log('   4. Copy the token');
    console.log('\n💡 Then run:');
    console.log(`   DIGITALOCEAN_API_TOKEN=your_token_here node ${__filename}`);
    process.exit(1);
  }

  console.log('🌐 Adding DNS records to DigitalOcean...');
  console.log(`   Domain: ${DOMAIN}`);
  console.log(`   IP: ${SERVER_IP}\n`);

  try {
    // Check if domain exists and get existing records
    console.log('📋 Checking existing records...');
    const existingRecords = await getExistingRecords(DOMAIN);
    
    const rootRecord = existingRecords.find(r => r.type === 'A' && (r.name === '@' || r.name === ''));
    const wwwRecord = existingRecords.find(r => r.type === 'A' && r.name === 'www');

    // Add root domain A record (@)
    if (!rootRecord) {
      console.log('➕ Adding A record for root domain (@)...');
      const result = await addDNSRecord(DOMAIN, 'A', '@', SERVER_IP);
      console.log(`   ✅ Created: ${result.domain_record.name || '@'} → ${result.domain_record.data}`);
    } else {
      if (rootRecord.data === SERVER_IP) {
        console.log(`   ✅ Root A record already exists: @ → ${rootRecord.data}`);
      } else {
        console.log(`   ⚠️  Root A record exists but points to ${rootRecord.data} instead of ${SERVER_IP}`);
        console.log(`   💡 You may want to update it manually in DigitalOcean dashboard`);
      }
    }

    // Add www A record
    if (!wwwRecord) {
      console.log('➕ Adding A record for www subdomain...');
      const result = await addDNSRecord(DOMAIN, 'A', 'www', SERVER_IP);
      console.log(`   ✅ Created: ${result.domain_record.name} → ${result.domain_record.data}`);
    } else {
      if (wwwRecord.data === SERVER_IP) {
        console.log(`   ✅ www A record already exists: www → ${wwwRecord.data}`);
      } else {
        console.log(`   ⚠️  www A record exists but points to ${wwwRecord.data} instead of ${SERVER_IP}`);
        console.log(`   💡 You may want to update it manually in DigitalOcean dashboard`);
      }
    }

    console.log('\n✅ DNS records setup complete!');
    console.log('\n⏳ Wait 5-10 minutes for DNS propagation, then test:');
    console.log(`   dig fongoai.com +short`);
    console.log(`   curl http://fongoai.com/health`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.message.includes('404')) {
      console.log('\n💡 The domain may not be added to DigitalOcean yet.');
      console.log('   Add it first: DigitalOcean Dashboard → Networking → Domains → Add Domain');
    }
    process.exit(1);
  }
}

main();


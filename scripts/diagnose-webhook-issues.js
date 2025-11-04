#!/usr/bin/env node

/**
 * Diagnostic script to check webhook functionality
 * Run this to see what's happening with webhooks
 */

const axios = require('axios');
require('dotenv').config();

const WEBHOOK_URL = process.env.WEBHOOK_URL || 'http://fongoai.com/webhook';
const SERVER_IP = '134.122.37.50';

console.log('🔍 Diagnosing Webhook Issues\n');
console.log('='.repeat(60));

// Test 1: Check if webhook endpoint is accessible
console.log('\n1️⃣  Testing Webhook Endpoint Accessibility...');
async function testWebhookEndpoint() {
  try {
    // Test via domain
    const domainResponse = await axios.post(
      WEBHOOK_URL,
      {
        event: 'test',
        call: { call_id: 'test-' + Date.now() },
        data: {}
      },
      { timeout: 5000, validateStatus: () => true }
    );
    console.log(`   ✅ Domain webhook accessible: ${WEBHOOK_URL}`);
    console.log(`      Status: ${domainResponse.status}`);
  } catch (error) {
    console.log(`   ❌ Domain webhook failed: ${error.message}`);
  }

  try {
    // Test via IP
    const ipResponse = await axios.post(
      `http://${SERVER_IP}:3000/webhook`,
      {
        event: 'test',
        call: { call_id: 'test-' + Date.now() },
        data: {}
      },
      { timeout: 5000, validateStatus: () => true }
    );
    console.log(`   ✅ IP webhook accessible: http://${SERVER_IP}:3000/webhook`);
    console.log(`      Status: ${ipResponse.status}`);
  } catch (error) {
    console.log(`   ❌ IP webhook failed: ${error.message}`);
  }
}

// Test 2: Check Retell AI configuration
console.log('\n2️⃣  Retell AI Agent Configuration Check...');
console.log('   📋 Current webhook URL in config:');
console.log('      http://134.122.37.50:3000/webhook');
console.log('   ⚠️  This should be updated to:');
console.log('      http://fongoai.com/webhook');
console.log('      or');
console.log('      https://fongoai.com/webhook (after SSL setup)');

// Test 3: Check what Retell AI should be sending
console.log('\n3️⃣  Expected Retell AI Webhook Events...');
console.log('   Retell AI should send these events:');
console.log('   - call_started: When a call begins');
console.log('   - call_ended: When a call ends');
console.log('   - call_analyzed: After call analysis (includes transcript)');
console.log('   - update_credit_card: Custom function call');

console.log('\n4️⃣  What to Check on Server...');
console.log('   Run these commands in DigitalOcean console:');
console.log('');
console.log('   # Check webhook logs');
console.log('   pm2 logs nucleusai --lines 100 | grep -i webhook');
console.log('');
console.log('   # Check for recent webhook activity');
console.log('   pm2 logs nucleusai --lines 200 | grep -E "call_started|call_ended|webhook"');
console.log('');
console.log('   # Check database for recent calls');
console.log('   cd /var/www/nucleusai');
console.log('   sqlite3 database/calls.db "SELECT call_id, caller_number, call_date, call_time FROM call_logs ORDER BY call_date DESC, call_time DESC LIMIT 10;"');

console.log('\n5️⃣  Action Items...');
console.log('   ✅ Update Retell AI agent webhook URL:');
console.log('      1. Go to Retell AI Dashboard');
console.log('      2. Find your agent');
console.log('      3. Update webhook_url to: http://fongoai.com/webhook');
console.log('      4. Update llm_websocket_url to: ws://fongoai.com/llm-websocket');
console.log('');
console.log('   ✅ Verify webhook is receiving calls:');
console.log('      Check PM2 logs on server for webhook activity');

testWebhookEndpoint().then(() => {
  console.log('\n' + '='.repeat(60));
  console.log('✅ Diagnosis complete!');
});


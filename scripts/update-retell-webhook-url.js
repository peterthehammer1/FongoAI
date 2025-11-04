#!/usr/bin/env node

/**
 * Update Retell AI Agent webhook URLs to use domain instead of IP
 */

const axios = require('axios');
require('dotenv').config();

const RETELL_API_KEY = process.env.RETELL_API_KEY || process.env.NUCLEUS_API_KEY;
const AGENT_ID = process.env.RETELL_AGENT_ID || process.env.NUCLEUS_AGENT_ID;

if (!RETELL_API_KEY || !AGENT_ID) {
  console.error('❌ Error: RETELL_API_KEY and RETELL_AGENT_ID environment variables required');
  console.log('\n💡 Set these in your .env file or environment:');
  console.log('   RETELL_API_KEY=your_api_key');
  console.log('   RETELL_AGENT_ID=your_agent_id');
  process.exit(1);
}

const NEW_WEBHOOK_URL = 'http://fongoai.com/webhook';
const NEW_WEBSOCKET_URL = 'ws://fongoai.com/llm-websocket';

async function updateRetellAgent() {
  try {
    console.log('🔄 Updating Retell AI Agent Configuration...\n');
    console.log(`   Agent ID: ${AGENT_ID}`);
    console.log(`   New Webhook URL: ${NEW_WEBHOOK_URL}`);
    console.log(`   New WebSocket URL: ${NEW_WEBSOCKET_URL}\n`);

    // Get current agent configuration
    console.log('📋 Fetching current agent configuration...');
    const getResponse = await axios.get(
      `https://api.retellai.com/get-retell-llm/${AGENT_ID}`,
      {
        headers: {
          'Authorization': `Bearer ${RETELL_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const currentAgent = getResponse.data;
    console.log(`   Current Webhook: ${currentAgent.webhook_url || 'Not set'}`);
    console.log(`   Current WebSocket: ${currentAgent.response_engine?.llm_websocket_url || 'Not set'}\n`);

    // Update agent configuration
    console.log('✏️  Updating agent configuration...');
    const updatePayload = {
      webhook_url: NEW_WEBHOOK_URL,
      response_engine: {
        ...currentAgent.response_engine,
        llm_websocket_url: NEW_WEBSOCKET_URL
      }
    };

    const updateResponse = await axios.patch(
      `https://api.retellai.com/update-retell-llm/${AGENT_ID}`,
      updatePayload,
      {
        headers: {
          'Authorization': `Bearer ${RETELL_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Agent configuration updated successfully!\n');
    console.log('📋 Updated Configuration:');
    console.log(`   Webhook URL: ${updateResponse.data.webhook_url}`);
    console.log(`   WebSocket URL: ${updateResponse.data.response_engine?.llm_websocket_url}\n`);

    console.log('✅ Next Steps:');
    console.log('   1. Make a test call to verify webhooks are received');
    console.log('   2. Check server logs: pm2 logs nucleusai --lines 50');
    console.log('   3. Verify calls appear in dashboard');

  } catch (error) {
    console.error('\n❌ Error updating agent:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Response:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

updateRetellAgent();


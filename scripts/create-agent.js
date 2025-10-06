const fs = require('fs');
const path = require('path');
const { RetellClient } = require('retell-sdk');

/**
 * Script to update Retell AI agent with custom LLM configuration
 */

async function updateRetellAgent() {
  try {
    // Load configuration
    const configPath = path.join(__dirname, '..', 'retell-agent-config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    // Initialize Retell client
    const retell = new RetellClient({
      apiKey: process.env.RETELL_API_KEY || 'key_dfc6862d300570f9dc8950062ea8',
      serverURL: 'https://api.retellai.com'
    });
    
    // Use the existing custom LLM agent
    const agentId = 'agent_a7f4e482b0df8b7979039b8d07';
    
    console.log('🤖 Updating Retell AI Agent with custom LLM configuration...');
    console.log('Agent ID:', agentId);
    
    const updatePayload = {
      response_engine: {
        type: 'custom-llm',
        llm_websocket_url: config.response_engine.llm_websocket_url
      }
    };
    
    console.log('Update payload:', JSON.stringify(updatePayload, null, 2));
    
    // Use direct HTTP call since SDK has issues
    const axios = require('axios');
    const response = await axios.patch(
      `https://api.retellai.com/update-agent/${agentId}`,
      updatePayload,
      {
        headers: {
          'Authorization': `Bearer ${process.env.RETELL_API_KEY || 'key_dfc6862d300570f9dc8950062ea8'}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Agent updated successfully!');
    console.log('Response:', JSON.stringify(response, null, 2));
    
  } catch (error) {
    console.error('❌ Error updating agent:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run if called directly
if (require.main === module) {
  updateRetellAgent();
}

module.exports = { updateRetellAgent };

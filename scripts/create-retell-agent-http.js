const axios = require('axios');
const fs = require('fs');
const path = require('path');

/**
 * Script to create Retell AI agent using direct HTTP API calls
 * This bypasses potential SDK network issues
 */

async function createRetellAgent() {
  try {
    // Check if API key is set
    if (!process.env.RETELL_API_KEY) {
      console.error('❌ RETELL_API_KEY environment variable is not set');
      console.log('Please set your Retell API key:');
      console.log('export RETELL_API_KEY="your_api_key_here"');
      return;
    }

    // Load configuration
    const configPath = path.join(__dirname, '..', 'nucleus-agent-config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

    console.log('🤖 Creating Retell AI Agent via HTTP API...');
    console.log('Configuration:', JSON.stringify(config, null, 2));

    // Prepare the request payload
    const payload = {
      agent_name: config.agent_name,
      voice_id: config.voice_id,
      language: config.language,
      webhook_url: config.webhook_url,
      response_engine: {
        type: "custom-llm",
        llm_websocket_url: config.response_engine.websocket_url
      },
      conversation_transcriber: config.conversation_transcriber,
      silence_timeout_seconds: config.silence_timeout_seconds,
      max_duration_seconds: config.max_duration_seconds,
      instructions: config.instructions,
    };

    // Make the API request
    const response = await axios.post('https://api.retellai.com/create-agent', payload, {
      headers: {
        'Authorization': `Bearer ${process.env.RETELL_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ Agent created successfully!');
    console.log('Agent ID:', response.data.agent_id);
    console.log('Agent Name:', response.data.agent_name);
    console.log('Webhook URL:', response.data.webhook_url);
    console.log('WebSocket URL:', response.data.response_engine.websocket_url);

    // Save agent ID to .env file
    const envPath = path.join(__dirname, '..', '.env');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Update or add agent ID
    if (envContent.includes('RETELL_AGENT_ID=')) {
      envContent = envContent.replace(/RETELL_AGENT_ID=.*/, `RETELL_AGENT_ID=${response.data.agent_id}`);
    } else {
      envContent += `\nRETELL_AGENT_ID=${response.data.agent_id}\n`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log('📝 Agent ID saved to .env file');

    return response.data;

  } catch (error) {
    console.error('❌ Error creating agent:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('Network error - no response received');
    }
  }
}

// Run if called directly
if (require.main === module) {
  createRetellAgent();
}

module.exports = { createRetellAgent };

const { RetellClient } = require('retell-sdk');
const fs = require('fs');
const path = require('path');

/**
 * Script to create Retell AI agent using the SDK
 * Make sure to set RETELL_API_KEY in your environment variables
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

    // Initialize Retell client
    const retell = new RetellClient({
      apiKey: process.env.RETELL_API_KEY,
    });

    // Load configuration
    const configPath = path.join(__dirname, '..', 'retell-agent-config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

    console.log('🤖 Creating Retell AI Agent...');
    console.log('Configuration:', JSON.stringify(config, null, 2));

    // Create the agent
    const agent = await retell.createAgent({
      agent_name: config.agent_name,
      voice_id: config.voice_id,
      language: config.language,
      webhook_url: config.webhook_url,
      response_engine: config.response_engine,
      conversation_transcriber: config.conversation_transcriber,
      silence_timeout_seconds: config.silence_timeout_seconds,
      max_duration_seconds: config.max_duration_seconds,
      instructions: config.instructions,
    });

    console.log('✅ Agent created successfully!');
    console.log('Agent ID:', agent.agent_id);
    console.log('Agent Name:', agent.agent_name);
    console.log('Webhook URL:', agent.webhook_url);
    console.log('WebSocket URL:', agent.response_engine.websocket_url);

    // Save agent ID to .env file
    const envPath = path.join(__dirname, '..', '.env');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Update or add agent ID
    if (envContent.includes('RETELL_AGENT_ID=')) {
      envContent = envContent.replace(/RETELL_AGENT_ID=.*/, `RETELL_AGENT_ID=${agent.agent_id}`);
    } else {
      envContent += `\nRETELL_AGENT_ID=${agent.agent_id}\n`;
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log('📝 Agent ID saved to .env file');

    return agent;

  } catch (error) {
    console.error('❌ Error creating agent:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run if called directly
if (require.main === module) {
  createRetellAgent();
}

module.exports = { createRetellAgent };

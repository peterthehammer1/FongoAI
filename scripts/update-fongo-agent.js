const axios = require('axios');
const fs = require('fs');
const path = require('path');

/**
 * Script to update the existing Fongo CC updater agent with our perfect configuration
 */

async function updateFongoAgent() {
  try {
    if (!process.env.RETELL_API_KEY) {
      console.error('❌ RETELL_API_KEY environment variable is not set');
      return;
    }

    const existingAgentId = 'agent_c0b3d0217ea4dbcd6feb9c690c';
    
    console.log('🔄 Updating existing Fongo CC updater agent...');
    console.log('Agent ID:', existingAgentId);

    // Load our configuration
    const configPath = path.join(__dirname, '..', 'retell-agent-config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

    // Prepare the update payload with our optimized settings
    const updatePayload = {
      agent_id: existingAgentId,
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
      // Additional optimized settings for credit card updates
      enable_backchannel: true,
      backchannel_frequency: 0.3,
      interruption_sensitivity: 0.9,
      responsiveness: 0.9,
      normalize_for_speech: true,
      stt_mode: 'accurate',
      allow_user_dtmf: false,
      ambient_sound: 'call-center',
      reminder_trigger_ms: 30000,
      reminder_max_count: 2,
      end_call_after_silence_ms: 30000,
      webhook_timeout_ms: 10000,
      opt_out_sensitive_data_storage: false,
      data_storage_setting: 'everything',
      post_call_analysis_model: 'gpt-4o-mini',
      pii_config: { 
        mode: 'post_call', 
        categories: ['credit_card_number', 'phone_number', 'email'] 
      }
    };

    console.log('📝 Update payload:', JSON.stringify(updatePayload, null, 2));

    // Make the API request to update the agent
    const response = await axios.post(`https://api.retellai.com/update-agent`, updatePayload, {
      headers: {
        'Authorization': `Bearer ${process.env.RETELL_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ Agent updated successfully!');
    console.log('Updated Agent ID:', response.data.agent_id);
    console.log('Agent Name:', response.data.agent_name);
    console.log('Webhook URL:', response.data.webhook_url);
    console.log('WebSocket URL:', response.data.response_engine.llm_websocket_url);

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
    console.error('❌ Error updating agent:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run if called directly
if (require.main === module) {
  updateFongoAgent();
}

module.exports = { updateFongoAgent };

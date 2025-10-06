const axios = require('axios');

/**
 * Create a new Fongo agent with custom-llm (WebSocket) from scratch
 */

async function createNewFongoAgent() {
  try {
    if (!process.env.RETELL_API_KEY) {
      console.error('❌ RETELL_API_KEY environment variable is not set');
      return;
    }

    console.log('🆕 Creating NEW Fongo agent with custom-llm...');

    // Create new agent with custom-llm (WebSocket)
    const payload = {
      agent_name: "Fongo Credit Card Update Agent - Custom",
      voice_id: "11labs-Grace",
      language: "en-US",
      webhook_url: "https://fongo-credit-card-agent-8hhkqjxd1-petes-projects-268bdd55.vercel.app/webhook",
      response_engine: {
        type: "custom-llm",
        llm_websocket_url: "wss://fongo-credit-card-agent-8hhkqjxd1-petes-projects-268bdd55.vercel.app/llm-websocket"
      },
      conversation_transcriber: {
        provider: "deepgram",
        model: "nova-2",
        language: "en-US",
        redact_pii: "entity"
      },
      silence_timeout_seconds: 30,
      max_duration_seconds: 1800,
      instructions: "You are Nova, a helpful AI assistant for Fongo's credit card update service. Greet callers warmly, authenticate them by caller ID, collect new credit card information securely, process updates via API, and confirm success or explain issues clearly. Always be professional and reassuring.",
      enable_backchannel: true,
      backchannel_frequency: 0.3,
      interruption_sensitivity: 0.9,
      responsiveness: 0.9,
      normalize_for_speech: true,
      stt_mode: "accurate",
      allow_user_dtmf: false,
      ambient_sound: "call-center",
      reminder_trigger_ms: 30000,
      reminder_max_count: 2,
      end_call_after_silence_ms: 30000,
      webhook_timeout_ms: 10000,
      opt_out_sensitive_data_storage: false,
      data_storage_setting: "everything",
      post_call_analysis_model: "gpt-4o-mini",
      pii_config: {
        mode: "post_call",
        categories: ["credit_card", "phone_number", "email"]
      }
    };

    console.log('📝 Creating agent with payload:', JSON.stringify(payload, null, 2));

    const response = await axios.post('https://api.retellai.com/create-agent', payload, {
      headers: {
        'Authorization': `Bearer ${process.env.RETELL_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('🎉 NEW Agent created successfully!');
    console.log('Agent ID:', response.data.agent_id);
    console.log('Agent Name:', response.data.agent_name);
    console.log('Response Engine:', response.data.response_engine.type);
    console.log('WebSocket URL:', response.data.response_engine.llm_websocket_url);

    return response.data;

  } catch (error) {
    console.error('❌ Error creating new agent:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run if called directly
if (require.main === module) {
  createNewFongoAgent();
}

module.exports = { createNewFongoAgent };

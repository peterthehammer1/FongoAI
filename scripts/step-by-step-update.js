const axios = require('axios');

/**
 * Step-by-step update script to identify which field causes the 404 error
 */

async function stepByStepUpdate() {
  try {
    const existingAgentId = 'agent_c0b3d0217ea4dbcd6feb9c690c';
    
    console.log('🔍 Step-by-step agent update to identify problematic fields...');
    console.log('Agent ID:', existingAgentId);

    // Step 1: Update just the name and instructions
    console.log('\n📝 Step 1: Updating name and instructions...');
    const step1Payload = {
      agent_name: "Fongo Credit Card Update Agent",
      instructions: "You are Nova, a helpful AI assistant for Fongo's credit card update service. Greet callers warmly, authenticate them by caller ID, collect new credit card information securely, process updates via API, and confirm success or explain issues clearly. Always be professional and reassuring."
    };

    const response1 = await axios.patch(`https://api.retellai.com/update-agent/${existingAgentId}`, step1Payload, {
      headers: {
        'Authorization': `Bearer ${process.env.RETELL_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ Step 1 successful!');

    // Step 2: Add webhook URL
    console.log('\n📝 Step 2: Adding webhook URL...');
    const step2Payload = {
      webhook_url: "https://fongo-credit-card-agent-8hhkqjxd1-petes-projects-268bdd55.vercel.app/webhook"
    };

    const response2 = await axios.patch(`https://api.retellai.com/update-agent/${existingAgentId}`, step2Payload, {
      headers: {
        'Authorization': `Bearer ${process.env.RETELL_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ Step 2 successful!');

    // Step 3: Add transcriber settings
    console.log('\n📝 Step 3: Adding transcriber settings...');
    const step3Payload = {
      conversation_transcriber: {
        provider: "deepgram",
        model: "nova-2",
        language: "en-US",
        redact_pii: "entity"
      }
    };

    const response3 = await axios.patch(`https://api.retellai.com/update-agent/${existingAgentId}`, step3Payload, {
      headers: {
        'Authorization': `Bearer ${process.env.RETELL_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ Step 3 successful!');

    // Step 4: Add voice and language
    console.log('\n📝 Step 4: Adding voice and language...');
    const step4Payload = {
      voice_id: "11labs_anna",
      language: "en-US"
    };

    const response4 = await axios.patch(`https://api.retellai.com/update-agent/${existingAgentId}`, step4Payload, {
      headers: {
        'Authorization': `Bearer ${process.env.RETELL_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ Step 4 successful!');

    console.log('\n🎉 All steps completed successfully!');
    console.log('Final agent configuration:', JSON.stringify(response4.data, null, 2));

    return response4.data;

  } catch (error) {
    console.error('❌ Error in step-by-step update:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run if called directly
if (require.main === module) {
  stepByStepUpdate();
}

module.exports = { stepByStepUpdate };

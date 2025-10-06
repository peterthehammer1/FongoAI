const axios = require('axios');

/**
 * Simple test script to update just the agent name
 */

async function testUpdateAgent() {
  try {
    const existingAgentId = 'agent_c0b3d0217ea4dbcd6feb9c690c';
    
    console.log('🧪 Testing minimal agent update...');
    console.log('Agent ID:', existingAgentId);

    // Minimal update payload - just change the name
    const updatePayload = {
      agent_name: "Fongo Credit Card Update Agent - Updated"
    };

    console.log('📝 Update payload:', JSON.stringify(updatePayload, null, 2));

    // Test the update endpoint
    const response = await axios.patch(`https://api.retellai.com/update-agent/${existingAgentId}`, updatePayload, {
      headers: {
        'Authorization': `Bearer ${process.env.RETELL_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ Agent updated successfully!');
    console.log('Response:', JSON.stringify(response.data, null, 2));

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
  testUpdateAgent();
}

module.exports = { testUpdateAgent };

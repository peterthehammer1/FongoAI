const axios = require('axios');

/**
 * Script to test Retell API connection and list existing agents
 */

async function testRetellConnection() {
  try {
    if (!process.env.RETELL_API_KEY) {
      console.error('❌ RETELL_API_KEY environment variable is not set');
      return;
    }

    console.log('🔍 Testing Retell API connection...');
    console.log('API Key:', process.env.RETELL_API_KEY.substring(0, 10) + '...');

    // Try to list existing agents
    const response = await axios.get('https://api.retellai.com/list-agents', {
      headers: {
        'Authorization': `Bearer ${process.env.RETELL_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ API connection successful!');
    console.log('Existing agents:', response.data);

  } catch (error) {
    console.error('❌ API connection failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run if called directly
if (require.main === module) {
  testRetellConnection();
}

module.exports = { testRetellConnection };

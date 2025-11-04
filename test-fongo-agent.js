const axios = require('axios');

// Test Fongo AI Agent Webhook
async function testWebhook() {
  const baseUrl = 'http://134.122.37.50:3000';
  
  console.log('🧪 Testing Fongo AI Agent Webhook...\n');
  
  // Test 1: Health Check
  console.log('1️⃣ Testing Health Endpoint...');
  try {
    const healthResponse = await axios.get(`${baseUrl}/health`);
    console.log('✅ Health check passed:');
    console.log(JSON.stringify(healthResponse.data, null, 2));
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('   Server appears to be down or not accessible');
      console.error('   Please check if the server is running:');
      console.error('   ssh root@134.122.37.50 "pm2 status"');
      return;
    }
    throw error;
  }
  
  console.log('\n2️⃣ Testing Webhook with call_started event...');
  try {
    const webhookResponse = await axios.post(`${baseUrl}/webhook`, {
      event: 'call_started',
      call: {
        call_id: 'test_call_' + Date.now(),
        from_number: '+15199918959',
        from_name: 'Test Caller'
      }
    });
    console.log('✅ Webhook accepted call_started event:');
    console.log(JSON.stringify(webhookResponse.data, null, 2));
  } catch (error) {
    console.error('❌ Webhook test failed:', error.message);
    if (error.response) {
      console.error('   Response status:', error.response.status);
      console.error('   Response data:', error.response.data);
    }
  }
  
  console.log('\n3️⃣ Testing update_credit_card function (validation only, no API call)...');
  try {
    const updateResponse = await axios.post(`${baseUrl}/webhook`, {
      name: 'update_credit_card',
      args: {
        cardType: 'visa',
        cardNumber: '4532015128303669',
        expiryMonth: '12',
        expiryYear: '2027'
      },
      call: {
        call_id: 'test_call_' + Date.now(),
        from_number: '+15199918959'
      }
    });
    console.log('✅ update_credit_card function handler responded:');
    console.log(JSON.stringify(updateResponse.data, null, 2));
    console.log('\n⚠️  Note: This tested the handler. Actual Fongo API call requires valid phone number.');
  } catch (error) {
    console.error('❌ Update credit card test failed:', error.message);
    if (error.response) {
      console.error('   Response status:', error.response.status);
      console.error('   Response data:', error.response.data);
    }
  }
  
  console.log('\n4️⃣ Testing send_sms_link function...');
  try {
    const smsResponse = await axios.post(`${baseUrl}/webhook`, {
      name: 'send_sms_link',
      args: {
        phoneNumber: '+15199918959'
      },
      call: {
        call_id: 'test_call_' + Date.now(),
        from_number: '+15199918959'
      }
    });
    console.log('✅ send_sms_link function handler responded:');
    console.log(JSON.stringify(smsResponse.data, null, 2));
  } catch (error) {
    console.error('❌ SMS function test failed:', error.message);
    if (error.response) {
      console.error('   Response status:', error.response.status);
      console.error('   Response data:', error.response.data);
    }
  }
  
  console.log('\n✅ Testing complete!');
}

// Run tests
testWebhook().catch(console.error);


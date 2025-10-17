require('dotenv').config(); // Load environment variables
const { testSmsIntegration } = require('./services/sms');

async function main() {
  console.log('🧪 SMS Integration Test\n');
  
  // Check if SMS is configured
  const smsProvider = process.env.SMS_PROVIDER;
  const testNumber = process.env.TEST_PHONE_NUMBER;
  
  if (!smsProvider) {
    console.log('❌ SMS_PROVIDER not set in environment variables');
    console.log('Please set SMS_PROVIDER=twilio or SMS_PROVIDER=vonage in your .env file');
    return;
  }
  
  if (!testNumber) {
    console.log('❌ TEST_PHONE_NUMBER not set in environment variables');
    console.log('Please set TEST_PHONE_NUMBER=your-phone-number in your .env file');
    return;
  }
  
  console.log(`📱 Testing SMS with ${smsProvider} provider`);
  console.log(`📞 Test number: ${testNumber}\n`);
  
  try {
    const result = await testSmsIntegration();
    
    if (result.success) {
      console.log('\n🎉 SMS integration test completed successfully!');
      console.log('The system is ready to send account login links to customers.');
    } else {
      console.log('\n❌ SMS integration test failed');
      console.log('Please check your SMS provider credentials and try again.');
    }
  } catch (error) {
    console.error('\n💥 Test failed with error:', error.message);
  }
}

main();

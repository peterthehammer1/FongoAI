const axios = require('axios');

// SMS Service Configuration
const SMS_CONFIG = {
  provider: process.env.SMS_PROVIDER || 'twilio', // twilio, vonage, etc.
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    fromNumber: process.env.TWILIO_FROM_NUMBER
  },
  vonage: {
    apiKey: process.env.VONAGE_API_KEY,
    apiSecret: process.env.VONAGE_API_SECRET,
    fromNumber: process.env.VONAGE_FROM_NUMBER
  }
};

// Send SMS using Twilio
async function sendSmsTwilio(to, message) {
  try {
    const { accountSid, authToken, fromNumber } = SMS_CONFIG.twilio;
    
    if (!accountSid || !authToken || !fromNumber) {
      throw new Error('Twilio credentials not configured');
    }
    
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    
    const response = await axios.post(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      new URLSearchParams({
        From: fromNumber,
        To: to,
        Body: message
      }),
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 10000
      }
    );
    
    console.log('✅ SMS sent via Twilio:', response.data.sid);
    return {
      success: true,
      messageId: response.data.sid,
      provider: 'twilio'
    };
    
  } catch (error) {
    console.error('❌ Twilio SMS error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      provider: 'twilio'
    };
  }
}

// Send SMS using Vonage (Nexmo)
async function sendSmsVonage(to, message) {
  try {
    const { apiKey, apiSecret, fromNumber } = SMS_CONFIG.vonage;
    
    if (!apiKey || !apiSecret || !fromNumber) {
      throw new Error('Vonage credentials not configured');
    }
    
    const response = await axios.post(
      'https://rest.nexmo.com/sms/json',
      {
        api_key: apiKey,
        api_secret: apiSecret,
        to: to,
        from: fromNumber,
        text: message
      },
      {
        timeout: 10000
      }
    );
    
    if (response.data.messages[0].status === '0') {
      console.log('✅ SMS sent via Vonage:', response.data.messages[0]['message-id']);
      return {
        success: true,
        messageId: response.data.messages[0]['message-id'],
        provider: 'vonage'
      };
    } else {
      throw new Error(response.data.messages[0]['error-text']);
    }
    
  } catch (error) {
    console.error('❌ Vonage SMS error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.messages?.[0]?.['error-text'] || error.message,
      provider: 'vonage'
    };
  }
}

// Main SMS sending function
async function sendSms(to, message) {
  try {
    // Format phone number (ensure it starts with +)
    const formattedTo = to.startsWith('+') ? to : `+1${to.replace(/\D/g, '')}`;
    
    console.log(`📱 Sending SMS to ${formattedTo}: ${message.substring(0, 50)}...`);
    
    let result;
    
    switch (SMS_CONFIG.provider.toLowerCase()) {
      case 'twilio':
        result = await sendSmsTwilio(formattedTo, message);
        break;
      case 'vonage':
        result = await sendSmsVonage(formattedTo, message);
        break;
      default:
        throw new Error(`Unsupported SMS provider: ${SMS_CONFIG.provider}`);
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ SMS sending failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Send account login link via SMS
async function sendAccountLoginLink(phoneNumber) {
  const message = `Hi! Here's your Fongo account login link: https://account.fongo.com/login/\n\nAfter updating your credit card, our system will automatically attempt to charge your outstanding balance overnight.`;
  
  return await sendSms(phoneNumber, message);
}

// Test SMS functionality
async function testSmsIntegration() {
  console.log('🧪 Testing SMS Integration...\n');
  
  // Test with a safe number (your own)
  const testNumber = process.env.TEST_PHONE_NUMBER || '5198040969';
  
  console.log(`1. Testing SMS to ${testNumber}...`);
  
  const result = await sendAccountLoginLink(testNumber);
  
  if (result.success) {
    console.log('✅ SMS sent successfully!');
    console.log(`   Provider: ${result.provider}`);
    console.log(`   Message ID: ${result.messageId}`);
  } else {
    console.log('❌ SMS sending failed:', result.error);
    console.log('\n📋 Setup Instructions:');
    console.log('1. Choose SMS provider (Twilio or Vonage)');
    console.log('2. Get API credentials from provider');
    console.log('3. Update your .env file with:');
    console.log('   SMS_PROVIDER=twilio');
    console.log('   TWILIO_ACCOUNT_SID=your-sid');
    console.log('   TWILIO_AUTH_TOKEN=your-token');
    console.log('   TWILIO_FROM_NUMBER=your-number');
  }
  
  return result;
}

module.exports = {
  sendSms,
  sendAccountLoginLink,
  testSmsIntegration,
  SMS_CONFIG
};

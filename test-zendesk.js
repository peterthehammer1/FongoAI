const { createZendeskTicket, testZendeskConnection } = require('./services/zendesk');

async function testZendeskIntegration() {
  console.log('🧪 Testing Zendesk Integration...\n');
  
  // Test 1: Connection Test
  console.log('1. Testing Zendesk connection...');
  const connectionTest = await testZendeskConnection();
  
  if (!connectionTest) {
    console.log('❌ Zendesk connection failed. Please check your credentials.');
    console.log('\n📋 Setup Instructions:');
    console.log('1. Go to your Zendesk Admin Center');
    console.log('2. Navigate to Apps and integrations > APIs > Zendesk API');
    console.log('3. Enable Token Access');
    console.log('4. Generate a new API token');
    console.log('5. Update your .env file with:');
    console.log('   ZENDESK_SUBDOMAIN=your-subdomain');
    console.log('   ZENDESK_EMAIL=your-email@fongo.com');
    console.log('   ZENDESK_TOKEN=your-api-token');
    return;
  }
  
  // Test 2: Create Test Ticket
  console.log('\n2. Creating test ticket...');
  const testTicketData = {
    ticket: {
      subject: 'FHP [PhoneBot] Test Ticket',
      requester: {
        email: '1test@tel.fongo.com',
        name: 'Test User'
      },
      custom_fields: [
        { id: 22026703, value: '122663365800' },
        { id: 22075352, value: 'fongo_home_phone' },
        { id: 22256532, value: 'fongo_home_phone_billing_and_payment_inquiry' },
        { id: 22038468, value: 'Normal' }
      ],
      comment: {
        body: 'This is a test ticket created by the Fongo AI system.\nCaller\'s Name: Test User\nCustomer call back number: 5198040969\nNumber caller called from: 22663365800\nBilling Issue Description: Test ticket creation'
      }
    }
  };
  
  const ticketResult = await createZendeskTicket(testTicketData);
  
  if (ticketResult.success) {
    console.log('✅ Test ticket created successfully!');
    console.log(`   Ticket ID: ${ticketResult.ticketId}`);
    console.log(`   Ticket URL: ${ticketResult.ticketUrl}`);
  } else {
    console.log('❌ Test ticket creation failed:', ticketResult.error);
  }
  
  console.log('\n🎉 Zendesk integration test complete!');
}

// Run the test
testZendeskIntegration().catch(console.error);

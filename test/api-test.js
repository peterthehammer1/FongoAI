const { updateCreditCard, validateCreditCard } = require('../services/fongoApi');

/**
 * Test script for Fongo API integration
 * Run with: node test/api-test.js
 */

describe('API Tests', () => {
  test('should validate credit card numbers', async () => {
    await testCreditCardValidation();
  });

  test('should handle API endpoint', async () => {
    await testAPIEndpoint();
  });
});

async function testCreditCardValidation() {
  console.log('🧪 Testing credit card validation...');
  
  // Test valid card numbers
  const validCards = [
    '4111111111111111', // Visa test card
    '5555555555554444', // Mastercard test card
    '378282246310005',  // Amex test card
  ];
  
  // Test invalid card numbers
  const invalidCards = [
    '1234567890123456', // Invalid
    '4111111111111112', // Invalid checksum
    '1234',             // Too short
  ];
  
  console.log('\n✅ Valid cards:');
  validCards.forEach(card => {
    const isValid = validateCreditCard(card);
    console.log(`${card}: ${isValid ? 'VALID' : 'INVALID'}`);
  });
  
  console.log('\n❌ Invalid cards:');
  invalidCards.forEach(card => {
    const isValid = validateCreditCard(card);
    console.log(`${card}: ${isValid ? 'VALID' : 'INVALID'}`);
  });
}

async function testAPIEndpoint() {
  console.log('\n🌐 Testing API endpoint...');
  
  // Note: This will fail with actual API since we're using test data
  // but it will show the request format and error handling
  
  try {
    const result = await updateCreditCard(
      '15195551234',  // Test phone number
      '4111111111111111', // Test card number
      '12',           // December
      '2028'          // Year
    );
    
    console.log('API Response:', result);
  } catch (error) {
    console.log('Expected error (test data):', error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting API tests...\n');
  
  await testCreditCardValidation();
  await testAPIEndpoint();
  
  console.log('\n✅ Tests completed!');
  console.log('\n📝 Note: API test will fail with test data, but shows proper error handling.');
}

// Run tests if called directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };

const axios = require('axios');

// Zendesk API configuration
const ZENDESK_CONFIG = {
  subdomain: process.env.ZENDESK_SUBDOMAIN || 'your-subdomain', // e.g., 'fongo' for fongo.zendesk.com
  email: process.env.ZENDESK_EMAIL || 'your-email@fongo.com',
  token: process.env.ZENDESK_TOKEN || 'your-api-token'
};

// Create Zendesk ticket
async function createZendeskTicket(ticketData) {
  try {
    const { ticket } = ticketData;
    
    // Zendesk API endpoint
    const url = `https://${ZENDESK_CONFIG.subdomain}.zendesk.com/api/v2/tickets.json`;
    
    // Basic auth header (email/token format)
    const auth = Buffer.from(`${ZENDESK_CONFIG.email}/token:${ZENDESK_CONFIG.token}`).toString('base64');
    
    const response = await axios.post(url, ticketData, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ Zendesk ticket created:', response.data.ticket.id);
    return {
      success: true,
      ticketId: response.data.ticket.id,
      ticketUrl: response.data.ticket.url
    };
    
  } catch (error) {
    console.error('❌ Zendesk API error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error || error.message
    };
  }
}

// Test Zendesk connection
async function testZendeskConnection() {
  try {
    const url = `https://${ZENDESK_CONFIG.subdomain}.zendesk.com/api/v2/users/me.json`;
    const auth = Buffer.from(`${ZENDESK_CONFIG.email}/token:${ZENDESK_CONFIG.token}`).toString('base64');
    
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Zendesk connection successful:', response.data.user.name);
    return true;
  } catch (error) {
    console.error('❌ Zendesk connection failed:', error.response?.data || error.message);
    return false;
  }
}

module.exports = {
  createZendeskTicket,
  testZendeskConnection,
  ZENDESK_CONFIG
};

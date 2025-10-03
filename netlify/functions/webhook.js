const { updateCreditCard } = require('../../services/fongoApi');

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { event: eventType, call } = body;
    
    console.log(`📞 Webhook received: ${eventType} for call ${call?.call_id}`);
    
    switch (eventType) {
      case 'call_started':
        console.log(`Call started: ${call.call_id}`);
        console.log(`Caller ID: ${call.from_number}`);
        break;
        
      case 'call_ended':
        console.log(`Call ended: ${call.call_id}`);
        console.log(`Duration: ${call.end_timestamp - call.start_timestamp} seconds`);
        break;
        
      case 'call_analyzed':
        console.log(`Call analyzed: ${call.call_id}`);
        console.log(`Transcript: ${call.transcript}`);
        break;
        
      default:
        console.log(`Unknown event: ${eventType}`);
    }
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error('Webhook error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Webhook processing failed' }),
    };
  }
};

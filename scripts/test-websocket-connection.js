const WebSocket = require('ws');

/**
 * Test WebSocket connection to our Vercel deployment
 */

async function testWebSocketConnection() {
  console.log('🧪 Testing WebSocket connection to Vercel deployment...');
  
  const wsUrl = 'wss://fongo-credit-card-agent-8hhkqjxd1-petes-projects-268bdd55.vercel.app/llm-websocket';
  
  try {
    const ws = new WebSocket(wsUrl);
    
    ws.on('open', () => {
      console.log('✅ WebSocket connection opened successfully!');
      console.log('📡 Connected to:', wsUrl);
      
      // Send a test message
      const testMessage = {
        message_type: 'test',
        call_id: 'test_call_123',
        response: 'Hello from test client'
      };
      
      ws.send(JSON.stringify(testMessage));
      console.log('📤 Sent test message:', testMessage);
    });
    
    ws.on('message', (data) => {
      console.log('📥 Received message:', data.toString());
    });
    
    ws.on('error', (error) => {
      console.error('❌ WebSocket error:', error.message);
    });
    
    ws.on('close', (code, reason) => {
      console.log(`🔌 WebSocket closed: ${code} - ${reason}`);
    });
    
    // Close after 5 seconds
    setTimeout(() => {
      ws.close();
      console.log('🔌 Test completed, closing connection');
    }, 5000);
    
  } catch (error) {
    console.error('❌ Failed to create WebSocket connection:', error.message);
  }
}

// Run if called directly
if (require.main === module) {
  testWebSocketConnection();
}

module.exports = { testWebSocketConnection };

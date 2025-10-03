const fs = require('fs');
const path = require('path');

/**
 * Script to create Retell AI agent using the configuration
 * Run this script after setting up your environment variables
 */

async function createRetellAgent() {
  try {
    // Load configuration
    const configPath = path.join(__dirname, '..', 'retell-agent-config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    // Update URLs with your actual domain
    const domain = process.env.DOMAIN || 'your-domain.com';
    config.webhook_url = `https://${domain}/webhook`;
    config.llm_websocket_url = `wss://${domain}/llm-websocket`;
    
    console.log('🤖 Creating Retell AI Agent with configuration:');
    console.log(JSON.stringify(config, null, 2));
    
    // Note: You'll need to manually create the agent in Retell AI dashboard
    // or use their API with your API key
    console.log('\n📋 Next steps:');
    console.log('1. Go to https://dashboard.retellai.com');
    console.log('2. Create a new agent');
    console.log('3. Use the configuration above');
    console.log('4. Update your .env file with the agent ID');
    console.log('5. Deploy your server to your domain');
    
  } catch (error) {
    console.error('❌ Error creating agent configuration:', error);
  }
}

// Run if called directly
if (require.main === module) {
  createRetellAgent();
}

module.exports = { createRetellAgent };

const axios = require('axios');
const fs = require('fs');
const path = require('path');

/**
 * Script to update the Retell AI agent prompt to fix the phone number issue
 * Replaces placeholder text with {{user_number}} dynamic variable
 */

async function updateRetellPrompt() {
  try {
    if (!process.env.RETELL_API_KEY) {
      console.error('❌ RETELL_API_KEY environment variable is not set');
      console.error('Please set it: export RETELL_API_KEY=your_api_key');
      return;
    }

    const agentId = 'agent_c0b3d0217ea4dbcd6feb9c690c';
    
    console.log('🔧 Updating Retell AI agent prompt to fix phone number detection...');
    console.log('Agent ID:', agentId);

    // Read the updated prompt file
    const promptPath = path.join(__dirname, 'FONGO_PROMPT_VOICE_ONLY.md');
    const promptContent = fs.readFileSync(promptPath, 'utf8');
    
    // Convert markdown to plain text instructions (remove markdown formatting)
    let instructions = promptContent
      .replace(/^#+\s+/gm, '') // Remove markdown headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1') // Remove italic
      .replace(/^- /gm, '• ') // Convert list items
      .trim();

    console.log('\n📝 Updated prompt uses {{user_number}} dynamic variable');
    console.log('✅ This will fix the issue where AI was using hardcoded test number\n');

    // Update the agent
    const response = await axios.patch(
      `https://api.retellai.com/update-agent/${agentId}`,
      {
        instructions: instructions
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.RETELL_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ Agent prompt updated successfully!');
    console.log('Agent ID:', response.data.agent_id);
    console.log('Agent Name:', response.data.agent_name);
    console.log('\n🔍 The AI will now correctly identify callers using {{user_number}}');
    console.log('   instead of the hardcoded test number.\n');

  } catch (error) {
    console.error('❌ Error updating agent:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run the update
updateRetellPrompt();


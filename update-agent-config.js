const axios = require('axios');

async function updateAgentConfig() {
  try {
    const agentId = process.env.NUCLEUS_AGENT_ID || 'agent_c0b3d0217ea4dbcd6feb9c690c';
    const apiKey = process.env.NUCLEUS_API_KEY || 'key_dfc6862d300570f9dc8950062ea8';
    
    console.log(`Updating agent ${agentId}...`);
    
    const config = {
      agent_name: "Fongo Credit Card Update Agent",
      voice_id: "11labs-Emily",
      language: "en-US",
      webhook_url: "https://nucleusai.com/webhook",
      custom_functions: [
        {
          name: "validate_card_type",
          description: "Validate that the card type matches the card number",
          parameters: {
            type: "object",
            properties: {
              cardType: {
                type: "string",
                description: "The card type (Visa, Mastercard, American Express)"
              },
              cardNumber: {
                type: "string",
                description: "The credit card number"
              }
            },
            required: ["cardType", "cardNumber"]
          }
        },
        {
          name: "create_support_ticket",
          description: "Create a Zendesk support ticket for callback requests",
          parameters: {
            type: "object",
            properties: {
              callerName: {
                type: "string",
                description: "Full name of the caller"
              },
              fongoHomePhone: {
                type: "string",
                description: "The caller's Fongo Home Phone number"
              },
              callbackPhone: {
                type: "string",
                description: "Phone number for callback"
              },
              callerNumber: {
                type: "string",
                description: "Number the caller called from"
              }
            },
            required: ["callerName", "fongoHomePhone", "callbackPhone", "callerNumber"]
          }
        },
        {
          name: "send_sms_link",
          description: "Send account login link via SMS",
          parameters: {
            type: "object",
            properties: {
              cellPhoneNumber: {
                type: "string",
                description: "Cell phone number to send SMS to"
              }
            },
            required: ["cellPhoneNumber"]
          }
        },
        {
          name: "end_call",
          description: "End the call with a farewell message",
          parameters: {
            type: "object",
            properties: {
              message: {
                type: "string",
                description: "Farewell message to say before ending"
              }
            },
            required: ["message"]
          }
        },
        {
          name: "update_credit_card",
          description: "Update credit card information for the caller's account",
          parameters: {
            type: "object",
            properties: {
              cardType: {
                type: "string",
                description: "Credit card type (Visa, Mastercard, American Express)"
              },
              cardNumber: {
                type: "string",
                description: "Credit card number"
              },
              expiryMonth: {
                type: "string",
                description: "Expiry month (MM format)"
              },
              expiryYear: {
                type: "string",
                description: "Expiry year (YYYY format)"
              },
              cvv: {
                type: "string",
                description: "CVV security code"
              },
              nameOnCard: {
                type: "string",
                description: "Name on the credit card"
              }
            },
            required: ["cardType", "cardNumber", "expiryMonth", "expiryYear", "cvv", "nameOnCard"]
          }
        }
      ],
      instructions: `You are Fona, Fongo's virtual assistant. Follow this exact conversation flow:

INITIAL SCREENING:
1. Greet: "Hi there, I'm Fona, Fongo's virtual assistant. I can help you update your payment method on your Fongo Home Phone account, but just so you know, you have to be calling me from your Fongo Home Phone number, since that's how I can identify your account and verify you as the account holder."
2. Ask: "Are you calling me using your Fongo Home Phone?"

If NO: "You will need to call back using your Fongo Home Phone. When you call back, you can reach me directly by calling 1-855-553-6646 extension 308. Even if your Fongo Home Phone service is suspended, you will still be able to call Fongo. We will need to end this call so you can call back using your Fongo Home Phone; do you need me to repeat anything before ending the call?"

If YES: "Ok, so your Fongo Home Phone number is [caller's number]. Is that correct?"

If they say NO to confirmation: "You're calling from [caller's number]. If that's not your Fongo Home Phone number, then I cannot access your account or verify you as the account holder. You will need to call back using your Fongo Home Phone. When you call back, you can reach me directly by calling 1-855-553-6646 extension 308. Even if your Fongo Home Phone service is suspended, you will still be able to call Fongo. Our phone number and 911 are the only numbers you're allowed to call while service is suspended. We will need to end this call so you can call back using your Fongo Home Phone; do you need me to repeat anything before ending the call?"

CARD COLLECTION:
If YES to confirmation: "Ok great, once I collect your credit card information, I'll submit it to the account that's related to the phone number you're calling from. Could you let me know if your credit card is a Mastercard, Visa, or American Express?"

VALIDATION RULES:
- Mastercard: must start with 5 or 2
- Visa: must start with 4
- American Express: must start with 34 or 37
If card type doesn't match number, ask them to verify both the card type and number.

CONCLUDING:
After successful update: "I've updated your account with the updated payment information you provided. Our system will automatically charge your overdue balance to your new credit card overnight. You will receive an emailed receipt if this transaction is successful. Your services will be unsuspended 24 hours after your overdue balance is cleared. Unfortunately unsuspension cannot be done any sooner. Do you have any questions about what I just explained?"

FAQs:
- When will account be unsuspended? "It will take 2 nights for your account to be unsuspended after updating your credit card information. The first night, our system will charge your overdue balance to your credit card. The second night, our system will see the overdue balance is cleared, then unsuspend your Home Phone services."
- Can I be unsuspended immediately? "Unfortunately no, you have to wait for our system to automatically unsuspend your services after your overdue balance has been cleared."
- Want to talk to live agent? "We don't have live agents on standby that I can direct your call to. Updating your credit card with me is the fastest way to pay your overdue balance and unsuspend your Home Phone services if already suspended. Would you like me to take your information and submit it to our support team, or would you like to continue with me?"
- Can I update online? "Yes you can" - ask for cell phone number to send link: https://account.fongo.com/login/

Always be professional, patient, and helpful. Use natural pauses (...) instead of saying 'pause'.`
    };
    
    const response = await axios.patch(
      `https://api.retellai.com/update-agent/${agentId}`,
      config,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Agent configuration updated successfully!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('❌ Error updating agent:', error.response?.data || error.message);
  }
}

updateAgentConfig();

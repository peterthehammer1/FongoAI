/**
 * Conversation State Manager for Credit Card Update Agent
 * Manages the flow of conversation and stores user data during the call
 */

class ConversationState {
  constructor() {
    this.states = new Map(); // call_id -> state object
  }
  
  /**
   * Initialize conversation state for a new call
   * @param {string} callId - Unique call identifier
   * @param {string} callerId - Phone number of the caller
   * @param {string} callerName - Name of the caller (if available)
   */
  initializeCall(callId, callerId, callerName = null) {
    this.states.set(callId, {
      step: 'greeting',
      callerId: callerId,
      callerName: callerName,
      cardNumber: null,
      expirationMonth: null,
      expirationYear: null,
      attempts: 0,
      maxAttempts: 3,
      startTime: new Date()
    });
    
    console.log(`📞 Initialized conversation state for call ${callId} from ${callerId}${callerName ? ` (${callerName})` : ''}`);
  }
  
  /**
   * Get current state for a call
   * @param {string} callId - Call identifier
   * @returns {Object} Current state object
   */
  getState(callId) {
    return this.states.get(callId);
  }
  
  /**
   * Update conversation state
   * @param {string} callId - Call identifier
   * @param {Object} updates - State updates
   */
  updateState(callId, updates) {
    const currentState = this.states.get(callId);
    if (currentState) {
      Object.assign(currentState, updates);
      console.log(`📝 Updated state for call ${callId}:`, updates);
    }
  }
  
  /**
   * Process user response and determine next action
   * @param {string} callId - Call identifier
   * @param {string} userResponse - User's spoken response
   * @returns {Object} Next action and response
   */
  processResponse(callId, userResponse) {
    const state = this.getState(callId);
    if (!state) {
      return {
        response: "I'm sorry, I lost track of our conversation. Please call back to start over.",
        nextStep: 'end_call'
      };
    }
    
    state.attempts++;
    
    // Check if max attempts exceeded
    if (state.attempts > state.maxAttempts) {
      return {
        response: "I'm having trouble understanding. Please contact our support team for assistance. Thank you for calling Fongo.",
        nextStep: 'end_call'
      };
    }
    
    const lowerResponse = userResponse.toLowerCase().trim();
    
    switch (state.step) {
      case 'greeting':
        return this.handleGreetingResponse(state, lowerResponse);
        
      case 'collecting_name':
        return this.handleNameResponse(state, userResponse);
        
      case 'collecting_card':
        return this.handleCardResponse(state, lowerResponse);
        
      case 'collecting_expiry':
        return this.handleExpiryResponse(state, userResponse);
        
      case 'collecting_cvv':
        return this.handleCvvResponse(state, lowerResponse);
        
      case 'confirming':
        return this.handleConfirmationResponse(state, lowerResponse);
        
      default:
        return {
          response: "I'm sorry, I'm not sure what to do next. Please call back to start over.",
          nextStep: 'end_call'
        };
    }
  }
  
  /**
   * Handle greeting response (phone number confirmation)
   */
  handleGreetingResponse(state, response) {
    if (this.isPositiveResponse(response)) {
      state.step = 'collecting_name';
      return {
        response: "Perfect! Now I'll need the name exactly as it appears on your credit card. What's the name on the card?",
        nextStep: 'continue'
      };
    } else if (this.isNegativeResponse(response)) {
      return {
        response: "I understand. Please make sure you're calling from the correct phone number for your Fongo account, or contact our support team for assistance.",
        nextStep: 'end_call'
      };
    } else {
      return {
        response: "I didn't quite catch that. Is this the correct phone number for your Fongo account? Please say yes or no.",
        nextStep: 'continue'
      };
    }
  }
  
  /**
   * Handle name on card response
   */
  handleNameResponse(state, response) {
    if (response.trim().length > 0) {
      state.nameOnCard = response.trim();
      state.step = 'collecting_card';
      return {
        response: "Thank you. Now I'll need your 16-digit credit card number. Let's do this in groups to make sure I get it right. Could you please read me the first 4 digits?",
        nextStep: 'continue'
      };
    } else {
      return {
        response: "I need the name exactly as it appears on your credit card. What's the name on the card?",
        nextStep: 'continue'
      };
    }
  }
  
  /**
   * Handle credit card number response
   */
  handleCardResponse(state, response) {
    // Extract digits from response
    const digits = response.replace(/\D/g, '');
    
    // Initialize card number if not exists
    if (!state.cardNumber) {
      state.cardNumber = '';
    }
    
    // Add new digits to existing card number
    state.cardNumber += digits;
    
    // Check if we have 16 digits total
    if (state.cardNumber.length === 16) {
      // Validate card number using Luhn algorithm
      if (this.validateCreditCard(state.cardNumber)) {
        state.step = 'collecting_expiry';
        return {
          response: "Thank you. May I have the expiry date?",
          nextStep: 'continue'
        };
      } else {
        // Reset card number and start over
        state.cardNumber = '';
        return {
          response: "I'm sorry, that doesn't appear to be a valid credit card number. Let's start over. Could you please read me the first 4 digits?",
          nextStep: 'continue'
        };
      }
    } else if (state.cardNumber.length < 16) {
      // Ask for next group
      const groupsCollected = Math.floor(state.cardNumber.length / 4);
      const nextGroup = groupsCollected + 1;
      
      if (nextGroup === 2) {
        return {
          response: "Thank you. Now the next 4 digits?",
          nextStep: 'continue'
        };
      } else if (nextGroup === 3) {
        return {
          response: "And the next 4 digits?",
          nextStep: 'continue'
        };
      } else if (nextGroup === 4) {
        return {
          response: "And the final 4 digits?",
          nextStep: 'continue'
        };
      }
    } else {
      // Too many digits, reset and start over
      state.cardNumber = '';
      return {
        response: "I need exactly 16 digits total. Let's start over. Could you please read me the first 4 digits?",
        nextStep: 'continue'
      };
    }
  }
  
  /**
   * Handle expiry date response (month and year together)
   */
  handleExpiryResponse(state, response) {
    // Extract digits and text from response
    const digits = response.replace(/\D/g, '');
    const text = response.toLowerCase();
    
    let month = null;
    let year = null;
    
    // Try to parse month
    if (digits.length >= 2) {
      month = digits.substring(0, 2);
      if (parseInt(month) >= 1 && parseInt(month) <= 12) {
        // Try to parse year
        if (digits.length >= 4) {
          year = digits.substring(2, 6);
        } else if (digits.length === 2) {
          // Only month provided, ask for year
          state.expirationMonth = month;
          state.step = 'collecting_year';
          return {
            response: "And what year does your card expire? Please give me the full four-digit year, like 2028.",
            nextStep: 'continue'
          };
        }
      }
    }
    
    // Try to parse month from text
    const monthNames = {
      'january': '01', 'jan': '01',
      'february': '02', 'feb': '02',
      'march': '03', 'mar': '03',
      'april': '04', 'apr': '04',
      'may': '05',
      'june': '06', 'jun': '06',
      'july': '07', 'jul': '07',
      'august': '08', 'aug': '08',
      'september': '09', 'sep': '09', 'sept': '09',
      'october': '10', 'oct': '10',
      'november': '11', 'nov': '11',
      'december': '12', 'dec': '12'
    };
    
    for (const [name, value] of Object.entries(monthNames)) {
      if (text.includes(name)) {
        month = value;
        break;
      }
    }
    
    if (month && year) {
      // Validate year (must be 2025 or later)
      const yearInt = parseInt(year);
      if (yearInt >= 2025) {
        state.expirationMonth = month;
        state.expirationYear = year;
        state.step = 'collecting_cvv';
        return {
          response: "Thank you. And what's the CVV number on the back of your card?",
          nextStep: 'continue'
        };
      } else {
        return {
          response: "I need an expiry year of 2025 or later. Could you please tell me the correct expiry year?",
          nextStep: 'continue'
        };
      }
    }
    
    return {
      response: "I need both the month and year. Please provide the expiry date, like 12/2027 or December 2027.",
      nextStep: 'continue'
    };
  }
  
  /**
   * Handle CVV response
   */
  handleCvvResponse(state, response) {
    const digits = response.replace(/\D/g, '');
    
    if (digits.length === 3) {
      state.cvv = digits;
      state.step = 'confirming';
      
      // Read back the credit card number in groups of 4 digits
      const cardNumber = state.cardNumber;
      const groups = [
        cardNumber.substring(0, 4),
        cardNumber.substring(4, 8),
        cardNumber.substring(8, 12),
        cardNumber.substring(12, 16)
      ];
      
      const readBack = groups.map(group => 
        group.split('').map(digit => this.numberToWord(digit)).join(', ')
      ).join(' ... ');
      
      return {
        response: `Thank you. Let me read that back to you to make sure it is correct. I have your credit card as ${readBack} with an expiry date of ${state.expirationMonth}/${state.expirationYear} and your CVV as ${state.cvv}. Is that correct?`,
        nextStep: 'continue'
      };
    } else {
      return {
        response: "I need exactly 3 digits for the CVV. Could you please read the 3-digit security code from the back of your card again?",
        nextStep: 'continue'
      };
    }
  }
  
  /**
   * Convert number to word
   */
  numberToWord(num) {
    const words = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
    return words[parseInt(num)] || num;
  }
  
  /**
   * Handle expiration year response
   */
  handleYearResponse(state, response) {
    const digits = response.replace(/\D/g, '');
    
    if (digits.length === 4) {
      const year = parseInt(digits);
      const currentYear = new Date().getFullYear();
      
      if (year >= currentYear) {
        state.step = 'confirming';
        state.expirationYear = digits;
        
        const lastFour = state.cardNumber.slice(-4);
        const lastFourDigits = lastFour.split('').map(digit => {
          const digitNames = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
          return digitNames[parseInt(digit)];
        }).join(', ');
        
        return {
          response: `Let me confirm: Card ending in ${lastFourDigits}, expiring ${state.expirationMonth}/${state.expirationYear}. Is this correct?`,
          nextStep: 'continue'
        };
      }
    }
    
    return {
      response: "Please provide the four-digit year your card expires, like 2028.",
      nextStep: 'continue'
    };
  }
  
  /**
   * Handle confirmation response
   */
  async handleConfirmationResponse(state, response) {
    if (this.isPositiveResponse(response)) {
      // All information collected, make API call
      state.step = 'processing';
      
      try {
        // Call the webhook to process the credit card update
        const axios = require('axios');
        const webhookUrl = 'https://fongo-credit-card-agent-8hhkqjxd1-petes-projects-268bdd55.vercel.app/webhook';
        
        const webhookData = {
          event: 'credit_card_collected',
          call: {
            call_id: state.callId,
            from_number: state.callerId,
            from_name: state.callerName
          },
          data: {
            cardNumber: state.cardNumber,
            expiryMonth: state.expirationMonth,
            expiryYear: state.expirationYear,
            cvv: state.cvv,
            nameOnCard: state.nameOnCard,
            callerId: state.callerId
          }
        };
        
        console.log('🔗 Calling webhook with credit card data:', webhookData);
        
        const response = await axios.post(webhookUrl, webhookData, {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        console.log('🔗 Webhook response:', response.data);
        
        if (response.data.success) {
          return {
            response: "Perfect! Your credit card has been successfully updated. Thank you for calling Fongo. Have a great day!",
            nextStep: 'end_call'
          };
        } else {
          return {
            response: response.data.message || "There was an issue updating your credit card. Please try again later or contact our support team. Thank you for calling Fongo.",
            nextStep: 'end_call'
          };
        }
      } catch (error) {
        console.error('Error calling webhook:', error);
        return {
          response: "I'm experiencing a technical issue. Please try again in a few minutes or contact our support team. Thank you for calling Fongo.",
          nextStep: 'end_call'
        };
      }
    } else if (this.isNegativeResponse(response)) {
      // Start over
      state.step = 'collecting_card';
      state.cardNumber = null;
      state.expirationMonth = null;
      state.expirationYear = null;
      return {
        response: "No problem. Let's start over. Please provide your 16-digit credit card number.",
        nextStep: 'continue'
      };
    } else {
      return {
        response: "Please say yes if the information is correct, or no if you'd like to start over.",
        nextStep: 'continue'
      };
    }
  }
  
  /**
   * Check if response is positive (yes, correct, right, etc.)
   */
  isPositiveResponse(response) {
    const positiveWords = ['yes', 'yeah', 'yep', 'correct', 'right', 'that\'s right', 'that is correct'];
    return positiveWords.some(word => response.includes(word));
  }
  
  /**
   * Check if response is negative (no, wrong, incorrect, etc.)
   */
  isNegativeResponse(response) {
    const negativeWords = ['no', 'nope', 'wrong', 'incorrect', 'that\'s wrong', 'that is wrong'];
    return negativeWords.some(word => response.includes(word));
  }
  
  /**
   * Validate credit card using Luhn algorithm
   */
  validateCreditCard(cardNumber) {
    let sum = 0;
    let isEven = false;
    
    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber[i]);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  }
  
  /**
   * Clean up conversation state when call ends
   * @param {string} callId - Call identifier
   */
  endCall(callId) {
    const state = this.getState(callId);
    if (state) {
      const duration = new Date() - state.startTime;
      console.log(`📞 Call ${callId} ended after ${Math.round(duration / 1000)} seconds`);
      this.states.delete(callId);
    }
  }
}

// Export singleton instance
module.exports = new ConversationState();

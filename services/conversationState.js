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
   */
  initializeCall(callId, callerId) {
    this.states.set(callId, {
      step: 'greeting',
      callerId: callerId,
      cardNumber: null,
      expirationMonth: null,
      expirationYear: null,
      attempts: 0,
      maxAttempts: 3,
      startTime: new Date()
    });
    
    console.log(`📞 Initialized conversation state for call ${callId} from ${callerId}`);
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
        
      case 'collecting_card':
        return this.handleCardResponse(state, lowerResponse);
        
      case 'collecting_month':
        return this.handleMonthResponse(state, lowerResponse);
        
      case 'collecting_year':
        return this.handleYearResponse(state, lowerResponse);
        
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
      state.step = 'collecting_card';
      return {
        response: "Great! I'll need to collect your new credit card information. Please provide your 16-digit credit card number.",
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
   * Handle credit card number response
   */
  handleCardResponse(state, response) {
    // Extract digits from response
    const digits = response.replace(/\D/g, '');
    
    if (digits.length === 16) {
      // Validate card number using Luhn algorithm
      if (this.validateCreditCard(digits)) {
        state.step = 'collecting_month';
        state.cardNumber = digits;
        return {
          response: "Thank you. What month does your card expire? Please give me the two-digit month, like 07 for July.",
          nextStep: 'continue'
        };
      } else {
        return {
          response: "I'm sorry, that doesn't appear to be a valid credit card number. Please provide your 16-digit credit card number again.",
          nextStep: 'continue'
        };
      }
    } else {
      return {
        response: "I need a 16-digit credit card number. Please provide your credit card number.",
        nextStep: 'continue'
      };
    }
  }
  
  /**
   * Handle expiration month response
   */
  handleMonthResponse(state, response) {
    const digits = response.replace(/\D/g, '');
    
    if (digits.length === 2) {
      const month = parseInt(digits);
      if (month >= 1 && month <= 12) {
        state.step = 'collecting_year';
        state.expirationMonth = digits;
        return {
          response: "And what year does your card expire? Please give me the full four-digit year, like 2028.",
          nextStep: 'continue'
        };
      }
    }
    
    return {
      response: "Please provide the two-digit month your card expires, like 07 for July.",
      nextStep: 'continue'
    };
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
        return {
          response: `Let me confirm: Card ending in ${lastFour}, expiring ${state.expirationMonth}/${state.expirationYear}. Is this correct?`,
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
        const { updateCreditCard } = require('./fongoApi');
        const result = await updateCreditCard(
          state.callerId,
          state.cardNumber,
          state.expirationMonth,
          state.expirationYear
        );
        
        if (result.success) {
          return {
            response: "Perfect! Your credit card has been successfully updated. Thank you for calling Fongo. Have a great day!",
            nextStep: 'end_call'
          };
        } else {
          return {
            response: result.message + " Thank you for calling Fongo.",
            nextStep: 'end_call'
          };
        }
      } catch (error) {
        console.error('Error processing credit card update:', error);
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

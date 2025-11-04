/**
 * Clear, actionable error messages for credit card update failures
 * Each error message tells the caller what happened and what they should do next
 */

const ACTIONABLE_ERROR_MESSAGES = {
  // Invalid credit card number errors
  'invalid_card': {
    message: 'The credit card number you provided is not valid.',
    action: 'Please check the card number and make sure you\'re reading all digits correctly. If the problem continues, you may need to use a different card or contact your bank.',
    support: false
  },
  'invalid_card_number': {
    message: 'The credit card number you provided is not valid.',
    action: 'Please check the card number and make sure you\'re reading all digits correctly. If the problem continues, you may need to use a different card or contact your bank.',
    support: false
  },
  
  // Account not found errors
  'customer_not_found': {
    message: 'I couldn\'t find an account associated with the phone number you\'re calling from.',
    action: 'Please make sure you\'re calling from your Fongo Home Phone number. If you\'re calling from a different number, you can call back from your Fongo Home Phone, or I can text you a link to update your payment information online.',
    support: true
  },
  
  // Expiry date errors
  'invalid_expiry': {
    message: 'The expiry date you provided is not valid.',
    action: 'Please check your card\'s expiry date and provide it again. The date should be in the future and formatted as MM/YYYY (for example, 12/2027).',
    support: false
  },
  'card_expired': {
    message: 'The credit card you provided has already expired.',
    action: 'Please use a different credit card with a future expiry date. If you don\'t have another card, you may need to contact your bank for a replacement card.',
    support: false
  },
  'invalid_month': {
    message: 'The expiry month you provided is not valid.',
    action: 'Please check your card\'s expiry month. It should be a number between 01 and 12 (for example, 01 for January, 12 for December).',
    support: false
  },
  'invalid_year': {
    message: 'The expiry year you provided is not valid.',
    action: 'Please check your card\'s expiry year. It should be a 4-digit year in the future (for example, 2027).',
    support: false
  },
  
  // Card declined errors
  'card_declined': {
    message: 'Your credit card was declined by your bank.',
    action: 'This could be due to insufficient funds, a security block, or an issue with your card. Please contact your bank to resolve this, or try using a different credit card.',
    support: false
  },
  
  // Account configuration errors
  'ERROR: Cannot Update Card When Current Payment Type Is XXX': {
    message: 'Your account currently uses a different payment method that prevents credit card updates.',
    action: 'To update your payment information, you\'ll need to contact our support team. Please go to Fongo\'s support webpage and submit a support request, or call us at 1-855-553-6646.',
    support: true
  },
  'ERROR: Cannot Update Card When There Is No Existing Card On File': {
    message: 'Your account doesn\'t have an existing credit card on file to update.',
    action: 'To set up a credit card for the first time, you\'ll need to contact our support team. Please go to Fongo\'s support webpage and submit a support request, or call us at 1-855-553-6646.',
    support: true
  },
  'ERROR: Cannot Update Card When There Is No Name On File': {
    message: 'Your account is missing required information that prevents payment updates.',
    action: 'To resolve this, you\'ll need to contact our support team to update your account information. Please go to Fongo\'s support webpage and submit a support request, or call us at 1-855-553-6646.',
    support: true
  },
  
  // Network and system errors
  'network_error': {
    message: 'I\'m unable to connect to the payment system right now.',
    action: 'This is a temporary technical issue. Please try again in a few minutes. If the problem continues, you can call back later or contact our support team.',
    support: true
  },
  'Unable to parse API response': {
    message: 'There was a technical issue processing your payment information.',
    action: 'Please try again in a few minutes. If the problem continues, you can call back later or contact our support team at 1-855-553-6646.',
    support: true
  },
  'There was an issue processing your payment': {
    message: 'There was a technical issue processing your payment information.',
    action: 'Please verify your credit card information and try again. If the problem continues, you can call back later or contact our support team at 1-855-553-6646.',
    support: true
  },
  
  // FAULT errors (technical server errors)
  'FAULT': {
    message: 'I\'m experiencing a technical issue on our end right now.',
    action: 'Please try again in a few minutes. If the problem continues, you can call back later or contact our support team at 1-855-553-6646.',
    support: true
  }
};

/**
 * Get a clear, actionable error message for a given error
 * @param {string} error - The raw error message from the API
 * @returns {Object} Object with message, action, and support flag
 */
function getActionableError(error) {
  if (!error) {
    return {
      message: 'There was an issue processing your payment.',
      action: 'Please try again, or contact our support team at 1-855-553-6646 for assistance.',
      support: true,
      fullMessage: 'Unknown error occurred'
    };
  }
  
  // Clean the error message
  let cleanedError = error.trim();
  
  // Remove FAULT prefix
  const isFaultError = cleanedError.match(/^FAULT:/i);
  if (isFaultError) {
    cleanedError = cleanedError.replace(/^FAULT:\s*/i, '').trim();
  }
  
  // Remove file paths and line numbers
  cleanedError = cleanedError.replace(/\s+at\s+[^\s]+\.pm\s+line\s+\d+\.?/gi, '').trim();
  
  // Extract error code if present
  const errorCodeMatch = cleanedError.match(/\(error code (\w+)\)/i);
  const errorCode = errorCodeMatch ? errorCodeMatch[1].toLowerCase() : null;
  
  // Try to find exact match first
  if (ACTIONABLE_ERROR_MESSAGES[cleanedError]) {
    return {
      ...ACTIONABLE_ERROR_MESSAGES[cleanedError],
      fullMessage: cleanedError
    };
  }
  
  // Try error code match
  if (errorCode && ACTIONABLE_ERROR_MESSAGES[errorCode]) {
    return {
      ...ACTIONABLE_ERROR_MESSAGES[errorCode],
      fullMessage: cleanedError
    };
  }
  
  // Try partial matches for common error patterns
  const lowerError = cleanedError.toLowerCase();
  
  if (lowerError.includes('customer not found') || lowerError.includes('account not found')) {
    return ACTIONABLE_ERROR_MESSAGES['customer_not_found'];
  }
  
  if (lowerError.includes('invalid card') || lowerError.includes('card number')) {
    return {
      ...ACTIONABLE_ERROR_MESSAGES['invalid_card'],
      fullMessage: cleanedError
    };
  }
  
  if (lowerError.includes('expired') || lowerError.includes('expiry')) {
    return {
      ...ACTIONABLE_ERROR_MESSAGES['invalid_expiry'],
      fullMessage: cleanedError
    };
  }
  
  if (lowerError.includes('declined')) {
    return {
      ...ACTIONABLE_ERROR_MESSAGES['card_declined'],
      fullMessage: cleanedError
    };
  }
  
  if (isFaultError || lowerError.includes('fault')) {
    return {
      ...ACTIONABLE_ERROR_MESSAGES['FAULT'],
      fullMessage: cleanedError
    };
  }
  
  // Default: generic actionable message
  return {
    message: 'There was an issue processing your payment information.',
    action: 'Please verify your credit card details and try again. If the problem continues, you can call back later or contact our support team at 1-855-553-6646 for assistance.',
    support: true,
    fullMessage: cleanedError
  };
}

/**
 * Format error message for AI agent to speak to caller
 * @param {string} error - The raw error message
 * @returns {string} Formatted message for the AI to speak
 */
function formatErrorForAI(error) {
  const actionable = getActionableError(error);
  
  // Format as: "What happened. What to do next. Support info if needed."
  let message = actionable.message;
  
  if (actionable.action) {
    message += ' ' + actionable.action;
  }
  
  if (actionable.support) {
    message += ' If you need further assistance, please go to Fongo\'s support webpage and submit a support request.';
  }
  
  return message;
}

/**
 * Format error message for dashboard display
 * @param {string} error - The raw error message
 * @returns {string} Formatted message for dashboard
 */
function formatErrorForDashboard(error) {
  const actionable = getActionableError(error);
  return `${actionable.message} ${actionable.action}`;
}

module.exports = {
  getActionableError,
  formatErrorForAI,
  formatErrorForDashboard,
  ACTIONABLE_ERROR_MESSAGES
};


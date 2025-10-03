const axios = require('axios');

const FONGO_API_URL = process.env.FONGO_API_URL || 'https://secure.freephoneline.ca/mobile/updatecc.pl';

/**
 * Update credit card information via Fongo API
 * @param {string} phone - 11 digit phone number (e.g., "15195551234")
 * @param {string} cardNumber - Credit card number without spaces
 * @param {string} month - 2 digit month (e.g., "07")
 * @param {string} year - 4 digit year (e.g., "2028")
 * @returns {Promise<Object>} API response
 */
async function updateCreditCard(phone, cardNumber, month, year) {
  try {
    // Validate inputs
    if (!phone || !cardNumber || !month || !year) {
      throw new Error('Missing required parameters');
    }
    
    // Validate phone number format (11 digits)
    if (!/^\d{11}$/.test(phone)) {
      throw new Error('Phone number must be 11 digits');
    }
    
    // Validate card number format (16 digits)
    if (!/^\d{16}$/.test(cardNumber)) {
      throw new Error('Credit card number must be 16 digits');
    }
    
    // Validate month format (2 digits, 01-12)
    if (!/^(0[1-9]|1[0-2])$/.test(month)) {
      throw new Error('Month must be 2 digits (01-12)');
    }
    
    // Validate year format (4 digits, current year or later)
    const currentYear = new Date().getFullYear();
    if (!/^\d{4}$/.test(year) || parseInt(year) < currentYear) {
      throw new Error('Year must be 4 digits and not in the past');
    }
    
    // Make API request
    const params = {
      phone: phone,
      payinfo: cardNumber,
      month: month,
      year: year
    };
    
    console.log(`🔄 Making API request to Fongo:`, {
      url: FONGO_API_URL,
      params: { ...params, payinfo: '****' + cardNumber.slice(-4) } // Log masked card number
    });
    
    const response = await axios.get(FONGO_API_URL, { params });
    
    console.log(`✅ Fongo API response:`, response.data);
    
    return {
      success: true,
      data: response.data,
      message: response.data.success === 1 ? 'Credit card updated successfully' : 'Update failed'
    };
    
  } catch (error) {
    console.error('❌ Fongo API error:', error.message);
    
    // Handle different types of errors
    if (error.response) {
      // API returned an error response
      const apiError = error.response.data;
      return {
        success: false,
        error: apiError.error || 'Unknown API error',
        message: getErrorMessage(apiError.error)
      };
    } else if (error.request) {
      // Network error
      return {
        success: false,
        error: 'Network error',
        message: 'Unable to connect to the payment system. Please try again later.'
      };
    } else {
      // Validation or other error
      return {
        success: false,
        error: error.message,
        message: 'Invalid information provided. Please check your details and try again.'
      };
    }
  }
}

/**
 * Convert API error messages to user-friendly messages
 * @param {string} error - Error message from API
 * @returns {string} User-friendly error message
 */
function getErrorMessage(error) {
  const errorMessages = {
    'Customer Not Found': 'I\'m sorry, but I couldn\'t find an account associated with this phone number. Please verify you\'re calling from the correct number.',
    'ERROR: Cannot Update Card When Current Payment Type Is XXX': 'I see there\'s an issue with your current payment method. Please contact our support team for assistance.',
    'ERROR: Cannot Update Card When There Is No Existing Card On File': 'It looks like there\'s no current card on file. Please contact our support team to set up your payment method.',
    'ERROR: Cannot Update Card When There Is No Name On File': 'There\'s an issue with your account information. Please contact our support team for assistance.'
  };
  
  // Check for FAULT errors
  if (error && error.startsWith('FAULT:')) {
    return 'I\'m experiencing a technical issue. Please try again in a few minutes or contact our support team.';
  }
  
  // Return specific error message or generic one
  return errorMessages[error] || 'There was an issue processing your request. Please try again or contact our support team.';
}

/**
 * Validate credit card number using Luhn algorithm
 * @param {string} cardNumber - Credit card number
 * @returns {boolean} Whether the card number is valid
 */
function validateCreditCard(cardNumber) {
  // Remove spaces and non-digits
  const cleaned = cardNumber.replace(/\D/g, '');
  
  // Check if it's 16 digits
  if (cleaned.length !== 16) {
    return false;
  }
  
  // Luhn algorithm
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i]);
    
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

module.exports = {
  updateCreditCard,
  getErrorMessage,
  validateCreditCard
};

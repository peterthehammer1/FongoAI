const express = require('express');
const axios = require('axios');
const router = express.Router();
const db = require('../services/database');
const dbComprehensive = require('../services/databaseComprehensive');
const nucleusDataProcessor = require('../services/nucleusDataProcessor');
const { sendAccountLoginLink } = require('../services/sms');
const { logger, AppError, asyncHandler, handleApiError } = require('../services/logger');
const { formatErrorForAI, formatErrorForDashboard } = require('../services/errorMessages');

// Store credit card information temporarily
const creditCardData = new Map();

// Webhook endpoint for NUCLEUS AI callbacks
router.post('/', asyncHandler(async (req, res) => {
  try {
    const { event, call, data, name, args } = req.body;
    
    // Log the full request body to see what we're receiving
    logger.info('Webhook received', { 
      event, 
      callId: call?.call_id,
      customFunction: name,
      args: args ? Object.keys(args) : null
    });
    
    // Store full webhook payload for all events (for complete call data)
    if (call?.call_id) {
      try {
        await db.updateWebhookData(call.call_id, req.body);
      } catch (dbError) {
        console.error('❌ Error storing webhook data:', dbError);
      }
    }

    // Process comprehensive Nucleus AI data
    if (call?.call_id && ['call_started', 'call_ended', 'call_analyzed'].includes(event)) {
      try {
        const processedData = nucleusDataProcessor.processWebhookEvent(req.body);
        if (processedData) {
          await dbComprehensive.storeComprehensiveCallData(processedData);
          logger.info(`✅ Stored comprehensive data for ${event} event`, { callId: call.call_id });
        }
      } catch (comprehensiveError) {
        logger.error('❌ Error storing comprehensive data:', comprehensiveError);
        // Don't fail the webhook if comprehensive storage fails
      }
    }
    
    // Handle custom function calls from Nucleus AI
    if (name === 'validate_card_type' && args) {
      console.log('💳 Custom function call: validate_card_type');
      console.log('Arguments:', args);
      
      const { cardType, cardNumber } = args;
      let isValid = false;
      let errorMessage = '';
      
      // Card validation rules
      if (cardType.toLowerCase() === 'visa' && cardNumber.startsWith('4')) {
        isValid = true;
      } else if (cardType.toLowerCase() === 'mastercard' && (cardNumber.startsWith('5') || cardNumber.startsWith('2'))) {
        isValid = true;
      } else if (cardType.toLowerCase() === 'amex' && (cardNumber.startsWith('34') || cardNumber.startsWith('37'))) {
        isValid = true;
      } else {
        errorMessage = `The card number doesn't match the ${cardType} type. Please verify both the card type and number.`;
      }
      
      return res.status(200).json({
        success: isValid,
        message: isValid ? 'Card type matches the number' : errorMessage
      });
    }
    
    if (name === 'end_call' && args) {
      console.log('📞 Custom function call: end_call');
      console.log('Arguments:', args);
      
      const { message } = args;
      
      return res.status(200).json({
        success: true,
        message: message || 'Thank you for calling Fongo. Have a great day!',
        end_call: true
      });
    }

    if (name === 'send_sms_link' && args) {
      console.log('📱 Custom function call: send_sms_link');
      console.log('Arguments:', args);
      
      const { phoneNumber } = args;
      const callId = call?.call_id || 'unknown';
      
      if (!phoneNumber) {
        console.log('SMS request missing phone number');
        return res.status(200).json({
          success: false,
          error: 'Phone number is required to send SMS'
        });
      }
      
      try {
        const smsResult = await sendAccountLoginLink(phoneNumber);
        console.log('SMS result:', smsResult);
        
        // Log SMS request to database
        try {
          await db.logSmsRequest(callId, call?.from_number || 'unknown', phoneNumber, smsResult);
        } catch (dbError) {
          console.error('❌ Database error logging SMS:', { callId, error: dbError.message });
        }
        
        if (smsResult.success) {
          return res.status(200).json({
            success: true,
            message: `I've texted you the link. After you update your credit card online our system will automatically attempt to charge your outstanding balance to your credit card overnight. Please wait 24 hours for your outstanding balance to be charged.`
          });
        } else {
          return res.status(200).json({
            success: false,
            error: 'Failed to send SMS. Please try again or contact support.'
          });
        }
      } catch (smsError) {
        console.error('SMS sending failed:', smsError.message);
        
        // Log failed SMS attempt
        try {
          await db.logSmsRequest(callId, call?.from_number || 'unknown', phoneNumber, {
            success: false,
            error: smsError.message
          });
        } catch (dbError) {
          console.error('❌ Database error logging SMS failure:', { callId, error: dbError.message });
        }
        
        return res.status(200).json({
          success: false,
          error: 'Failed to send SMS. Please try again or contact support.'
        });
      }
    }
    
    if (name === 'update_credit_card' && args) {
      console.log('💳 Custom function call: update_credit_card');
      console.log('Arguments:', args);
      
      // Extract caller ID from call object
      const callerId = call?.from_number || 'unknown';
      const callId = call?.call_id || 'unknown';
      
      // Prepare credit card data
      const cardData = {
        callerId: callerId,
        cardNumber: args.cardNumber,
        expiryMonth: args.expiryMonth,
        expiryYear: args.expiryYear
      };
      
      // Validate card type matches card number
      const cardType = args.cardType || 'unknown';
      const cardNumber = args.cardNumber;
      
      // Card validation rules
      let isValidCard = false;
      if (cardType.toLowerCase() === 'visa' && cardNumber.startsWith('4')) {
        isValidCard = true;
      } else if (cardType.toLowerCase() === 'mastercard' && (cardNumber.startsWith('5') || cardNumber.startsWith('2'))) {
        isValidCard = true;
      } else if (cardType.toLowerCase() === 'amex' && (cardNumber.startsWith('34') || cardNumber.startsWith('37'))) {
        isValidCard = true;
      }
      
      if (!isValidCard) {
        return res.status(200).json({
          success: false,
          error: `The card number doesn't match the ${cardType} type. Please verify both the card type and number.`
        });
      }
      
      // Call Fongo API
      try {
        const apiResponse = await callFongoAPI(cardData);
        console.log(`✅ Fongo API response:`, apiResponse);
        
        // Log to database with both technical and actionable error messages
        const rawError = apiResponse.success 
          ? null 
          : (apiResponse.data?.error || 'Failed to update credit card');
        const actionableError = rawError ? formatErrorForDashboard(rawError) : null;
        
        // Store both technical error (for billing) and actionable message (for display)
        // Format: "Technical Error | Actionable Message" for billing department clarity
        const errorMessageForDB = rawError 
          ? `${rawError} | ${actionableError}` 
          : null;
        
        await db.updateCallResult(callId, {
          cardType: cardType,
          cardNumber: args.cardNumber,
          expiryMonth: args.expiryMonth,
          expiryYear: args.expiryYear,
          cardholderName: null,
          updateSuccessful: apiResponse.success,
          errorMessage: errorMessageForDB, // Store both technical and actionable
          language: 'en' // TODO: detect language from call
        });
        
        if (apiResponse.success) {
          return res.status(200).json({ 
            success: true,
            message: 'Credit card updated successfully'
          });
        } else {
          // Format error message for AI agent to speak to caller
          const rawError = apiResponse.data?.error || 'Failed to update credit card';
          const actionableError = formatErrorForAI(rawError);
          
          return res.status(200).json({ 
            success: false,
            error: rawError, // Keep raw error for database
            actionableError: actionableError, // Clear message for AI to speak
            dashboardError: formatErrorForDashboard(rawError) // Clear message for dashboard
          });
        }
      } catch (apiError) {
        console.error('❌ Fongo API error:', apiError);
        
        // Log failed attempt to database with both technical and actionable error messages
        const rawError = apiError.message || apiError.toString();
        const actionableError = formatErrorForDashboard(rawError);
        
        // Store both technical error (for billing) and actionable message (for display)
        const errorMessageForDB = `${rawError} | ${actionableError}`;
        
        try {
          await db.updateCallResult(callId, {
            cardType: cardType,
            cardNumber: args.cardNumber,
            expiryMonth: args.expiryMonth,
            expiryYear: args.expiryYear,
            cardholderName: null,
            updateSuccessful: false,
            errorMessage: errorMessageForDB, // Store both technical and actionable
            language: 'en'
          });
        } catch (dbError) {
          console.error('❌ Database error:', dbError);
        }
        
        const actionableErrorForAI = formatErrorForAI(rawError);
        
        return res.status(200).json({ 
          success: false,
          error: rawError, // Keep raw error for logging
          actionableError: actionableErrorForAI, // Clear message for AI to speak
          dashboardError: actionableError // Clear message for dashboard
        });
      }
    }
    
    console.log(`📞 Webhook event: ${event} for call ${call?.call_id}`);
    
    switch (event) {
      case 'call_started':
        console.log(`Call started: ${call.call_id}`);
        console.log(`Caller ID: ${call.from_number}`);
        console.log(`Caller Name: ${call.from_name || 'Not provided'}`);
        console.log(`Full call data:`, JSON.stringify(call, null, 2));
        
        // Log call start to database
        try {
          await db.logCallStart(call.call_id, call.from_number, call.from_name);
        } catch (dbError) {
          console.error('❌ Database error logging call start:', dbError);
        }
        
        // Initialize credit card data storage
        creditCardData.set(call.call_id, {
          callerId: call.from_number,
          callerName: call.from_name,
          cardNumber: null,
          expiryMonth: null,
          expiryYear: null,
          cvv: null,
          nameOnCard: null
        });
        break;
        
      case 'call_ended':
        console.log(`Call ended: ${call.call_id}`);
        // Timestamps are in milliseconds, convert to seconds
        // Also try duration_ms field if available
        let duration;
        if (call.duration_ms) {
          duration = Math.floor(call.duration_ms / 1000);
        } else if (call.end_timestamp && call.start_timestamp) {
          duration = Math.floor((call.end_timestamp - call.start_timestamp) / 1000);
        } else {
          duration = 0;
        }
        console.log(`Duration: ${duration} seconds`);
        
        // Update call duration in database
        try {
          await db.updateCallDuration(call.call_id, duration);
        } catch (dbError) {
          console.error('❌ Database error updating call duration:', dbError);
        }
        
        // Clean up stored data
        creditCardData.delete(call.call_id);
        break;
        
      case 'call_analyzed':
        console.log(`Call analyzed: ${call?.call_id}`);
        
        const callId = call?.call_id || data?.call_id || req.body?.call_id;
        if (!callId) {
          console.log(`⚠️  No call_id found in call_analyzed event`);
          break;
        }
        
        // Nucleus AI sends transcript - check multiple possible locations
        // According to docs, transcript can be in call.transcript or call.call_analysis.transcript
        let transcript = call?.transcript 
          || call?.call_analysis?.transcript
          || call?.call_transcript 
          || data?.transcript 
          || data?.call_analysis?.transcript
          || req.body?.transcript;
        
        console.log(`Looking for transcript in call_analyzed event...`);
        console.log(`call.transcript exists: ${!!call?.transcript}`);
        console.log(`call.call_analysis exists: ${!!call?.call_analysis}`);
        
        // If transcript not in webhook, fetch from Nucleus API as fallback
        if (!transcript && process.env.RETELL_API_KEY) {
          console.log(`📡 Transcript not in webhook, fetching from Nucleus API...`);
          try {
            const apiResponse = await axios.get(`https://api.retellai.com/get-call/${callId}`, {
              headers: {
                'Authorization': `Bearer ${process.env.RETELL_API_KEY}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (apiResponse.data?.transcript) {
              transcript = apiResponse.data.transcript;
              console.log(`✅ Fetched transcript from API (${transcript.length} characters)`);
            } else if (apiResponse.data?.call_analysis?.transcript) {
              transcript = apiResponse.data.call_analysis.transcript;
              console.log(`✅ Fetched transcript from API call_analysis (${transcript.length} characters)`);
            } else {
              console.log(`⚠️  Transcript not found in API response either`);
              console.log(`API response keys:`, Object.keys(apiResponse.data || {}));
            }
          } catch (apiError) {
            console.error('❌ Error fetching transcript from API:', apiError.message);
          }
        }
        
        console.log(`Transcript found: ${transcript ? 'Yes' : 'No'}`);
        if (transcript) {
          console.log(`Transcript preview (first 100 chars): ${transcript.substring(0, 100)}`);
          console.log(`Transcript length: ${transcript.length}`);
        }
        
        // Store transcript in database
        if (transcript) {
          try {
            const result = await db.updateCallTranscript(callId, transcript);
            console.log(`✅ Transcript stored for call ${callId} (${transcript.length} characters)`);
          } catch (dbError) {
            console.error('❌ Database error storing transcript:', dbError);
            console.error('Error details:', dbError.message, dbError.stack);
          }
        } else {
          console.log(`⚠️  No transcript found in webhook or API`);
          console.log(`Full webhook body keys:`, Object.keys(req.body || {}));
          if (call) console.log(`Call object keys:`, Object.keys(call));
          if (data) console.log(`Data object keys:`, Object.keys(data));
        }
        break;
        
      case 'credit_card_collected':
        // Handle credit card information from Grace
        console.log(`Credit card data received for call ${call.call_id}:`, data);
        
        if (creditCardData.has(call.call_id)) {
          const cardData = creditCardData.get(call.call_id);
          cardData.cardNumber = data.cardNumber;
          cardData.expiryMonth = data.expiryMonth;
          cardData.expiryYear = data.expiryYear;
          cardData.cvv = data.cvv;
          cardData.nameOnCard = data.nameOnCard;
          
          // Call Fongo API
          try {
            const apiResponse = await callFongoAPI(cardData);
            console.log(`Fongo API response:`, apiResponse);
            
            // Store the API response for Grace to retrieve
            cardData.apiResponse = apiResponse;
            
            // Send success response back to Grace
            res.status(200).json({ 
              success: true, 
              apiResponse: apiResponse,
              message: 'Credit card processed successfully'
            });
          } catch (apiError) {
            console.error('Fongo API error:', apiError);
            
            // Store the error for Grace to retrieve
            cardData.apiError = apiError.message;
            
            // Send error response back to Grace
            res.status(200).json({ 
              success: false, 
              error: apiError.message,
              message: 'Failed to process credit card'
            });
          }
        } else {
          console.error(`No credit card data found for call ${call.call_id}`);
          res.status(400).json({ error: 'No credit card data found for this call' });
        }
        break;
        
      default:
        console.log(`Unknown event: ${event}`);
        break;
    }
    
    // Send response if not already sent (credit_card_collected sends its own response)
    if (event !== 'credit_card_collected') {
      res.status(200).json({ success: true });
    }
  } catch (error) {
    console.error('Webhook error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  }
}));

// Function to call Fongo API with SOAP authentication
async function callFongoAPI(cardData) {
  try {
    const { callerId, cardNumber, expiryMonth, expiryYear } = cardData;
    
    // Format phone number (ensure 11 digits, digits only)
    const phone = callerId.replace(/\D/g, ''); // Remove non-digits
    const formattedPhone = phone.length === 10 ? `1${phone}` : phone;
    
    // Format expiry month (ensure 2 digits, digits only)
    const formattedMonth = expiryMonth.toString().padStart(2, '0');
    
    // Format expiry year (ensure 4 digits, digits only)
    const formattedYear = expiryYear.toString();
    
    // Validate all parameters are digits only (as per API source code)
    if (!/^\d+$/.test(formattedPhone)) {
      throw new Error('Invalid phone number - must be digits only');
    }
    // Card number can be 15 digits (Amex) or 16 digits (Visa/MasterCard)
    if (!/^\d+$/.test(cardNumber)) {
      throw new Error('Invalid credit card number - must be digits only');
    }
    if (cardNumber.length !== 15 && cardNumber.length !== 16) {
      throw new Error('Invalid credit card number - must be 15 or 16 digits');
    }
    if (!/^\d+$/.test(formattedMonth)) {
      throw new Error('Invalid month - must be digits only');
    }
    if (!/^\d+$/.test(formattedYear)) {
      throw new Error('Invalid year - must be digits only');
    }
    
    const apiUrl = `https://secure.freephoneline.ca/mobile/updatecc.pl?phone=${formattedPhone}&payinfo=${cardNumber}&month=${formattedMonth}&year=${formattedYear}`;
    
    console.log(`Calling Fongo API: ${apiUrl}`);
    console.log(`Using SOAP credentials: secure / 8o:zc4n$y(Zw`);
    
    const response = await axios.get(apiUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Fongo-CreditCard-Agent/1.0',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    // Parse response - Fongo API returns JavaScript object notation, not JSON
    let responseData;
    try {
      if (typeof response.data === 'string') {
        // Try to parse as JSON first
        try {
          responseData = JSON.parse(response.data);
        } catch (jsonError) {
          // If JSON parse fails, try to extract error message from string
          // Fongo API returns: { success:0 , error:"FAULT: Invalid credit card number..." }
          // Extract the actual error message
          const errorMatch = response.data.match(/error\s*:\s*"([^"]+)"/);
          const successMatch = response.data.match(/success\s*:\s*(\d+)/);
          
          if (errorMatch || successMatch) {
            responseData = {
              success: successMatch ? parseInt(successMatch[1]) : 0,
              error: errorMatch ? errorMatch[1] : 'Unknown error'
            };
          } else {
            // Try to convert JS object notation to JSON
            // Replace { success:1 } with {"success":1}
            const fixedJson = response.data
              .replace(/\{\s*success\s*:\s*(\d+)\s*\}/g, '{"success":$1}')
              .replace(/\{\s*success\s*:\s*(\d+)\s*,\s*error\s*:\s*"([^"]*)"\s*\}/g, '{"success":$1,"error":"$2"}');
            responseData = JSON.parse(fixedJson);
          }
        }
      } else {
        responseData = response.data;
      }
      
      // Extract and clean up error messages
      if (responseData.error) {
        // Remove "FAULT:" prefix if present
        responseData.error = responseData.error.replace(/^FAULT:\s*/i, '').trim();
        
        // Remove file paths and line numbers (e.g., "at /home/ploeppky/__soap/lib/CustomerNumber.pm line 116.")
        responseData.error = responseData.error.replace(/\s+at\s+[^\s]+\.pm\s+line\s+\d+\.?/gi, '').trim();
        
        // Extract specific error codes and messages
        const errorCodeMatch = responseData.error.match(/\(error code (\w+)\)/i);
        if (errorCodeMatch) {
          const errorCode = errorCodeMatch[1].toLowerCase();
          
          // Extract the main error message (before the error code)
          const mainMessage = responseData.error.split('(')[0].trim();
          
          // Map common error codes to user-friendly messages
          const errorMessages = {
            'invalid_card': mainMessage || 'Invalid credit card number',
            'invalid_card_number': mainMessage || 'Invalid credit card number',
            'customer_not_found': mainMessage || 'Customer account not found',
            'invalid_expiry': mainMessage || 'Invalid expiry date',
            'card_expired': mainMessage || 'Credit card has expired',
            'card_declined': mainMessage || 'Credit card was declined',
            'invalid_month': mainMessage || 'Invalid expiry month',
            'invalid_year': mainMessage || 'Invalid expiry year'
          };
          
          // Use mapped message if available, otherwise use the main message (cleaned)
          if (errorMessages[errorCode]) {
            responseData.error = errorMessages[errorCode];
          } else {
            // Use the main message (before error code and file path)
            responseData.error = mainMessage || responseData.error.split('(')[0].trim();
          }
        } else {
          // No error code, just clean up the message
          responseData.error = responseData.error.trim();
        }
      }
    } catch (parseError) {
      console.error('Failed to parse API response:', response.data);
      console.error('Parse error details:', parseError.message);
      
      // Try to extract error message even if parsing fails
      const errorMatch = String(response.data).match(/error[:\s]*"([^"]+)"/i) || 
                         String(response.data).match(/FAULT:\s*([^"]+)/i) ||
                         String(response.data).match(/error[:\s]*([^,}]+)/i);
      
      let extractedError;
      if (errorMatch && errorMatch[1]) {
        extractedError = errorMatch[1].trim();
        // Clean up common error message patterns
        extractedError = extractedError.replace(/^FAULT:\s*/i, '').trim();
      } else {
        // If we can't extract a specific error, provide a more helpful message
        extractedError = 'There was an issue processing your payment. Please verify your credit card information and try again, or contact support for assistance.';
      }
      
      responseData = { success: 0, error: extractedError };
    }
    
    console.log('Parsed Fongo API response:', responseData);
    
    return {
      success: responseData.success === 1,
      data: responseData,
      status: response.status
    };
    
  } catch (error) {
    console.error('Fongo API call failed:', error.message);
    
    if (error.response) {
      // Try to parse error response
      let errorData;
      try {
        errorData = typeof error.response.data === 'string' ? JSON.parse(error.response.data) : error.response.data;
      } catch (parseError) {
        errorData = { success: 0, error: error.response.data };
      }
      
      return {
        success: false,
        error: errorData.error || error.response.data,
        status: error.response.status
      };
    } else {
      return {
        success: false,
        error: error.message,
        status: 'NETWORK_ERROR'
      };
    }
  }
}

// Test endpoint to check Fongo API access
router.get('/test-api', async (req, res) => {
  try {
    console.log('Testing Fongo API access...');
    
    const testData = {
      callerId: '12263365800',
      cardNumber: '4532015112830366',
      expiryMonth: '12',
      expiryYear: '2027'
    };
    
    const result = await callFongoAPI(testData);
    
    res.status(200).json({
      success: true,
      message: 'API test completed',
      result: result
    });
    
  } catch (error) {
    console.error('API test failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test endpoint to identify Vercel's outbound IP
router.get('/test-outbound-ip', async (req, res) => {
  try {
    console.log('Testing outbound IP...');
    
    // Make a request to an IP echo service to see what IP Vercel uses
    const ipResponse = await axios.get('https://api.ipify.org?format=json', {
      timeout: 5000
    });
    
    console.log('Outbound IP detected:', ipResponse.data.ip);
    
    res.status(200).json({
      success: true,
      message: 'Outbound IP detected',
      outboundIP: ipResponse.data.ip,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('IP detection failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

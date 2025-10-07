const express = require('express');
const axios = require('axios');
const router = express.Router();

// Store credit card information temporarily
const creditCardData = new Map();

// Webhook endpoint for NUCLEUS AI callbacks
router.post('/', async (req, res) => {
  try {
    const { event, call, data } = req.body;
    
    console.log(`📞 Webhook received: ${event} for call ${call?.call_id}`);
    
    switch (event) {
      case 'call_started':
        console.log(`Call started: ${call.call_id}`);
        console.log(`Caller ID: ${call.from_number}`);
        console.log(`Caller Name: ${call.from_name || 'Not provided'}`);
        console.log(`Full call data:`, JSON.stringify(call, null, 2));
        
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
        console.log(`Duration: ${call.end_timestamp - call.start_timestamp} seconds`);
        
        // Clean up stored data
        creditCardData.delete(call.call_id);
        break;
        
      case 'call_analyzed':
        console.log(`Call analyzed: ${call.call_id}`);
        console.log(`Transcript: ${call.transcript}`);
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
        res.status(200).json({ success: true });
    }
    
    if (event !== 'credit_card_collected') {
      res.status(200).json({ success: true });
    }
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

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
    if (!/^\d+$/.test(cardNumber)) {
      throw new Error('Invalid credit card number - must be digits only');
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
    
    // Parse JSON response
    let responseData;
    try {
      responseData = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
    } catch (parseError) {
      console.error('Failed to parse API response:', response.data);
      responseData = { success: 0, error: 'Invalid API response format' };
    }
    
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

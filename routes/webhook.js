const express = require('express');
const axios = require('axios');
const router = express.Router();

// Store credit card information temporarily
const creditCardData = new Map();

// Webhook endpoint for Retell AI callbacks
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
            
            // Send response back to Grace
            res.status(200).json({ 
              success: true, 
              apiResponse: apiResponse,
              message: 'Credit card processed successfully'
            });
          } catch (apiError) {
            console.error('Fongo API error:', apiError);
            res.status(200).json({ 
              success: false, 
              error: apiError.message,
              message: 'Failed to process credit card'
            });
          }
        } else {
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

// Function to call Fongo API
async function callFongoAPI(cardData) {
  try {
    const { callerId, cardNumber, expiryMonth, expiryYear } = cardData;
    
    // Format phone number (ensure 11 digits)
    const phone = callerId.replace(/\D/g, ''); // Remove non-digits
    const formattedPhone = phone.length === 10 ? `1${phone}` : phone;
    
    // Format expiry month (ensure 2 digits)
    const formattedMonth = expiryMonth.toString().padStart(2, '0');
    
    // Format expiry year (ensure 4 digits)
    const formattedYear = expiryYear.toString();
    
    const apiUrl = `https://secure.freephoneline.ca/mobile/updatecc.pl?phone=${formattedPhone}&payinfo=${cardNumber}&month=${formattedMonth}&year=${formattedYear}`;
    
    console.log(`Calling Fongo API: ${apiUrl}`);
    
    const response = await axios.get(apiUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Fongo-CreditCard-Agent/1.0'
      }
    });
    
    return {
      success: true,
      data: response.data,
      status: response.status
    };
    
  } catch (error) {
    console.error('Fongo API call failed:', error.message);
    
    if (error.response) {
      return {
        success: false,
        error: error.response.data,
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

module.exports = router;

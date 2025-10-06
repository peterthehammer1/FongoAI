const axios = require('axios');

module.exports = async (req, res) => {
  try {
    console.log('📞 Webhook received:', req.body);
    
    const { event, call, data } = req.body;

    if (event === 'call_started') {
      console.log(`Call started: ${call.call_id}`);
      console.log(`Caller ID: ${call.from_number}`);
      
      return res.status(200).json({ 
        success: true, 
        message: 'Call started successfully' 
      });
    }

    if (event === 'credit_card_collected') {
      console.log(`Credit card data received for call ${call.call_id}:`, data);
      
      // Test the Fongo API
      try {
        const apiUrl = `https://secure.freephoneline.ca/mobile/updatecc.pl?phone=15195551234&payinfo=5524000000000000&month=09&year=2026`;
        
        console.log(`Testing Fongo API: ${apiUrl}`);
        
        const response = await axios.get(apiUrl, {
          timeout: 10000,
          headers: {
            'User-Agent': 'Fongo-CreditCard-Agent/1.0'
          }
        });

        console.log('Fongo API response:', response.data);

        return res.status(200).json({
          success: true,
          apiResponse: response.data,
          message: 'Credit card processed successfully'
        });
      } catch (apiError) {
        console.error('Fongo API error:', apiError.message);
        
        return res.status(200).json({
          success: false,
          error: apiError.message,
          message: 'Failed to process credit card'
        });
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};
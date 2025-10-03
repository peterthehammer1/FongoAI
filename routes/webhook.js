const express = require('express');
const router = express.Router();

// Webhook endpoint for Retell AI callbacks
router.post('/', async (req, res) => {
  try {
    const { event, call } = req.body;
    
    console.log(`📞 Webhook received: ${event} for call ${call?.call_id}`);
    
    switch (event) {
      case 'call_started':
        console.log(`Call started: ${call.call_id}`);
        console.log(`Caller ID: ${call.from_number}`);
        break;
        
      case 'call_ended':
        console.log(`Call ended: ${call.call_id}`);
        console.log(`Duration: ${call.end_timestamp - call.start_timestamp} seconds`);
        break;
        
      case 'call_analyzed':
        console.log(`Call analyzed: ${call.call_id}`);
        console.log(`Transcript: ${call.transcript}`);
        break;
        
      default:
        console.log(`Unknown event: ${event}`);
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const db = require('../services/database');
const dbComprehensive = require('../services/databaseComprehensive');

// Get all calls with pagination
router.get('/calls', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    
    const calls = await db.getAllCalls(limit, offset);
    res.json({ success: true, calls });
  } catch (error) {
    console.error('Error fetching calls:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get call summary statistics
router.get('/summary', async (req, res) => {
  try {
    const summary = await db.getCallSummary();
    res.json({ success: true, summary });
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Search calls
router.get('/search', async (req, res) => {
  try {
    const searchTerm = req.query.q || '';
    if (!searchTerm) {
      return res.status(400).json({ success: false, error: 'Search term required' });
    }
    
    const calls = await db.searchCalls(searchTerm);
    res.json({ success: true, calls });
  } catch (error) {
    console.error('Error searching calls:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get analytics data
router.get('/analytics', async (req, res) => {
  try {
    const analytics = await db.getAnalytics();
    res.json({ success: true, ...analytics });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get SMS logs with pagination
router.get('/sms-logs', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    
    const smsLogs = await db.getAllSmsLogs(limit, offset);
    res.json({ success: true, smsLogs });
  } catch (error) {
    console.error('Error fetching SMS logs:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get SMS analytics
router.get('/sms-analytics', async (req, res) => {
  try {
    const smsAnalytics = await db.getSmsAnalytics();
    res.json({ success: true, ...smsAnalytics });
  } catch (error) {
    console.error('Error fetching SMS analytics:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Error analysis function
function analyzeError(errorMessage) {
  if (!errorMessage) {
    return {
      category: 'Unknown',
      description: 'No error message was recorded for this failed call.',
      possibleCauses: [
        'Call was terminated before completion',
        'Network connectivity issue',
        'System timeout'
      ],
      solutions: [
        'Check if the call completed normally',
        'Review call transcript for customer feedback',
        'Verify network connection to Fongo API',
        'Check server logs for additional details'
      ]
    };
  }

  const errorLower = errorMessage.toLowerCase();

  // Customer Not Found
  if (errorLower.includes('customer not found') || errorLower.includes('customer not in system')) {
    return {
      category: 'Account Not Found',
      description: 'The phone number used to call is not associated with a Fongo account in the system.',
      possibleCauses: [
        'Customer called from a different phone number than their Fongo Home Phone',
        'Phone number is not properly registered in Fongo system',
        'Account may have been deactivated or suspended',
        'Phone number formatting issue (missing country code, etc.)'
      ],
      solutions: [
        'Verify customer is calling from their registered Fongo Home Phone number',
        'Have customer check their account details to confirm phone number',
        'Manually verify phone number in Fongo admin system',
        'Consider sending SMS link for online account access instead',
        'Ask customer to call back from their Fongo Home Phone number'
      ]
    };
  }

  // Invalid Credit Card Number
  if (errorLower.includes('invalid credit card') || errorLower.includes('invalid card number') || errorLower.includes('card number')) {
    return {
      category: 'Invalid Card Details',
      description: 'The credit card number provided did not pass validation.',
      possibleCauses: [
        'Card number was entered incorrectly',
        'Card number does not match card type (Visa/MC/Amex)',
        'Card number is not in correct format',
        'Card has been cancelled or expired'
      ],
      solutions: [
        'Verify card number was read back correctly by agent',
        'Confirm card type matches the card number (Visa starts with 4, MC with 5/2, Amex with 34/37)',
        'Ask customer to double-check card number',
        'Ensure card is active and not expired',
        'Request customer use a different payment card'
      ]
    };
  }

  // FAULT errors
  if (errorLower.includes('fault:') || errorLower.startsWith('fault')) {
    return {
      category: 'System Error',
      description: 'Fongo API returned a system error (FAULT).',
      possibleCauses: [
        'Temporary system issue with Fongo payment processing',
        'Database connection problem on Fongo side',
        'API endpoint may be experiencing issues',
        'Request format may not match current API expectations'
      ],
      solutions: [
        'Retry the call after a few minutes',
        'Check Fongo API status page or system health',
        'Review recent API changes or updates',
        'Contact Fongo technical support for API issues',
        'Check server logs for detailed error information'
      ]
    };
  }

  // Payment method conflicts
  if (errorLower.includes('cannot update card when') || errorLower.includes('payment type')) {
    return {
      category: 'Payment Method Conflict',
      description: 'Unable to update card due to existing payment method configuration.',
      possibleCauses: [
        'Account has different payment type (e.g., ACH, bank transfer)',
        'Account has no existing card to replace',
        'Account information missing (name, etc.)',
        'Payment method change restrictions in place'
      ],
      solutions: [
        'Manually review account in Fongo admin system',
        'Clear or update existing payment method first',
        'Complete missing account information',
        'Process payment update through Fongo admin portal instead',
        'Contact Fongo support for account-specific resolution'
      ]
    };
  }

  // Network errors
  if (errorLower.includes('network') || errorLower.includes('timeout') || errorLower.includes('connection')) {
    return {
      category: 'Network Issue',
      description: 'Connection problem when contacting Fongo API.',
      possibleCauses: [
        'Internet connectivity issue',
        'Fongo API server is down or unreachable',
        'Firewall or proxy blocking connection',
        'Request timeout'
      ],
      solutions: [
        'Check server internet connection',
        'Verify Fongo API endpoint is accessible',
        'Review firewall rules and network configuration',
        'Check API endpoint URL is correct',
        'Review server logs for network error details',
        'Contact hosting provider if connection issues persist'
      ]
    };
  }

  // Generic/Unknown
  return {
    category: 'Other Error',
    description: errorMessage,
    possibleCauses: [
      'Unexpected API response',
      'Data validation failure',
      'System configuration issue',
      'Unknown error from Fongo API'
    ],
    solutions: [
      'Review full error message in database',
      'Check call transcript for additional context',
      'Review server logs for detailed error information',
      'Contact technical support with call ID and error details',
      'Verify recent system or API changes'
    ]
  };
}

// Get call details by ID
router.get('/call/:callId', async (req, res) => {
  try {
    const { callId } = req.params;
    
    // Get from main database
    const call = await db.getCallById(callId);
    
    if (!call) {
      return res.status(404).json({ success: false, error: 'Call not found' });
    }
    
    // Try to get comprehensive data
    try {
      const comprehensiveCall = await dbComprehensive.getComprehensiveCallData(callId);
      if (comprehensiveCall) {
        // Merge comprehensive data into call object
        Object.assign(call, {
          // Core Call Data
          call_type: comprehensiveCall.call_type || call.call_type,
          call_status: comprehensiveCall.call_status || call.call_status,
          from_number: comprehensiveCall.from_number || call.caller_number,
          to_number: comprehensiveCall.to_number,
          direction: comprehensiveCall.direction,
          agent_id: comprehensiveCall.agent_id,
          agent_name: comprehensiveCall.agent_name || call.agent_name,
          agent_version: comprehensiveCall.agent_version,
          start_timestamp: comprehensiveCall.start_timestamp,
          end_timestamp: comprehensiveCall.end_timestamp,
          duration_ms: comprehensiveCall.duration_ms,
          call_duration: comprehensiveCall.duration_ms ? Math.floor(comprehensiveCall.duration_ms / 1000) : call.call_duration,
          disconnection_reason: comprehensiveCall.disconnection_reason,
          
          // Transcript & Recording Data
          transcript_object: comprehensiveCall.transcript_object,
          transcript_with_tool_calls: comprehensiveCall.transcript_with_tool_calls,
          scrubbed_transcript_with_tool_calls: comprehensiveCall.scrubbed_transcript_with_tool_calls,
          recording_url: comprehensiveCall.recording_url,
          recording_multi_channel_url: comprehensiveCall.recording_multi_channel_url,
          scrubbed_recording_url: comprehensiveCall.scrubbed_recording_url,
          scrubbed_recording_multi_channel_url: comprehensiveCall.scrubbed_recording_multi_channel_url,
          
          // Analysis & Insights
          call_analysis: comprehensiveCall.call_analysis,
          call_summary: comprehensiveCall.call_summary,
          user_sentiment: comprehensiveCall.user_sentiment,
          call_successful: comprehensiveCall.call_successful,
          in_voicemail: comprehensiveCall.in_voicemail,
          custom_analysis_data: comprehensiveCall.custom_analysis_data,
          
          // Use comprehensive transcript if available
          transcript: comprehensiveCall.transcript || call.transcript
        });
      }
    } catch (compError) {
      // If comprehensive database doesn't exist or has an error, just use main database data
      console.log('Comprehensive data not available:', compError.message);
    }
    
    res.json({ success: true, call });
  } catch (error) {
    console.error('Error fetching call details:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get failed calls report with error analysis
router.get('/failed-calls-report', async (req, res) => {
  try {
    const failedCalls = await db.getFailedCalls();
    
    // Analyze each failed call
    const report = failedCalls.map(call => {
      const analysis = analyzeError(call.error_message);
      return {
        ...call,
        errorAnalysis: analysis
      };
    });
    
    // Group by error category
    const byCategory = {};
    report.forEach(item => {
      const category = item.errorAnalysis.category;
      if (!byCategory[category]) {
        byCategory[category] = [];
      }
      byCategory[category].push(item);
    });
    
    res.json({ 
      success: true, 
      totalFailed: failedCalls.length,
      byCategory,
      detailedReport: report
    });
  } catch (error) {
    console.error('Error fetching failed calls report:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===== COMPREHENSIVE RETELL AI DATA ENDPOINTS =====

// Get comprehensive call data by ID
router.get('/comprehensive-call/:callId', async (req, res) => {
  try {
    const { callId } = req.params;
    const call = await dbComprehensive.getComprehensiveCallData(callId);
    
    if (!call) {
      return res.status(404).json({ success: false, error: 'Call not found' });
    }
    
    res.json({ success: true, call });
  } catch (error) {
    console.error('Error fetching comprehensive call data:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all comprehensive calls
router.get('/comprehensive-calls', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const calls = await dbComprehensive.getAllComprehensiveCalls({ limit });
    
    res.json({ success: true, calls });
  } catch (error) {
    console.error('Error fetching comprehensive calls:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get comprehensive analytics
router.get('/comprehensive-analytics', async (req, res) => {
  try {
    const analytics = await dbComprehensive.getComprehensiveAnalytics();
    res.json({ success: true, analytics });
  } catch (error) {
    console.error('Error fetching comprehensive analytics:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Search comprehensive calls with filters
router.get('/comprehensive-search', async (req, res) => {
  try {
    const filters = {
      fromNumber: req.query.fromNumber,
      callStatus: req.query.callStatus,
      callSuccessful: req.query.callSuccessful ? req.query.callSuccessful === 'true' : undefined,
      updateSuccessful: req.query.updateSuccessful ? req.query.updateSuccessful === 'true' : undefined,
      userSentiment: req.query.userSentiment,
      dateFrom: req.query.dateFrom,
      dateTo: req.query.dateTo,
      limit: parseInt(req.query.limit) || 50
    };

    const calls = await dbComprehensive.searchComprehensiveCalls(filters);
    res.json({ success: true, calls, filters });
  } catch (error) {
    console.error('Error searching comprehensive calls:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get failed calls with comprehensive analysis
router.get('/comprehensive-failed-calls', async (req, res) => {
  try {
    const failedCalls = await dbComprehensive.getFailedCallsAnalysis();
    res.json({ success: true, failedCalls });
  } catch (error) {
    console.error('Error fetching comprehensive failed calls:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;


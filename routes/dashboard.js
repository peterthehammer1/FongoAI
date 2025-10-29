const express = require('express');
const router = express.Router();
const db = require('../services/database');

// Get all calls with pagination
router.get('/api/calls', async (req, res) => {
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
router.get('/api/summary', async (req, res) => {
  try {
    const summary = await db.getCallSummary();
    res.json({ success: true, summary });
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Search calls
router.get('/api/search', async (req, res) => {
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
router.get('/api/analytics', async (req, res) => {
  try {
    const analytics = await db.getAnalytics();
    res.json({ success: true, ...analytics });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get SMS logs with pagination
router.get('/api/sms-logs', async (req, res) => {
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
router.get('/api/sms-analytics', async (req, res) => {
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

// Get failed calls report with error analysis
router.get('/api/failed-calls-report', async (req, res) => {
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

module.exports = router;


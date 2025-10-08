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

module.exports = router;


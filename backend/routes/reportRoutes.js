const express = require('express');
const router = express.Router();
const { getAllReports, addDummyData } = require('../controllers/reportController');

// Get all reports (completed meetings)
router.get('/', getAllReports);

// Add dummy data (development only)
router.post('/dummy', addDummyData);

module.exports = router; 
const express = require('express');
const router = express.Router();
const {
    submitVote,
    getPointVotes,
    startVotingSession,
    endVotingSession,
    getMeetingVotes
} = require('../controllers/votingController');

// Import the auth middleware (assuming it exists from meetingRoutes)
const { verifyToken } = require('../controllers/meetingController');

// Submit or update a vote for a meeting point
router.post('/submit', verifyToken, submitVote);

// Get vote summary for a specific point
router.get('/point/:pointId', verifyToken, getPointVotes);

// Start voting session for a point (admin only)
router.post('/start-session', verifyToken, startVotingSession);

// End voting session for a point (admin only)
router.post('/end-session', verifyToken, endVotingSession);

// Get all votes for a meeting (admin/members only)
router.get('/meeting/:meetingId', verifyToken, getMeetingVotes);

module.exports = router;
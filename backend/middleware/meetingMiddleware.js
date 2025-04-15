// middleware/meetingMiddleware.js
const pool = require('../config/db');

const isMeetingCreator = async(req, res, next) => {
    try {
        const meetingId = req.params.meeting_id;
        const userId = req.user.id;

        const [meeting] = await pool.query(
            'SELECT created_by FROM created_meetings WHERE id = ?', [meetingId]
        );
    
        if (meeting.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Meeting not found'
            });
        }

        if (meeting[0].created_by !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Only the meeting creator can perform this action'
            });
        }
    
        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = { isMeetingCreator };
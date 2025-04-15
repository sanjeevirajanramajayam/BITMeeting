const pool = require('../config/db');

// Middleware to check if user is an admin
const isAdmin = async(req, res, next) => {
    try {
        const [user] = await pool.query(
            'SELECT role FROM users WHERE id = ?', [req.user.id]
        );

        if (!user.length || user[0].role !== 'admin') {
            return res.status(403).json({
                message: 'Access denied. Admin privileges required.'
            });
        }

        next();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Middleware to check if user is the creator of the resource
const isCreator = async(req, res, next) => {
    try {
        const [meeting] = await pool.query(
            'SELECT created_by FROM created_meetings WHERE id = ?', [req.params.id]
        );

        if (!meeting.length || meeting[0].created_by !== req.user.id) {
            return res.status(403).json({
                message: 'Access denied. Creator privileges required.'
            });
        }

        next();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    isAdmin,
    isCreator
};
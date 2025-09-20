const db = require('../config/db');

// Submit or update a vote for a meeting point
const submitVote = async (req, res) => {
    const { pointId, voteType } = req.body;
    const userId = req.user.userId;

    // Validate input
    if (!pointId || !voteType) {
        return res.status(400).json({
            success: false,
            message: 'Point ID and vote type are required'
        });
    }

    if (!['for', 'against', 'abstain'].includes(voteType)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid vote type. Must be "for", "against", or "abstain"'
        });
    }

    try {
        // Check if the point exists and get meeting info
        const [pointInfo] = await db.query(
            `SELECT mp.id, mp.meeting_id, m.meeting_status 
             FROM meeting_points mp 
             JOIN meeting m ON mp.meeting_id = m.id 
             WHERE mp.id = ?`,
            [pointId]
        );

        if (pointInfo.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Meeting point not found'
            });
        }

        const meetingId = pointInfo[0].meeting_id;
        const meetingStatus = pointInfo[0].meeting_status;

        // Check if user is a member of this meeting
        const [memberCheck] = await db.query(
            `SELECT id FROM meeting_members WHERE meeting_id = ? AND user_id = ?`,
            [meetingId, userId]
        );

        if (memberCheck.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to vote on this meeting point'
            });
        }

        // Check if voting is allowed (meeting should be in progress)
        if (meetingStatus !== 'in_progress') {
            return res.status(400).json({
                success: false,
                message: 'Voting is only allowed during active meetings'
            });
        }

        // Check if there's an active voting session for this point
        const [votingSession] = await db.query(
            `SELECT id, is_active FROM point_voting_sessions 
             WHERE point_id = ? AND is_active = TRUE`,
            [pointId]
        );

        if (votingSession.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Voting is not currently active for this point'
            });
        }

        // Insert or update the vote
        await db.query(
            `INSERT INTO point_votes (point_id, user_id, vote_type) 
             VALUES (?, ?, ?) 
             ON DUPLICATE KEY UPDATE 
             vote_type = VALUES(vote_type), 
             updated_at = CURRENT_TIMESTAMP`,
            [pointId, userId, voteType]
        );

        // Get updated vote summary
        const [voteSummary] = await db.query(
            `SELECT * FROM point_vote_summary WHERE point_id = ?`,
            [pointId]
        );

        res.status(200).json({
            success: true,
            message: 'Vote submitted successfully',
            data: {
                pointId,
                userVote: voteType,
                summary: voteSummary[0] || {
                    point_id: pointId,
                    votes_for: 0,
                    votes_against: 0,
                    votes_abstain: 0,
                    total_votes: 0
                }
            }
        });

    } catch (error) {
        console.error('Error submitting vote:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while submitting vote'
        });
    }
};

// Get vote summary for a specific point
const getPointVotes = async (req, res) => {
    const { pointId } = req.params;
    const userId = req.user.userId;

    try {
        // Check if the point exists and user has access
        const [pointInfo] = await db.query(
            `SELECT mp.id, mp.meeting_id, mp.point_name
             FROM meeting_points mp 
             WHERE mp.id = ?`,
            [pointId]
        );

        if (pointInfo.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Meeting point not found'
            });
        }

        const meetingId = pointInfo[0].meeting_id;

        // Check if user is a member of this meeting
        const [memberCheck] = await db.query(
            `SELECT id FROM meeting_members WHERE meeting_id = ? AND user_id = ?`,
            [meetingId, userId]
        );

        if (memberCheck.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to view votes for this meeting point'
            });
        }

        // Get vote summary
        const [voteSummary] = await db.query(
            `SELECT * FROM point_vote_summary WHERE point_id = ?`,
            [pointId]
        );

        // Get user's current vote
        const [userVote] = await db.query(
            `SELECT vote_type FROM point_votes WHERE point_id = ? AND user_id = ?`,
            [pointId, userId]
        );

        // Check if voting is currently active
        const [votingSession] = await db.query(
            `SELECT is_active FROM point_voting_sessions 
             WHERE point_id = ? AND is_active = TRUE`,
            [pointId]
        );

        const summary = voteSummary[0] || {
            point_id: parseInt(pointId),
            votes_for: 0,
            votes_against: 0,
            votes_abstain: 0,
            total_votes: 0,
            voters_for: null,
            voters_against: null,
            voters_abstain: null
        };

        res.status(200).json({
            success: true,
            data: {
                pointId: parseInt(pointId),
                pointName: pointInfo[0].point_name,
                summary,
                userVote: userVote[0]?.vote_type || null,
                votingActive: votingSession.length > 0
            }
        });

    } catch (error) {
        console.error('Error getting point votes:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while retrieving votes'
        });
    }
};

// Start voting session for a point (admin only)
const startVotingSession = async (req, res) => {
    const { pointId } = req.body;
    const userId = req.user.userId;

    try {
        // Get point and meeting info
        const [pointInfo] = await db.query(
            `SELECT mp.id, mp.meeting_id, m.created_by, m.meeting_status
             FROM meeting_points mp 
             JOIN meeting m ON mp.meeting_id = m.id 
             WHERE mp.id = ?`,
            [pointId]
        );

        if (pointInfo.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Meeting point not found'
            });
        }

        const meetingId = pointInfo[0].meeting_id;
        const createdBy = pointInfo[0].created_by;
        const meetingStatus = pointInfo[0].meeting_status;

        // Check if user is the meeting creator/organizer
        if (createdBy !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Only meeting organizers can start voting sessions'
            });
        }

        // Check if meeting is in progress
        if (meetingStatus !== 'in_progress') {
            return res.status(400).json({
                success: false,
                message: 'Voting sessions can only be started during active meetings'
            });
        }

        // End any existing active voting sessions for this point
        await db.query(
            `UPDATE point_voting_sessions 
             SET is_active = FALSE, ended_at = CURRENT_TIMESTAMP 
             WHERE point_id = ? AND is_active = TRUE`,
            [pointId]
        );

        // Start new voting session
        await db.query(
            `INSERT INTO point_voting_sessions (point_id, meeting_id, is_active, started_by, started_at) 
             VALUES (?, ?, TRUE, ?, CURRENT_TIMESTAMP)`,
            [pointId, meetingId, userId]
        );

        res.status(200).json({
            success: true,
            message: 'Voting session started successfully',
            data: {
                pointId,
                votingActive: true
            }
        });

    } catch (error) {
        console.error('Error starting voting session:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while starting voting session'
        });
    }
};

// End voting session for a point (admin only)
const endVotingSession = async (req, res) => {
    const { pointId } = req.body;
    const userId = req.user.userId;

    try {
        // Get point and meeting info
        const [pointInfo] = await db.query(
            `SELECT mp.id, mp.meeting_id, m.created_by
             FROM meeting_points mp 
             JOIN meeting m ON mp.meeting_id = m.id 
             WHERE mp.id = ?`,
            [pointId]
        );

        if (pointInfo.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Meeting point not found'
            });
        }

        const createdBy = pointInfo[0].created_by;

        // Check if user is the meeting creator/organizer
        if (createdBy !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Only meeting organizers can end voting sessions'
            });
        }

        // End voting session
        const [result] = await db.query(
            `UPDATE point_voting_sessions 
             SET is_active = FALSE, ended_at = CURRENT_TIMESTAMP 
             WHERE point_id = ? AND is_active = TRUE`,
            [pointId]
        );

        if (result.affectedRows === 0) {
            return res.status(400).json({
                success: false,
                message: 'No active voting session found for this point'
            });
        }

        // Get final vote summary
        const [voteSummary] = await db.query(
            `SELECT * FROM point_vote_summary WHERE point_id = ?`,
            [pointId]
        );

        res.status(200).json({
            success: true,
            message: 'Voting session ended successfully',
            data: {
                pointId,
                votingActive: false,
                finalSummary: voteSummary[0] || {
                    point_id: pointId,
                    votes_for: 0,
                    votes_against: 0,
                    votes_abstain: 0,
                    total_votes: 0
                }
            }
        });

    } catch (error) {
        console.error('Error ending voting session:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while ending voting session'
        });
    }
};

// Get all votes for a meeting (admin only)
const getMeetingVotes = async (req, res) => {
    const { meetingId } = req.params;
    const userId = req.user.userId;

    try {
        // Check if user has access to this meeting
        const [memberCheck] = await db.query(
            `SELECT id FROM meeting_members WHERE meeting_id = ? AND user_id = ?
             UNION
             SELECT id FROM meeting WHERE id = ? AND created_by = ?`,
            [meetingId, userId, meetingId, userId]
        );

        if (memberCheck.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to view votes for this meeting'
            });
        }

        // Get all points with their vote summaries
        const [pointsWithVotes] = await db.query(
            `SELECT 
                mp.id as point_id,
                mp.point_name,
                pvs.votes_for,
                pvs.votes_against,
                pvs.votes_abstain,
                pvs.total_votes,
                pvs.voters_for,
                pvs.voters_against,
                pvs.voters_abstain,
                CASE 
                    WHEN pvs_active.is_active IS TRUE THEN TRUE 
                    ELSE FALSE 
                END as voting_active
             FROM meeting_points mp
             LEFT JOIN point_vote_summary pvs ON mp.id = pvs.point_id
             LEFT JOIN point_voting_sessions pvs_active ON mp.id = pvs_active.point_id AND pvs_active.is_active = TRUE
             WHERE mp.meeting_id = ?
             ORDER BY mp.id`,
            [meetingId]
        );

        res.status(200).json({
            success: true,
            data: {
                meetingId: parseInt(meetingId),
                points: pointsWithVotes.map(point => ({
                    pointId: point.point_id,
                    pointName: point.point_name,
                    votingActive: Boolean(point.voting_active), // Ensure boolean
                    summary: {
                        votes_for: point.votes_for || 0,
                        votes_against: point.votes_against || 0,
                        votes_abstain: point.votes_abstain || 0,
                        total_votes: point.total_votes || 0,
                        voters_for: point.voters_for,
                        voters_against: point.voters_against,
                        voters_abstain: point.voters_abstain
                    }
                }))
            }
        });

    } catch (error) {
        console.error('Error getting meeting votes:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while retrieving meeting votes'
        });
    }
};

module.exports = {
    submitVote,
    getPointVotes,
    startVotingSession,
    endVotingSession,
    getMeetingVotes
};
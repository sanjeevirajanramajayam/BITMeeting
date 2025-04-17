const db = require('../config/db');
const {
    format
} = require("date-fns");
const jwt = require('jsonwebtoken');

function groupMembersByRole(data) {
    const grouped = {};

    data.forEach(({
        role,
        member_id
    }) => {
        if (!grouped[role]) {
            grouped[role] = [];
        }
        grouped[role].push(member_id);
    });

    return Object.keys(grouped).map(role => ({
        role: role,
        members: grouped[role]
    }));
}

const insertForwardedPoints = async (meetingId, templateId) => {
    try {
        const [futurePoints] = await db.query(
            `SELECT point_id FROM meeting_point_future WHERE template_id = ?`,
            [templateId]
        );

        if (futurePoints.length > 0) {
            await db.query(
                `INSERT INTO meeting_points (meeting_id, point_name, point_responsibility, point_deadline, todo, remarks)
                SELECT ?, point_name, point_responsibility, point_deadline, todo, remarks 
                FROM meeting_points WHERE id IN (?)`,
                [meetingId, futurePoints.map(p => p.point_id)]
            );

            await db.query(
                `DELETE FROM meeting_point_future WHERE template_id = ?`,
                [templateId]
            );

            console.log(`Forwarded ${futurePoints.length} points to meeting ${meetingId}.`);
        }
    } catch (error) {
        console.error("Error inserting forwarded points:", error);
    }
};

const createMeeting = async (req, res) => {
    var {
        templateId,
        meeting_name,
        meeting_description,
        start_time,
        end_time,
        venue_id,
        priority,
        roles,
        points,
        repeat_type,
        custom_days
    } = req.body;

    var created_by = req.user.userId;

    try {
        if (!templateId || !created_by || !start_time || !end_time) {
            return res.status(400).json({
                success: false,
                message: 'templateId, start_time, and end_time are required'
            });
        }

        const [templateRows] = await db.query(
            'SELECT * FROM templates WHERE id = ?',
            [templateId]
        );

        if (templateRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Template not found'
            });
        }

        const template = templateRows[0];

        const meetingData = {
            meeting_name: meeting_name || template.name,
            meeting_description: meeting_description || template.description,
            start_time: start_time,
            end_time: end_time,
            venue_id: venue_id || template.venue_id,
            priority: priority || template.priority_type,
            created_by: created_by,
            repeat_type: repeat_type || 'daily', // Default to 'daily'
            custom_days: custom_days || null,
            next_schedule: start_time // Initially set next_schedule to start_time
        };

        const [meetingResult] = await db.query(
            `INSERT INTO meeting 
            (template_id, meeting_name, meeting_description, priority, venue_id, start_time, end_time, created_by, repeat_type, custom_days, next_schedule) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                templateId,
                meetingData.meeting_name,
                meetingData.meeting_description,
                meetingData.priority,
                meetingData.venue_id,
                meetingData.start_time,
                meetingData.end_time,
                meetingData.created_by,
                meetingData.repeat_type,
                meetingData.custom_days,
                meetingData.next_schedule
            ]
        );

        const meetingId = meetingResult.insertId;

        if (!roles) {
            const [templateRoles] = await db.query(
                `SELECT role, member_id FROM template_members WHERE template_id = ?`,
                [templateId]
            );
            roles = groupMembersByRole(templateRoles);
        }

        insertForwardedPoints(meetingId, templateId);

        if (!points) {
            const [meetingPoints] = await db.query(
                `SELECT * FROM template_points WHERE template_id = ?`,
                [templateId]
            );
            points = meetingPoints;
        }

        const pointPromises = points.map(point =>
            db.query(
                'INSERT INTO meeting_points (meeting_id, point_name, point_deadline) VALUES (?, ?, ?)',
                [meetingId, point.point_name || point.point, point.point_deadline || null]
            )
        );


        const memberIds = [...new Set(roles.flatMap(role => role.members))];

        if (memberIds.length > 0) {
            const [existingUsers] = await db.query(
                'SELECT id FROM users WHERE id IN (?)', [memberIds]
            );
            const existingUserIds = new Set(existingUsers.map(user => user.id));

            const missingUsers = memberIds.filter(id => !existingUserIds.has(id));

            if (missingUsers.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Users with IDs [${missingUsers.join(', ')}] do not exist`
                });
            }

            const rolePromises = roles.flatMap(({
                    role,
                    members
                }) =>
                members.map(memberId =>
                    db.query('INSERT INTO meeting_members (meeting_id, role, user_id) VALUES (?, ?, ?)', [meetingId, role, memberId])
                )
            );

            await Promise.all(rolePromises);
        }

        await Promise.all([...pointPromises]);

        res.status(201).json({
            success: true,
            message: 'Meeting created successfully',
            meetingId: meetingResult.insertId
        });

    } catch (error) {
        console.error('Error creating meeting:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const getUserMeetingResponse = async (req, res) => {
    const {
        meetingId
    } = req.body;
    const userId = req.user.userId;

    console.log(meetingId, userId);

    if (!meetingId) {
        return res.status(400).json({
            error: 'meetingId is required'
        });
    }

    try {
        const query = `
            SELECT accepted_status 
            FROM accepted_members 
            WHERE meeting_id = ? AND user_id = ?
        `;

        const [rows] = await db.execute(query, [meetingId, userId]);

        if (rows.length === 0) {
            return res.status(200).json({
                error: 'No response found for the given meeting and user'
            });
        }

        return res.status(200).json({
            accepted_status: rows[0].accepted_status
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: 'An error occurred while fetching the response'
        });
    }
};

const updateMeeting = async (req, res) => {
    const {
        meetingId,
        meeting_name,
        meeting_description,
        start_time,
        end_time,
        venue_id,
        priority,
        roles,
        points,
        repeat_type,
        custom_days
    } = req.body;

    try {
        if (!meetingId) {
            return res.status(400).json({
                success: false,
                message: 'meetingId is required'
            });
        }

        // Check if the meeting exists
        const [existingMeetings] = await db.query(
            'SELECT * FROM meeting WHERE id = ?',
            [meetingId]
        );

        if (existingMeetings.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Meeting not found'
            });
        }

        // Determine next_schedule
        let next_schedule = existingMeetings[0].next_schedule;
        if (start_time || repeat_type) {
            next_schedule = start_time || existingMeetings[0].start_time;
        }

        // Update meeting details
        await db.query(
            `UPDATE meeting 
             SET meeting_name = COALESCE(?, meeting_name),
                 meeting_description = COALESCE(?, meeting_description),
                 start_time = COALESCE(?, start_time),
                 end_time = COALESCE(?, end_time),
                 venue_id = COALESCE(?, venue_id),
                 priority = COALESCE(?, priority),
                 repeat_type = COALESCE(?, repeat_type),
                 custom_days = COALESCE(?, custom_days),
                 next_schedule = COALESCE(?, next_schedule)
             WHERE id = ?`,
            [
                meeting_name,
                meeting_description,
                start_time,
                end_time,
                venue_id,
                priority,
                repeat_type,
                custom_days,
                next_schedule,
                meetingId
            ]
        );

        // If roles are provided, update them
        if (roles) {
            await db.query('DELETE FROM meeting_members WHERE meeting_id = ?', [meetingId]);

            const memberIds = [...new Set(roles.flatMap(role => role.members))];

            if (memberIds.length > 0) {
                const [existingUsers] = await db.query(
                    'SELECT id FROM users WHERE id IN (?)', [memberIds]
                );

                const existingUserIds = new Set(existingUsers.map(user => user.id));
                const missingUsers = memberIds.filter(id => !existingUserIds.has(id));

                if (missingUsers.length > 0) {
                    return res.status(400).json({
                        success: false,
                        message: `Users with IDs [${missingUsers.join(', ')}] do not exist`
                    });
                }

                const rolePromises = roles.flatMap(({
                        role,
                        members
                    }) =>
                    members.map(memberId =>
                        db.query('INSERT INTO meeting_members (meeting_id, role, user_id) VALUES (?, ?, ?)', [meetingId, role, memberId])
                    )
                );

                await Promise.all(rolePromises);
            }
        }

        // If points are provided, update them
        if (points) {
            await db.query('DELETE FROM meeting_points WHERE meeting_id = ?', [meetingId]);

            const pointPromises = points.map(point =>
                db.query('INSERT INTO meeting_points (meeting_id, point_name) VALUES (?, ?)', [meetingId, point.point])
            );

            await Promise.all(pointPromises);
        }

        res.status(200).json({
            success: true,
            message: 'Meeting updated successfully'
        });

    } catch (error) {
        console.error('Error updating meeting:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const getMeetingbyId = async (req, res) => {
    const {
        id
    } = req.params;

    var accessUserId = req.user.userId;

    // Get created_by user from meeting table
    var [
        [createdUserId]
    ] = await db.query(
        `SELECT created_by FROM meeting WHERE id = ?`,
        [id]
    );

    // Authorization check
    if (createdUserId.created_by !== accessUserId) {
        return res.status(403).json({
            success: false,
            message: `Authorization is required`
        });
    }

    try {
        // Fetch template with venue, category, and creator details
        var [meeting] = await db.query(`
            SELECT 
                meeting.id,
                meeting.meeting_name,
                meeting.meeting_description,
                meeting.priority,
                meeting.start_time,
                meeting.end_time,
                venues.name AS venue_name,
                users.name AS created_by
            FROM meeting
            JOIN venues ON meeting.venue_id = venues.id
            JOIN users ON meeting.created_by = users.id
            WHERE meeting.id = ?
        `, [id]);

        if (meeting.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Meeting not found'
            });
        }

        meeting = meeting[0];

        // Fetch points for the template
        const [points] = await db.query(`
            SELECT 
                meeting_points.id,
                meeting_points.point_name,
                meeting_points.point_responsibility,
                meeting_points.todo,
                meeting_points.remarks,
                meeting_points.approved_by_admin
            FROM meeting_points
            WHERE meeting_points.meeting_id = ?
        `, [id]);

        // Fetch roles and members using a JOIN
        const [roles] = await db.query(`
            SELECT 
             mm.role,
                u.id AS user_id,
                u.name AS user_name,
                mm.id AS m_user_id
            FROM meeting_members mm
            JOIN users u ON mm.user_id = u.id
            WHERE mm.meeting_id = ?
        `, [id]);

        // Group roles properly
        const rolesMap = {};
        roles.forEach(({
            role,
            user_id,
            user_name,
            m_user_id
        }) => {
            if (!rolesMap[role]) rolesMap[role] = [];
            rolesMap[role].push({
                id: user_id,
                name: user_name,
                user_id,
                member_user_id: m_user_id
            });
        });

        // Map roles into structured format
        const formattedRoles = Object.entries(rolesMap).map(([role, members]) => ({
            role,
            members
        }));

        // Map template with associated points and roles
        const meetingWithDetails = {
            ...meeting,
            points: points,
            roles: formattedRoles
        };

        res.status(200).json(meetingWithDetails);
    } catch (error) {
        console.error('Error fetching meeting:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const assignResponsibility = async (req, res) => {
    const {
        pointId,
        userId
    } = req.body;

    if (!pointId || !userId) {
        return res.status(400).json({
            success: false,
            message: `${!pointId ? 'pointId' : 'userId'} is required`
        });
    }

    try {
        // Get the meeting_id of the point
        const [pointResult] = await db.query(
            'SELECT meeting_id FROM meeting_points WHERE id = ?',
            [pointId]
        );

        if (pointResult.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No meeting point found with the given pointId'
            });
        }

        const meetingId = pointResult[0].meeting_id;

        // Check if userId is part of the meeting
        const [memberResult] = await db.query(
            'SELECT id FROM meeting_members WHERE meeting_id = ? AND user_id = ?',
            [meetingId, userId]
        );

        if (memberResult.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User is not part of the meeting associated with this point'
            });
        }

        // Update responsibility
        const [updateResult] = await db.query(
            'UPDATE meeting_points SET point_responsibility = ? WHERE id = ?',
            [userId, pointId]
        );

        if (updateResult.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'No meeting point found with the given pointId'
            });
        }

        return res.status(200).json({
            success: true,
            message: "Responsibility assigned successfully"
        });

    } catch (error) {
        console.error('Error assigning responsibility:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const getUserResponsibilities = async (req, res) => {
    const {
        meetingId
    } = req.body;

    var userId = req.user.userId

    if (!meetingId || !userId) {
        return res.status(400).json({
            success: false,
            message: `${!meetingId ? 'Meeting ID' : 'User ID'} is required`
        });
    }

    // var memberIds = await db.query(
    //     `SELECT 
    //         mm.id 
    //     FROM meeting_members mm
    //     WHERE mm.meeting_id = ? AND mm.user_id = ?`,
    //     [meetingId, userId]
    // );

    // if (memberIds[0].length === 0) {
    //     return res.status(404).json({
    //         success: false,
    //         message: "No user found in the meeting"
    //     });
    // }


    // var memberId = memberIds[0][0].id

    try {
        const [responsibilities] = await db.query(
            `SELECT 
                mp.id AS pointId, 
                mp.point_name,
                mp.todo,
                mp.remarks,
                mp.point_status,
                u.name
            FROM meeting_points mp JOIN users u ON 
            mp.point_responsibility = u.id
            WHERE mp.meeting_id = ? AND mp.point_responsibility = ?`,
            [meetingId, userId]
        );

        if (responsibilities.length === 0) {
            return res.status(200).json({
                success: false,
                message: "No responsibilities found for this user in the meeting"
            });
        }

        return res.status(200).json({
            success: true,
            data: responsibilities
        });

    } catch (error) {
        console.error('Error fetching user responsibilities:', error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const setTodoForPoint = async (req, res) => {
    const {
        pointId,
        todo,
        status,
        remarks
    } = req.body;
    const user_id = req.user.userId; // Logged-in user's ID

    if (!pointId || !status) {
        return res.status(400).json({
            success: false,
            message: `${!pointId ? 'pointId' : 'status'} is required`
        });
    }

    if (status === 'completed' && !todo) {
        return res.status(400).json({
            success: false,
            message: `todo is required`
        });
    }

    if (status === 'not completed' && !remarks) {
        return res.status(400).json({
            success: false,
            message: `remarks is required`
        });
    }

    try {
        // Fetch point_responsibility from meeting_points
        const [pointRows] = await db.query(
            'SELECT point_responsibility FROM meeting_points WHERE id = ?;',
            [pointId]
        );



        // Only allow responsible user to update 'todo'
        if (status === 'completed' && user_id !== pointRows[0].point_responsibility) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to update the todo for this point'
            });
        }

        let updateQuery, queryParams;

        if (status === 'completed') {
            updateQuery = `
                UPDATE meeting_points 
                SET todo = ?, point_status = ?, approved_by_admin = null
                WHERE id = ?;
            `;
            queryParams = [todo, status, pointId];
        } else {
            updateQuery = `
                UPDATE meeting_points 
                SET remarks = ?, point_status = ?, approved_by_admin = null
                WHERE id = ?;
            `;
            queryParams = [remarks, status, pointId];
        }

        const [result] = await db.query(updateQuery, queryParams);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'No meeting point found with the given pointId'
            });
        }

        return res.status(200).json({
            success: true,
            message: `${status === 'completed' ? 'todo' : 'remark'} assigned successfully`
        });

    } catch (error) {
        console.error('Error assigning Todo or Remark:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const getPoints = async (req, res) => {
    const {
        meetingId
    } = req.params;

    try {
        // Fetch discussion points related to the meeting
        const points = await db.query(
            'SELECT id, point_name FROM meeting_points WHERE meeting_id = ?',
            [meetingId]
        );

        res.status(200).json({
            points: points[0] || [] // MySQL with mysql2 returns [rows, fields]
        });
    } catch (error) {
        console.error('Error fetching points:', error);
        res.status(500).json({
            message: 'Failed to fetch points for the meeting.'
        });
    }
};

const respondToMeetingInvite = async (req, res) => {
    const {
        meetingId,
        status
    } = req.body;
    const userId = req.user.userId;

    if (!meetingId || !['accept', 'reject'].includes(status)) {
        return res.status(400).json({
            success: false,
            message: 'Valid meetingId and status ("accept" or "reject") are required'
        });
    }

    try {
        // Check if the meeting exists
        const [meetingRows] = await db.query('SELECT id FROM meeting WHERE id = ?', [meetingId]);
        if (meetingRows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Meeting not found'
            });
        }

        // Insert or update response
        const [result] = await db.query(`
            INSERT INTO accepted_members (user_id, meeting_id, accepted_status)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE accepted_status = VALUES(accepted_status)
        `, [userId, meetingId, status]);

        return res.status(200).json({
            success: true,
            message: `Meeting ${status} successfully`
        });
    } catch (error) {
        console.error('Error responding to meeting:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const markAttendance = async (req, res) => {
    const {
        meetingId,
        userId,
        status
    } = req.body;

    var accessUserId = req.user.userId;

    if (!meetingId || !userId || !status || !accessUserId) {
        return res.status(400).json({
            success: false,
            message: `${!meetingId ? 'meetingId' : !userId ? 'userId' : !status ? 'status' : 'accessUserId'} is required`
        });
    }

    try {
        // Check if meeting exists
        const [meetingExists] = await db.query(
            `SELECT created_by FROM meeting WHERE id = ?`,
            [meetingId]
        );

        if (meetingExists.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Meeting ${meetingId} does not exist`
            });
        }

        const createdUserId = meetingExists[0].created_by;

        if (createdUserId !== accessUserId) {
            return res.status(403).json({
                success: false,
                message: `Authorization is required`
            });
        }

        // Check if the user is a member of the meeting
        const [memberCheck] = await db.query(
            `SELECT role FROM meeting_members WHERE meeting_id = ? AND user_id = ?`,
            [meetingId, userId]
        );

        if (memberCheck.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User is not a member of this meeting"
            });
        }

        const role = memberCheck[0].role;

        // Get user's name
        const [userDetails] = await db.query(
            `SELECT name FROM users WHERE id = ?`,
            [userId]
        );

        if (userDetails.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const name = userDetails[0].name;

        if (status === 'present') {
            // Check if attendance is already marked
            const [attendanceCheck] = await db.query(
                `SELECT id FROM meeting_attendence WHERE meeting_id = ? AND user_id = ?`,
                [meetingId, userId]
            );

            if (attendanceCheck.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: "Attendance already marked for this user"
                });
            }

            await db.query(
                `INSERT INTO meeting_attendence (meeting_id, user_id, role, user_name) VALUES (?, ?, ?, ?)`,
                [meetingId, userId, role, name]
            );

            return res.status(200).json({
                success: true,
                message: "Attendance marked as present"
            });

        } else if (status === 'absent') {
            const [deleteResult] = await db.query(
                `DELETE FROM meeting_attendence WHERE meeting_id = ? AND user_id = ?`,
                [meetingId, userId]
            );

            if (deleteResult.affectedRows === 0) {
                return res.status(400).json({
                    success: false,
                    message: "User was not marked as present"
                });
            }

            return res.status(200).json({
                success: true,
                message: "Attendance marked as absent"
            });

        } else {
            return res.status(400).json({
                success: false,
                message: "Invalid status. Use 'present' or 'absent'"
            });
        }

    } catch (error) {
        console.error("Error updating attendance:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const forwardMeetingPoint = async (req, res) => {
    var {
        pointId,
        templateId,
        forwardType,
        forwardDecision,
    } = req.body;

    var accessUserId = req.user.userId

    if (!pointId || !forwardType || !forwardDecision || !accessUserId) {
        return res.status(400).json({
            success: false,
            message: 'pointId, forwardType, forwardDecision, and accessUserId are required'
        });
    }

    try {
        // Check if the point exists
        const [pointExists] = await db.query(
            `SELECT meeting_id FROM meeting_points WHERE id = ?`,
            [pointId]
        );

        if (pointExists.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Point ${pointId} does not exist`
            });
        }

        const meetingId = pointExists[0].meeting_id;

        if (!templateId) {
            const [templateRow] = await db.query(
                `SELECT template_id FROM meeting WHERE id = ?`,
                [meetingId]
            );

            if (templateRow.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: `Meeting ${meetingId} not found`
                });
            }

            templateId = templateRow[0].template_id;
        }

        // Get the creator of the meeting
        const [createdUserRow] = await db.query(
            `SELECT created_by FROM meeting WHERE id = ?`,
            [meetingId]
        );

        if (createdUserRow.length === 0) {
            return res.status(404).json({
                success: false,
                message: `Meeting ${meetingId} not found`
            });
        }

        const createdUserId = createdUserRow[0].created_by;

        if (createdUserId !== accessUserId) {
            return res.status(403).json({
                success: false,
                message: `Authorization is required`
            });
        }

        const [existingRows] = await db.query(
            `SELECT * FROM meeting_point_future WHERE point_id = ? AND template_id = ?`,
            [pointId, templateId]
        );

        if (existingRows.length > 0) {
            return res.status(409).json({
                success: false,
                message: `Point ${pointId} is already marked for forwarding in future meetings of template ${templateId}.`
            });
        }

        await db.query(
            `INSERT INTO meeting_point_future (point_id, template_id, forward_type, carry_over, forward_decision)
             VALUES (?, ?, ?, ?, ?)`,
            [pointId, templateId, forwardType, 1, forwardDecision]
        );

        res.status(201).json({
            success: true,
            message: `Point ${pointId} marked for forwarding in future meetings of template ${templateId}.`
        });

    } catch (error) {
        console.error("Error forwarding meeting point:", error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const getUserMeetings = async (req, res) => {
    const id = req.user.userId;

    try {
        // 1. Get meetings where user is a member
        const [memberMeetings] = await db.query(
            `SELECT meeting_id, role FROM meeting_members WHERE user_id = ?;`,
            [id]
        );

        // 2. Get meetings where user is the creator
        const [creatorMeetings] = await db.query(
            `SELECT id FROM meeting WHERE created_by = ?;`,
            [id]
        );

        // 3. Get rejected meeting IDs by the user
        const [rejectedMeetings] = await db.query(
            `SELECT meeting_id FROM meeting_rejections WHERE user_id = ?;`,
            [id]
        );

        // Create a Set of rejected meeting IDs for fast lookup
        const rejectedMeetingIds = new Set(rejectedMeetings.map(r => r.meeting_id));

        // Combine meeting IDs from both queries into a map with roles
        const meetingIdRoleMap = new Map();

        // Add member meetings with their roles (excluding rejected)
        memberMeetings.forEach(({
            meeting_id,
            role
        }) => {
            if (!rejectedMeetingIds.has(meeting_id)) {
                meetingIdRoleMap.set(meeting_id, role);
            }
        });

        // Add creator meetings with default 'Admin' role (excluding rejected)
        creatorMeetings.forEach(({
            id: meeting_id
        }) => {
            if (!rejectedMeetingIds.has(meeting_id) && !meetingIdRoleMap.has(meeting_id)) {
                meetingIdRoleMap.set(meeting_id, 'Admin');
            }
        });

        const meetingIds = [...meetingIdRoleMap.keys()];

        if (meetingIds.length === 0) {
            return res.status(200).json({
                success: true,
                meetings: []
            });
        }

        const placeholders = meetingIds.map(() => '?').join(',');

        // 3. Fetch full meeting details with creator's username
        const [meetingDetails] = await db.query(
            `SELECT m.*, u.name AS created_by_username, v.name as venue_name
             FROM meeting m
             JOIN users u JOIN venues v ON m.created_by = u.id AND
             m.venue_id = v.id
             WHERE m.id IN (${placeholders})`,
            meetingIds
        );

        // 4. Fetch all members of these meetings
        const [meetingMembers] = await db.query(
            `SELECT mm.meeting_id, mm.user_id, mm.role, u.name
             FROM meeting_members mm
             JOIN users u ON mm.user_id = u.id
             WHERE mm.meeting_id IN (${placeholders})`,
            meetingIds
        );

        // 5. Fetch meeting points
        const [meetingPoints] = await db.query(
            `SELECT mp.*, u.name             FROM bit_meeting_test.meeting_points mp
             LEFT JOIN bit_meeting_test.users u ON mp.point_responsibility = u.id
             WHERE meeting_id IN (${placeholders})`,
            meetingIds
        );

        // 6. Group members by meeting_id and group them under each role as a list
        const membersByMeeting = [];

        meetingMembers.forEach(member => {
            if (!membersByMeeting[member.meeting_id]) {
                membersByMeeting[member.meeting_id] = {};
            }

            const roleGroup = membersByMeeting[member.meeting_id];

            if (!roleGroup[member.role]) {
                roleGroup[member.role] = [];
            }

            roleGroup[member.role].push({
                user_id: member.user_id,
                name: member.name
            });
        });

        // Convert role groups into a list: [{ role, members }]
        const formattedMembersByMeeting = {};

        Object.entries(membersByMeeting).forEach(([meetingId, roleMap]) => {
            formattedMembersByMeeting[meetingId] = Object.entries(roleMap).map(
                ([role, members]) => ({
                    role,
                    members
                })
            );
        });


        // 7. Group meeting points by meeting_id
        const pointsByMeeting = {};
        meetingPoints.forEach(point => {
            if (!pointsByMeeting[point.meeting_id]) {
                pointsByMeeting[point.meeting_id] = [];
            }
            pointsByMeeting[point.meeting_id].push({
                point_id: point.id,
                point_name: point.point_name,
                todo: point.todo,
                point_status: point.point_status,
                responsible: point.name,
                responsibleId: point.point_responsibility,
                point_deadline: point.point_deadline,
                point_id: point.id,
                approved_by_admin: point.approved_by_admin,
                old_todo: point.old_todo
            });
        });
        // 8. Add role info, members, and points to each meeting
        const finalMeetings = meetingDetails.map(meeting => ({
            ...meeting,
            created_by: meeting.created_by_username,
            created_by_id: meeting.created_by,
            role: meetingIdRoleMap.get(meeting.id),
            members: membersByMeeting[meeting.id] || [],
            points: pointsByMeeting[meeting.id] || []
        }));

        // Return the response
        res.status(200).json({
            success: true,
            meetings: finalMeetings
        });

    } catch (error) {
        console.error("Error fetching meetings:", error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const rejectMeeting = async (req, res) => {
    const {
        meetingId,
        reason
    } = req.body;
    const userId = req.user.userId
    if (!meetingId || !userId) {
        return res.status(400).json({
            success: false,
            message: 'meetingId and userId are required'
        });
    }

    try {
        // Check if user is in the meeting
        const [existingMember] = await db.query(
            `SELECT * FROM meeting_members WHERE meeting_id = ? AND user_id = ?`,
            [meetingId, userId]
        );

        if (existingMember.length === 0) {
            return res.status(404).json({
                success: false,
                message: `User ${userId} is not a member of meeting ${meetingId}`
            });
        }

        // Check if the user already rejected the meeting
        const [existingRejection] = await db.query(
            `SELECT * FROM meeting_rejections WHERE meeting_id = ? AND user_id = ?`,
            [meetingId, userId]
        );

        if (existingRejection.length > 0) {
            return res.status(409).json({
                success: false,
                message: `User ${userId} has already rejected meeting ${meetingId}`
            });
        }

        // Insert rejection record
        await db.query(
            `INSERT INTO meeting_rejections (meeting_id, user_id, reason) VALUES (?, ?, ?)`,
            [meetingId, userId, reason || null]
        );

        res.status(200).json({
            success: true,
            message: `User ${userId} has rejected meeting ${meetingId}`
        });

    } catch (error) {
        console.error("Error rejecting meeting:", error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const getUserRejectionsById = async (req, res) => {
    const meetingId = req.params.id;

    if (!meetingId) {
        return res.status(400).json({
            success: false,
            message: 'meetingId are required'
        });
    }

    try {

        // Check if the user already rejected the meeting
        const [RejectionRecords] = await db.query(
            `SELECT * FROM meeting_rejections WHERE meeting_id = ?`,
            [meetingId]
        );

        if (RejectionRecords.length == 0) {
            return res.status(200).json({
                success: false,
                message: `No Rejection Records.`
            });
        }


        res.status(200).json({
            success: true,
            data: RejectionRecords
        });

    } catch (error) {
        console.error("Error getting rejection records:", error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
}

const getAttendanceRecords = async (req, res) => {
    const meetingId = req.params.id;

    if (!meetingId) {
        return res.status(400).json({
            success: false,
            message: 'meetingId are required'
        });
    }

    try {

        // Check if the user already rejected the meeting
        const [AttendanceRecords] = await db.query(
            `SELECT u.name, ma.user_name
            FROM bit_meeting_test.meeting_members AS mm
            LEFT JOIN bit_meeting_test.meeting_attendence AS ma 
                ON ma.user_id = mm.user_id 
                AND ma.meeting_id = mm.meeting_id
            JOIN bit_meeting_test.users AS u 
                ON u.id = mm.user_id
            WHERE mm.meeting_id = ?;
            `,
            [meetingId]
        );

        if (AttendanceRecords.length == 0) {
            return res.status(200).json({
                success: false,
                message: `No Rejection Records.`
            });
        }

        const TransformedAttendanceRecords = AttendanceRecords.map(user => ({
            name: user.name,
            attendance_status: user.user_name ? 'present' : 'absent'
        }));


        res.status(200).json({
            success: true,
            data: TransformedAttendanceRecords
        });

    } catch (error) {
        console.error("Error getting rejection records:", error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
}

const approvePoint = async (req, res) => {
    const {
        pointId,
        approvedDecision,
    } = req.body;

    const accessUserId = req.user.userId;

    if (!pointId || !approvedDecision || !accessUserId) {
        return res.status(400).json({
            success: false,
            message: 'pointId, approvedDecision and accessUserId are required'
        });
    }

    try {
        const [
            [meetingId]
        ] = await db.query(
            `SELECT meeting_id FROM meeting_points WHERE id = ?`,
            [pointId]
        );

        const [
            [createdUserId]
        ] = await db.query(
            `SELECT created_by FROM meeting WHERE id = ?`,
            [meetingId.meeting_id]
        );

        if (createdUserId.created_by !== accessUserId) {
            return res.status(403).json({
                success: false,
                message: `Authorization is required`
            });
        }

        if (approvedDecision === "NOT APPROVED") {
            await db.query(
                `UPDATE meeting_points 
                 SET approved_by_admin = ?, 
                     old_todo = todo, 
                     todo = NULL, 
                     point_status = NULL 
                 WHERE meeting_id = ? AND id = ?`,
                [approvedDecision, meetingId.meeting_id, pointId]
            );
        } else {
            await db.query(
                `UPDATE meeting_points 
                 SET approved_by_admin = ? 
                 WHERE meeting_id = ? AND id = ?`,
                [approvedDecision, meetingId.meeting_id, pointId]
            );
        }

        return res.status(200).json({
            success: true,
            message: `Point ${pointId} marked ${approvedDecision}.`
        });

    } catch (error) {
        console.error("Error approving point:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const addAdminRemarks = async (req, res) => {
    const {
        pointId,
        adminRemarks
    } = req.body;

    var accessUserId = req.user.userId;

    if (!pointId || !adminRemarks || !accessUserId) {
        return res.status(400).json({
            success: false,
            message: 'pointId, adminRemarks, and accessUserId are required'
        });
    }

    try {
        // Get meeting_id from meeting_points
        var [
            [meetingId]
        ] = await db.query(
            `SELECT meeting_id FROM meeting_points WHERE id = ?`,
            [pointId]
        );

        // Get created_by user from meeting table
        var [
            [createdUserId]
        ] = await db.query(
            `SELECT created_by FROM meeting WHERE id = ?`,
            [meetingId.meeting_id]
        );
    } catch (error) {
        console.error("Error fetching meeting details:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }

    // Authorization check
    if (createdUserId.created_by !== accessUserId) {
        return res.status(403).json({
            success: false,
            message: `Authorization is required`
        });
    }

    try {
        // Update only remarks_by_admin
        await db.query(
            `UPDATE meeting_points 
             SET remarks_by_admin = ? 
             WHERE id = ?;`,
            [adminRemarks, pointId]
        );

        res.status(200).json({
            success: true,
            message: `Admin remarks updated for point ${pointId}.`
        });
    } catch (error) {
        console.error("Error updating admin remarks:", error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const getMeetingAgenda = async (req, res) => {
    const {
        id
    } = req.params;

    var accessUserId = req.user.userId;

    if (!accessUserId || !id) {
        return res.status(400).json({
            success: false,
            message: 'accessUserId and meeting_id are required'
        });
    }

    try {
        // Verify user access
        const [meetingCheck] = await db.query(
            `SELECT m.id, m.created_by, m.meeting_name
             FROM meeting m
             LEFT JOIN meeting_members mm ON m.id = mm.meeting_id
             WHERE m.id = ? AND (m.created_by = ? OR mm.user_id = ?)
             LIMIT 1`,
            [id, accessUserId, accessUserId]
        );

        if (meetingCheck.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'User does not have access to this meeting'
            });
        }

        // First get all meeting points
        const [points] = await db.query(
            `SELECT 
                mp.id,
                mp.point_name,
                mp.point_responsibility,
                mp.remarks_by_admin,
                mp.approved_by_admin,
                mp.todo,
                mp.remarks,
                mp.point_status,
                mp.point_responsibility AS responsible_user_id,
                u.name AS responsible_user_name
             FROM meeting_points mp
             LEFT JOIN users u ON mp.point_responsibility = u.id
             WHERE mp.meeting_id = ?
             ORDER BY mp.id`,
            [id]
        );

        // Then get forwarding info for points that have it
        const [forwardingInfo] = await db.query(
            `SELECT 
                mpf.point_id,
                mpf.forward_type,
                mpf.forward_decision,
                t.name AS template_name
             FROM meeting_point_future mpf
             JOIN meeting_points mp ON mpf.point_id = mp.id
             LEFT JOIN templates t ON mpf.template_id = t.id
             WHERE mp.meeting_id = ?`,
            [id]
        );

        // Create a map of forwarding info by point_id
        const forwardingMap = forwardingInfo.reduce((acc, info) => {
            acc[info.point_id] = {
                type: info.forward_type,
                decision: info.forward_decision,
                text: info.template_name ? `next ${info.template_name}` : null
            };
            return acc;
        }, {});

        // Format the response
        const formattedPoints = points.map(point => {
            const basePoint = {
                id: point.id,
                point_name: point.point_name,
                responsible_user: point.responsible_user_id ? {
                    id: point.responsible_user_id,
                    name: point.responsible_user_name
                } : null,
                todo: point.todo,
                remarks: point.remarks,
                admin_remarks: point.remarks_by_admin,
                status: point.approved_by_admin || point.point_status || 'PENDING'
            };

            if (forwardingMap[point.id]) {
                return {
                    ...basePoint,
                    forward_info: forwardingMap[point.id]
                };
            }
            return basePoint;
        });

        res.status(200).json({
            success: true,
            data: {
                meeting_id: id,
                meeting_name: meetingCheck[0].meeting_name,
                points: formattedPoints
            }
        });

    } catch (error) {
        console.error('Error fetching meeting agenda:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching meeting agenda'
        });
    }
};

const startMeeting = async (req, res) => {
    const {
        meetingId
    } = req.body;

    var accessUserId = req.user.userId;

    if (!meetingId) {
        return res.status(400).json({
            message: "meetingId is required."
        });
    }

    // Get created_by user from meeting table
    var [
        [createdUserId]
    ] = await db.query(
        `SELECT created_by FROM meeting WHERE id = ?`,
        [meetingId]
    );

    // Authorization check
    if (createdUserId.created_by !== accessUserId) {
        return res.status(403).json({
            success: false,
            message: `Authorization is required`
        });
    }

    try {
        // Check the current status of the meeting
        const [rows] = await db.query(`SELECT meeting_status FROM meeting WHERE id = ?`, [meetingId]);

        if (rows.length === 0) {
            return res.status(404).json({
                message: "Meeting not found."
            });
        }

        if (rows[0].meeting_status !== "not_started") {
            return res.status(400).json({
                message: "Meeting cannot be started or is already in progress."
            });
        }

        // Update the meeting status
        const [result] = await db.query(
            `UPDATE meeting SET meeting_status = 'in_progress' WHERE id = ?`,
            [meetingId]
        );

        if (result.affectedRows === 0) {
            return res.status(400).json({
                message: "Failed to start meeting."
            });
        }

        res.json({
            message: "Meeting started successfully."
        });

    } catch (error) {
        console.error("Error starting meeting:", error);
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

const endMeeting = async (req, res) => {
    const {
        meetingId
    } = req.body;

    if (!meetingId) {
        return res.status(400).json({
            message: "meetingId is required."
        });
    }

    var accessUserId = req.user.userId;

    var [
        [createdUserId]
    ] = await db.query(
        `SELECT created_by FROM meeting WHERE id = ?`,
        [meetingId]
    );

    if (createdUserId.created_by !== accessUserId) {
        return res.status(403).json({
            success: false,
            message: `Authorization is required`
        });
    }

    try {
        // Check if the meeting exists and is in progress
        const [rows] = await db.query(`SELECT meeting_status FROM meeting WHERE id = ?`, [meetingId]);

        if (rows.length === 0) {
            return res.status(404).json({
                message: "Meeting not found."
            });
        }

        if (rows[0].meeting_status !== "in_progress") {
            return res.status(400).json({
                message: "Meeting cannot be ended or is not in progress."
            });
        }

        // Update the meeting status to 'completed'
        const [result] = await db.query(
            `UPDATE meeting SET meeting_status = 'completed' WHERE id = ?`,
            [meetingId]
        );

        if (result.affectedRows === 0) {
            return res.status(400).json({
                message: "Failed to end meeting."
            });
        }

        res.json({
            message: "Meeting ended successfully."
        });

    } catch (error) {
        console.error("Error ending meeting:", error);
        res.status(500).json({
            message: "Server error",
            error: error.message
        });
    }
};

const getAllMeetings = async (req, res) => {
    try {
        const sql = `
            SELECT 
                m.id,
                m.meeting_name, 
                m.start_time, 
                m.end_time, 
                m.meeting_description, 
                u.name AS created_by
            FROM meeting m
            JOIN users u ON m.created_by = u.id
            ORDER BY m.start_time DESC`;

        const [result] = await db.query(sql);

        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No meetings found"
            });
        }

        // Format date and time using date-fns
        const formattedMeetings = result.map(meeting => ({
            id: meeting.id,
            meeting_name: meeting.meeting_name,
            start_time: format(new Date(meeting.start_time), "HH:mm:ss"),
            end_time: format(new Date(meeting.end_time), "HH:mm:ss"),
            date: format(new Date(meeting.start_time), "yyyy-MM-dd"),
            meeting_description: meeting.meeting_description,
            created_by: meeting.created_by
        }));

        res.json({
            success: true,
            meetings: formattedMeetings
        });

    } catch (error) {
        console.error("Error fetching meetings:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const JWT_SECRET = 'your_secret_key';

const handleLogin = async (req, res) => {
    const {
        email,
        password
    } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required"
        });
    }

    try {
        const [users] = await db.query(
            `SELECT id, name, email, password, auth_type FROM users WHERE email = ?`,
            [email]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const user = users[0];

        const isMatch = password === user.password;

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid password"
            });
        }

        const token = jwt.sign({
            userId: user.id,
            email: user.email
        }, JWT_SECRET, {
            expiresIn: '1h'
        });

        res.json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1];

    if (!token) {
        return res.status(403).json({
            success: false,
            message: "Access denied"
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid token"
        });
    }
};

const getMeetingStatus = async (req, res) => {
    const { meetingId } = req.params;

    if (!meetingId) {
        return res.status(400).json({
            success: false,
            message: "meetingId is required.",
        });
    }

    try {
        const [[meeting]] = await db.query(
            `SELECT id, meeting_name, meeting_status, start_time, end_time, created_by
             FROM meeting
             WHERE id = ?`,
            [meetingId]
        );

        if (!meeting) {
            return res.status(404).json({
                success: false,
                message: "Meeting not found.",
            });
        }

        return res.status(200).json({
            success: true,
            meeting: {
                id: meeting.id,
                name: meeting.meeting_name,
                status: meeting.meeting_status,
                startTime: meeting.start_time,
                endTime: meeting.end_time,
                createdBy: meeting.created_by,
            },
        });

    } catch (error) {
        console.error("Error fetching meeting status:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
};


module.exports = {
    createMeeting,
    assignResponsibility,
    getMeetingbyId,
    getUserResponsibilities,
    setTodoForPoint,
    markAttendance,
    forwardMeetingPoint,
    updateMeeting,
    getUserMeetings,
    rejectMeeting,
    getUserRejectionsById,
    getAttendanceRecords,
    approvePoint,
    addAdminRemarks,
    getMeetingAgenda,
    startMeeting,
    endMeeting,
    getAllMeetings,
    handleLogin,
    verifyToken,
    getPoints,
    respondToMeetingInvite,
    getUserMeetingResponse,
    getMeetingStatus
}
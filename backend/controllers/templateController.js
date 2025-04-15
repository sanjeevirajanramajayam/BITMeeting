const db = require('../config/db');

const generateRefNumber = () => {
    const refNumber = 'BITMEET-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    return refNumber;
};

const getCategories = async (req, res) => {
    const [categories] = await db.query(`
        SELECT * FROM categories
    `);

    return res.status(200).json({categories})
}

const createTemplate = async (req, res) => {
    const {cd,
        name,
        description,
        repeatType,
        priorityType,
        venueId,
        categoryId,
        points,
        roles,
        status,
        dateTime,
    } = req.body;

    try {
        const refNumber = generateRefNumber();

        var createdBy = req.user.userId

        const [templateResult] = await db.query(
            'INSERT INTO templates (name, description, repeat_type, priority_type, venue_id, ref_number, category_id, created_by, status, created_date, date_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [name, description, repeatType, priorityType, venueId, refNumber, categoryId, createdBy, status || 'Active', new Date(), dateTime || null]
        );

        const templateId = templateResult.insertId;

        if (points.length > 0) {
            const pointValues = points.map(point => [templateId, point.sno, point.point]);
            await db.query('INSERT INTO template_points (template_id, sno, point) VALUES ?', [pointValues]);
        }

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
            const memberValues = roles.flatMap(({
                role,
                members
            }) =>
                members.map(memberId => [templateId, role, memberId])
            );

            await db.query('INSERT INTO template_members (template_id, role, member_id) VALUES ?', [memberValues]);
        }

        res.status(201).json({
            success: true,
            message: 'Template created successfully'
        });
    } catch (error) {
        console.error('Error creating template:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const deleteTemplate = async (req, res) => {
    const { id } = req.params;

    try {
        // Check if the template exists
        const [existingTemplate] = await db.query(
            'SELECT id FROM templates WHERE id = ?',
            [id]
        );

        if (existingTemplate.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Template not found'
            });
        }

        // Delete related data
        await db.query('DELETE FROM template_points WHERE template_id = ?', [id]);
        await db.query('DELETE FROM template_members WHERE template_id = ?', [id]);

        // Delete the template
        await db.query('DELETE FROM templates WHERE id = ?', [id]);

        res.status(200).json({
            success: true,
            message: 'Template deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting template:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};




const getTemplates = async (req, res) => {
    try {
        // Fetch templates with venue, category, and creator details
        const [templates] = await db.query(`
            SELECT 
                templates.id,
                templates.name,
                templates.description,
                templates.repeat_type,
                templates.priority_type,
                templates.ref_number,
                templates.status,
                templates.created_date,
                templates.updated_date,
                templates.date_time,
                venues.name AS venue_name,
                categories.name AS category_name,
                users.name AS created_by
            FROM templates
            JOIN venues ON templates.venue_id = venues.id
            JOIN categories ON templates.category_id = categories.id
            JOIN users ON templates.created_by = users.id
        `);

        if (templates.length === 0) {
            return res.status(200).json([]);
        }

        // Extract template IDs
        const templateIds = templates.map(template => template.id);

        // Fetch points
        const [points] = await db.query(`
            SELECT 
                template_points.id,
                template_points.template_id,
                template_points.sno,
                template_points.point
            FROM template_points
            WHERE template_points.template_id IN (?)
        `, [templateIds]);

        // Fetch roles and members using a JOIN
        const [roles] = await db.query(`
            SELECT 
                tm.template_id,
                tm.role,
                u.id AS user_id,
                u.name AS user_name
            FROM template_members tm
            JOIN users u ON tm.member_id = u.id
            WHERE tm.template_id IN (?)
        `, [templateIds]);

        // Group roles by template ID
        const rolesMap = {};
        roles.forEach(({
            template_id,
            role,
            user_id,
            user_name
        }) => {
            if (!rolesMap[template_id]) rolesMap[template_id] = {};
            if (!rolesMap[template_id][role]) rolesMap[template_id][role] = [];
            rolesMap[template_id][role].push({
                id: user_id,
                name: user_name
            });
        });

        // Map templates with associated points and roles
        const templatesWithDetails = templates.map(template => ({
            ...template,
            points: points.filter(point => point.template_id === template.id),
            roles: Object.entries(rolesMap[template.id] || {}).map(([role, members]) => ({
                role,
                members
            }))
        }));

        res.status(200).json(templatesWithDetails);
    } catch (error) {
        console.error('Error fetching templates:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};


const getTemplateById = async (req, res) => {
    const {
        id
    } = req.params;

    try {
        // Fetch template with venue, category, and creator details
        const [templates] = await db.query(`
            SELECT 
                templates.id,
                templates.name,
                templates.description,
                templates.repeat_type,
                templates.priority_type,
                templates.ref_number,
                templates.status,
                templates.created_date,
                templates.updated_date,
                templates.date_time,
                venues.name AS venue_name,
                categories.name AS category_name,
                users.name AS created_by
            FROM templates
            JOIN venues ON templates.venue_id = venues.id
            JOIN categories ON templates.category_id = categories.id
            JOIN users ON templates.created_by = users.id
            WHERE templates.id = ?
        `, [id]);

        if (templates.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Template not found'
            });
        }

        const template = templates[0];

        // Fetch points for the template
        const [points] = await db.query(`
            SELECT 
                template_points.id,
                template_points.sno,
                template_points.point
            FROM template_points
            WHERE template_points.template_id = ?
        `, [id]);

        // Fetch roles and members using a JOIN
        const [roles] = await db.query(`
            SELECT 
                tm.role,
                u.id AS user_id,
                u.name AS user_name
            FROM template_members tm
            JOIN users u ON tm.member_id = u.id
            WHERE tm.template_id = ?
        `, [id]);

        // Group roles properly
        const rolesMap = {};
        roles.forEach(({
            role,
            user_id,
            user_name
        }) => {
            if (!rolesMap[role]) rolesMap[role] = [];
            rolesMap[role].push({
                id: user_id,
                name: user_name
            });
        });

        // Map roles into structured format
        const formattedRoles = Object.entries(rolesMap).map(([role, members]) => ({
            role,
            members
        }));

        // Map template with associated points and roles
        const templateWithDetails = {
            ...template,
            points: points,
            roles: formattedRoles
        };

        res.status(200).json(templateWithDetails);
    } catch (error) {
        console.error('Error fetching template:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};


const updateTemplate = async (req, res) => {
    const { id } = req.params;
    const {
        name,
        description,
        repeatType,
        priorityType,
        venueId,
        categoryId,
        points,
        roles,
        status,
        dateTime,
    } = req.body;

    try {
        // Check if the template exists
        const [existingTemplate] = await db.query(
            'SELECT id FROM templates WHERE id = ?',
            [id]
        );

        if (existingTemplate.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Template not found'
            });
        }

        // Update template
        await db.query(
            'UPDATE templates SET name = ?, description = ?, repeat_type = ?, priority_type = ?, venue_id = ?, category_id = ?, status = ?, updated_date = ?, date_time = ? WHERE id = ?',
            [name, description, repeatType, priorityType, venueId, categoryId, status, new Date(), dateTime || null, id]
        );

        // Delete existing points and roles
        await db.query('DELETE FROM template_points WHERE template_id = ?', [id]);
        await db.query('DELETE FROM template_members WHERE template_id = ?', [id]);

        // Insert new points
        const pointPromises = points.map(point =>
            db.query('INSERT INTO template_points (template_id, sno, point) VALUES (?, ?, ?)', [id, point.sno, point.point])
        );

        // Insert new roles
        const rolePromises = roles.map(async ({
            role,
            members
        }) => {
            const memberPromises = members.map(async (memberId) => {
                // Ensure the user exists before inserting
                const [existingMember] = await db.query('SELECT id FROM users WHERE id = ?', [memberId]);

                if (existingMember.length === 0) {
                    throw new Error(`User with ID ${memberId} does not exist.`);
                }

                return db.query(
                    'INSERT INTO template_members (template_id, role, member_id) VALUES (?, ?, ?)',
                    [id, role, memberId]
                );
            });

            return Promise.all(memberPromises);
        });

        await Promise.all([...pointPromises, ...rolePromises]);

        res.status(200).json({
            success: true,
            message: 'Template updated successfully'
        });
    } catch (error) {
        console.error('Error updating template:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
};


const templateList = async (req, res) => {
    try {
        const [templates] = await db.query(`
            SELECT 
                t.id,
                t.name,
                c.name AS category_name,
                t.created_date,
                t.updated_date,
                t.status,
                u.name AS created_by
            FROM templates t
            LEFT JOIN categories c ON t.category_id = c.id
            LEFT JOIN users u ON t.created_by = u.id
        `);

        console.log("Fetched Templates:", templates); // Debugging

        if (!templates || templates.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No templates found'
            });
        }

        res.status(200).json({
            success: true,
            data: templates
        });
    } catch (error) {
        console.error('Error fetching template list:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

const searchTemplates = async (req, res) => {
    let {
        searchText,
        category,
        status
    } = req.query;

    // Ensure searchText is valid (optional search)
    searchText = (searchText && searchText.trim()) || "";
    // Initialize query and values array
    let query = `
        SELECT 
            t.id,
            t.name,
            c.name AS category_name,
            t.created_date,
            t.updated_date,
            t.status,
            u.name AS created_by
        FROM templates t
        LEFT JOIN categories c ON t.category_id = c.id
        LEFT JOIN users u ON t.created_by = u.id
        WHERE 1=1`; // Default condition for dynamic filtering

    let values = [];

    // Search Condition (Optional)
    if (searchText) {
        let searchCondition = ` (t.name LIKE ? OR u.name LIKE ?) `;
        values.push(`%${searchText}%`, `%${searchText}%`);
        query += ` AND ${searchCondition}`;
    }

    // Category Filter (Independent)
    let categoryFilter = category ? ` c.name = ? ` : null;
    if (categoryFilter) values.push(category);

    // Status Filter (Independent)
    let statusFilter = status ? ` t.status = ? ` : null;
    if (statusFilter) values.push(status);

    if (categoryFilter || statusFilter) {
        query += " AND (" + [categoryFilter, statusFilter].filter(Boolean).join(" AND ") + ")";
    }

    try {
        const [templates] = await db.query(query, values);

        if (!templates.length) {
            return res.status(404).json({
                success: false,
                message: "No templates found"
            });
        }

        res.status(200).json({
            success: true,
            data: templates
        });
    } catch (error) {
        console.error("Error searching templates:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const getUsers = async (req, res) => {
    try {
      const [users] = await db.execute(
        "SELECT id, name, role, department FROM users"
      );
  
      res.status(200).json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  
const getVenue = async (req, res) => {
    try {
      const [venues] = await db.execute(
        "SELECT * FROM venues"
      );
  
      res.status(200).json(venues);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  





module.exports = {
    createTemplate,
    getTemplates,
    getTemplateById,
    updateTemplate,
    templateList,
    searchTemplates,
    deleteTemplate,
    getCategories,
    getUsers,
    getVenue
};
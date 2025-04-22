const db = require('../config/db');

// Get all completed meetings
const getAllReports = async (req, res) => {
    try {
        const query = `
            SELECT 
                m.id,
                m.meeting_name,
                c.name as category,
                u.name as creator_name,
                DATE_FORMAT(m.start_time, '%Y-%m-%d %H:%i') as start_time,
                m.meeting_status,
                DATE_FORMAT(m.end_time, '%Y-%m-%d %H:%i') as end_time,
                m.meeting_description,
                v.name as venue_name
            FROM meeting m
            LEFT JOIN users u ON m.created_by = u.id
            LEFT JOIN templates t ON m.template_id = t.id
            LEFT JOIN categories c ON t.category_id = c.id
            LEFT JOIN venues v ON m.venue_id = v.id
            WHERE m.meeting_status = 'completed'
            ORDER BY m.start_time DESC
        `;

        const [meetings] = await db.query(query);
        console.log('Fetched meetings:', meetings); // Add this line for debugging

        if (!Array.isArray(meetings)) {
            throw new Error('Invalid database response format');
        }

        const reports = meetings.map(meeting => {
            if (!meeting) return null;
            
            return {
                id: meeting.id?.toString() || '',
                name: meeting.meeting_name || 'Untitled Meeting',
                category: meeting.category || 'Uncategorized',
                createdBy: meeting.creator_name || 'Unknown',
                dateCreated: meeting.start_time || 'No date',
                venue: meeting.venue_name || 'No venue'
            };
        }).filter(report => report !== null); // Remove any null entries

        console.log('Processed reports:', reports); // Add this line for debugging

        if (reports.length === 0) {
            return res.status(200).json([]); // Return empty array if no reports
        }

        res.status(200).json(reports);
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ 
            message: 'Error fetching reports',
            error: error.message 
        });
    }
};

// Create a report
const createReport = async (req, res) => {
    try {
        const report = new MeetingReport(req.body);
        const savedReport = await report.save();
        res.status(201).json(savedReport);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Add dummy data function (for development purposes)
const addDummyData = async (req, res) => {
    try {
        const dummyData = [
            {
                title: 'BOS meeting',
                category: 'COA',
                created_by: 1, // Assuming user ID 1 exists
                date: '2024-01-04',
                status: 'completed'
            },
            {
                title: 'Grievance meeting',
                category: 'M Team',
                created_by: 1,
                date: '2024-01-04',
                status: 'completed'
            },
            {
                title: 'Academic meeting',
                category: 'Academic',
                created_by: 1,
                date: '2024-01-02',
                status: 'completed'
            }
        ];

        const query = `
            INSERT INTO meetings (title, category, created_by, date, status)
            VALUES ?
        `;

        const values = dummyData.map(data => [
            data.title,
            data.category,
            data.created_by,
            data.date,
            data.status
        ]);

        await db.query(query, [values]);
        res.status(201).json({ message: 'Dummy data added successfully' });
    } catch (error) {
        console.error('Error adding dummy data:', error);
        res.status(400).json({ message: 'Error adding dummy data' });
    }
};

module.exports = {
    getAllReports,
    createReport,
    addDummyData
}; 
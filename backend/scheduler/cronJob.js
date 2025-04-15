const cron = require('node-cron');
const db = require('../config/db');

const calculateNextSchedule = (currentDate, repeatType, customDays = null) => {
    const nextDate = new Date(currentDate);

    if (repeatType === 'daily') {
        nextDate.setDate(nextDate.getDate() + 1);
    } else if (repeatType === 'weekly') {
        nextDate.setDate(nextDate.getDate() + 7);
    } else if (repeatType === 'monthly') {
        nextDate.setMonth(nextDate.getMonth() + 1);
    } else if (repeatType === 'custom_day' && customDays && customDays > 0) {
        nextDate.setDate(nextDate.getDate() + parseInt(customDays));
    } else {
        nextDate.setDate(nextDate.getDate() + 1);
    }

    return nextDate;
};

// Format JavaScript Date to MySQL DATETIME format: YYYY-MM-DD HH:MM:SS
const formatMySQLDateTime = (date) => {
    return date.toISOString().slice(0, 19).replace('T', ' ');
};

const initScheduler = () => {
    console.log('Meeting scheduler initialized');

    cron.schedule('* * * * *', async () => {
        console.log('Running daily meeting scheduler');

        try {
            const today = new Date().toISOString().split('T')[0];

            const [meetings] = await db.query(
                'SELECT id, repeat_type, custom_days, next_schedule, start_time, end_time FROM meeting WHERE meeting_status = "completed" AND DATE(next_schedule) = ?',
                [today]
            );

            for (const meeting of meetings) {
                const nextSchedule = calculateNextSchedule(new Date(meeting.next_schedule), meeting.repeat_type, meeting.custom_days);

                // Convert MySQL DATETIME (string) to JavaScript Date object
                const originalStartTime = meeting.start_time ? new Date(meeting.start_time) : null;
                const originalEndTime = meeting.end_time ? new Date(meeting.end_time) : null
                let newStartTime, newEndTime;

                if (originalStartTime) {
                    newStartTime = new Date(nextSchedule);
                    newStartTime.setDate(newStartTime.getDate() + 1);
                    newStartTime.setHours(originalStartTime.getHours(), originalStartTime.getMinutes(), originalStartTime.getSeconds());
                } else {
                    newStartTime = new Date(nextSchedule);
                    newStartTime.setHours(9, 0, 0); // Default: 09:00:00 AM
                }

                if (originalEndTime) {
                    newEndTime = new Date(nextSchedule);
                    newEndTime.setDate(newEndTime.getDate() + 1);
                    newEndTime.setHours(originalEndTime.getHours(), originalEndTime.getMinutes(), originalEndTime.getSeconds());
                } else {
                    newEndTime = new Date(nextSchedule);
                    newEndTime.setHours(17, 0, 0); // Default: 05:00:00 PM
                }
                console.log(newStartTime, nextSchedule)
                await db.query(
                    'UPDATE meeting SET next_schedule = ?, start_time = ?, end_time = ?, meeting_status = "not_started" WHERE id = ?',
                    [
                        formatMySQLDateTime(nextSchedule),
                        formatMySQLDateTime(newStartTime),
                        formatMySQLDateTime(newEndTime),
                        meeting.id,
                    ]
                );

                await db.query(
                    'INSERT INTO meeting_history (meeting_id, schedule_date, status, created_date) VALUES (?, ?, "scheduled", NOW())',
                    [meeting.id, formatMySQLDateTime(nextSchedule)]
                );

                console.log(`Meeting ID ${meeting.id} rescheduled for ${formatMySQLDateTime(nextSchedule)} with start_time: ${formatMySQLDateTime(newStartTime)} and end_time: ${formatMySQLDateTime(newEndTime)}`);
            }
        } catch (error) {
            console.error('Cron job error:', error);
        }
    }, { timezone: 'Asia/Kolkata' });
};

module.exports = { initScheduler };

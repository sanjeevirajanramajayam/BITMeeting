const express = require('express');
const router = express.Router();
const {
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
    endMeeting,
    startMeeting,
    getAllMeetings,
    handleLogin,
    verifyToken,
    getPoints
} = require('../controllers/meetingController');

router.post('/create', verifyToken, createMeeting)
router.post('/assign-responsibility', verifyToken, assignResponsibility)
router.get('/get-calender-details', getAllMeetings)
router.get('/get-user-meetings', verifyToken, getUserMeetings)
router.post('/get-responsibility', verifyToken, getUserResponsibilities)
router.post('/set-todo', verifyToken, setTodoForPoint)
router.post('/mark-attendence', verifyToken, markAttendance)
router.post('/forward-point', verifyToken, forwardMeetingPoint)
router.post('/update', updateMeeting)
router.post('/reject', rejectMeeting)
router.get('/get-rejection-records/:id', getUserRejectionsById)
router.get('/get-attendance-records/:id', getAttendanceRecords)
router.post('/approve-point', verifyToken, approvePoint)
router.post('/add-admin-remarks', verifyToken, addAdminRemarks)
router.get('/get-meeting-agenda/:id', verifyToken, getMeetingAgenda)
router.post('/start-meeting', verifyToken, startMeeting)
router.post('/end-meeting', verifyToken, endMeeting)
router.post('/login', handleLogin)
router.get('/meeting/:id', verifyToken, getMeetingbyId)
router.get('/:meetingId/points', getPoints)

module.exports = router;
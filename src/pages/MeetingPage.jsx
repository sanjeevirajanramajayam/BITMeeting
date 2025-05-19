import { useEffect, useState } from "react";
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, IconButton, Tooltip } from "@mui/material";
import Autocomplete from '@mui/material/Autocomplete';
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AttendanceIcon from "@mui/icons-material/HowToReg";
import AgendaIcon from "@mui/icons-material/Groups";
import ForwardingForm from "./MeetingPage2";
import image from "../assets/bannariammanheader.png";
import { useNavigate } from "react-router-dom";
import { useLocation } from 'react-router-dom';
import axios, { all } from "axios";
import Reason from "../components/ViewReason";
import { format } from "date-fns";
import DatePick from "../components/date";
import React from 'react';
import _ from 'lodash';
import { useMemo } from "react";


const cellStyle = {
    border: "1px solid #ddd",
    padding: "12px",
    fontWeight: "bold",
};

const headerCellStyle = {
    ...cellStyle,
    backgroundColor: "#f0f0f0",
    fontWeight: "bold",
};

const headerStyle = {
    ...headerCellStyle,
    textAlign: "left",
};

export default function StartMeet({ handleBack }) {

    const [selectedReason, setSelectedReason] = useState(null);
    const [attendanceRecords, setAttendanceRecords] = useState([]);

    const handleViewReason = (userId, username) => {
        const rejection = rejectionRecords.find((r) => r.user_id === userId);
        if (rejection) {
            setSelectedReason({
                name: meetingData.title, // Replace with actual meeting name if available
                reason: rejection.reason,
                userName: username, // You should implement this function
            });
        }
    };

    const location = useLocation();
    const { meetingData } = location.state || {};
    console.log(meetingData)
    const navigate = useNavigate();

    // State management
    const [status, setStatus] = useState(null);
    const [onStart, setOnStart] = useState(false);
    const [selectedTab, setSelectedTab] = useState("attendance");
    const [isForward, setIsForward] = useState(false);
    const [selectedAction, setSelectedAction] = useState(null);
    const [rejectionRecords, setRejectionRecords] = useState([]);
    const [selectedPoint, setSelectedPoint] = useState(null);
    const [meetingAgenda, setMeetingAgenda] = useState([]);
    const [openDateIndex, setOpenDateIndex] = useState(null);
    const [selectedDate, setSelectedDate] = useState({});
    const [selectedDateSub, setSelectedDateSub] = useState({});

    const [points, setPoints] = useState(
        meetingData.points.map(point => ({
            ...point,
            point_status: point.point_status || ""
        }))
    );

    useEffect(() => { console.log(points) }, [points])

    // For date pickers, you’ll need state to track which index is open
    const [openDateIndexSub, setOpenDateIndexSub] = React.useState(null);

    // Confirm date pick main point
    function handleDateConfirm(date, index) {
        handleChange(index, 'point_deadline', date.toISOString());
        setOpenDateIndex(null);
    }

    // Confirm date pick subpoint
    function handleDateConfirmSub(date, mainIndex, subIndex) {
        handleChange(mainIndex, 'point_deadline', date.toISOString(), true, subIndex);
        setOpenDateIndexSub(null);
    }

    useEffect(() => {
        const fetchAttendanceData = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:5000/api/meetings/get-attendance-records/${meetingData.id}`
                );
                setAttendanceRecords(response.data.data);
            } catch (err) {
                console.error(err)
                // Initialize with all members as absent if API fails
                const allMembers = Object.values(meetingData.members).flat();
                setAttendanceRecords(allMembers.map(member => ({
                    name: member.name,
                    attendance_status: 'absent',
                })));
            }
        };

        fetchAttendanceData();
        const token = localStorage.getItem('token')
        const fetchAgenda = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:5000/api/meetings/get-meeting-agenda/${meetingData.id}`
                    , {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        }
                    });
                setMeetingAgenda(response.data.data.points);
                console.log(response.data.data)
            } catch (err) {
                console.error(err)
                // Initialize with all members as absent if API fails
                // const allMembers = Object.values(meetingData.members).flat();
                // setAttendanceRecords(allMembers.map(member => ({
                //     name: member.name,
                //     attendance_status: 'absent',
                // })));
            }
        };

        fetchAgenda();
    }, [meetingData.id]);

    const handleAddSubpoint = (index) => {
        const updatedPoints = [...points]; // shallow copy of points
        const point = { ...updatedPoints[index] }; // shallow copy of the target point

        if (!point.subpoints) {
            point.subpoints = [];
        }

        point.subpoints.push({
            point_name: '',
            remarks_by_admin: '',
            responsible: '',
            responsibleId: null,
            point_deadline: '',
            meeting_id: meetingData.id
        });

        updatedPoints[index] = point; // reassign updated point
        setPoints(updatedPoints); // set new state
    };


    const getMemberStatus = (name) => {
        const record = attendanceRecords ? attendanceRecords.find(r => r.name === name) : [];
        return record ? record.attendance_status : 'absent'; // default to absent if not found
    };

    // const handleChangeStatus = (index, newStatus) => {
    //     const updatedPoints = [...points];
    //     updatedPoints[index].DecisionStatus = newStatus;
    //     setPoints(updatedPoints);
    // };

    // For status buttons (main or subpoint)
    function handleChangeStatus(mainIndex, status, isSubpoint = false, subIndex = null) {
        console.log("ksjflksdjkldfjl;sdfjl;asfkj;lkfkjdl;kfjl;kfjkl;jdklj")
        setPoints((prevPoints) => {
            const newPoints = [...prevPoints];
            if (isSubpoint && subIndex !== null) {
                newPoints[mainIndex].subpoints[subIndex] = {
                    ...newPoints[mainIndex].subpoints[subIndex],
                    DecisionStatus: status,
                };
            } else {
                newPoints[mainIndex] = {
                    ...newPoints[mainIndex],
                    DecisionStatus: status,
                };
            }
            return newPoints;
        });
    }

    function handleChange(mainIndex, field, value, isSubpoint = false, subIndex = null) {
        setPoints((prevPoints) => {
            const newPoints = [...prevPoints];
            if (isSubpoint && subIndex !== null) {
                newPoints[mainIndex].subpoints = newPoints[mainIndex].subpoints || [];
                newPoints[mainIndex].subpoints[subIndex] = {
                    ...newPoints[mainIndex].subpoints[subIndex],
                    [field]: value,
                };
            } else {
                newPoints[mainIndex] = {
                    ...newPoints[mainIndex],
                    [field]: value,
                };
            }

            return newPoints;

        });
    }

    //useEffect(() => { debouncedSubmitPoints() }, [points])

    const debouncedSubmitPoints = useMemo(
        () => _.debounce(() => {
            submitPoints();
        }, 500),
        [] // Only create once
    );

    const handleAddTopic = () => {
        const newId = String(points.length + 1).padStart(2, "0");
        const newPoint = { meetingId: meetingData.id };

        setPoints([...points, newPoint]);
    };

    const handleAttendanceChange = (name, newStatus) => {
        setAttendanceRecords(prevRecords =>
            prevRecords.map(record =>
                record.name === name ? { ...record, attendance_status: newStatus } : record
            )
        );
    };

    // const handleDateConfirm = (date, index) => {
    //     const formattedDate = date.format("YYYY-MM-DD");
    //     setSelectedDate((prev) => ({ ...prev, [index]: formattedDate }));

    //     // Update the points state with the new deadline
    //     setPoints(prevPoints => {
    //         const updatedPoints = [...prevPoints];
    //         updatedPoints[index] = {
    //             ...updatedPoints[index],
    //             point_deadline: formattedDate
    //         };
    //         return updatedPoints;
    //     });

    //     setOpenDateIndex(null);
    // };

    const allMembers = Object.values(meetingData.members).flatMap(roleMembers =>
        roleMembers.map(member => ({
            id: member.user_id,
            name: member.name
        }))
    );

    const submitPoints = async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            console.error("No auth token found");
            return;
        }

        // Ensure meetingId exists
        const updatedPoints = points.map(point => ({
            ...point,
            meetingId: point.meetingId || meetingData.id, // assume meetingId is in scope
            subpoints: point.subpoints?.map(sub => ({
                ...sub,
                meetingId: sub.meetingId || point.meetingId || meetingData.id
            })) || []
        }));

        try {
            const res = await axios.post(
                "http://localhost:5000/api/meetings/update-point",
                { points: updatedPoints },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            const newPointMap = {};
            for (const entry of res.data.insertedPoints) {
                newPointMap[entry.index] = entry.point_id;
            }
            console.log(newPointMap)
            // Apply new point_ids based on index
            const updatedState = updatedPoints.map((point, i) => {
                const updated = { ...point };
                if (!updated.point_id && newPointMap[i]) {
                    updated.point_id = newPointMap[i];
                }

                if (updated.subpoints) {
                    updated.subpoints = updated.subpoints.map((sub, j) => {
                        if (!sub.point_id && newPointMap[`${i}-${j}`]) {
                            return { ...sub, point_id: newPointMap[`${i}-${j}`] };
                        }
                        return sub;
                    });
                }

                return updated;
            });
            console.log(updatedState)
            setPoints(updatedState);
            console.log("All points updated with correct point_ids.");
        } catch (err) {
            console.error("Error submitting points:", err.response?.data || err.message);
        }
    };




    const getNonRejectedMembers = () => {
        const rejectedUserIds = (rejectionRecords?.map(r => r.user_id) || []);
        return Object.values(meetingData.members)
            .flatMap(roleMembers =>
                roleMembers.filter(member => !rejectedUserIds.includes(member.user_id))
            )
            .map(member => ({
                id: member.user_id,
                name: member.name
            }));
    };

    const markAttendance = async (userId, status) => {
        const token = localStorage.getItem('token');
        console.log(userId)
        console.log(attendanceRecords)
        try {
            await axios.post('http://localhost:5000/api/meetings/mark-attendence', {
                meetingId: meetingData.id,
                userId,
                status
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            // Update local state


            setAttendanceRecords(prevRecords =>
                prevRecords.map(record =>
                    record.userId === userId ? { ...record, attendance_status: status } : record
                )
            );
        } catch (err) {
            console.error('Failed to update attendance:', err.response?.data?.message || err.message);
        }
    };

    const setMeetingState = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `http://localhost:5000/api/meetings/get-meeting-status/${meetingData.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.meeting.status == 'in_progress') {
                setOnStart(true)
            }
        } catch (error) {
            console.error("Error getting meeting state:", error);
        }
    };

    const approvePoint = async (pointId, approvedDecision, point, index) => {
        try {
            const token = localStorage.getItem('token')
            const sentobj = { pointId, approvedDecision }
            if (point.todo || point.old_todo) {
                const response = await axios.post('http://localhost:5000/api/meetings/approve-point', sentobj, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                })
                if (approvedDecision == "APPROVED") {
                    handleStatusChange(index, "Approve")
                }
                else if (approvedDecision == "NOT APPROVED") {
                    handleStatusChange(index, "Not Approve")
                }
            }
            else {
                alert('todo is null')
            }
        }
        catch (err) {
            console.error(err)
        }
    }

    // Handlers
    const handleForwardClick = (action) => {
        setIsForward(true);
        setSelectedAction(action);
    };

    const handleStatusChange = (index, newStatus) => {
        const updatedPoints = [...points];
        updatedPoints[index].status = newStatus;
        setPoints(updatedPoints);
    };

    // const handleChange = (index, field, value) => {
    //     const updatedPoints = [...points];
    //     updatedPoints[index][field] = value;
    //     console.log(updatedPoints)
    //     setPoints(updatedPoints);
    // };

    const isRejected = (userId) => {
        if (rejectionRecords) {
            return rejectionRecords.some(record => record.user_id === userId);
        }
        else {
            return false
        }
    };

    async function allPointsApproved() {

        try {
            var token = localStorage.getItem('token')
            var id = meetingData.id;
            const response = await axios.get(`http://localhost:5000/api/meetings/get-meeting-agenda/${meetingData.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            })
            var meetingDataPoints = response.data.data
        }
        catch (err) {
            console.log(err)
        }
        var flag = 0;
        for (let i = 0; i < meetingDataPoints.points.length; i++) {
            if (meetingDataPoints.points[i].status != "APPROVED" && !isRejected(meetingDataPoints.points[i].responsible_user.id)) {
                flag = 1;
            }
        }
        if (flag == 0) {

            const response = await axios.post(` http://localhost:5000/api/meetings/start-meeting/`, { meetingId: id }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            })

            return true
        }
        return false

    }

    const getRejectionReason = (userId) => {
        const record = rejectionRecords.find(r => r.user_id === userId);
        return record ? record.reason : '';
    };

    const EndMeeting = async () => {
        const allHaveForwardType = meetingAgenda.every(
            point => point.forward_info && typeof point.forward_info.type !== "undefined"
        );
        const allHaveDecisionStatus = points.every(p => p.DecisionStatus !== undefined);
        var id = meetingData.id;
        var token = localStorage.getItem('token')
        if (allHaveForwardType || allHaveDecisionStatus) {


            const response = await axios.post(`http://localhost:5000/api/meetings/end-meeting/`, { meetingId: id }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            })
            navigate(`/reports/${meetingData.id}`)
        }
        else {
            alert('Fill in all points!')
        }
    }

    useEffect(() => {

        meetingData.points.forEach((point, index) => {
            var status = point.approved_by_admin;
            if (status == "NOT APPROVED") {
                status = "Not Approve"
            }
            else if (status == "APPROVED") {
                status = "Approve"
            }
            handleStatusChange(index, status);
        });
        setMeetingState();
    }, [])

    useEffect(() => {
        const fetchRejectionRecords = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/meetings/get-rejection-records/${meetingData.id}`);
                const data = await res.json();

                setRejectionRecords(data.data);
            } catch (err) {
                console.error('Failed to fetch rejection records:', err);
            }
        };

        if (meetingData.id) fetchRejectionRecords();


    }, [meetingData.id]);

    useEffect(() => {
        meetingAgenda.forEach((point) => {
            if (!point.forward_info) return;
    
            if (point.parent_point_id) {
                // This is a subpoint
                const parentId = point.parent_point_id;
    
                // Find mainIndex: index in `points` where id matches parent
                const mainIndex = points.findIndex(p => p.point_id === parentId);
                if (mainIndex === -1) return;
    
                // Now, find subIndex: index in `points[mainIndex].subpoints` where id matches subpoint
                const subIndex = points[mainIndex]?.subpoints?.findIndex(sp => sp.point_id === point.id);
                if (subIndex === -1 || subIndex === undefined) return;
    
                console.log(`Calling for subpoint ${point.id}:`, point.forward_info.decision);
                handleChangeStatus(mainIndex, point.forward_info.decision, true, subIndex);
            } else {
                // This is a main point
                const mainIndex = points.findIndex(p => p.point_id === point.id);
                if (mainIndex === -1) return;
    
                console.log(`Calling for main point ${point.id}:`, point.forward_info.decision);
                handleChangeStatus(mainIndex, point.forward_info.decision);
            }
        });
    }, [meetingAgenda]);
    





    console.log(points)
    return (
        <Box>
            {/* Header Section */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", gap: 50 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{ display: "flex", padding: "5px", backgroundColor: "white" }}>
                        <ArrowBackIcon sx={{ cursor: "pointer" }} onClick={() => navigate("/dashboardrightpanel")} />
                    </Box>
                    <Typography variant="h6" fontWeight="bold">
                        {meetingData?.title || "Meeting Title"}
                        <Typography sx={{ fontSize: '12px' }}>
                            {meetingData?.location} • {meetingData?.date}
                        </Typography>
                    </Typography>
                </Box>

                {/* Action Buttons */}
                {!onStart ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, padding: "6px", backgroundColor: "white", borderRadius: "8px" }}>
                        <Button
                            variant="outlined"
                            sx={{
                                borderRadius: '8px',
                                textTransform: 'none',
                                fontWeight: 500,
                                padding: '6px 16px',
                                borderWidth: '2px',
                                borderColor: '#FB3748',
                                color: '#FB3748',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                            }}
                            onClick={() => navigate("/dashboardrightpanel")}
                        >
                            <DeleteOutlineIcon sx={{ fontSize: '18px' }} />
                            Cancel Meeting
                        </Button>
                        <Button
                            variant="contained"
                            sx={{
                                borderRadius: '5px',
                                backgroundColor: "#6c757d",
                                textTransform: "none",
                                gap: "8px",
                                "&:hover": { backgroundColor: "#5a6268" },
                            }}
                            onClick={() => { navigate('/editpoints', { state: { meetingData } }) }}
                        >
                            <DescriptionOutlinedIcon sx={{ fontSize: "18px" }} />
                            Edit Points
                        </Button>
                        <Button
                            variant="contained"
                            sx={{
                                paddingX: '35px',
                                borderRadius: '5px',
                                backgroundColor: "#007bff",
                                textTransform: "none",
                                gap: "8px",
                                "&:hover": { backgroundColor: "#0069d9" },
                            }}
                            onClick={async () => {
                                const status = await allPointsApproved()
                                if (status == true) {
                                    setOnStart(true)
                                }
                                else {
                                    alert("Not all points are approved.")
                                }
                            }}
                        >
                            <AutoAwesomeOutlinedIcon sx={{ fontSize: "18px" }} />
                            Start Meeting
                        </Button>
                    </Box>
                ) : (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, padding: "6px", backgroundColor: "white", borderRadius: "8px" }}>
                        <Button
                            variant="contained"
                            sx={{ width: '250px', backgroundColor: "#FFB547", textTransform: "none", gap: "5px" }}
                            onClick={() => { EndMeeting() }}
                        >
                            <AutoAwesomeOutlinedIcon sx={{ fontSize: "18px" }} />
                            End Meeting
                        </Button>
                    </Box>
                )}
            </Box>

            {/* Tab Selection */}
            {onStart && (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: 2, padding: '4px', backgroundColor: 'white', gap: 2, width: '800px', margin: '0 auto', marginBottom: '10px' }}>
                    <Button
                        onClick={() => setSelectedTab("attendance")}
                        sx={{
                            width: '400px',
                            backgroundColor: selectedTab === "attendance" ? "#4285F4" : "transparent",
                            color: selectedTab === "attendance" ? "#fff" : "#666",
                            "&:hover": { backgroundColor: selectedTab === "attendance" ? "#357ae8" : "#f0f0f0" },
                            textTransform: "none",
                            gap: 2,
                            transition: "background-color 0.3s, color 0.3s",
                        }}
                    >
                        <AttendanceIcon />
                        Attendance
                    </Button>
                    <Button
                        onClick={() => setSelectedTab("agenda")}
                        sx={{
                            width: '400px',
                            backgroundColor: selectedTab === "agenda" ? "#4285F4" : "transparent",
                            color: selectedTab === "agenda" ? "#fff" : "#666",
                            "&:hover": { backgroundColor: selectedTab === "agenda" ? "#357ae8" : "#f0f0f0" },
                            textTransform: "none",
                            gap: 2,
                            transition: "background-color 0.3s, color 0.3s",
                            borderRadius: '8px'
                        }}
                    >
                        <AgendaIcon />
                        Agenda
                    </Button>
                </Box>
            )}

            {/* Main Content */}
            <Box sx={{ display: "flex", backgroundColor: "white", justifyContent: "center", alignItems: "center", flexDirection: 'column', width: "90%", margin: "0 auto", paddingX: '40px' }}>
                <img src={image} alt="Example" style={{ width: "50%", height: "50%", padding: "10px" }} />

                {/* Meeting Details Table */}
                <TableContainer sx={{ margin: "auto", mt: 3, border: "1px solid #ddd", borderBottom: 'none' }}>
                    <Table sx={{ borderCollapse: "collapse" }}>
                        <TableBody>
                            <TableRow>
                                <TableCell sx={cellStyle}>Name of the Meeting</TableCell>
                                <TableCell sx={cellStyle}>
                                    <TextField
                                        variant="standard"
                                        fullWidth
                                        value={meetingData?.title || ""}
                                        InputProps={{ disableUnderline: true }}
                                    />
                                </TableCell>
                                <TableCell sx={cellStyle}>Reference Number</TableCell>
                                <TableCell sx={cellStyle}>
                                    <TextField
                                        variant="standard"
                                        fullWidth
                                        placeholder="Autogenerate"
                                        InputProps={{ disableUnderline: true, sx: { fontStyle: 'italic', color: '#777' } }}
                                    />
                                </TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCell sx={cellStyle}>Meeting Description</TableCell>
                                <TableCell colSpan={3} sx={cellStyle}>
                                    <TextField
                                        variant="standard"
                                        multiline
                                        fullWidth
                                        value={meetingData?.description || ""}
                                        rows={4}
                                        InputProps={{ disableUnderline: true }}
                                    />
                                </TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCell sx={cellStyle}>Repeat Type</TableCell>
                                <TableCell sx={cellStyle}>
                                    <TextField
                                        placeholder="Ex..Monthly"
                                        value={meetingData?.repeat_type || ""}
                                        variant="standard"
                                        InputProps={{ disableUnderline: true }}
                                    />
                                </TableCell>
                                <TableCell sx={cellStyle}>Priority Type</TableCell>
                                <TableCell sx={cellStyle}>
                                    <TextField
                                        value={meetingData?.priority || ""}
                                        variant="standard"
                                        InputProps={{ disableUnderline: true }}
                                    />
                                </TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCell sx={cellStyle}>Venue Details</TableCell>
                                <TableCell sx={cellStyle}>
                                    <TextField
                                        variant="standard"
                                        value={meetingData?.location || ""}
                                        fullWidth
                                        InputProps={{ disableUnderline: true }}
                                    />
                                </TableCell>
                                <TableCell sx={cellStyle}>Date & Time</TableCell>
                                <TableCell sx={cellStyle}>
                                    <TextField
                                        variant="standard"
                                        value={meetingData?.dateText || ""}
                                        fullWidth
                                        InputProps={{ disableUnderline: true }}
                                    />
                                </TableCell>
                            </TableRow>

                            <TableRow sx={{ backgroundColor: "#f0f0f0" }}>
                                <TableCell sx={headerStyle}>Roles</TableCell>
                                <TableCell colSpan={3} sx={headerStyle}>Member list</TableCell>
                            </TableRow>

                            {Object.entries(meetingData.members).map((member) => (
                                <TableRow key={member[0]}>
                                    <TableCell sx={cellStyle}>
                                        <TextField
                                            variant="standard"
                                            placeholder="Person"
                                            value={member[0]}
                                            fullWidth
                                            InputProps={{ disableUnderline: true }}
                                        />
                                    </TableCell>
                                    <TableCell colSpan={3} sx={cellStyle}>
                                        <TextField
                                            variant="standard"
                                            placeholder="Select Member"
                                            fullWidth
                                            value={member[1]?.map((element) => ` ${element.name}`)}
                                            InputProps={{ disableUnderline: true }}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Dynamic Content Based on Tab Selection */}
                {onStart && selectedTab === 'attendance' ? (
                    <TableContainer sx={{ margin: "auto", border: "1px solid #ddd", borderTop: "none" }}>
                        <Table sx={{ borderCollapse: "collapse" }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell width="5%" sx={{ ...headerCellStyle, textAlign: 'center' }}>S.No</TableCell>
                                    <TableCell width="30%" sx={{ ...headerCellStyle, textAlign: 'center' }}>Name & Designation</TableCell>
                                    <TableCell width="15%" sx={{ ...headerCellStyle, textAlign: 'center' }}>Role</TableCell>
                                    <TableCell width="10%" sx={{ ...headerCellStyle, textAlign: 'center' }}>Attendance</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>

                                {Object.entries(meetingData.members).map(([role, members]) =>
                                    members.map((member, index) => {
                                        const currentStatus = getMemberStatus(member.name);
                                        return (
                                            <TableRow key={`${role}-${index}`}>
                                                <TableCell sx={{ textAlign: "center" }}>{index + 1}</TableCell>
                                                <TableCell sx={{ textAlign: "center" }}>{member.name}</TableCell>
                                                <TableCell sx={{ textAlign: "center" }}>{role}</TableCell>
                                                <TableCell sx={{ textAlign: "center" }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                                                        <Button
                                                            variant={currentStatus === "present" ? "contained" : "outlined"}
                                                            sx={{
                                                                width: '100px',
                                                                color: currentStatus === "present" ? "white" : "green",
                                                                borderColor: "green",
                                                                backgroundColor: currentStatus === "present" ? "green" : "#e6f8e6",
                                                                textTransform: "none",
                                                                borderRadius: "14px",
                                                                fontSize: '10px',
                                                                gap: 0.5,
                                                                "&:hover": {
                                                                    backgroundColor: currentStatus === "present" ? "darkgreen" : "#d4edda",
                                                                },
                                                            }}
                                                            onClick={() => markAttendance(member.user_id, "present")}

                                                        >
                                                            Present
                                                        </Button>
                                                        <Button
                                                            variant={currentStatus === "absent" ? "contained" : "outlined"}
                                                            sx={{
                                                                width: '100px',
                                                                color: currentStatus === "absent" ? "white" : "red",
                                                                borderColor: "red",
                                                                backgroundColor: currentStatus === "absent" ? "red" : "#fdecec",
                                                                textTransform: "none",
                                                                borderRadius: "14px",
                                                                fontSize: '10px',
                                                                gap: 0.5,
                                                                "&:hover": {
                                                                    backgroundColor: currentStatus === "absent" ? "darkred" : "#f8d7da",
                                                                },
                                                            }}
                                                            onClick={() => markAttendance(member.user_id, "absent")}

                                                        >
                                                            Absent
                                                        </Button>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                ) : onStart && selectedTab === 'agenda' ? (
                    <TableContainer sx={{ margin: "auto", border: "1px solid #ddd", borderTop: "none" }}>
                        <Table sx={{ borderCollapse: "collapse" }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell width="5%" sx={{ ...headerCellStyle, textAlign: 'center' }}>S.No</TableCell>
                                    <TableCell width="25%" sx={{ ...headerCellStyle, textAlign: 'center' }}>Points to be Discussed</TableCell>
                                    <TableCell width="20%" sx={{ ...headerCellStyle, textAlign: 'center' }}>Remarks</TableCell>
                                    <TableCell width="10%" sx={{ ...headerCellStyle, textAlign: 'center' }}>Status</TableCell>
                                    <TableCell width="10%" sx={{ ...headerCellStyle, textAlign: 'center' }}>Responsibility</TableCell>
                                    <TableCell width="10%" sx={{ ...headerCellStyle, textAlign: 'center' }}>Deadline</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <>
                                    {points.map((point, index) => {
                                        const isRowDisabled = isRejected(point.responsibleId);

                                        // Common style for disabled elements
                                        const disabledStyle = isRowDisabled ? {
                                            opacity: 1.0,
                                            pointerEvents: 'none',
                                            backgroundColor: '#f5f5f5'
                                        } : {};

                                        // Merge with existing cell style
                                        const mergedCellStyle = {
                                            ...cellStyle,
                                            ...(isRowDisabled && { backgroundColor: '#f5f5f5' })
                                        };

                                        return (
                                            <>
                                                {/* Main point row */}
                                                <TableRow>
                                                    <TableCell sx={{ ...cellStyle, textAlign: "center" }}>{index + 1}</TableCell>
                                                    <TableCell sx={{ ...cellStyle, fontWeight: "normal", maxWidth: "300px" }}>
                                                        <TextField
                                                            variant="standard"
                                                            placeholder="Enter discussion topic"
                                                            multiline
                                                            fullWidth
                                                            minRows={1}
                                                            maxRows={4}
                                                            value={point.point_name}
                                                            InputProps={{
                                                                disableUnderline: true,
                                                                sx: { fontSize: '14px', fontWeight: 'bold' }
                                                            }}
                                                            onChange={(e) => handleChange(index, 'point_name', e.target.value)}
                                                        />
                                                    </TableCell>
                                                    <TableCell sx={cellStyle}>
                                                        <TextField
                                                            variant="standard"
                                                            placeholder="Add remarks"
                                                            fullWidth
                                                            value={point.remarks_by_admin}
                                                            onChange={(e) => handleChange(index, 'remarks_by_admin', e.target.value)}
                                                            InputProps={{ disableUnderline: true }}
                                                        />
                                                    </TableCell>
                                                    <TableCell sx={{ ...cellStyle, textAlign: "center" }}>
                                                        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 1, alignItems: 'center' }}>
                                                            {point.DecisionStatus !== "DISAGREE" && point.DecisionStatus !== "FORWARD" && (
                                                                <Button
                                                                    variant="outlined"
                                                                    sx={{
                                                                        width: '100px',
                                                                        color: "green",
                                                                        borderColor: "green",
                                                                        backgroundColor: "#e6f8e6",
                                                                        textTransform: "none",
                                                                        borderRadius: "14px",
                                                                        fontSize: '10px',
                                                                        gap: 0.5,
                                                                        "&:hover": {
                                                                            backgroundColor: "#d4edda",
                                                                        },
                                                                    }}
                                                                    onClick={() => {
                                                                        var updatedPoint = point;
                                                                        updatedPoint.DecisionIndex = index;
                                                                        setSelectedPoint(updatedPoint);
                                                                        handleForwardClick("AGREE")

                                                                        //handleChangeStatus(index, "AGREE");
                                                                    }}
                                                                >
                                                                    Agree
                                                                </Button>
                                                            )}
                                                            {point.DecisionStatus !== "DISAGREE" && point.DecisionStatus !== "AGREE" && (
                                                                <Button
                                                                    variant="outlined"
                                                                    sx={{
                                                                        width: '100px',
                                                                        color: "black",
                                                                        borderColor: "black",
                                                                        backgroundColor: "#D8DEE2",
                                                                        textTransform: "none",
                                                                        borderRadius: "14px",
                                                                        fontSize: '10px',
                                                                        gap: 0.5,
                                                                    }}
                                                                    onClick={() => {
                                                                        var updatedPoint = point;
                                                                        updatedPoint.DecisionIndex = index;
                                                                        setSelectedPoint(updatedPoint);
                                                                        handleForwardClick("FORWARD")
                                                                        //handleChangeStatus(index, "FORWARD");
                                                                    }}
                                                                >
                                                                    Forward
                                                                </Button>
                                                            )}
                                                            {point.DecisionStatus !== "AGREE" && point.DecisionStatus !== "FORWARD" && (
                                                                <Button
                                                                    variant="outlined"
                                                                    sx={{
                                                                        width: '100px',
                                                                        color: "red",
                                                                        borderColor: "red",
                                                                        backgroundColor: "#fdecec",
                                                                        textTransform: "none",
                                                                        borderRadius: "14px",
                                                                        fontSize: '10px',
                                                                        gap: 0.5,
                                                                        "&:hover": {
                                                                            backgroundColor: "#f8d7da",
                                                                        },
                                                                    }}
                                                                    onClick={() => {
                                                                        var updatedPoint = point;
                                                                        updatedPoint.DecisionIndex = index;
                                                                        console.log(meetingAgenda)
                                                                        setSelectedPoint(updatedPoint);
                                                                        handleForwardClick("DISAGREE")
                                                                        //handleChangeStatus(index, "DISAGREE");
                                                                    }}
                                                                >
                                                                    Not Agree
                                                                </Button>
                                                            )}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell sx={{ ...cellStyle, p: 1 }}>
                                                        <Autocomplete
                                                            disableClearable
                                                            options={getNonRejectedMembers()}
                                                            getOptionLabel={(option) => option.name}
                                                            value={allMembers.find(member => member.id === point.responsibleId) || null}
                                                            onChange={(event, newValue) => {
                                                                if (newValue) {
                                                                    handleChange(index, 'responsible', newValue.name);
                                                                    handleChange(index, 'responsibleId', newValue.id);
                                                                }
                                                            }}
                                                            renderInput={(params) => (
                                                                <TextField
                                                                    {...params}
                                                                    variant="standard"
                                                                    placeholder="Select Member"
                                                                    fullWidth
                                                                    InputProps={{
                                                                        ...params.InputProps,
                                                                        disableUnderline: true,
                                                                    }}
                                                                    sx={{
                                                                        px: 1,
                                                                        py: 0.5,
                                                                        borderRadius: 1,
                                                                        bgcolor: isRejected(point.responsibleId) ? '#ffe5e5' : 'transparent',
                                                                    }}
                                                                />
                                                            )}
                                                            sx={{
                                                                minWidth: 200,
                                                                '& .MuiAutocomplete-popupIndicator': {
                                                                    display: 'flex'
                                                                }
                                                            }}
                                                        />
                                                        {isRejected(point.responsibleId) && (
                                                            <Typography
                                                                component="a"
                                                                onClick={() => handleViewReason(point.responsibleId, point.responsible)}
                                                                sx={{
                                                                    fontSize: '0.8rem',
                                                                    color: 'error.main',
                                                                    cursor: 'pointer',
                                                                    textDecoration: 'underline',
                                                                    ml: 1
                                                                }}
                                                            >
                                                                View reason
                                                            </Typography>
                                                        )}
                                                    </TableCell>
                                                    <TableCell sx={{ position: "relative", ...cellStyle }}>
                                                        <TextField
                                                            variant="standard"
                                                            placeholder="Select Date"
                                                            fullWidth
                                                            InputProps={{ disableUnderline: true, style: { fontStyle: 'italic' } }}
                                                            value={point.point_deadline ? format(new Date(point.point_deadline), 'dd MMM yyyy') : selectedDate[index] || ""}
                                                            onClick={() => setOpenDateIndex(index)}
                                                            readOnly
                                                        />

                                                        {openDateIndex === index && (
                                                            <Box
                                                                sx={{
                                                                    position: "fixed",
                                                                    top: 0,
                                                                    left: 0,
                                                                    width: "100vw",
                                                                    height: "100vh",
                                                                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                                                                    zIndex: 5,
                                                                    display: "flex",
                                                                    justifyContent: "center",
                                                                    alignItems: "center",
                                                                }}
                                                                onClick={() => setOpenDateIndex(null)}
                                                            >
                                                                <Box
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    <DatePick
                                                                        onConfirm={(date) => handleDateConfirm(date, index)}
                                                                        onClose={() => setOpenDateIndex(null)}
                                                                    />
                                                                </Box>
                                                            </Box>
                                                        )}
                                                    </TableCell>
                                                </TableRow>

                                                {/* Subpoints */}
                                                {point.subpoints && point.subpoints.map((subpoint, subIndex) => (
                                                    <TableRow key={`sub-${index}-${subIndex}`}>
                                                        <TableCell sx={{ ...cellStyle, pl: 4, textAlign: "center", fontSize: 13, color: 'gray' }}>
                                                            {index + 1}.{subIndex + 1}
                                                        </TableCell>
                                                        <TableCell sx={{ ...cellStyle, fontWeight: "normal", maxWidth: "280px", pl: 4 }}>
                                                            <TextField
                                                                variant="standard"
                                                                placeholder="Enter subpoint topic"
                                                                multiline
                                                                fullWidth
                                                                minRows={1}
                                                                maxRows={3}
                                                                value={subpoint.point_name}
                                                                InputProps={{
                                                                    disableUnderline: true,
                                                                    sx: { fontSize: '13px' }
                                                                }}
                                                                onChange={(e) => handleChange(index, 'point_name', e.target.value, true, subIndex)}
                                                            />
                                                        </TableCell>
                                                        <TableCell sx={cellStyle}>
                                                            <TextField
                                                                variant="standard"
                                                                placeholder="Add remarks"
                                                                fullWidth
                                                                value={subpoint.remarks_by_admin}
                                                                onChange={(e) => handleChange(index, 'remarks_by_admin', e.target.value, true, subIndex)}
                                                                InputProps={{ disableUnderline: true }}
                                                            />
                                                        </TableCell>
                                                        <TableCell sx={{ ...cellStyle, textAlign: "center" }}>
                                                            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 1, alignItems: 'center' }}>
                                                                {subpoint.DecisionStatus !== "DISAGREE" && subpoint.DecisionStatus !== "FORWARD" && (
                                                                    <Button
                                                                        variant="outlined"
                                                                        sx={{
                                                                            width: '100px',
                                                                            color: "green",
                                                                            borderColor: "green",
                                                                            backgroundColor: "#e6f8e6",
                                                                            textTransform: "none",
                                                                            borderRadius: "14px",
                                                                            fontSize: '10px',
                                                                            gap: 0.5,
                                                                            "&:hover": {
                                                                                backgroundColor: "#d4edda",
                                                                            },
                                                                        }}
                                                                        onClick={() => {
                                                                            var updatedPoint = subpoint;
                                                                            updatedPoint.DecisionIndex = index;
                                                                            updatedPoint.SubPointIndex = subIndex;
                                                                            setSelectedPoint(updatedPoint);
                                                                            handleForwardClick("AGREE")

                                                                            //handleChangeStatus(index, "AGREE");
                                                                        }}
                                                                    >
                                                                        Agree
                                                                    </Button>
                                                                )}
                                                                {subpoint.DecisionStatus !== "DISAGREE" && subpoint.DecisionStatus !== "AGREE" && (
                                                                    <Button
                                                                        variant="outlined"
                                                                        sx={{
                                                                            width: '100px',
                                                                            color: "black",
                                                                            borderColor: "black",
                                                                            backgroundColor: "#D8DEE2",
                                                                            textTransform: "none",
                                                                            borderRadius: "14px",
                                                                            fontSize: '10px',
                                                                            gap: 0.5,
                                                                        }}
                                                                        onClick={() => {
                                                                            var updatedPoint = subpoint;
                                                                            updatedPoint.DecisionIndex = index;
                                                                            updatedPoint.SubPointIndex = subIndex;
                                                                            setSelectedPoint(updatedPoint);
                                                                            handleForwardClick("FORWARD")
                                                                            //handleChangeStatus(index, "FORWARD");
                                                                        }}
                                                                    >
                                                                        Forward
                                                                    </Button>
                                                                )}
                                                                {subpoint.DecisionStatus !== "AGREE" && subpoint.DecisionStatus !== "FORWARD" && (
                                                                    <Button
                                                                        variant="outlined"
                                                                        sx={{
                                                                            width: '100px',
                                                                            color: "red",
                                                                            borderColor: "red",
                                                                            backgroundColor: "#fdecec",
                                                                            textTransform: "none",
                                                                            borderRadius: "14px",
                                                                            fontSize: '10px',
                                                                            gap: 0.5,
                                                                            "&:hover": {
                                                                                backgroundColor: "#f8d7da",
                                                                            },
                                                                        }}
                                                                        onClick={() => {
                                                                            var updatedPoint = subpoint;
                                                                            updatedPoint.DecisionIndex = index;
                                                                            updatedPoint.SubPointIndex = subIndex;
                                                                            console.log(meetingAgenda)
                                                                            setSelectedPoint(updatedPoint);
                                                                            handleForwardClick("DISAGREE")
                                                                            //handleChangeStatus(index, "DISAGREE");
                                                                        }}
                                                                    >
                                                                        Not Agree
                                                                    </Button>
                                                                )}
                                                            </Box>
                                                        </TableCell>
                                                        <TableCell sx={{ ...cellStyle, p: 1 }}>
                                                            <Autocomplete
                                                                disableClearable
                                                                options={getNonRejectedMembers()}
                                                                getOptionLabel={(option) => option.name}
                                                                value={allMembers.find(member => member.id === subpoint.responsibleId) || null}
                                                                onChange={(event, newValue) => {
                                                                    if (newValue) {
                                                                        handleChange(index, 'responsible', newValue.name, true, subIndex);
                                                                        handleChange(index, 'responsibleId', newValue.id, true, subIndex);
                                                                    }
                                                                }}
                                                                renderInput={(params) => (
                                                                    <TextField
                                                                        {...params}
                                                                        variant="standard"
                                                                        placeholder="Select Member"
                                                                        fullWidth
                                                                        InputProps={{
                                                                            ...params.InputProps,
                                                                            disableUnderline: true,
                                                                        }}
                                                                        sx={{
                                                                            px: 1,
                                                                            py: 0.5,
                                                                            borderRadius: 1,
                                                                            bgcolor: isRejected(subpoint.responsibleId) ? '#ffe5e5' : 'transparent',
                                                                        }}
                                                                    />
                                                                )}
                                                                sx={{
                                                                    minWidth: 180,
                                                                    '& .MuiAutocomplete-popupIndicator': {
                                                                        display: 'flex'
                                                                    }
                                                                }}
                                                            />
                                                            {isRejected(subpoint.responsibleId) && (
                                                                <Typography
                                                                    component="a"
                                                                    onClick={() => handleViewReason(subpoint.responsibleId, subpoint.responsible)}
                                                                    sx={{
                                                                        fontSize: '0.8rem',
                                                                        color: 'error.main',
                                                                        cursor: 'pointer',
                                                                        textDecoration: 'underline',
                                                                        ml: 1
                                                                    }}
                                                                >
                                                                    View reason
                                                                </Typography>
                                                            )}
                                                        </TableCell>
                                                        <TableCell sx={{ position: "relative", ...cellStyle }}>
                                                            <TextField
                                                                variant="standard"
                                                                placeholder="Select Date"
                                                                fullWidth
                                                                InputProps={{ disableUnderline: true, style: { fontStyle: 'italic' } }}
                                                                value={subpoint.point_deadline ? format(new Date(subpoint.point_deadline), 'dd MMM yyyy') : selectedDateSub[index]?.[subIndex] || ""}
                                                                onClick={() => setOpenDateIndexSub(index, subIndex)}
                                                                readOnly
                                                            />

                                                            {openDateIndexSub?.[0] === index && openDateIndexSub?.[1] === subIndex && (
                                                                <Box
                                                                    sx={{
                                                                        position: "fixed",
                                                                        top: 0,
                                                                        left: 0,
                                                                        width: "100vw",
                                                                        height: "100vh",
                                                                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                                                                        zIndex: 5,
                                                                        display: "flex",
                                                                        justifyContent: "center",
                                                                        alignItems: "center",
                                                                    }}
                                                                    onClick={() => setOpenDateIndexSub(null)}
                                                                >
                                                                    <Box onClick={(e) => e.stopPropagation()}>
                                                                        <DatePick
                                                                            onConfirm={(date) => handleDateConfirmSub(date, index, subIndex)}
                                                                            onClose={() => setOpenDateIndexSub(null)}
                                                                        />
                                                                    </Box>
                                                                </Box>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}

                                                <TableRow>
                                                    <TableCell colSpan={6} sx={{ border: 0, padding: 0 }}>
                                                        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", border: "2px dashed #1976d2", margin: "auto", padding: "8px", color: "#1976d2", cursor: "pointer" }}
                                                            onClick={() => handleAddSubpoint(index)}
                                                        >
                                                            <AddCircleOutlineIcon sx={{ marginRight: 1 }} />
                                                            <Typography>Add Subpoint</Typography>
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            </>
                                        )
                                    })}
                                    <TableRow>
                                        <TableCell colSpan={6} sx={{ border: 0, padding: 0 }}>
                                            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", border: "2px dashed #1976d2", margin: "auto", padding: "8px", color: "#1976d2", cursor: "pointer" }}
                                                onClick={handleAddTopic}
                                            >
                                                <AddCircleOutlineIcon sx={{ marginRight: 1 }} />
                                                <Typography>Add New Points</Typography>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                </>

                            </TableBody>

                        </Table>
                        <button onClick={() => submitPoints()}>Save</button>
                    </TableContainer>
                ) : (
                    <TableContainer sx={{ margin: "auto", border: "1px solid #ddd", borderTop: "none" }}>
                        <Table sx={{ borderCollapse: "collapse" }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={headerCellStyle}>S.No</TableCell>
                                    <TableCell sx={headerCellStyle}>Points to be Discussed</TableCell>
                                    <TableCell sx={headerCellStyle}>Todo</TableCell>
                                    <TableCell sx={headerCellStyle}>Status</TableCell>
                                    <TableCell sx={headerCellStyle}>Responsibility</TableCell>
                                    <TableCell sx={headerCellStyle}>Deadline</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {points.map((point, index) => {
                                    const isRowDisabled = isRejected(point.responsibleId);

                                    // Common style for disabled elements
                                    const disabledStyle = isRowDisabled ? {
                                        opacity: 1.0,
                                        pointerEvents: 'none',
                                        backgroundColor: '#f5f5f5'
                                    } : {};

                                    // Merge with existing cell style
                                    const mergedCellStyle = {
                                        ...cellStyle,
                                        ...(isRowDisabled && { backgroundColor: '#f5f5f5' })
                                    };

                                    return (
                                        <TableRow
                                            key={index}
                                            sx={isRowDisabled ? { backgroundColor: '#f5f5f5' } : {}}
                                        >
                                            <TableCell sx={mergedCellStyle}>{index + 1}</TableCell>
                                            <TableCell sx={{ ...mergedCellStyle, fontWeight: "normal" }}>
                                                <TextField
                                                    variant="standard"
                                                    placeholder="Points forward"
                                                    multiline
                                                    fullWidth
                                                    value={point.point_name}
                                                    minRows={1}
                                                    maxRows={4}
                                                    disabled={isRowDisabled}
                                                    InputProps={{
                                                        disableUnderline: true,
                                                        sx: {
                                                            fontSize: '14px',
                                                            fontWeight: 'bold',
                                                            ...disabledStyle
                                                        }
                                                    }}
                                                    onChange={(e) => handleChange(index, 'point_name', e.target.value)}
                                                />
                                            </TableCell>
                                            <TableCell sx={mergedCellStyle}>
                                                <TextField
                                                    variant="standard"
                                                    placeholder="Add remarks"
                                                    fullWidth
                                                    disabled={true}
                                                    InputProps={{
                                                        disableUnderline: true,
                                                        sx: disabledStyle
                                                    }}
                                                    value={point.todo || point.old_todo || ''}
                                                    onChange={(e) => handleChange(index, 'todo', e.target.value)}
                                                />
                                            </TableCell>
                                            <TableCell sx={mergedCellStyle}>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                                    {(points[index].status == 'Approve' || points[index].status == null) &&
                                                        <Button
                                                            variant={point.status === "Approve" ? "contained" : "outlined"}
                                                            disabled={isRowDisabled}
                                                            sx={{
                                                                color: point.status === "Approve" ? "white" : "green",
                                                                borderColor: "green",
                                                                backgroundColor: point.status === "Approve" ? "green" : "#e6f8e6",
                                                                textTransform: "none",
                                                                borderRadius: "14px",
                                                                padding: "6px 40px",
                                                                fontSize: '10px',
                                                                gap: 0.5,
                                                                "&:hover": {
                                                                    backgroundColor: point.status === "Approve" ? "darkgreen" : "#d4edda"
                                                                },
                                                                ...(isRowDisabled && {
                                                                    opacity: 0.6,
                                                                    pointerEvents: 'none',
                                                                    backgroundColor: point.status === "Approve" ? "green" : "#e6f8e6",
                                                                })
                                                            }}
                                                            onClick={() => {
                                                                approvePoint(point.point_id, "APPROVED", point, index);
                                                            }}
                                                        >
                                                            Approve
                                                        </Button>}
                                                    {(points[index].status == 'Not Approve' || points[index].status == null) && <Button
                                                        variant={point.status === "Not Approve" ? "contained" : "outlined"}
                                                        disabled={isRowDisabled}
                                                        sx={{
                                                            color: point.status === "Not Approve" ? "white" : "red",
                                                            borderColor: "red",
                                                            backgroundColor: point.status === "Not Approve" ? "red" : "#fdecec",
                                                            textTransform: "none",
                                                            borderRadius: "14px",
                                                            padding: "6px 30px",
                                                            fontSize: '10px',
                                                            gap: 0.5,
                                                            "&:hover": {
                                                                backgroundColor: point.status === "Not Approve" ? "darkred" : "#f8d7da"
                                                            },
                                                            ...(isRowDisabled && {
                                                                opacity: 0.6,
                                                                pointerEvents: 'none',
                                                                backgroundColor: point.status === "Not Approve" ? "red" : "#fdecec",
                                                            })
                                                        }}
                                                        onClick={() => {
                                                            approvePoint(point.point_id, "NOT APPROVED", point, index);
                                                        }}
                                                    >
                                                        Not Approve
                                                    </Button>}
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ ...mergedCellStyle, p: 1 }}>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                                    <TextField
                                                        variant="standard"
                                                        placeholder="Select Member"
                                                        fullWidth
                                                        disabled={isRowDisabled}
                                                        InputProps={{
                                                            disableUnderline: true,
                                                            sx: isRowDisabled ? disabledStyle : {}
                                                        }}
                                                        value={point.responsible}
                                                        onChange={(e) => handleChange(index, 'responsible', e.target.value)}
                                                        sx={{
                                                            px: 1,
                                                            py: 0.5,
                                                            borderRadius: 1,
                                                            bgcolor: isRejected(point.responsibleId) ? '#ffe5e5' : 'transparent',
                                                            fontWeight: isRejected(point.responsibleId) ? 'bold' : 'normal',
                                                            color: isRejected(point.responsibleId) ? 'error.main' : 'inherit',
                                                        }}
                                                    />
                                                    {isRejected(point.responsibleId) && (
                                                        <Typography
                                                            component="a"
                                                            onClick={() => handleViewReason(point.responsibleId, point.responsible)}
                                                            sx={{
                                                                fontSize: '0.8rem',
                                                                color: 'error.main',
                                                                cursor: 'pointer',
                                                                textDecoration: 'underline',
                                                                ml: 1
                                                            }}
                                                        >
                                                            View reason
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </TableCell>

                                            {/* Show reason popup */}
                                            {selectedReason && (
                                                <Reason data={selectedReason} onClose={() => setSelectedReason(null)} />
                                            )}

                                            <TableCell sx={mergedCellStyle}>
                                                <TextField
                                                    variant="standard"
                                                    placeholder="Select Date"
                                                    fullWidth
                                                    disabled={isRowDisabled}
                                                    InputProps={{
                                                        disableUnderline: true,
                                                        sx: isRowDisabled ? disabledStyle : {}
                                                    }}
                                                    value={point.point_deadline ? format(new Date(point.point_deadline), 'dd MMM yyyy') : 'NIL'}
                                                    onChange={(e) => handleChange(index, 'point_deadline', e.target.value)}
                                                />
                                            </TableCell>
                                        </TableRow>

                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )
                }

                {/* Forwarding Form Modal */}
                {
                    isForward &&
                    <Box
                        sx={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            width: "100vw",
                            height: "100vh",
                            backgroundColor: "rgba(0, 0, 0, 0.5)",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            zIndex: 5,
                        }}
                        onClick={() => setIsForward(false)}
                    >
                        <Box onClick={(e) => e.stopPropagation()}>
                            <ForwardingForm onClose={() => setIsForward(false)} selectedAction={selectedAction} remarks={selectedPoint.remarks_by_admin || ''} pointId={selectedPoint.point_id || ''} selectedPoint={selectedPoint} handleChangeStatus={handleChangeStatus} />
                        </Box>
                    </Box>
                }
            </Box >
        </Box >
    );
}
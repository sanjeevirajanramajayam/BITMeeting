import { useEffect, useState } from "react";
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, IconButton, Tooltip } from "@mui/material";
import Autocomplete from '@mui/material/Autocomplete';
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AttendanceIcon from "@mui/icons-material/HowToReg";
import AgendaIcon from "@mui/icons-material/Groups";
import ForwardingForm from "./MeetingPage2";
import image from "../assets/bannariammanheader.png";
import { useNavigate } from "react-router-dom";
import { useLocation } from 'react-router-dom';
import InfoIcon from '@mui/icons-material/Info';
import axios, { all } from "axios";
import Reason from "../components/ViewReason";
import { format } from "date-fns";

// Table cell styles
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
    const navigate = useNavigate();

    // State management
    const [status, setStatus] = useState(null);
    const [onStart, setOnStart] = useState(false);
    const [selectedTab, setSelectedTab] = useState("attendance");
    const [isForward, setIsForward] = useState(false);
    const [selectedAction, setSelectedAction] = useState(null);
    const [rejectionRecords, setRejectionRecords] = useState([]);

    const [points, setPoints] = useState(
        meetingData.points.map(point => ({
            ...point,
            point_status: point.point_status || ""
        }))
    );

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
            console.log(point)
            if (point.todo || point.old_todo) {
                const response = await axios.post('http://localhost:5000/api/meetings/approve-point', sentobj, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                })
                console.log(response.data)
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
            console.log(err)
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
        console.log(updatedPoints)
    };

    const handleChange = (index, field, value) => {
        const updatedPoints = [...points];
        updatedPoints[index][field] = value;
        setPoints(updatedPoints);
    };

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
            console.log(isRejected(meetingDataPoints.points[i].responsible_user.id))
            if (meetingDataPoints.points[i].status != "APPROVED" && !isRejected(meetingDataPoints.points[i].responsible_user.id)) {
                flag = 1;
            }
        }
        console.log(flag)
        if (flag == 0) {

            const response = await axios.post(`http://localhost:5000/api/meetings/start-meeting/`, { meetingId: id }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            })
            console.log(response.data)

            return true
        }
        return false

    }

    const getRejectionReason = (userId) => {
        const record = rejectionRecords.find(r => r.user_id === userId);
        console.log(record?.reason)
        return record ? record.reason : '';
    };


    useEffect(() => {

        console.log(meetingData)
        meetingData.points.forEach((point, index) => {
            var status = point.approved_by_admin;
            console.log("status", status)
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
                console.log("Rejection Records:", data);

                setRejectionRecords(data.data);
            } catch (err) {
                console.error('Failed to fetch rejection records:', err);
            }
        };

        if (meetingData.id) fetchRejectionRecords();
    }, [meetingData.id]);


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
                            onClick={() => {navigate('/editpoints', { state: { meetingData } })}}
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
                            onClick={() => navigate("/dashboardrightpanel")}
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
                                        value={meetingData?.date || ""}
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
                                <TableRow>
                                    <TableCell sx={{ ...cellStyle, textAlign: "center" }}>1</TableCell>
                                    <TableCell sx={{ ...cellStyle, textAlign: "center" }}>John Doe (Manager)</TableCell>
                                    <TableCell sx={{ ...cellStyle, textAlign: "center" }}>Chairperson</TableCell>
                                    <TableCell sx={{ ...cellStyle, textAlign: "center" }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                                            <Button
                                                variant={status === "Present" ? "contained" : "outlined"}
                                                sx={{
                                                    width: '100px',
                                                    color: status === "Present" ? "white" : "green",
                                                    borderColor: "green",
                                                    backgroundColor: status === "Present" ? "green" : "#e6f8e6",
                                                    textTransform: "none",
                                                    borderRadius: "14px",
                                                    fontSize: '10px',
                                                    gap: 0.5,
                                                    "&:hover": {
                                                        backgroundColor: status === "Present" ? "darkgreen" : "#d4edda",
                                                    },
                                                }}
                                                onClick={() => setStatus("Present")}
                                            >
                                                Present
                                            </Button>
                                            <Button
                                                variant={status === "Absent" ? "contained" : "outlined"}
                                                sx={{
                                                    width: '100px',
                                                    color: status === "Absent" ? "white" : "red",
                                                    borderColor: "red",
                                                    backgroundColor: status === "Absent" ? "red" : "#fdecec",
                                                    textTransform: "none",
                                                    borderRadius: "14px",
                                                    fontSize: '10px',
                                                    gap: 0.5,
                                                    "&:hover": {
                                                        backgroundColor: status === "Absent" ? "darkred" : "#f8d7da",
                                                    },
                                                }}
                                                onClick={() => setStatus("Absent")}
                                            >
                                                Absent
                                            </Button>
                                        </Box>
                                    </TableCell>
                                </TableRow>
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
                                {points.map((point, index) => (
                                    <TableRow key={index}>
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
                                                value={point.remarks}
                                                onChange={(e) => handleChange(index, 'remarks', e.target.value)}
                                                InputProps={{ disableUnderline: true }}
                                            />
                                        </TableCell>

                                        <TableCell sx={{ ...cellStyle, textAlign: "center" }}>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 1 }}>
                                                <Button
                                                    variant={point.approved_by_admin === "APPROVED" ? "contained" : "outlined"}
                                                    sx={{
                                                        color: point.approved_by_admin === "APPROVED" ? "white" : "green",
                                                        borderColor: "green",
                                                        backgroundColor: point.approved_by_admin === "APPROVED" ? "green" : "#e6f8e6",
                                                        textTransform: "none",
                                                        borderRadius: "14px",
                                                        padding: "6px 40px",
                                                        fontSize: '10px',
                                                        gap: 0.5,
                                                        "&:hover": {
                                                            backgroundColor: point.approved_by_admin === "APPROVED" ? "darkgreen" : "#d4edda",
                                                        },
                                                    }}
                                                    onClick={() => {
                                                        approvePoint(point.point_id, "APPROVED");
                                                        handleStatusChange(index, "Approve")
                                                    }}
                                                >
                                                    Approve
                                                </Button>
                                                <Button
                                                    variant={point.approved_by_admin === "NOT APPROVED" ? "contained" : "outlined"}
                                                    sx={{
                                                        color: point.approved_by_admin === "NOT APPROVED" ? "white" : "red",
                                                        borderColor: "red",
                                                        backgroundColor: point.approved_by_admin === "NOT APPROVED" ? "red" : "#fdecec",
                                                        textTransform: "none",
                                                        borderRadius: "14px",
                                                        padding: "6px 30px",
                                                        fontSize: '10px',
                                                        gap: 0.5,
                                                        "&:hover": {
                                                            backgroundColor: point.approved_by_admin === "NOT APPROVED" ? "darkred" : "#f8d7da",
                                                        },
                                                    }}
                                                    onClick={() => {
                                                        approvePoint(point.point_id, "NOT APPROVED");
                                                        handleStatusChange(index, "NotApprove")
                                                    }}
                                                >
                                                    Not Approve
                                                </Button>
                                            </Box>
                                        </TableCell>

                                        <TableCell sx={cellStyle}>
                                            <TextField
                                                variant="standard"
                                                placeholder="Select Member"
                                                fullWidth
                                                value={point.responsible}
                                                onChange={(e) => handleChange(index, 'responsible', e.target.value)}
                                                InputProps={{ disableUnderline: true }}
                                            />
                                        </TableCell>
                                        <TableCell sx={cellStyle}>
                                            <TextField
                                                variant="standard"
                                                placeholder="Select Date"
                                                fullWidth
                                                value={point.point_deadline}
                                                onChange={(e) => handleChange(index, 'point_deadline', e.target.value)}
                                                InputProps={{ disableUnderline: true }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
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
                                                    disabled={isRowDisabled}
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
                                                    value={format(new Date(point.point_deadline), 'dd MMM yyyy')}
                                                onChange={(e) => handleChange(index, 'point_deadline', e.target.value)}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {/* Forwarding Form Modal */}
                {isForward && (
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
                            <ForwardingForm onClose={() => setIsForward(false)} selectedAction={selectedAction} />
                        </Box>
                    </Box>
                )}
            </Box>
        </Box>
    );
}
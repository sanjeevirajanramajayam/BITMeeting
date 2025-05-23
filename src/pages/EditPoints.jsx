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
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import DatePick from "../components/date";


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

export default function EditPoints({ handleBack }) {

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
    const [selectedDate, setSelectedDate] = useState({});
    const [openDateIndex, setOpenDateIndex] = useState(null);
    
    const handleDateConfirm = (date, index) => {
        const formattedDate = date.format("YYYY-MM-DD");
        setSelectedDate((prev) => ({ ...prev, [index]: formattedDate }));

        // Update the points state with the new deadline
        setPoints(prevPoints => {
            const updatedPoints = [...prevPoints];
            updatedPoints[index] = {
                ...updatedPoints[index],
                point_deadline: formattedDate
            };
            return updatedPoints;
        });

        setOpenDateIndex(null);
    };



    const [points, setPoints] = useState(
        meetingData.points.map(point => ({
            ...point,
            point_status: point.point_status || ""
        }))
    );

    console.log(points)

    const handleChange = (index, field, value) => {
        setPoints(prevPoints => {
            const updatedPoints = [...prevPoints];
            updatedPoints[index] = {
                ...updatedPoints[index],
                [field]: value
            };
            return updatedPoints;
        });
    };


    const submitPoints = async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            console.error("No auth token found in localStorage");
            return;
        }

        const formatMySQLDateTime = (date) => {
            if (!date) return null;
            return new Date(date).toISOString().slice(0, 19).replace('T', ' ');
        };

        const updatedPoints = points.map(point => ({
            ...point,
            point_deadline: formatMySQLDateTime(point.point_deadline)
        }));

        console.log(updatedPoints)

        const promises = updatedPoints.map((point) =>
            axios.post("http://localhost:5000/api/meetings/update-point", point, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
        );

        await Promise.all(promises);
        meetingData.points = points;
        // Navigate after successful submission
        navigate("/admin-access", { state: { meetingData } });

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

    useEffect(() => {
        console.log("Points updated:", points);
    }, [points]);

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

    const handleStatusChange = (index, newStatus) => {
        const updatedPoints = [...points];
        updatedPoints[index].status = newStatus;
        setPoints(updatedPoints);
        console.log(updatedPoints)
    };

    const allMembers = Object.values(meetingData.members).flatMap(roleMembers =>
        roleMembers.map(member => ({
            id: member.user_id,
            name: member.name
        }))
    );

    const isRejected = (userId) => {
        if (rejectionRecords) {
            return rejectionRecords.some(record => record.user_id === userId);
        }
        else {
            return false
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
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, padding: "6px", backgroundColor: "white", borderRadius: "8px" }}>
                    <Button
                        variant="contained"
                        onClick={() => { console.log('clocik'); submitPoints() }}
                        sx={{
                            borderRadius: '5px',
                            backgroundColor: "#6c757d",
                            textTransform: "none",
                            gap: "8px",
                            "&:hover": { backgroundColor: "#5a6268" },
                        }}
                    >
                        <DescriptionOutlinedIcon sx={{ fontSize: "18px" }} />
                        Save Points
                    </Button>
                </Box>
            </Box>

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
                                // const isRowDisabled = isRejected(point.responsibleId);

                                // // Common style for disabled elements
                                // const disabledStyle = isRowDisabled ? {
                                //     opacity: 1.0,
                                //     pointerEvents: 'none',
                                //     backgroundColor: '#f5f5f5'
                                // } : {};

                                // Merge with existing cell style
                                const mergedCellStyle = {
                                    ...cellStyle,
                                    // ...(isRowDisabled && { backgroundColor: '#f5f5f5' })
                                };

                                return (
                                    <TableRow
                                        key={index}
                                        sx={{ backgroundColor: '#f5f5f5' }}
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
                                                InputProps={{
                                                    disableUnderline: true,
                                                    sx: {
                                                        fontSize: '14px',
                                                        fontWeight: 'bold',
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
                                                InputProps={{
                                                    disableUnderline: true,
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
                                                            }
                                                        }}
                                                        onClick={() => {
                                                            approvePoint(point.point_id, "APPROVED", point, index);
                                                        }}
                                                    >
                                                        Approve
                                                    </Button>}
                                                {(points[index].status == 'Not Approve' || points[index].status == null) && <Button
                                                    variant={point.status === "Not Approve" ? "contained" : "outlined"}
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
                                                                sx: {}
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
                                            </Box>
                                        </TableCell>

                                        {/* Show reason popup */}
                                        {selectedReason && (
                                            <Reason data={selectedReason} onClose={() => setSelectedReason(null)} />
                                        )}

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
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>

            </Box>
        </Box>
    );
}
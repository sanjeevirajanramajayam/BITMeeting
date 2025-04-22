import { useState, useEffect } from "react";
import { Card, Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, IconButton } from "@mui/material";
import Autocomplete from '@mui/material/Autocomplete';
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import CloseIcon from "@mui/icons-material/Close";
import { useLocation, useNavigate } from "react-router-dom";
import AttendanceIcon from "@mui/icons-material/HowToReg";
import AgendaIcon from "@mui/icons-material/Groups";
import axios from "axios";
import CancelIcon from '@mui/icons-material/Cancel';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import MeetingRejection from "../components/MeetingRejection";
import { FormatBold, FormatItalic, FormatUnderlined, FormatAlignLeft, FormatAlignCenter, FormatAlignRight, Link } from "@mui/icons-material";
import image from "../assets/bannariammanheader.png";
import format from "date-fns/format";

const Reject = ({ onClose, handleSave }) => {
    return (
        <Card sx={{ borderRadius: 3, p: 2, width: '800px' }}>

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 1 }}>
                <Typography sx={{ color: "#3D3939", fontWeight: "bold", fontSize: "18px" }}>Meeting Rejection</Typography>
                <IconButton
                    sx={{
                        border: "2px solid #FB3748",
                        borderRadius: "50%",
                        p: 0.5,
                        "&:hover": { backgroundColor: "transparent" },
                    }}
                    onClick={onClose}
                >
                    <CloseIcon sx={{ fontSize: 18, color: "#FB3748" }} />
                </IconButton>
            </Box>

            <Box sx={{ p: 1 }}>
                <Typography sx={{ fontWeight: "bold", mb: 1 }}>Reason</Typography>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        border: "1px solid #ccc",
                        borderRadius: 1,
                        p: 1,
                        width: "100%",
                        position: "relative",
                    }}
                >
                    <Box sx={{ position: "absolute", top: 4, right: 8, display: "flex", gap: 1 }}>
                        <IconButton size="small"><FormatBold fontSize="small" /></IconButton>
                        <IconButton size="small"><FormatUnderlined fontSize="small" /></IconButton>
                        <IconButton size="small"><FormatItalic fontSize="small" /></IconButton>
                        <IconButton size="small"><FormatAlignLeft fontSize="small" /></IconButton>
                        <IconButton size="small"><FormatAlignCenter fontSize="small" /></IconButton>
                        <IconButton size="small"><FormatAlignRight fontSize="small" /></IconButton>
                        <IconButton size="small"><Link fontSize="small" /></IconButton>
                    </Box>

                    <TextField
                        variant="standard"
                        placeholder="Your text goes here"
                        multiline
                        fullWidth
                        InputProps={{
                            disableUnderline: true,
                            sx: { fontSize: 14, px: 1, pt: 4 },
                        }}
                        sx={{
                            "& .MuiInputBase-root": {
                                paddingTop: "30px",
                            },
                            width: "100%",
                        }}
                    />
                </Box>
            </Box>

            <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end", gap: 2 }}>
                <Button
                    variant="outlined"
                    sx={{
                        borderColor: "red",
                        color: "red",
                        textTransform: "none",
                        marginRight: "10px",
                        width: '180px',
                    }}
                    onClick={onClose}
                >
                    Cancel
                </Button>

                <Button
                    variant="contained"
                    sx={{ backgroundColor: "#408FEA", color: "white", textTransform: "none", width: 180 }}
                    onClick={handleSave}
                >
                    Save & Next
                </Button>
            </Box>
        </Card>
    );
};

export default function JoinMeet() {
    const navigate = useNavigate();
    const [openRejectCard, setOpenRejectCard] = useState(false);
    const [isAccpet, setIsAccept] = useState(false);
    const [onJoin, setOnJoin] = useState(false);
    const [selectedTab, setSelectedTab] = useState("attendance");
    const [pointData, setPointData] = useState([]);
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [meetingAgenda, setMeetingAgenda] = useState([]);

    const onBack = () => {
        navigate('/dashboard')
    }

    const location = useLocation();
    const { meetingData } = location.state || {};

    const handleCancelMeeting = () => {
        setOpenRejectCard(true);
    };

    const handleCloseRejectCard = () => {
        setOpenRejectCard(false);
        navigate('/dashboard')
    };

    useEffect(() => {
        const fetchAttendanceData = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:5000/api/meetings/get-attendance-records/${meetingData.id}`
                );
                console.log(response.data.data)
                setAttendanceRecords(response.data.data);
            } catch (err) {
                console.error(err)
                const allMembers = Object.values(meetingData.members).flat();
                setAttendanceRecords(allMembers.map(member => ({
                    name: member.name,
                    attendance_status: 'absent',
                })));
            }
        };
        fetchAttendanceData();
    }, [meetingData.id]);

    useEffect(() => {
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
            }
        }

        const fetchAttendanceData = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:5000/api/meetings/get-attendance-records/${meetingData.id}`
                );
                console.log(response.data.data)
                setAttendanceRecords(response.data.data);
            } catch (err) {
                console.error(err)
                const allMembers = Object.values(meetingData.members).flat();
                setAttendanceRecords(allMembers.map(member => ({
                    name: member.name,
                    attendance_status: 'absent',
                })));
            }
        };

        const interval = setInterval(() => {
            fetchAgenda(),
                fetchAttendanceData()
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const sendTodo = async (pointId, todo, status) => {
        try {
            const token = localStorage.getItem('token');
            const sentobj = {
                pointId,
                todo,
                status,
                remarks: todo
            };

            const response = await axios.post(
                'http://localhost:5000/api/meetings/set-todo',
                sentobj,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setPointData(prevData =>
                prevData.map(point =>
                    point.pointId === pointId
                        ? { ...point, todo, point_status: status }
                        : point
                )
            );

        } catch (err) {
            console.log(err);
        }
    };

    const acceptMeeting = async (status) => {
        try {
            const meetingId = meetingData.id;
            const token = localStorage.getItem('token');
            const sentobj = { meetingId, status };

            const response = await axios.post(
                'http://localhost:5000/api/meetings/respond',
                sentobj,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setIsAccept(status === 'accept');
        } catch (err) {
            console.log(err);
        }
    };

    const joinMeeting = async (status) => {
        try {
            const meetingId = meetingData.id;
            const token = localStorage.getItem('token');
            const sentobj = { meetingId, status };

            const response = await axios.post(
                'http://localhost:5000/api/meetings/respond',
                sentobj,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setIsAccept(status === 'accept');
        } catch (err) {
            console.log(err);
        }
    };

    const setMeetingState = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                'http://localhost:5000/api/meetings/get-response',
                { meetingId: meetingData.id },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log(response.data)

            if (response.data.accepted_status === 'accept') {
                setIsAccept(true);
            }
            else if (response.data.accepted_status === 'joined') {
                setOnJoin(true);
            }
        } catch (error) {
            console.error("Error getting meeting state:", error);
        }
    };

    const fetchMeetings = async () => {
        try {
            const token = localStorage.getItem('token');
            const meetingId = meetingData.id;
            const response = await fetch(
                'http://localhost:5000/api/meetings/get-responsibility',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ meetingId }),
                }
            );
            const data = await response.json();

            if (!data.data) {
                setPointData([]);
            } else {
                setPointData(
                    data.data.map(point => ({
                        ...point,
                        point_status: point.point_status || null,
                        todo: point.todo || ''
                    }))
                );
            }
        } catch (error) {
            console.error("Failed to fetch meetings:", error);
        }
    };

    useEffect(() => {
        if (meetingData) {
            setMeetingState();
            fetchMeetings();
        }
    }, [meetingData]);

    const handleTodoChange = (pointId, value) => {
        setPointData(prevData =>
            prevData.map(point =>
                point.pointId === pointId
                    ? { ...point, todo: value }
                    : point
            )
        );
    };

    const startMeeting = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:5000/api/meetings/meeting/${meetingData.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.meeting_status == 'not_started') {
                alert('meeting not started')
            }
            else if (response.data.meeting_status == 'in_progress') {
                joinMeeting('joined')
                isAccpet && setOnJoin(true)
            }
        } catch (error) {
            console.error('Error fetching meeting:', error.response?.data || error.message);
        }
    }

    console.log(pointData)

    return (
        <Box sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "90vh"
        }}>
            <Box sx={{
                display: "flex",
                flexDirection: "column",
                minHeight: "90vh",
                backgroundColor: "#f5f5f5",
                padding: "16px",
                borderRadius: "8px",
                boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
                width: '100%',
                maxWidth: '1200px'
            }}>
                {/* Header Section */}
                <Box sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 0",
                    gap: 2
                }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box sx={{ display: "flex", padding: "5px", backgroundColor: "white" }}>
                            <ArrowBackIcon sx={{ cursor: "pointer" }} onClick={onBack} />
                        </Box>
                        <Typography variant="h6" fontWeight="bold">
                            {meetingData?.title}
                            <Typography sx={{ fontSize: '12px' }}>
                                {meetingData?.date || 'No date specified'}
                            </Typography>
                        </Typography>
                    </Box>

                    {!onJoin ? (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, padding: "6px", backgroundColor: "white", borderRadius: "8px" }}>
                            <Button
                                variant="contained"
                                sx={{
                                    backgroundColor: "#6c757d",
                                    textTransform: "none",
                                    gap: "5px",
                                    "&:hover": { backgroundColor: "#5a6268" },
                                }}
                            >
                                <DescriptionOutlinedIcon sx={{ fontSize: "18px" }} />
                                Edit Points
                            </Button>
                            <Button
                                variant="contained"
                                sx={{
                                    backgroundColor: isAccpet ? "#007bff" : "#d3d3d3",
                                    textTransform: "none",
                                    gap: "5px",
                                    "&:hover": { backgroundColor: isAccpet ? "#0069d9" : "#d3d3d3" },
                                }}

                                onClick={() => { startMeeting() }}
                                disabled={!isAccpet}
                            >
                                <AutoAwesomeOutlinedIcon sx={{ fontSize: "18px" }} />
                                Join Meeting
                            </Button>
                        </Box>
                    ) : (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, padding: "6px", backgroundColor: "white", borderRadius: "8px", width: '270px' }}>
                            <Button
                                variant="contained"
                                sx={{ width: '100%', backgroundColor: "#FC7A85", textTransform: "none", gap: "5px" }}
                                onClick={() => {
                                    setOnJoin(false);
                                    navigate('/dashboard')
                                }}
                            >
                                <AutoAwesomeOutlinedIcon sx={{ fontSize: "18px" }} />
                                Leave Meeting
                            </Button>
                        </Box>
                    )}
                </Box>

                {/* Accept/Reject Section */}
                {!onJoin && !isAccpet && (
                    <Box sx={{
                        display: 'flex',
                        padding: '8px',
                        backgroundColor: 'white',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '16px'
                    }}>
                        <Typography sx={{ fontSize: '15px' }}>Accept to Join the Meeting</Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, padding: "6px", backgroundColor: "white", borderRadius: "8px" }}>
                            <Button
                                variant="outlined"
                                sx={{
                                    color: "red",
                                    borderColor: "red",
                                    backgroundColor: "#fdecec",
                                    textTransform: "none",
                                    borderRadius: "14px",
                                    padding: "6px 40px",
                                    fontSize: '10px',
                                    gap: 0.5,
                                    "&:hover": { backgroundColor: "#f8d7da" },
                                }}
                                onClick={handleCancelMeeting}
                            >
                                <CancelIcon sx={{ color: "red", fontSize: '10px' }} />
                                Reject
                            </Button>
                            <Button
                                variant="outlined"
                                sx={{
                                    color: "green",
                                    borderColor: "green",
                                    backgroundColor: "#e6f8e6",
                                    textTransform: "none",
                                    borderRadius: "14px",
                                    padding: "6px 40px",
                                    fontSize: '10px',
                                    gap: 0.5,
                                    "&:hover": { backgroundColor: "#d4edda" },
                                }}
                                onClick={() => {
                                    setIsAccept(true);
                                    acceptMeeting('accept');
                                }}
                            >
                                <CheckBoxIcon sx={{ color: "green", fontSize: '10px' }} />
                                Accept
                            </Button>
                        </Box>
                    </Box>
                )}

                {/* Reject Card Modal */}
                {openRejectCard && (
                    <Box sx={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        backgroundColor: "rgba(0,0,0,0.5)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 999
                    }}>
                        <MeetingRejection
                            onClose={handleCloseRejectCard}
                            meetingId={meetingData.id}   // You must pass this from parent
                            token={localStorage.getItem('token')}               // Your JWT token from context/localStorage
                        />

                    </Box>
                )}

                {/* Meeting Content */}
                <Box sx={{
                    display: "flex",
                    backgroundColor: "white",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: 'column',
                    marginTop: '10px',
                    padding: '20px',
                    borderRadius: '8px'
                }}>
                    <img
                        src={image}
                        alt="Meeting"
                        style={{
                            width: "50%",
                            height: "auto",
                            padding: "10px",
                            marginBottom: '20px'
                        }}
                    />

                    {/* Meeting Details Table */}
                    <TableContainer sx={{
                        width: '100%',
                        margin: "auto",
                        mt: 3,
                        border: "1px solid #ddd",
                        borderBottom: 'none',
                        marginBottom: '20px'
                    }}>
                        <Table sx={{ borderCollapse: "collapse" }}>
                            <TableBody>
                                <TableRow>
                                    <TableCell sx={cellStyle}>Name of the Meeting</TableCell>
                                    <TableCell sx={cellStyle}>
                                        <TextField
                                            variant="standard"
                                            placeholder="Ex. 8th BoS Meeting"
                                            fullWidth
                                            value={meetingData?.title || ''}
                                            InputProps={{ disableUnderline: true }}
                                        />
                                    </TableCell>
                                    <TableCell sx={cellStyle}>Reference Number</TableCell>
                                    <TableCell sx={cellStyle}>
                                        <TextField
                                            variant="standard"
                                            placeholder="Auto generate"
                                            fullWidth
                                            InputProps={{
                                                disableUnderline: true,
                                                sx: { fontStyle: 'italic', color: '#777' }
                                            }}
                                        />
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell sx={cellStyle}>Meeting Description</TableCell>
                                    <TableCell colSpan={3} sx={{ ...cellStyle }}>
                                        <TextField
                                            variant="standard"
                                            multiline
                                            fullWidth
                                            placeholder="Meeting description..."
                                            rows={4}
                                            value={meetingData?.description || ''}
                                            InputProps={{
                                                disableUnderline: true,
                                                sx: { fontStyle: 'italic', color: '#555' }
                                            }}
                                        />
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell sx={cellStyle}>Repeat Type</TableCell>
                                    <TableCell sx={cellStyle}>
                                        <TextField
                                            placeholder="Ex. Monthly"
                                            value={meetingData?.repeat_type || ''}
                                            variant="standard"
                                            InputProps={{ disableUnderline: true }}
                                        />
                                    </TableCell>
                                    <TableCell sx={cellStyle}>Priority Type</TableCell>
                                    <TableCell sx={cellStyle}>
                                        <Autocomplete
                                            disablePortal
                                            sx={{
                                                "&.MuiAutocomplete-endAdornment": { display: "none" },
                                            }}
                                            value={meetingData?.priority || ''}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    placeholder="Ex. High Priority"
                                                    variant="standard"
                                                    InputProps={{
                                                        ...params.InputProps,
                                                        disableUnderline: true,
                                                    }}
                                                />
                                            )}
                                        />
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell sx={cellStyle}>Venue Details</TableCell>
                                    <TableCell sx={cellStyle}>
                                        <TextField
                                            variant="standard"
                                            placeholder="Select venue"
                                            fullWidth
                                            value={meetingData.location || ''}
                                            InputProps={{
                                                disableUnderline: true,
                                                style: { color: "#999" }
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell sx={cellStyle}>Date & Time</TableCell>
                                    <TableCell sx={cellStyle}>
                                        <TextField
                                            variant="standard"
                                            placeholder="Select time"
                                            fullWidth
                                            value={meetingData?.dateText}
                                            InputProps={{ disableUnderline: true }}
                                        />
                                    </TableCell>
                                </TableRow>
                                <TableRow sx={{ backgroundColor: "#f0f0f0" }}>
                                    <TableCell sx={headerStyle}>Roles</TableCell>
                                    <TableCell colSpan={3} sx={headerStyle}>Member list</TableCell>
                                </TableRow>
                                {meetingData?.members && Object.entries(meetingData.members).map(([role, members]) => (
                                    <TableRow key={role}>
                                        <TableCell sx={cellStyle}>
                                            <TextField
                                                variant="standard"
                                                placeholder="Person"
                                                value={role}
                                                fullWidth
                                                InputProps={{ disableUnderline: true }}
                                            />
                                        </TableCell>
                                        <TableCell colSpan={3} sx={cellStyle}>
                                            <TextField
                                                variant="standard"
                                                placeholder="Select Member"
                                                fullWidth
                                                value={members.map(member => member.name).join(', ')}
                                                InputProps={{ disableUnderline: true }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Tabs for Joined Meeting */}
                    {onJoin && (
                        <Box sx={{
                            display: "flex",
                            borderRadius: 2,
                            overflow: "hidden",
                            padding: '6px',
                            backgroundColor: 'white',
                            gap: 2,
                            width: '100%',
                            marginBottom: '16px'
                        }}>
                            <Button
                                onClick={() => setSelectedTab("attendance")}
                                sx={{
                                    flex: 1,
                                    backgroundColor: selectedTab === "attendance" ? "#4285F4" : "transparent",
                                    color: selectedTab === "attendance" ? "#fff" : "#666",
                                    "&:hover": { backgroundColor: selectedTab === "attendance" ? "#357ae8" : "#f0f0f0" },
                                    textTransform: "none",
                                    gap: 2,
                                    transition: "background-color 0.3s, color 0.3s",
                                }}
                            >
                                <AttendanceIcon /> Attendance
                            </Button>
                            <Button
                                onClick={() => setSelectedTab("agenda")}
                                sx={{
                                    flex: 1,
                                    backgroundColor: selectedTab === "agenda" ? "#4285F4" : "transparent",
                                    color: selectedTab === "agenda" ? "#fff" : "#666",
                                    "&:hover": { backgroundColor: selectedTab === "agenda" ? "#357ae8" : "#f0f0f0" },
                                    textTransform: "none",
                                    gap: 2,
                                    transition: "background-color 0.3s, color 0.3s",
                                }}
                            >
                                <AgendaIcon /> Agenda
                            </Button>
                        </Box>
                    )}

                    {/* Points Table */}
                    <TableContainer sx={{
                        width: '100%',
                        margin: "auto",
                        border: "1px solid #ddd",
                        borderTop: onJoin ? "none" : "1px solid #ddd"
                    }}>
                        <Table sx={{ borderCollapse: "collapse" }}>
                            {onJoin && selectedTab === 'attendance' ? (
                                <>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell width="5%" sx={{ ...headerCellStyle, textAlign: 'center' }}>S.No</TableCell>
                                            <TableCell width="35%" sx={{ ...headerCellStyle, textAlign: 'center' }}>Name & Designation</TableCell>
                                            <TableCell width="25%" sx={{ ...headerCellStyle, textAlign: 'center' }}>Role</TableCell>
                                            <TableCell width="25%" sx={{ ...headerCellStyle, textAlign: 'center' }}>Attendance</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {meetingData?.members && Object.entries(meetingData.members).flatMap(([role, members]) =>
                                            members.map((member, index) => {
                                                const attendance = attendanceRecords.find(record => record.userId === member.user_id);
                                                const isPresent = attendance?.attendance_status === 'present';

                                                return (
                                                    <TableRow key={`${role}-${index}`}>
                                                        <TableCell sx={{ ...cellStyle, textAlign: "center" }}>{index + 1}</TableCell>
                                                        <TableCell sx={{ ...cellStyle, textAlign: "center" }}>{member.name}</TableCell>
                                                        <TableCell sx={{ ...cellStyle, textAlign: "center" }}>{role}</TableCell>
                                                        <TableCell sx={{ ...cellStyle, textAlign: "center" }}>
                                                            <Button
                                                                variant="outlined"
                                                                sx={{
                                                                    color: isPresent ? "green" : "red",
                                                                    borderColor: isPresent ? "green" : "red",
                                                                    backgroundColor: isPresent ? "#e6f8e6" : "#ffe6e6",
                                                                    textTransform: "none",
                                                                    borderRadius: "14px",
                                                                    padding: "6px 40px",
                                                                    fontSize: '10px',
                                                                    gap: 0.5,
                                                                    "&:hover": { backgroundColor: isPresent ? "#d4edda" : "#f8d7da" },
                                                                }}
                                                            >
                                                                {isPresent ? (
                                                                    <>
                                                                        {/* <CheckBoxIcon sx={{ color: "green", fontSize: '10px' }} /> */}
                                                                        Present
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        {/* <IndeterminateCheckBoxIcon sx={{ color: "red", fontSize: '10px' }} /> */}
                                                                        Absent
                                                                    </>
                                                                )}
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        )}
                                    </TableBody>
                                </>
                            ) : onJoin && selectedTab === 'agenda' ? (
                                <>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell width="5%" sx={{ ...headerCellStyle, textAlign: 'center' }}>S.No</TableCell>
                                            <TableCell width="30%" sx={{ ...headerCellStyle, textAlign: 'center' }}>Points to be Discussed</TableCell>
                                            <TableCell width="20%" sx={{ ...headerCellStyle, textAlign: 'center' }}>Remarks</TableCell>
                                            <TableCell width="15%" sx={{ ...headerCellStyle, textAlign: 'center' }}>Status</TableCell>
                                            <TableCell width="15%" sx={{ ...headerCellStyle, textAlign: 'center' }}>Responsibility</TableCell>
                                            <TableCell width="15%" sx={{ ...headerCellStyle, textAlign: 'center' }}>Deadline</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {pointData.map((point, index) => {

                                            const ForwardPointData = meetingAgenda.find(item => item.id === point.pointId);
                                            console.log(ForwardPointData)
                                            if (ForwardPointData?.forward_info.type == 'NIL') {
                                                ForwardPointData.forward_info.text = ''
                                            }

                                            return (
                                                <TableRow key={point.pointId}>
                                                    <TableCell sx={{ ...cellStyle, textAlign: "center" }}>{index + 1}</TableCell>
                                                    <TableCell sx={{ ...cellStyle, textAlign: "center" }}>{point.point_name}</TableCell>
                                                    <TableCell sx={{ ...cellStyle, textAlign: "center" }}>{ForwardPointData?.admin_remarks || '-'}</TableCell>
                                                    <TableCell sx={{ ...cellStyle, textAlign: "center" }}>
                                                        <Box
                                                            sx={{
                                                                color:
                                                                    ForwardPointData?.forward_info?.decision === "agree"
                                                                        ? "green"
                                                                        : ForwardPointData?.forward_info?.decision === "not agree"
                                                                            ? "red"
                                                                            : ForwardPointData?.forward_info?.decision === "forward"
                                                                                ? "gray"
                                                                                : "inherit",
                                                                fontWeight: "bold",
                                                            }}
                                                        >
                                                            {ForwardPointData?.forward_info?.decision || "-"}
                                                        </Box>

                                                        <Box sx={{ mt: 1 }}>
                                                            {ForwardPointData?.forward_info?.text?.includes("FORWARDnext") ? (
                                                                <>
                                                                    <div>
                                                                        {
                                                                            ForwardPointData?.forward_info?.text.split("FORWARDnext")[0]
                                                                        }
                                                                    </div>
                                                                    <div style={{ fontWeight: "bold", color: "gray" }}>
                                                                        FORWARDnext
                                                                        {ForwardPointData?.forward_info?.text.split("FORWARDnext")[1]}
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <div>{ForwardPointData?.forward_info?.text}</div>
                                                            )}
                                                        </Box>
                                                    </TableCell>

                                                    <TableCell sx={{ ...cellStyle, textAlign: "center" }}>{point.name || '-'}</TableCell>
                                                    <TableCell sx={{ ...cellStyle, textAlign: "center" }}>{point.point_deadline ? format(new Date(point.point_deadline), 'dd MMM yyyy') : '-'}</TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </>
                            ) : (
                                <>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell width="5%" sx={headerCellStyle}>S.No</TableCell>
                                            <TableCell width="30%" sx={headerCellStyle}>Points to be Discussed</TableCell>
                                            <TableCell width="20%" sx={headerCellStyle}>Todo</TableCell>
                                            {isAccpet && <TableCell width="15%" sx={headerCellStyle}>Status</TableCell>}
                                            <TableCell width="15%" sx={headerCellStyle}>Responsibility</TableCell>
                                            <TableCell width="15%" sx={headerCellStyle}>Deadline</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {pointData.map((point, index) => (
                                            <TableRow key={point.pointId}>
                                                <TableCell sx={cellStyle}>{index + 1}</TableCell>
                                                <TableCell sx={{ ...cellStyle, fontWeight: "normal", maxWidth: "300px" }}>
                                                    <TextField
                                                        variant="standard"
                                                        placeholder="Points forward"
                                                        multiline
                                                        fullWidth
                                                        minRows={1}
                                                        maxRows={4}
                                                        value={point.point_name}
                                                        InputProps={{
                                                            disableUnderline: true,
                                                            sx: { fontSize: '14px', fontWeight: 'bold' }
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell sx={cellStyle}>
                                                    <TextField
                                                        variant="standard"
                                                        placeholder="Add remarks"
                                                        fullWidth
                                                        value={point.todo}
                                                        onChange={(e) => handleTodoChange(point.pointId, e.target.value)}
                                                        InputProps={{ disableUnderline: true }}
                                                    />
                                                </TableCell>
                                                {isAccpet && (
                                                    <TableCell sx={cellStyle}>
                                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                                            {point.point_status !== "not completed" && (
                                                                <Button
                                                                    variant="outlined"
                                                                    sx={{
                                                                        color: "green",
                                                                        borderColor: "green",
                                                                        backgroundColor: "#e6f8e6",
                                                                        textTransform: "none",
                                                                        borderRadius: "14px",
                                                                        padding: "6px 40px",
                                                                        fontSize: '10px',
                                                                        gap: 0.5,
                                                                        "&:hover": { backgroundColor: "#d4edda" },
                                                                    }}
                                                                    onClick={() => sendTodo(point.pointId, point.todo, "completed")}
                                                                >
                                                                    <CheckBoxIcon sx={{ color: "green", fontSize: '10px' }} />
                                                                    Completed
                                                                </Button>
                                                            )}
                                                            {point.point_status !== "completed" && (
                                                                <Button
                                                                    variant="outlined"
                                                                    sx={{
                                                                        color: "red",
                                                                        borderColor: "red",
                                                                        backgroundColor: "#fdecec",
                                                                        textTransform: "none",
                                                                        borderRadius: "14px",
                                                                        padding: "6px 30px",
                                                                        fontSize: '10px',
                                                                        gap: 0.5,
                                                                        "&:hover": { backgroundColor: "#f8d7da" },
                                                                    }}
                                                                    onClick={() => sendTodo(point.pointId, point.todo, "not completed")}
                                                                >
                                                                    <CancelIcon sx={{ color: "red", fontSize: '10px' }} />
                                                                    Not Completed
                                                                </Button>
                                                            )}
                                                        </Box>
                                                    </TableCell>
                                                )}
                                                <TableCell sx={cellStyle}>
                                                    <TextField
                                                        variant="standard"
                                                        placeholder="Select Member"
                                                        fullWidth
                                                        InputProps={{ disableUnderline: true }}
                                                        value={point.name}
                                                    />
                                                </TableCell>
                                                <TableCell sx={cellStyle}>
                                                    <TextField
                                                        variant="standard"
                                                        placeholder="Select Date"
                                                        fullWidth
                                                        InputProps={{ disableUnderline: true }}
                                                        value={point.point_deadline ? format(new Date(point.point_deadline), 'dd MMM yyyy') : 'NIL'}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </>
                            )}
                        </Table>
                    </TableContainer>
                </Box>
            </Box>
        </Box>
    );
}

const cellStyle = {
    border: "1px solid #ddd",
    padding: "10px",
    fontWeight: "bold",
};

const headerStyle = {
    ...cellStyle,
    backgroundColor: "#f0f0f0",
    fontWeight: "bold",
};

const headerCellStyle = {
    border: "1px solid #ddd",
    padding: "10px",
    backgroundColor: "#f0f0f0",
    fontWeight: "bold",
};

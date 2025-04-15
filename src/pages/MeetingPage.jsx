import { useState, useEffect } from "react";
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, IconButton } from "@mui/material";
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

export default function StartMeet({ handleBack }) {

    const location = useLocation();
    const { meetingData } = location.state || {};

    const [status, setStatus] = useState(null);
    const [onStart, setOnStart] = useState(false);
    const navigate = useNavigate();

    console.log(meetingData)

    const [selectedTab, setSelectedTab] = useState("attendance");
    const [isForward, setIsForward] = useState(false);
    const [selectedAction, setSelectedAction] = useState(null);

    const handleForwardClick = (action) => {
        setIsForward(true);
        setSelectedAction(action);
    };

    // const fetchMeetings = async () => {
    //     try {
    //       const token = localStorage.getItem('token');
    //       const meetingId = meetingData.id;

    //       console.log("Token:", token);
    //       console.log("Meeting ID:", meetingId);

    //       const response = await fetch('http://localhost:5000/api/meetings/get-responsibility', {
    //         method: 'POST',
    //         headers: {
    //           'Content-Type': 'application/json',
    //           Authorization: `Bearer ${token}`
    //         },
    //         body: JSON.stringify({ meetingId })
    //       });

    //       const data = await response.json();

    //       console.log("Response data:", data);

    //     //   if (data.success) {
    //     //     const formattedMeetings = data.meetings.map(meeting => ({
    //     //       id: meeting.id,
    //     //       type: `Info: ${meeting.role}`,
    //     //       title: meeting.meeting_name,
    //     //       date: dayjs(meeting.start_time).format("dddd, D MMMM, YYYY"),
    //     //       duration: dayjs(meeting.end_time).diff(dayjs(meeting.start_time), 'minute') + " min",
    //     //       location: `Venue ID: ${meeting.venue_id}`,
    //     //       description: meeting.meeting_description,
    //     //       host: `${meeting.created_by}`,
    //     //       priority: `${meeting.priority.toUpperCase()} PRIORITY`,
    //     //       deadline: meeting.meeting_status === "not_started" ? "Upcoming" : null,
    //     //       progress: meeting.meeting_status === "in_progress" ? "40%" : null,
    //     //       repeat_type: meeting.repeat_type.toUpperCase(),
    //     //       members: meeting.members
    //     //     }));

    //     //     setMeetings(formattedMeetings);
    //     //   } else {
    //     //     console.warn("Response returned success: false", data);
    //     //   }

    //     } catch (error) {
    //       console.error("Failed to fetch meetings:", error);
    //     }
    //   };


    //   useEffect(() => {
    //     fetchMeetings();
    //   }, []);

    return (
        <Box>
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
                                borderRadius: '5px', backgroundColor: "#6c757d", textTransform: "none", gap: "8px",
                                "&:hover": { backgroundColor: "#5a6268" },
                            }}
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
                            onClick={() => setOnStart(true)}

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
            <Box sx={{ display: "flex", backgroundColor: "white", justifyContent: "center", alignItems: "center", flexDirection: 'column', width: "90%", margin: "0 auto", paddingX: '40px' }}>
                <img src={image} alt="Example" style={{ width: "50%", height: "50%", padding: "10px" }} />
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

                            {Object.entries(meetingData.members).map((member => (
                                <TableRow>
                                    <TableCell sx={cellStyle}>
                                        <TextField
                                            variant="standard"
                                            placeholder="Person"
                                            value={member[0]}
                                            fullWidth
                                            InputProps={{
                                                disableUnderline: true,
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell colSpan={3} sx={cellStyle}>
                                        <TextField
                                            variant="standard"
                                            placeholder="Select Member"
                                            fullWidth
                                            value={member[1].map((element) => ` ${element.name}`)}
                                            InputProps={{
                                                disableUnderline: true,
                                            }}
                                        />
                                    </TableCell>
                                </TableRow>)))}
                        </TableBody>
                    </Table>
                </TableContainer>
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
                                <TableRow >
                                    <TableCell sx={{ ...cellStyle, textAlign: "center" }}></TableCell>
                                    <TableCell sx={{ ...cellStyle, textAlign: "center" }}></TableCell>
                                    <TableCell sx={{ ...cellStyle, textAlign: "center" }}></TableCell>
                                    <TableCell sx={{ ...cellStyle, textAlign: "center" }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                                            {status !== "Absent" && (
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
                                                    onClick={() => setStatus("Present")}
                                                >
                                                    Present
                                                </Button>
                                            )}
                                            {status !== "Present" && (
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
                                                    onClick={() => setStatus("Absent")}
                                                >
                                                    Absent
                                                </Button>
                                            )}
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
                                <TableRow>
                                    <TableCell sx={cellStyle}></TableCell>
                                    <TableCell sx={{ ...cellStyle, fontWeight: "normal", maxWidth: "300px" }}>
                                        <TextField
                                            variant="standard"
                                            placeholder="Enter discussion topic"
                                            multiline
                                            fullWidth
                                            minRows={1}
                                            maxRows={4}
                                            InputProps={{
                                                disableUnderline: true,
                                                sx: { fontSize: '14px', fontWeight: 'bold' }
                                            }}
                                            onChange={(e) => {
                                                const updatedPoints = [...discussionPoints];
                                                updatedPoints[index].point = e.target.value;
                                                setDiscussionPoints(updatedPoints);
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell sx={cellStyle}>
                                        <TextField variant="standard" placeholder="Add remarks" fullWidth InputProps={{ disableUnderline: true }} />
                                    </TableCell>

                                    <TableCell sx={{ ...cellStyle, textAlign: "center" }}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 2 }}>
                                            {status !== "Not Agree" && status !== "Forward" && (
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
                                                    onClick={() => handleForwardClick("agree")}
                                                >
                                                    Agree
                                                </Button>
                                            )}
                                            {status !== "Not Agree" && status !== "Agree" && (
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
                                                    onClick={() => handleForwardClick("forward")}
                                                >
                                                    Forward
                                                </Button>
                                            )}
                                            {status !== "Agree" && status !== "Forward" && (
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
                                                    onClick={() => handleForwardClick("notAgree")}
                                                >
                                                    Not Agree
                                                </Button>
                                            )}
                                        </Box>
                                    </TableCell>

                                    <TableCell sx={cellStyle}>
                                        <TextField variant="standard" placeholder="Select Member" fullWidth InputProps={{ disableUnderline: true }} />
                                    </TableCell>
                                    <TableCell sx={cellStyle}>
                                        <TextField variant="standard" placeholder="Select Date" fullWidth
                                            InputProps={{ disableUnderline: true }}
                                            readOnly
                                        />
                                    </TableCell>
                                </TableRow>
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
                                {meetingData.points.map((point, index) => (
                                    <TableRow key={index}>
                                        <TableCell sx={cellStyle}>{index + 1}</TableCell>
                                        <TableCell sx={{ ...cellStyle, fontWeight: "normal" }}>
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
                                                    sx: { fontSize: '14px', fontWeight: 'bold' }
                                                }}
                                                onChange={(e) => handleChange(index, 'pointsToDiscuss', e.target.value)}
                                            />
                                        </TableCell>
                                        <TableCell sx={cellStyle}>
                                            <TextField
                                                variant="standard"
                                                placeholder="Add remarks"
                                                fullWidth
                                                InputProps={{ disableUnderline: true }}
                                                value={point.todo}
                                                onChange={(e) => handleChange(index, 'remarks', e.target.value)}
                                            />
                                        </TableCell>
                                        <TableCell sx={cellStyle}>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                                {/* Only show Approve button if current status is not "Not Approve" */}
                                                {point.status !== "Not Approve" && (
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
                                                        onClick={() => handleStatusChange(index, "Approve")}
                                                    >
                                                        Approve
                                                    </Button>
                                                )}
                                                {/* Only show Not Approve button if current status is not "Approve" */}
                                                {point.status !== "Approve" && (
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
                                                        onClick={() => handleStatusChange(index, "Not Approve")}
                                                    >
                                                        Not Approve
                                                    </Button>
                                                )}
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={cellStyle}>
                                            <TextField
                                                variant="standard"
                                                placeholder="Select Member"
                                                fullWidth
                                                InputProps={{ disableUnderline: true }}
                                                value={point.responsible}
                                                onChange={(e) => handleChange(index, 'responsibility', e.target.value)}
                                            />
                                        </TableCell>
                                        <TableCell sx={cellStyle}>
                                            <TextField
                                                variant="standard"
                                                placeholder="Select Date"
                                                fullWidth
                                                InputProps={{ disableUnderline: true }}
                                                value={point.point_deadline}
                                                onChange={(e) => handleChange(index, 'deadline', e.target.value)}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
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
                        onClick={() => setIsForward(false)} // Close the form when clicking outside
                    >
                        <Box onClick={(e) => e.stopPropagation()}>
                            <ForwardingForm onClose={() => setIsForward(false)} selectedAction={selectedAction} /> // Pass onClose and selectedAction props
                        </Box>
                    </Box>
                )}
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

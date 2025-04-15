import { useState, useEffect } from "react";
import { Card, Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, IconButton } from "@mui/material";
import Autocomplete from '@mui/material/Autocomplete';
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import { Cancel } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import { CheckBox } from "@mui/icons-material";
import { useLocation } from "react-router-dom";
import AttendanceIcon from "@mui/icons-material/HowToReg";
import AgendaIcon from "@mui/icons-material/Groups";

import { FormatBold, FormatItalic, FormatUnderlined, FormatAlignLeft, FormatAlignCenter, FormatAlignRight, Link } from "@mui/icons-material";

import image from "../assets/bannariammanheader.png";

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

export default function JoinMeet({ onBack }) {
    const [openRejectCard, setOpenRejectCard] = useState(false);
    const [isAccpet, setIsAccept] = useState(false);
    const [onJoin, setOnJoin] = useState(false);
    const [selectedTab, setSelectedTab] = useState("attendance");
    const [status, setStatus] = useState(null);
    const [pointData, setpointData] = useState([]);

    const handleCancelMeeting = () => {
        setOpenRejectCard(true);
    };

    const handleCloseRejectCard = () => {
        setOpenRejectCard(false);
    };



    const fetchMeetings = async () => {
        try {
            const token = localStorage.getItem('token');
            const meetingId = meetingData.id;
            console.log("Hello")
            console.log("Token:", token);
            console.log("Meeting ID:", meetingId);

            const response = await fetch('http://localhost:5000/api/meetings/get-responsibility', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ meetingId })
            });

            const data = await response.json();
            if (!data.data){
                setpointData([]);
            }
            else {
                setpointData(data.data)
            }
            console.log("Response data:", data);

            //   if (data.success) {
            //     const formattedMeetings = data.meetings.map(meeting => ({
            //       id: meeting.id,
            //       type: `Info: ${meeting.role}`,
            //       title: meeting.meeting_name,
            //       date: dayjs(meeting.start_time).format("dddd, D MMMM, YYYY"),
            //       duration: dayjs(meeting.end_time).diff(dayjs(meeting.start_time), 'minute') + " min",
            //       location: `Venue ID: ${meeting.venue_id}`,
            //       description: meeting.meeting_description,
            //       host: `${meeting.created_by}`,
            //       priority: `${meeting.priority.toUpperCase()} PRIORITY`,
            //       deadline: meeting.meeting_status === "not_started" ? "Upcoming" : null,
            //       progress: meeting.meeting_status === "in_progress" ? "40%" : null,
            //       repeat_type: meeting.repeat_type.toUpperCase(),
            //       members: meeting.members
            //     }));

            //     setMeetings(formattedMeetings);
            //   } else {
            //     console.warn("Response returned success: false", data);
            //   }

        } catch (error) {
            console.error("Failed to fetch meetings:", error);
        }
    };


    useEffect(() => {
        fetchMeetings();
    }, []);

    const location = useLocation();
    const { meetingData } = location.state || {};
    console.log('helloeer', meetingData)

    console.log('sfs', (Object.entries(meetingData.members)));

    return (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "90vh" }}>
            <Box sx={{ display: "flex", flexDirection: "column", minHeight: "90vh", backgroundColor: "#f5f5f5", padding: "16px", borderRadius: "8px", boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)" }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", gap: 80 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box sx={{ display: "flex", padding: "5px", backgroundColor: "white" }}>
                            <ArrowBackIcon sx={{ cursor: "pointer" }} onClick={onBack} />
                        </Box>
                        <Typography variant="h6" fontWeight="bold">
                            {meetingData.title}
                            <Typography sx={{ fontSize: '12px' }}>
                                SF Board Room 12 Nov,2021 at 9:40 PM
                            </Typography>
                        </Typography>
                    </Box>

                    {!onJoin ? (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, padding: "6px", backgroundColor: "white", borderRadius: "8px" }}>
                            <Button
                                variant="contained"
                                sx={{
                                    backgroundColor: "#6c757d", textTransform: "none", gap: "5px",
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
                                onClick={() => isAccpet && setOnJoin(true)}
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
                            >
                                <AutoAwesomeOutlinedIcon sx={{ fontSize: "18px" }} />
                                Leave Meeting
                            </Button>
                        </Box>
                    )}
                </Box>
                {!onJoin && !isAccpet && (
                    <Box sx={{ display: 'flex', padding: '8px', backgroundColor: 'white', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography sx={{ fontSize: '15px' }}>Accepted To Join The Meeting</Typography>
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
                                    "&:hover": {
                                        backgroundColor: "#f8d7da",
                                    },
                                }}
                                onClick={handleCancelMeeting}
                            >
                                <Cancel sx={{ color: "red", fontSize: '10px' }} />
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
                                    "&:hover": {
                                        backgroundColor: "#d4edda",
                                    },
                                }}
                                onClick={() => setIsAccept(true)}
                            >
                                <CheckBox sx={{ color: "green", fontSize: '10px' }} />
                                Accept
                            </Button>
                        </Box>
                    </Box>
                )}
                {openRejectCard && (
                    <Box sx={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "rgba(0, 0, 0, 0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 999 }}>
                        <Reject onClose={handleCloseRejectCard} />
                    </Box>
                )}
                {onJoin && (
                    <Box sx={{ display: "flex", borderRadius: 2, overflow: "hidden", padding: '6px', backgroundColor: 'white', gap: 2 }}>
                        <Button
                            onClick={() => setSelectedTab("attendance")}
                            sx={{
                                flex: 0.75,
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
                                flex: 0.75,
                                backgroundColor: selectedTab === "agenda" ? "#4285F4" : "transparent",
                                color: selectedTab === "agenda" ? "#fff" : "#666",
                                "&:hover": { backgroundColor: selectedTab === "agenda" ? "#357ae8" : "#f0f0f0" },
                                textTransform: "none",
                                gap: 2,
                                transition: "background-color 0.3s, color 0.3s",
                            }}
                        >
                            <AgendaIcon />
                            Agenda
                        </Button>
                    </Box>
                )}

                <Box sx={{ display: "flex", backgroundColor: "white", justifyContent: "center", alignItems: "center", flexDirection: 'column', marginTop: '10px' }}>
                    <img src={image} alt="Example" style={{ width: "50%", height: "50%", padding: "10px" }} />

                    {/* first part */}
                    <TableContainer sx={{ maxWidth: 1150, margin: "auto", mt: 3, border: "1px solid #ddd", borderBottom: 'none' }}>
                        <Table sx={{ borderCollapse: "collapse" }}>
                            <TableBody>
                                <TableRow>
                                    <TableCell sx={cellStyle}>Name of the Meeting</TableCell>
                                    <TableCell sx={cellStyle}>
                                        <TextField
                                            variant="standard"
                                            placeholder="Ex..8th BoS Meeting"
                                            fullWidth
                                            value={meetingData.title}
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
                                            placeholder="Ex..Lorem ipsum dolor sit amet consectetur. Arcu vel egestas rutrum in magna semper dolor sem. Bibendum tristique quisque facilisis cursus mus malesuada mattis et erat. Pellentesque sed congue tellus massa aliquam. Augue erat nunc mauris consectetur."
                                            rows={4}
                                            value={meetingData.description}
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
                                            placeholder="Ex..Monthly"
                                            value={meetingData.repeat_type}
                                            variant="standard"
                                            InputProps={{ disableUnderline: true }}
                                        />
                                    </TableCell>

                                    <TableCell sx={cellStyle}>Priority Type</TableCell>
                                    <TableCell sx={cellStyle}>
                                        <Autocomplete
                                            disablePortal
                                            sx={{
                                                "& .MuiAutocomplete-endAdornment": { display: "none" },
                                            }}
                                            value={meetingData.description}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    placeholder="Ex..High Priority"
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

                    {onJoin && selectedTab === 'attendance' ? (
                        <TableContainer sx={{ maxWidth: 1150, margin: "auto", border: "1px solid #ddd", borderTop: "none" }}>
                            <Table sx={{ borderCollapse: "collapse" }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell width="5%" sx={{ ...headerCellStyle, textAlign: 'center' }}>S.No</TableCell>
                                        <TableCell width="35%" sx={{ ...headerCellStyle, textAlign: 'center' }}>Name & Designation</TableCell>
                                        <TableCell width="25%" sx={{ ...headerCellStyle, textAlign: 'center' }}>Role</TableCell>
                                        <TableCell width="25%" sx={{ ...headerCellStyle, textAlign: 'center' }}>Attendance</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {[...Array(4)].map((_, index) => (
                                        <TableRow key={index}>
                                            <TableCell sx={{ ...cellStyle, textAlign: "center" }}>hello</TableCell>
                                            <TableCell sx={{ ...cellStyle, textAlign: "center" }}>hello</TableCell>
                                            <TableCell sx={{ ...cellStyle, textAlign: "center" }}>hello</TableCell>
                                            <TableCell sx={{ ...cellStyle, textAlign: "center" }}>
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
                                                        "&:hover": {
                                                            backgroundColor: "#d4edda",
                                                        },
                                                    }}
                                                >
                                                    <CheckBox sx={{ color: "green", fontSize: '10px' }} />
                                                    Present
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : onJoin && selectedTab === 'agenda' ? (
                        <TableContainer sx={{ maxWidth: 1150, margin: "auto", border: "1px solid #ddd", borderTop: "none" }}>
                            <Table sx={{ borderCollapse: "collapse" }}>
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
                                    <TableRow>
                                        <TableCell sx={cellStyle}>1</TableCell>
                                        <TableCell sx={{ ...cellStyle, fontWeight: "normal" }}> hello</TableCell>
                                        <TableCell sx={{ ...cellStyle, fontWeight: "normal" }}>hello</TableCell>
                                        <TableCell sx={{ ...cellStyle, fontWeight: "normal" }}>hello</TableCell>
                                        <TableCell sx={{ ...cellStyle, fontWeight: "normal" }}>hello</TableCell>
                                        <TableCell sx={{ ...cellStyle, fontWeight: "normal" }}>hello</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <TableContainer sx={{ maxWidth: 1150, margin: "auto", border: "1px solid #ddd", borderTop: "none" }}>
                            
                            <Table sx={{ borderCollapse: "collapse" }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell width="5%" sx={headerCellStyle}>S.No</TableCell>
                                        <TableCell width="30%" sx={headerCellStyle}>Points to be Discussed</TableCell>
                                        <TableCell width="20%" sx={headerCellStyle}>Todo</TableCell>
                                        {isAccpet && (
                                            <TableCell width="15%" sx={headerCellStyle}>Status</TableCell>
                                        )}
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
                                                    defaultValue={point.point_name}
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
                                                    defaultValue={point.todo}
                                                    InputProps={{ disableUnderline: true }}
                                                />
                                            </TableCell>

                                            {isAccpet && (
                                                <TableCell sx={cellStyle}>
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                                        {status !== "notCompleted" && (
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
                                                                onClick={() => setStatus("completed")}
                                                            >
                                                                Completed
                                                            </Button>
                                                        )}
                                                        {status !== "completed" && (
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
                                                                onClick={() => setStatus("notCompleted")}
                                                            >
                                                                Not Completed
                                                            </Button>
                                                        )}
                                                    </Box>
                                                </TableCell>
                                            )}

                                            <TableCell sx={cellStyle}>
                                                <TextField variant="standard" placeholder="Select Member" fullWidth InputProps={{ disableUnderline: true }} value={point.name}/>
                                            </TableCell>

                                            <TableCell sx={cellStyle}>
                                                <TextField variant="standard" placeholder="Select Date" fullWidth InputProps={{ disableUnderline: true }} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Box>
            </Box>
        </Box>
    )
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

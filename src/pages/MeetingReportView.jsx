import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    Container,
    Paper,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import axios from 'axios';
import { formatInTimeZone } from 'date-fns-tz';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';

// Import the header image directly from assets
import image from "../assets/bannariammanheader.png";

// Styles to match template1.jsx exactly
const cellStyle = {
    padding: '12px 16px',
    border: '1px solid #ddd',
    borderCollapse: 'collapse',
    fontSize: '14px',
    fontWeight: 'normal',
    lineHeight: '1.5',
    color: '#333',
};

const headerStyle = {
    ...cellStyle,
    backgroundColor: '#f0f0f0',
    fontWeight: '500',
    color: '#000',
};

const headerCellStyle = {
    backgroundColor: '#f8f8f8',
    fontWeight: '500',
    padding: '12px 16px',
    border: '1px solid #ddd',
    textAlign: 'left',
    color: '#333',
};

export default function MeetingReportView() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const pdfRef = useRef();

    useEffect(() => {
        const fetchReport = async () => {
            try {
                setLoading(true);
                const apiUrl = 'http://localhost:5000';
                const token = localStorage.getItem('token');

                if (!token) {
                    setError('Authentication required');
                    setLoading(false);
                    return;
                }

                // First check if user has access to this meeting
                const accessCheck = await axios.get(`${apiUrl}/api/meetings/get-meeting-agenda/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                });

                if (!accessCheck.data) {
                    setError('You do not have access to this meeting');
                    setLoading(false);
                    return;
                }

                // If user has access, fetch the meeting details
                const meetingResponse = await axios.get(`${apiUrl}/api/meetings/meeting/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                });

                const response = await axios.get(
                    `http://localhost:5000/api/meetings/get-meeting-agenda/${id}`
                    , {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        }
                    });

                if (meetingResponse.data) {
                    const meetingData = meetingResponse.data;
                    console.log(meetingData.start_time)

                    // Format the data to match the report structure
                    const formattedReport = {
                        name: meetingData.meeting_name,
                        referenceNumber: `MEETING-${meetingData.id}`,
                        description: meetingData.meeting_description,
                        repeatType: meetingData.repeat_type || 'One-time',
                        priorityType: meetingData.priority?.toUpperCase() || 'NORMAL',
                        venue: meetingData.venue_name,
                        dateTime: `${formatInTimeZone(meetingData.start_time, 'UTC', 'dd/MM/yyyy')} | ${formatInTimeZone(meetingData.start_time, 'UTC', 'hh:mm a')} - ${formatInTimeZone(meetingData.end_time, 'UTC', 'hh:mm a')}`,
                        createdBy: meetingData.created_by,
                        roles: meetingData.roles || [],
                        points: (response.data.data.points || [])
                    };

                    console.log(formattedReport)
                    setReport(formattedReport);
                }
            } catch (err) {
                console.error('Error fetching report:', err);
                if (err.response?.status === 403) {
                    setError('You do not have access to this meeting');
                } else if (err.response?.status === 404) {
                    setError('Meeting not found');
                } else {
                    setError('Failed to load report details');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, [id]);

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <IconButton
                        onClick={() => navigate(-1)}
                        sx={{ mr: 2, border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px' }}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6">Loading report...</Typography>
                </Box>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ py: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <IconButton
                        onClick={() => navigate(-1)}
                        sx={{ mr: 2, border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px' }}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6" color="error">{error}</Typography>
                </Box>
            </Container>
        );
    }

    if (!report) {
        return (
            <Container maxWidth="lg" sx={{ py: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <IconButton
                        onClick={() => navigate(-1)}
                        sx={{ mr: 2, border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px' }}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6" color="error">Report not found</Typography>
                </Box>
            </Container>
        );
    }

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPDF = async () => {
        const element = pdfRef.current;
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false,
            allowTaint: true
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const imgWidth = 210; // A4 width in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save(`${report.name.replace(/\s+/g, '_')}_Meeting_Report.pdf`);
    };

    return (
        <Container maxWidth="lg" sx={{ py: 3 }}>
            {/* Header with back button and download */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton
                        onClick={() => navigate(-1)}
                        sx={{
                            mr: 2,
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            padding: '8px'
                        }}
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{report.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {report.venue} • {report.dateTime}
                        </Typography>
                    </Box>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownloadPDF}
                    sx={{
                        backgroundColor: '#1565c0',
                        '&:hover': { backgroundColor: '#0d47a1' },
                        borderRadius: '6px',
                        padding: '10px 16px',
                        textTransform: 'none',
                        fontWeight: '500'
                    }}
                >
                    Download MOM
                </Button>
            </Box>

            {/* Main content */}
            <Paper
                ref={pdfRef}
                sx={{
                    p: { xs: 2, md: 4 },
                    mb: 3,
                    boxShadow: 'none',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px'
                }}
            >
                {/* College Header Image */}
                <Box sx={{ mb: 4, textAlign: 'center' }}>
                    <img
                        src={image}
                        alt="College Header"
                        style={{ width: '100%', height: 'auto', maxWidth: '100%' }}
                    />
                </Box>

                {/* Meeting Details */}
                <TableContainer sx={{ margin: "auto", mt: 3, border: "1px solid #ddd", borderBottom: 'none' }}>
                    <Table sx={{ borderCollapse: "collapse" }}>
                        <TableBody>
                            <TableRow>
                                <TableCell sx={cellStyle}>Name of the Meeting</TableCell>
                                <TableCell sx={cellStyle}>{report.name}</TableCell>
                                <TableCell sx={{ ...cellStyle, backgroundColor: '#E7E7E7', color: '#777' }}>Reference Number</TableCell>
                                <TableCell sx={{ ...cellStyle, backgroundColor: '#E7E7E7' }}>{report.referenceNumber || '-'}</TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCell sx={cellStyle}>Meeting Description</TableCell>
                                <TableCell colSpan={3} sx={{ ...cellStyle }}>{report.description || '-'}</TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCell sx={cellStyle}>Repeat Type</TableCell>
                                <TableCell sx={cellStyle}>{report.repeatType || '-'}</TableCell>
                                <TableCell sx={cellStyle}>Priority Type</TableCell>
                                <TableCell sx={cellStyle}>{report.priorityType || '-'}</TableCell>
                            </TableRow>

                            <TableRow>
                                <TableCell sx={cellStyle}>Venue Details</TableCell>
                                <TableCell sx={cellStyle}>{report.venue || '-'}</TableCell>
                                <TableCell sx={cellStyle}>Date & Time</TableCell>
                                <TableCell sx={cellStyle}>{report.dateTime || '-'}</TableCell>
                            </TableRow>

                            <TableRow sx={{ backgroundColor: "#f0f0f0" }}>
                                <TableCell sx={headerStyle}>Roles</TableCell>
                                <TableCell colSpan={3} sx={headerStyle}>Member list</TableCell>
                            </TableRow>

                            {report.roles.map((role, index) => (
                                <TableRow key={index}>
                                    <TableCell sx={{ ...cellStyle, width: '20%' }}>{role.role}</TableCell>
                                    <TableCell colSpan={3} sx={cellStyle}>
                                        {(role.members && role.members.length > 0)
                                            ? role.members.map(m => m.name).join(', ')
                                            : '-'}
                                    </TableCell>
                                </TableRow>
                            ))}

                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Points Table */}
                <TableContainer sx={{ margin: "auto", border: "1px solid #ddd", borderTop: "none" }}>
                    <Table sx={{ borderCollapse: "collapse" }}>
                        <TableHead>
                            <TableRow>
                                <TableCell width="5%" sx={headerCellStyle}>S.No</TableCell>
                                <TableCell width="30%" sx={headerCellStyle}>Points to be Discussed</TableCell>
                                <TableCell width="20%" sx={headerCellStyle}>Remarks</TableCell>
                                <TableCell width="15%" sx={headerCellStyle}>Status</TableCell>
                                <TableCell width="15%" sx={headerCellStyle}>Responsibility</TableCell>
                                <TableCell width="15%" sx={headerCellStyle}>Deadline</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {(report.points || []).map((point, index) => (
                                <TableRow key={ index}>
                                    <TableCell sx={cellStyle}>{ (index + 1)}</TableCell>
                                    <TableCell sx={{ ...cellStyle, fontWeight: "normal", maxWidth: "300px" }}>
                                        <Typography sx={{ fontWeight: "medium" }}>
                                            {point?.point_name || '-'}
                                        </Typography>
                                        {point?.description && (
                                            <Typography sx={{ color: 'text.secondary', fontStyle: 'italic', mt: 1, fontSize: '14px' }}>
                                                {point.description}
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell sx={cellStyle}>{point?.admin_remarks || '-'}</TableCell>
                                    <TableCell sx={cellStyle}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                            <Typography sx={{
                                                color: point?.status === 'APPROVED' ? '#059669' : '#d97706',
                                                fontWeight: '500',
                                                mb: 1
                                            }}>
                                                {point?.status || '-'}
                                            </Typography>
                                            {point?.forward_info && (
                                                <Typography sx={{ color: '#2563eb', fontSize: '14px' }}>
                                                    Forward to: {point.forward_info.text}
                                                </Typography>
                                            )}
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={cellStyle}>{point?.responsible_user?.name || '-'}</TableCell>
                                    <TableCell sx={cellStyle}>{point.point_deadline ? format(new Date(point.point_deadline), 'dd MMM yyyy') : '-'}</TableCell>
                                </TableRow>
                            ))}
                            {(!report.points || report.points.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={cellStyle}>
                                        No points discussed
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Container>
    );
}
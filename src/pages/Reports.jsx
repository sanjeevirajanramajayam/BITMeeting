import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Reports.css';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { formatInTimeZone } from 'date-fns-tz';
import image from "../assets/bannariammanheader.png";

export default function Reports() {
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItems, setSelectedItems] = useState(new Set());
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [categoryFilter, setCategoryFilter] = useState('');
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                const apiUrl = 'http://localhost:5000';

                if (!token) {
                    setError('Authentication required');
                    setLoading(false);
                    return;
                }

                // First get user's meetings
                const userMeetingsResponse = await axios.get(`${apiUrl}/api/meetings/get-user-meetings`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                });

                if (!userMeetingsResponse.data?.meetings) {
                    setReports([]);
                    setLoading(false);
                    return;
                }

                // Get meeting IDs where user is either creator or member
                const userMeetingIds = userMeetingsResponse.data.meetings.map(meeting => meeting.id);

                // Get completed meetings that user has access to
                const reportsResponse = await axios.get(`${apiUrl}/api/reports`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                });

                // Filter reports to only show meetings user has access to
                const userReports = reportsResponse.data.filter(report =>
                    userMeetingIds.includes(parseInt(report.id))
                );

                const validatedReports = userReports.map(report => ({
                    id: report.id || '',
                    name: report.name || 'Untitled Meeting',
                    category: report.category || 'Uncategorized',
                    createdBy: report.createdBy || 'Unknown',
                    dateCreated: report.dateCreated || 'No date',
                    venue: report.venue || 'No venue'
                }));

                setReports(validatedReports);

                // Extract unique categories
                const uniqueCategories = [...new Set(validatedReports
                    .filter(report => report.category)
                    .map(report => report.category))];

                setCategories(uniqueCategories.map(cat => ({
                    id: cat,
                    label: cat,
                    color: getCategoryColor(cat)
                })));
            } catch (err) {
                console.error('Error fetching reports:', err);
                setError(err.response?.data?.message || err.message || 'Failed to fetch reports');
                setReports([]);
            } finally {
                setLoading(false);
            }
        };

        fetchReports();

    }, []);

    const getCategoryColor = (category) => {
        const categoryColors = {
            'BOS': '#2563EB',
            'Department': '#059669',
            'Academic': '#DC2626'
        };
        return categoryColors[category] || '#6B7280';
    };

    const getCategoryClass = (category) => {
        switch (category) {
            case 'Team Meeting':
                return 'team-meeting';
            case 'Board Meeting':
                return 'board-meeting';
            default:
                return '';
        }
    };

    const filteredReports = useMemo(() => {
        let filtered = [...reports];

        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(report =>
                (report.name?.toLowerCase().includes(searchLower)) ||
                (report.category?.toLowerCase().includes(searchLower)) ||
                (report.createdBy?.toLowerCase().includes(searchLower)) ||
                (report.venue?.toLowerCase().includes(searchLower))
            );
        }

        if (categoryFilter) {
            filtered = filtered.filter(report => report.category === categoryFilter);
        }

        if (sortConfig.key) {
            filtered.sort((a, b) => {
                const aVal = a[sortConfig.key] || '';
                const bVal = b[sortConfig.key] || '';

                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return filtered;
    }, [reports, searchTerm, categoryFilter, sortConfig]);

    const handleSort = (key) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const handleSelectAll = (event) => {
        if (event.target.checked) {
            setSelectedItems(new Set(filteredReports.map(report => report.id)));
        } else {
            setSelectedItems(new Set());
        }
    };

    const handleSelectItem = (id) => {
        setSelectedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const handleExport = () => {
        const selectedReports = filteredReports.filter(report => selectedItems.has(report.id));
        if (selectedReports.length === 0) {
            alert('Please select at least one report to export');
            return;
        }

        const exportData = selectedReports.map(report => ({
            name: report.name,
            category: report.category,
            createdBy: report.createdBy,
            dateCreated: report.dateCreated
        }));

        console.log('Exporting reports:', exportData);
        alert(`Exporting ${selectedReports.length} reports`);
    };

    const handleViewReport = (report) => {
        // Navigate to the detailed report view page
        navigate(`/reports/${report.id}`);
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPDF = async (report) => {
        try {
            const token = localStorage.getItem('token');
            const apiUrl = 'http://localhost:5000';

            // Fetch detailed report data
            const response = await axios.get(`${apiUrl}/api/meetings/meeting/${report.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            const meetingData = response.data;
            const agendaResponse = await axios.get(`${apiUrl}/api/meetings/get-meeting-agenda/${report.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });

            // Create a temporary div to hold the PDF content
            const tempDiv = document.createElement('div');
            tempDiv.style.padding = '20px';
            tempDiv.style.backgroundColor = 'white';
            tempDiv.style.width = '210mm'; // A4 width
            tempDiv.style.minHeight = '297mm'; // A4 height

            // Add content to the temporary div matching MeetingReportView layout
            tempDiv.innerHTML = `
                <div style="text-align: center; margin-bottom: 20px;">
                    <img src="${image}" alt="College Header" style="width: 100%; height: auto; max-width: 100%;" />
                </div>

                <div style="margin: 20px 0;">
                    <h1 style="text-align: center; margin-bottom: 10px;">${meetingData.meeting_name}</h1>
                    <p style="text-align: center; color: #666;">${meetingData.venue_name} • ${formatInTimeZone(meetingData.start_time, 'UTC', 'dd/MM/yyyy')} | ${formatInTimeZone(meetingData.start_time, 'UTC', 'hh:mm a')} - ${formatInTimeZone(meetingData.end_time, 'UTC', 'hh:mm a')}</p>
                </div>

                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <tbody>
                        <tr>
                            <td style="padding: 12px 16px; border: 1px solid #ddd;">Name of the Meeting</td>
                            <td style="padding: 12px 16px; border: 1px solid #ddd;">${meetingData.meeting_name}</td>
                            <td style="padding: 12px 16px; border: 1px solid #ddd; background-color: #E7E7E7; color: #777;">Reference Number</td>
                            <td style="padding: 12px 16px; border: 1px solid #ddd; background-color: #E7E7E7;">MEETING-${meetingData.id}</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px 16px; border: 1px solid #ddd;">Meeting Description</td>
                            <td colspan="3" style="padding: 12px 16px; border: 1px solid #ddd;">${meetingData.meeting_description || '-'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px 16px; border: 1px solid #ddd;">Repeat Type</td>
                            <td style="padding: 12px 16px; border: 1px solid #ddd;">${meetingData.repeat_type || 'One-time'}</td>
                            <td style="padding: 12px 16px; border: 1px solid #ddd;">Priority Type</td>
                            <td style="padding: 12px 16px; border: 1px solid #ddd;">${meetingData.priority?.toUpperCase() || 'NORMAL'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px 16px; border: 1px solid #ddd;">Venue Details</td>
                            <td style="padding: 12px 16px; border: 1px solid #ddd;">${meetingData.venue_name || '-'}</td>
                            <td style="padding: 12px 16px; border: 1px solid #ddd;">Date & Time</td>
                            <td style="padding: 12px 16px; border: 1px solid #ddd;">${formatInTimeZone(meetingData.start_time, 'UTC', 'dd/MM/yyyy')} | ${formatInTimeZone(meetingData.start_time, 'UTC', 'hh:mm a')} - ${formatInTimeZone(meetingData.end_time, 'UTC', 'hh:mm a')}</td>
                        </tr>
                    </tbody>
                </table>

                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <thead>
                        <tr style="background-color: #f0f0f0;">
                            <th style="padding: 12px 16px; border: 1px solid #ddd; text-align: left;">S.No</th>
                            <th style="padding: 12px 16px; border: 1px solid #ddd; text-align: left;">Points to be Discussed</th>
                            <th style="padding: 12px 16px; border: 1px solid #ddd; text-align: left;">Remarks</th>
                            <th style="padding: 12px 16px; border: 1px solid #ddd; text-align: left;">Status</th>
                            <th style="padding: 12px 16px; border: 1px solid #ddd; text-align: left;">Responsibility</th>
                            <th style="padding: 12px 16px; border: 1px solid #ddd; text-align: left;">Deadline</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${(agendaResponse.data.data.points || []).map((point, index) => `
                            <tr>
                                <td style="padding: 12px 16px; border: 1px solid #ddd;">${point?.id || (index + 1)}</td>
                                <td style="padding: 12px 16px; border: 1px solid #ddd;">
                                    <div style="font-weight: 500;">${point?.point_name || '-'}</div>
                                    ${point?.description ? `<div style="color: #666; font-style: italic; margin-top: 5px;">${point.description}</div>` : ''}
                                </td>
                                <td style="padding: 12px 16px; border: 1px solid #ddd;">${point?.admin_remarks || '-'}</td>
                                <td style="padding: 12px 16px; border: 1px solid #ddd;">
                                    <div style="color: ${point?.status === 'APPROVED' ? '#059669' : '#d97706'}; font-weight: 500;">
                                        ${point?.status || '-'}
                                    </div>
                                    ${point?.forward_info ? `
                                        <div style="color: #2563eb; font-size: 14px;">
                                            Forward to: ${point.forward_info.text}
                                        </div>
                                    ` : ''}
                                </td>
                                <td style="padding: 12px 16px; border: 1px solid #ddd;">${point?.responsible_user?.name || '-'}</td>
                                <td style="padding: 12px 16px; border: 1px solid #ddd;">${point?.deadline || '-'}</td>
                            </tr>
                        `).join('')}
                        ${(!agendaResponse.data.data.points || agendaResponse.data.data.points.length === 0) ? `
                            <tr>
                                <td colspan="6" style="padding: 12px 16px; border: 1px solid #ddd; text-align: center;">
                                    No points discussed
                                </td>
                            </tr>
                        ` : ''}
                    </tbody>
                </table>
            `;

            // Add the temporary div to the document
            document.body.appendChild(tempDiv);

            // Convert to PDF
            const canvas = await html2canvas(tempDiv, {
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

            // Remove the temporary div
            document.body.removeChild(tempDiv);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        }
    };

    if (loading) {
        return <div className="loading">Loading reports...</div>;
    }

    return (
        <div className="reports-container">
            <div className="reports-main-header">
                <div className="back-button-container">
                    <button className="back-button" onClick={() => navigate(-1)}>
                        <i className="fi fi-rr-arrow-left"></i>
                    </button>
                    <h1 className="page-title">Meeting Reports</h1>
                </div>
            </div>

            <div className="reports-content">
                <div className="reports-header">
                    <div className="reports-title">
                        <h2>Reports</h2>
                        <span className="reports-subtitle">Completed Meetings</span>
                    </div>
                    <button
                        className={`reports-btn secondary ${selectedItems.size === 0 ? 'disabled' : ''}`}
                        onClick={handleExport}
                        disabled={selectedItems.size === 0}
                    >
                        <i className="fi fi-rr-file-export"></i>
                        <span>Export ({selectedItems.size})</span>
                    </button>
                </div>

                <div className="reports-filter-section">
                    <div className="reports-filter-buttons">
                        <button
                            className={`reports-btn ${!categoryFilter ? 'secondary active' : 'secondary'}`}
                            onClick={() => setCategoryFilter('')}
                            type="button"
                        >
                            View all
                        </button>
                        <select
                            className="reports-dropdown"
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            autoComplete="off"
                        >
                            <option value="">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="reports-search">
                        <i className="fi fi-rr-search reports-search-icon"></i>
                        <input
                            type="search"
                            placeholder="Search reports..."
                            className="reports-search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoComplete="off"
                        />
                    </div>
                </div>

                <div className="table-container">
                    <table className="reports-table">
                        <thead>
                            <tr>
                                <th className="checkbox-column">
                                    <input
                                        type="checkbox"
                                        onChange={handleSelectAll}
                                        checked={selectedItems.size === filteredReports.length && filteredReports.length > 0}
                                        autoComplete="off"
                                    />
                                </th>
                                <th>Meeting Title</th>
                                <th onClick={() => handleSort('category')}>Category</th>
                                <th>Created by</th>
                                <th onClick={() => handleSort('dateCreated')}>Date</th>
                                <th>Venue</th>
                                <th>Report</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredReports.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="no-data">
                                        {error || 'No completed meetings found'}
                                    </td>
                                </tr>
                            ) : (
                                filteredReports.map((report) => (
                                    <tr
                                        key={`report-${report.id}`}
                                        className="report-row"
                                        onClick={(e) => {
                                            // Prevent opening report if clicking on checkbox or View Report button
                                            if (!e.target.closest('input[type="checkbox"]') &&
                                                !e.target.closest('.download-link')) {
                                                handleViewReport(report);
                                            }
                                        }}
                                    >
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedItems.has(report.id)}
                                                onChange={() => handleSelectItem(report.id)}
                                                autoComplete="off"
                                            />
                                        </td>
                                        <td>{report.name}</td>
                                        <td>
                                            <span className={`category-badge ${getCategoryClass(report.category)}`}>
                                                {report.category}
                                            </span>
                                        </td>
                                        <td>{report.createdBy}</td>
                                        <td>{report.dateCreated}</td>
                                        <td>{report.venue}</td>
                                        <td>
                                            <a href="#" className="download-link" onClick={(e) => {
                                                e.preventDefault();
                                                handleDownloadPDF(report);
                                            }}>Download</a>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    <div className="pagination">
                        <div className="page-info">Page 1 of 10</div>
                        <div className="pagination-buttons">
                            <button className="prev-button" disabled>Previous</button>
                            <button className="next-button">Next</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Reports.css';

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
                                                handleViewReport(report);
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
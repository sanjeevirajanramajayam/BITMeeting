import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Reports.css';

export default function Reports() {
    const navigate = useNavigate();
    const [reports, setReports] = useState([
        { id: 1, name: 'BOS meeting', category: 'COA', createdBy: 'Olivia Rhye', dateCreated: 'Jan 4, 2024' },
        { id: 2, name: 'Grievance meeting', category: 'M Team', createdBy: 'Phoenix Baker', dateCreated: 'Jan 4, 2024' },
        { id: 3, name: 'Academic meeting', category: 'Academic', createdBy: 'Lana Steiner', dateCreated: 'Jan 2, 2024' },
        { id: 4, name: 'BOS meeting', category: 'COA', createdBy: 'Demi Wilkinson', dateCreated: 'Jan 6, 2024' },
        { id: 5, name: 'Grievance meeting', category: 'COA', createdBy: 'Candice Wu', dateCreated: 'Jan 8, 2024' },
        { id: 6, name: 'Academic meeting', category: 'COA', createdBy: 'Natali Craig', dateCreated: 'Jan 6, 2024' },
        { id: 7, name: 'BOS meeting', category: 'COA', createdBy: 'Drew Cano', dateCreated: 'Jan 4, 2024' },
    ]);

    const [activeTab, setActiveTab] = useState('View all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedItems, setSelectedItems] = useState(new Set());
    const [sortConfig, setSortConfig] = useState({ key: 'category', direction: 'asc' });
    const [filterOpen, setFilterOpen] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    const categories = [
        { id: 'COA', label: 'COA', color: '#2563EB' },
        { id: 'M Team', label: 'Management Team', color: '#059669' },
        { id: 'Academic', label: 'Academic', color: '#DC2626' }
    ];

    // Navigation handler
    const handleBack = () => {
        navigate(-1);
    };

    // Sort handler
    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Selection handlers
    const handleSelectAll = (event) => {
        if (event.target.checked) {
            const newSelected = new Set(filteredReports.map(report => report.id));
            setSelectedItems(newSelected);
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

    // Tab handler
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === 'View all') {
            setCategoryFilter('');
        }
    };

    const handleCategoryFilter = (category) => {
        setSelectedCategory(category);
        setCategoryFilter(category);
    };

    const filteredReports = useMemo(() => {
        let filtered = [...reports];

        if (searchTerm) {
            filtered = filtered.filter(report =>
                report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                report.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                report.createdBy.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (categoryFilter) {
            filtered = filtered.filter(report => report.category === categoryFilter);
        }

        if (sortConfig.key) {
            filtered.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        return filtered;
    }, [reports, searchTerm, categoryFilter, sortConfig]);

    const getCategoryClass = (category) => {
        switch(category) {
            case 'COA':
                return 'coa';
            case 'M Team':
                return 'mteam';
            case 'Academic':
                return 'academic';
            default:
                return '';
        }
    };

    // Add export handling
    const handleExport = () => {
        const selectedReports = filteredReports.filter(report => selectedItems.has(report.id));
        if (selectedReports.length === 0) {
            alert('Please select at least one report to export');
            return;
        }
        
        // Add export logic here
        const exportData = selectedReports.map(report => ({
            name: report.name,
            category: report.category,
            createdBy: report.createdBy,
            dateCreated: report.dateCreated
        }));

        console.log('Exporting reports:', exportData);
        // Implement actual export functionality
        alert(`Exporting ${selectedReports.length} reports`);
    };

    return (
        <div className="reports-container">
            {/* Header */}
            <div className="reports-main-header">
                <div className="back-button-container">
                    <button className="back-button" onClick={handleBack}>
                        <i className="fi fi-rr-arrow-left"></i>
                    </button>
                    <h1 className="page-title">Meeting Reports</h1>
                </div>
            </div>

            {/* Main Content */}
            <div className="reports-content">
                {/* Reports header with Export button */}
                <div className="reports-header">
                    <div className="reports-title">
                        <h2>Reports</h2>
                        <span className="reports-subtitle">Keep track of meeting reports</span>
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

                {/* Filter Section */}
                <div className="reports-filter-section">
                    <div className="reports-filter-buttons">
                        <button 
                            className={`reports-btn ${!categoryFilter ? 'secondary active' : 'secondary'}`}
                            onClick={() => setCategoryFilter('')}
                        >
                            View all
                        </button>
                        <select 
                            className="reports-dropdown"
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            <option value="">Category: All</option>
                            <option value="COA">COA</option>
                            <option value="M Team">M Team</option>
                            <option value="Academic">Academic</option>
                        </select>
                    </div>
                    <div className="reports-search">
                        <i className="fi fi-rr-search reports-search-icon"></i>
                        <input 
                            type="text" 
                            placeholder="Search reports..." 
                            className="reports-search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="table-container">
                    <table className="reports-table">
                        <thead>
                            <tr>
                                <th className="checkbox-column">
                                    <input
                                        type="checkbox"
                                        onChange={handleSelectAll}
                                        checked={selectedItems.size === filteredReports.length && filteredReports.length > 0}
                                    />
                                </th>
                                <th>File name</th>
                                <th onClick={() => handleSort('category')}>
                                    Category
                                    {sortConfig.key === 'category' && (
                                        <i className={`fi fi-rr-${sortConfig.direction === 'asc' ? 'arrow-down' : 'arrow-up'} sort-icon`}></i>
                                    )}
                                </th>
                                <th>Created by</th>
                                <th>Date created</th>
                                <th>Report</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredReports.map((report) => (
                                <tr key={report.id}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.has(report.id)}
                                            onChange={() => handleSelectItem(report.id)}
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
                                    <td>
                                        <a href="#" className="download-link" onClick={(e) => {
                                            e.preventDefault();
                                            alert('Download functionality not implemented');
                                        }}>Download</a>
                                    </td>
                                </tr>
                            ))}
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
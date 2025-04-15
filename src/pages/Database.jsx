import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Database.css';
import axios from 'axios';

export default function Template() {
    const [templates, setTemplates] = useState([]);
    const [activeTab, setActiveTab] = useState('templates');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: 'dateCreated', direction: 'desc' }); // Default sort by date, newest first
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [selectedItems, setSelectedItems] = useState(new Set());
    const [activeStatusDropdown, setActiveStatusDropdown] = useState(null);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deletingTemplateId, setDeletingTemplateId] = useState(null);
    const navigate = useNavigate();

    // Function to fetch templates from API
    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Authentication required');
                setLoading(false);
                return;
            }

            const response = await axios.get('http://localhost:5000/api/templates/list', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.data && response.data.success && response.data.data) {
                // Get the stored category map from localStorage
                let categoryMap = {};
                try {
                    const storedMap = localStorage.getItem('templateCategoryMap');
                    if (storedMap) {
                        categoryMap = JSON.parse(storedMap);
                    }
                } catch (error) {
                    // Silent error handling for localStorage
                }
                
                // Get the template being edited (if any)
                const editingTemplateName = localStorage.getItem('editingTemplate');
                
                // Transform the data to match our component's expected format
                const formattedTemplates = response.data.data.map((template, index) => {
                    // Default category name from API
                    let categoryName = template.category_name || 'Uncategorized';
                    
                    // If we have a stored category for this template name in localStorage,
                    // prioritize it over the API value
                    if (template.name && categoryMap[template.name]) {
                        categoryName = categoryMap[template.name];
                    }
                    
                    return {
                        id: index + 1, // Frontend ID for UI purposes
                        backendId: template.id, // Store the actual database ID
                        name: template.name || 'Untitled',
                        status: template.status || 'Active',
                        dateCreated: new Date(template.created_date).toLocaleDateString(),
                        rawDateCreated: new Date(template.created_date),
                        lastUpdated: template.updated_date ? new Date(template.updated_date).toLocaleDateString() : 'Not updated',
                        rawLastUpdated: template.updated_date ? new Date(template.updated_date) : null,
                        category: categoryName,
                        category_name: template.category_name, // Store original API value for reference
                        categoryId: template.category_id,
                        createdBy: template.created_by || 'Unknown'
                    };
                });
                // Sort by dateCreated, most recent first
                formattedTemplates.sort((a, b) => b.rawDateCreated - a.rawDateCreated);
                
                setTemplates(formattedTemplates);
            } else {
                setTemplates([]);
            }
        } catch (err) {
            setError('Failed to fetch templates');
            
            // If unauthorized, show appropriate message
            if (err.response && err.response.status === 403) {
                setError('Authentication required. Please log in again.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Call fetchTemplates on component mount
    useEffect(() => {
        fetchTemplates();
    }, []);

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                
                const response = await axios.get('http://localhost:5000/api/templates/categories', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (response.data && response.data.categories) {
                    const categoryNames = response.data.categories.map(category => category.name);
                    setCategories(categoryNames);
                }
            } catch (error) {
                setCategories([]);
            }
        };
        
        fetchCategories();
    }, []);

    // Check for new templates when templates list changes
    useEffect(() => {
        try {
            // Check if we have a temporary template name stored
            const lastTemplateName = localStorage.getItem('lastTemplateName');
            if (!lastTemplateName) return;
            
            // Check if there's a new template in the list that might match our temporary name
            const selectedCategory = localStorage.getItem('selectedTemplateCategory');
            if (!selectedCategory) return;
            
            // Get the existing category map
            let categoryMap = {};
            const existingMap = localStorage.getItem('templateCategoryMap');
            if (existingMap) {
                categoryMap = JSON.parse(existingMap);
            }
            
            // Get the newest template in the list (based on creation date)
            if (templates.length > 0) {
                templates.sort((a, b) => b.rawDateCreated - a.rawDateCreated);
                const newestTemplate = templates[0];
                
                // If the newest template is very recent (created in the last 5 minutes)
                const now = new Date();
                const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
                
                if (newestTemplate.rawDateCreated > fiveMinutesAgo) {
                    // Transfer the category mapping to the actual template name
                    categoryMap[newestTemplate.name] = selectedCategory;
                    
                    // Remove the temporary name entry
                    delete categoryMap[lastTemplateName];
                    
                    // Update localStorage
                    localStorage.setItem('templateCategoryMap', JSON.stringify(categoryMap));
                    localStorage.removeItem('lastTemplateName');
                    localStorage.removeItem('selectedTemplateCategory');
                    
                    // Force refresh to show the correct category
                    fetchTemplates();
                }
            }
        } catch (error) {
            // Silent error handling
        }
    }, [templates]);

    // Check for template updates after editing
    useEffect(() => {
        try {
            // Check if we were editing a template
            const originalName = localStorage.getItem('editingTemplate');
            if (!originalName) return;
            
            // Get the category map
            let categoryMap = {};
            try {
                const existingMap = localStorage.getItem('templateCategoryMap');
                if (existingMap) {
                    categoryMap = JSON.parse(existingMap);
                }
            } catch (error) {}
            
            // Find the template with that name
            const originalTemplate = templates.find(t => t.name === originalName);
            
            // If we can't find it by the original name, it might have been renamed
            if (!originalTemplate) {
                // If we had a custom category for this template
                if (categoryMap[originalName]) {
                    const originalCategory = categoryMap[originalName];
                    
                    // Get the most recently edited template 
                    const sortedTemplates = [...templates].sort((a, b) => {
                        const timeA = a.rawLastUpdated ? a.rawLastUpdated.getTime() : 0;
                        const timeB = b.rawLastUpdated ? b.rawLastUpdated.getTime() : 0;
                        return timeB - timeA; // Sort descending (newest first)
                    });
                    
                    if (sortedTemplates.length > 0) {
                        const recentlyEdited = sortedTemplates[0];
                        
                        // Transfer the category to the new name
                        categoryMap[recentlyEdited.name] = originalCategory;
                        delete categoryMap[originalName];
                        
                        // Save the updated map
                        localStorage.setItem('templateCategoryMap', JSON.stringify(categoryMap));
                        
                        // Force a refresh to show the correct category
                        fetchTemplates();
                    }
                }
            } else {
                // Template wasn't renamed, preserve its original category
                const currentCategory = categoryMap[originalName];
                
                // Don't let the category change to "COA" if we have saved a different category
                if (originalTemplate.category === 'COA' && currentCategory && currentCategory !== 'COA') {
                    originalTemplate.category = currentCategory;
                }
                
                // Always update our mapping with the current category
                categoryMap[originalTemplate.name] = originalTemplate.category;
                localStorage.setItem('templateCategoryMap', JSON.stringify(categoryMap));
            }
            
            // Remove the editing flag after a short delay to ensure category is preserved
            setTimeout(() => {
                localStorage.removeItem('editingTemplate');
                fetchTemplates();
            }, 1000);
        } catch (error) {
            localStorage.removeItem('editingTemplate');
        }
    }, [templates]);

    // Sort data function
    const sortData = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Filter and sort templates
    const filteredTemplates = useMemo(() => {
        let filtered = [...templates];

        // Apply search
        if (searchTerm) {
            filtered = filtered.filter(template =>
                template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                template.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                template.createdBy.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply status filter
        if (statusFilter) {
            filtered = filtered.filter(template => template.status === statusFilter);
        }

        // Apply category filter
        if (categoryFilter) {
            filtered = filtered.filter(template => template.category === categoryFilter);
        }

        // Apply sort
        if (sortConfig.key) {
            filtered.sort((a, b) => {
                // Special handling for date fields
                if (sortConfig.key === 'dateCreated') {
                    return sortConfig.direction === 'asc' 
                        ? a.rawDateCreated - b.rawDateCreated 
                        : b.rawDateCreated - a.rawDateCreated;
                }
                else if (sortConfig.key === 'lastUpdated') {
                    // Handle null values for lastUpdated
                    if (!a.rawLastUpdated) return sortConfig.direction === 'asc' ? -1 : 1;
                    if (!b.rawLastUpdated) return sortConfig.direction === 'asc' ? 1 : -1;
                    
                    return sortConfig.direction === 'asc' 
                        ? a.rawLastUpdated - b.rawLastUpdated 
                        : b.rawLastUpdated - a.rawLastUpdated;
                }
                // Normal string comparison for other fields
                else {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
                }
            });
        }

        return filtered;
    }, [templates, searchTerm, statusFilter, categoryFilter, sortConfig]);

    const openModal = () => {
        // Reset selected category when opening the modal
        setSelectedCategory('');
        setIsModalOpen(true);
    };
    
    const closeModal = () => setIsModalOpen(false);

    const handleSelectAll = (event) => {
        if (event.target.checked) {
            const activeTemplateIds = filteredTemplates
                .filter(template => template.status === 'Active')
                .map(template => template.id);
            setSelectedItems(new Set(activeTemplateIds));
        } else {
            setSelectedItems(new Set());
        }
    };

    const handleSelectItem = (id, status) => {
        if (status === 'In Active') return;
        
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

    const handleStatusClick = (templateId) => {
        setActiveStatusDropdown(activeStatusDropdown === templateId ? null : templateId);
    };

    const handleStatusChange = async (templateId, newStatus) => {
        try {
            // Get the token
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Authentication required. Please log in.');
                navigate('/login');
                return;
            }
            
            // In a real implementation, you'd call an API to update the status
            // await axios.patch(`http://localhost:5000/api/templates/${templateId}`, 
            //   { status: newStatus },
            //   { headers: { 'Authorization': `Bearer ${token}` } }
            // );
            
            // For now, just update the UI
        setTemplates(prevTemplates =>
            prevTemplates.map(template =>
                template.id === templateId ? { ...template, status: newStatus } : template
            )
        );
        setActiveStatusDropdown(null);
        } catch (error) {
            console.error('Error updating template status:', error);
            alert('Failed to update template status');
        }
    };

    const handleSaveAndNext = () => {
        if (!selectedCategory) {
            alert('Please select a category');
            return;
        }

        localStorage.setItem('selectedTemplateCategory', selectedCategory);
        
        const tempName = `New Template ${new Date().toISOString()}`;
        
        try {
            let categoryMap = {};
            const existingMap = localStorage.getItem('templateCategoryMap');
            if (existingMap) {
                categoryMap = JSON.parse(existingMap);
            }
            
            categoryMap[tempName] = selectedCategory;
            localStorage.setItem('templateCategoryMap', JSON.stringify(categoryMap));
            localStorage.setItem('lastTemplateName', tempName);
        } catch (error) {
            // Silent error handling
        }
        
        setIsModalOpen(false);
        navigate('/template');
    };

    // Handle delete template
    const handleDeleteTemplate = async (templateId) => {
        try {
            setDeletingTemplateId(templateId);
            
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
                return;
            }
    
            const template = templates.find(t => t.id === templateId);
            if (!template) {
                setDeletingTemplateId(null);
                return;
            }
            
            if (template.backendId) {
                try {
                    await axios.delete(
                        `http://localhost:5000/api/templates/delete/${template.backendId}`, 
                        {
                            headers: { Authorization: `Bearer ${token}` }
                        }
                    );
                    
                    await fetchTemplates();
                    setDeletingTemplateId(null);
                    return;
                } catch (deleteError) {
                    // Fallback to alternative deletion method
                }
            }
            
            // Fallback: Get fresh template list and find the matching template
            try {
                const response = await axios.get('http://localhost:5000/api/templates/list', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                if (!response.data?.success || !response.data?.data) {
                    setDeletingTemplateId(null);
                    return;
                }
                
                // Find the template by matching name and date
                const backendTemplate = response.data.data.find(bt => 
                    bt.name === template.name && 
                    new Date(bt.created_date).toLocaleDateString() === template.dateCreated
                );
                
                if (!backendTemplate?.id) {
                    setDeletingTemplateId(null);
                    return;
                }
                
                // Delete the template using the found ID
                await axios.delete(
                    `http://localhost:5000/api/templates/delete/${backendTemplate.id}`, 
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );
                
                await fetchTemplates();
            } catch (error) {
                // Handle silently
            } finally {
                setDeletingTemplateId(null);
            }
        } catch (error) {
            setDeletingTemplateId(null);
        }
    };
    
    // Handle edit template
    const handleEditTemplate = (templateId) => {
        // Find the template with this frontend ID
        const template = templates.find(t => t.id === templateId);
        
        if (!template) {
            return;
        }
        
        // Store template data in localStorage
        localStorage.setItem('editTemplateData', JSON.stringify({
            templateId: template.id,
            backendId: template.backendId,
            name: template.name,
            description: template.description || '',
            status: template.status,
            repeatType: template.repeatType || '',
            priorityType: template.priorityType || '',
            category: template.category,
            categoryId: template.categoryId || '',
            dateCreated: template.dateCreated,
            lastUpdated: template.lastUpdated,
            createdBy: template.createdBy
        }));
        
        // Save the original name and category for tracking through edits
        try {
            // Get existing map or create a new one
            let categoryMap = {};
            const existingMap = localStorage.getItem('templateCategoryMap');
            if (existingMap) {
                categoryMap = JSON.parse(existingMap);
            }
            
            // Add a special flag to indicate we're editing this template
            localStorage.setItem('editingTemplate', template.name);
            
            // Always save the current category for this template
            categoryMap[template.name] = template.category;
            localStorage.setItem('templateCategoryMap', JSON.stringify(categoryMap));
        } catch (error) {
            // Handle silently
        }
        
        // Navigate to the template page
        navigate('/template');
    };

    return (
        <div className="db-container">
            {/* Navigation */}
            <nav className="db-nav">
                <div className={`db-nav-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
                    <i className="fi fi-rr-users"></i>
                    <span>Users</span>
                </div>
                <div className={`db-nav-item ${activeTab === 'roles' ? 'active' : ''}`} onClick={() => setActiveTab('roles')}>
                    <i className="fi fi-rr-user"></i>
                    <span>Roles</span>
                </div>
                <div className={`db-nav-item ${activeTab === 'infrastructure' ? 'active' : ''}`} onClick={() => setActiveTab('infrastructure')}>
                    <i className="fi fi-rr-building"></i>
                    <span>Infrastructure</span>
                </div>
                <div className={`db-nav-item ${activeTab === 'templates' ? 'active' : ''}`} onClick={() => setActiveTab('templates')}>
                    <i className="fi fi-rr-file"></i>
                    <span>Templates</span>
                </div>
            </nav>

            {/* Main Content */}
            <div className="db-content">
                {activeTab === 'templates' && (
                    <>
                        <div className="db-header">
                            <div className="db-header-title">
                                <h1>Template list</h1>
                                <p className="db-header-subtitle">Keep track of templates and their datas.</p>
                            </div>
                            <div className="db-header-buttons">
                                <button className="db-button secondary">
                                    <i className="fi fi-rr-download"></i>
                                    <span>Import</span>
                                </button>
                                <button className="db-button primary" onClick={openModal}>
                                    <i className="fi fi-rr-plus"></i>
                                    <span>Add Template</span>
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="db-loading">
                                <p>Loading templates...</p>
                            </div>
                        ) : error ? (
                            <div className="db-error">
                                <p>{error}</p>
                                <button 
                                    className="db-button primary" 
                                    onClick={() => navigate('/login')}
                                >
                                    Go to Login
                                </button>
                            </div>
                        ) : templates.length > 0 ? (
                            <div className="db-table">
                                {/* Filter and Search */}
                                <div className="db-filter-search">
                                    <div className="db-filter-buttons">
                                        <button 
                                            className={`db-button ${!statusFilter && !categoryFilter ? 'primary' : ''}`}
                                            onClick={() => { setStatusFilter(''); setCategoryFilter(''); }}
                                        >
                                            View all
                                        </button>
                                        <select 
                                            className="db-button"
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                        >
                                            <option value="">Status: All</option>
                                            <option value="Active">Active</option>
                                            <option value="In Active">Inactive</option>
                                        </select>
                                        <select 
                                            className="db-button"
                                            value={categoryFilter}
                                            onChange={(e) => setCategoryFilter(e.target.value)}
                                        >
                                            <option value="">Category: All</option>
                                            {categories.map(category => (
                                                <option key={category} value={category}>{category}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="db-search-filter">
                                        <div className="db-search">
                                            <i className="fi fi-rr-search db-search-icon"></i>
                                            <input 
                                                type="text" 
                                                placeholder="Search" 
                                                className="db-search-input"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Table */}
                                <div className="db-table-container">
                                    <table className="db-table">
                                        <thead>
                                            <tr>
                                                <th>
                                                    <input
                                                        type="checkbox"
                                                        onChange={handleSelectAll}
                                                        checked={
                                                            filteredTemplates.length > 0 &&
                                                            filteredTemplates
                                                                .filter(t => t.status === 'Active')
                                                                .every(t => selectedItems.has(t.id))
                                                        }
                                                    />
                                                </th>
                                                <th onClick={() => sortData('name')}>
                                                    File name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                                </th>
                                                <th onClick={() => sortData('status')}>
                                                    Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                                </th>
                                                <th onClick={() => sortData('dateCreated')}>
                                                    Date created {sortConfig.key === 'dateCreated' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                                </th>
                                                <th onClick={() => sortData('lastUpdated')}>
                                                    Last updated {sortConfig.key === 'lastUpdated' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                                </th>
                                                <th onClick={() => sortData('category')}>
                                                    Category {sortConfig.key === 'category' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                                </th>
                                                <th onClick={() => sortData('createdBy')}>
                                                    Created by {sortConfig.key === 'createdBy' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                                </th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredTemplates.map((template) => (
                                                <tr key={template.id}>
                                                    <td>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedItems.has(template.id)}
                                                            onChange={() => handleSelectItem(template.id, template.status)}
                                                            disabled={template.status === 'In Active'}
                                                        />
                                                    </td>
                                                    <td>
                                                        <div className="db-table-cell">
                                                            <div className="db-icon-container">
                                                                <i className="fi fi-rr-file db-icon"></i>
                                                            </div>
                                                            {template.name}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div style={{ position: 'relative' }}>
                                                            <div
                                                                className={`db-status ${template.status === 'Active' ? 'active' : 'inactive'}`}
                                                                onClick={() => handleStatusClick(template.id)}
                                                            >
                                                                <span className={`db-status-dot ${template.status === 'Active' ? 'active' : 'inactive'}`} />
                                                                {template.status}
                                                                <i className="fi fi-rr-angle-small-down"></i>
                                                            </div>
                                                            {activeStatusDropdown === template.id && (
                                                                <div className="db-status-dropdown">
                                                                    <div 
                                                                        className="db-status-option active"
                                                                        onClick={() => handleStatusChange(template.id, 'Active')}
                                                                    >
                                                                        <span className="db-status-dot active" />
                                                                        Active
                                                                    </div>
                                                                    <div 
                                                                        className="db-status-option inactive"
                                                                        onClick={() => handleStatusChange(template.id, 'In Active')}
                                                                    >
                                                                        <span className="db-status-dot inactive" />
                                                                        Inactive
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td>{template.dateCreated}</td>
                                                    <td>{template.lastUpdated}</td>
                                                    <td>
                                                        <span 
                                                            className="db-category" 
                                                            data-category={template.category}
                                                        >
                                                            {template.category}
                                                        </span>
                                                    </td>
                                                    <td>{template.createdBy}</td>
                                                    <td>
                                                        <div className="db-actions">
                                                            <button 
                                                                className="db-action-button"
                                                                onClick={() => handleDeleteTemplate(template.id)}
                                                                disabled={deletingTemplateId === template.id}
                                                            >
                                                                {deletingTemplateId === template.id ? (
                                                                    <span className="loading-spinner"></span>
                                                                ) : (
                                                                    <i className="fi fi-rr-trash"></i>
                                                                )}
                                                            </button>
                                                            <button 
                                                                className="db-action-button"
                                                                onClick={() => handleEditTemplate(template.id)}
                                                            >
                                                                <i className="fi fi-rr-edit"></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <div className="db-pagination">
                                        <div className="db-pagination-info">Page 1 of 10</div>
                                        <div className="db-pagination-buttons">
                                            <button className="db-button">Previous</button>
                                            <button className="db-button">Next</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="db-empty-state">
                                <div className="db-empty-icon">
                                    <i className="fi fi-rr-upload"></i>
                                </div>
                                <h3>Start by uploading a file</h3>
                                <p>Any assets used in projects will live here.</p>
                                <p>Start creating by uploading your files.</p>
                                <div className="db-empty-buttons">
                                    <button className="db-button-new" onClick={openModal}>
                                        <i className="fi fi-rr-plus"></i>
                                        <span>Add New</span>
                                    </button>
                                    <label className="db-button primary">
                                        <i className="fi fi-rr-upload"></i>
                                        <span>Upload</span>
                                        <input type="file" accept=".jpg,.jpeg,.png,.doc,.docx,.pdf" style={{ display: 'none' }} />
                                    </label>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="close-button" onClick={closeModal}>&times;</button>
                        <h2>Select Category</h2>
                        <form>
                            <div className="form-group">
                                <select 
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    required
                                    >
                                    <option value="" disabled>Select Category</option>
                                    {categories.length > 0 ? (
                                        categories.map(category => (
                                        <option key={category} value={category}>{category}</option>
                                        ))
                                    ) : (
                                        <option disabled>No categories available</option>
                                    )}
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="db-button cancel" onClick={closeModal}>Cancel</button>
                                <button 
                                    type="button" 
                                    className="db-button primary"
                                    onClick={handleSaveAndNext}
                                    disabled={!selectedCategory}
                                >
                                    Save and Next
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
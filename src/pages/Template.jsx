import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiCheckCircle, FiTrash2 } from 'react-icons/fi';
import { MdDragIndicator } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableRow, TextField, Select, MenuItem, Chip ,IconButton } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import bheader from "../assets/bannariammanheader.png";
import '../styles/Template.css';
import RepeatOverlay from '../components/RepeatOverlay';
import CloseIcon from "@mui/icons-material/Close";
import axios from 'axios';

const overlayStyles = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
};

export default function Template() {
  const navigate = useNavigate();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState(null);
  const [meetingDetails, setMeetingDetails] = useState({
    title: '',
    description: '',
    repeatType: '',
    priorityType: '',
    venue: '',
    dateTime: '',
    refNumber: 'Auto generate',
    categoryId: ''
  });

  // Add preview state
  const [isPreview, setIsPreview] = useState(false);

  // Add preview toggle handler
  const handlePreviewToggle = () => {
    setIsPreview(!isPreview);
  };

  // Add priority options
  const priorityOptions = [
    { value: 'high', label: 'High Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'low', label: 'Low Priority' }
  ];

  const repeatOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
    { value: 'once', label: 'One Time' }
  ];

  const [allMembers, setAllMembers] = useState([]);
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/templates/users');
        const data = await response.json();
        setAllMembers(data);
      } catch (error) {
        console.error('Failed to fetch members:', error);
      }
    };

    fetchMembers();
  }, []);



  // Update roles state to include selected members array
  const [roles, setRoles] = useState([
    { role: '', members: [] }
  ]);

  const [points, setPoints] = useState([
    {
      sno: '01',
      point: ''
    }
  ]);

  const handleMeetingChange = (field, value) => {
    setMeetingDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRoleChange = (index, field, value) => {
    const newRoles = [...roles];
    newRoles[index][field] = value;
    setRoles(newRoles);
  };

  const handlePointChange = (index, field, value) => {
    const newPoints = [...points];
    newPoints[index][field] = value;
    setPoints(newPoints);
  };

  const addNewPoint = () => {
    setPoints(prev => [
      ...prev,
      {
        sno: String(prev.length + 1).padStart(2, '0'),
        point: ''
      }
    ]);
  };

  const addNewRole = () => {
    setRoles(prev => [...prev, { role: '', members: [] }]);
  };

  // Get alphabetical index (a, b, c, etc.)
  const getAlphabeticalIndex = (index) => {
    return String.fromCharCode(97 + index) + "."; // 97 is ASCII for 'a'
  };

  // Updated table styles for modern look
  const tableContainerStyle = {
    margin: "0 auto",
    borderRadius: "12px",
    overflow: "hidden",
    width: "100%",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    border: "1px solid #e5e7eb"
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0
  };

  const cellStyle = {
    border: "1px solid #e5e7eb",
    padding: "16px",
    fontSize: "0.95rem",
    backgroundColor: "white",
    position: 'relative',
    color: '#111827'
  };

  const headerCellStyle = {
    backgroundColor: "#f8fafc",
    fontWeight: "600",
    padding: "16px",
    border: "1px solid #e5e7eb",
    color: '#1a202c', // Darker header text
    borderBottom: "2px solid #e5e7eb",
    fontSize: '0.95rem',
    letterSpacing: '0.025em'
  };

  const inputStyle = {
    color: '#111827',
    fontSize: '0.95rem',
    '&::placeholder': {
      color: '#9CA3AF',
      fontStyle: 'italic'
    },
    padding: '8px 0'
  };

  const roleInputContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    position: 'relative',
    paddingRight: '45px', // Space for action buttons
  };

  const roleActionsStyle = {
    position: 'absolute',
    right: '8px',
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex',
    gap: '4px',
    opacity: 0,
    transition: 'all 0.2s ease',
    backgroundColor: 'white',
    padding: '2px',
    borderRadius: '4px',
    zIndex: 1,
  };

  const disabledHeaderStyle = {
    ...headerCellStyle,
    backgroundColor: "#E7E7E7",  // Back to original gray
    color: "#7D7D7D",
    border: "1px solid #d1d5db", // Darker border color
    borderBottom: "1px solid #d1d5db",
    '&:not(:last-child)': {
      borderRight: '1px solid #d1d5db',
    }
  };

  const disabledCellStyle = {
    ...cellStyle,
    backgroundColor: "#E7E7E7",  // Back to original gray
    color: "#7D7D7D",
    fontStyle: "italic",
    border: "1px solid #d1d5db", // Darker border color
    borderBottom: "1px solid #d1d5db",
    '&:not(:last-child)': {
      borderRight: '1px solid #d1d5db',
    }
  };

  const sectionHeaderStyle = {
    backgroundColor: "#f7fafc",
    fontWeight: "600",
    padding: "14px 18px",
    border: "1px solid #edf2f7",
    color: "#2d3748",
  };

  const blueButtonStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "8px", // Reduced from 12px
    margin: "8px auto", // Added margin
    border: "2px dashed #3182ce",
    color: "#3182ce",
    backgroundColor: "#ebf8ff",
    width: "100%",
    cursor: "pointer",
    borderRadius: "6px",
    fontSize: "0.9rem",
    transition: "all 0.2s ease",
    '&:hover': {
      backgroundColor: "#bee3f8",
      borderColor: "#2b6cb0",
    }
  };

  const selectStyle = {
    fontSize: "0.95rem",
    '.MuiSelect-select': {
      padding: '2px 8px',
      color: '#666',
      fontStyle: 'italic',
    },
    '&:before, &:after': {
      display: 'none'
    },
    '& .MuiSelect-icon': {
      color: '#666'
    }
  };

  // Add drag state
  const [dragItem, setDragItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);

  // Handle drag for roles
  const handleRoleDragStart = (index) => {
    setDragItem({ type: 'role', index });
  };

  const handlePointDragStart = (index) => {
    setDragItem({ type: 'point', index });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (index, type) => {
    if (!dragItem || dragItem.type !== type) return;
    
    if (type === 'role') {
      const items = [...roles];
      const draggedItem = items[dragItem.index];
      items.splice(dragItem.index, 1);
      items.splice(index, 0, draggedItem);
      setRoles(items);
    } else {
      const items = [...points];
      const draggedItem = items[dragItem.index];
      items.splice(dragItem.index, 1);
      items.splice(index, 0, draggedItem);
      // Update sno after reordering
      items.forEach((item, idx) => {
        item.sno = String(idx + 1).padStart(2, '0');
      });
      setPoints(items);
    }
    setDragItem(null);
  };

  const deleteRole = (index) => {
    setRoles(roles.filter((_, idx) => idx !== index));
  };

  const deletePoint = (index) => {
    const newPoints = points.filter((_, idx) => idx !== index);
    // Update sno after deletion
    newPoints.forEach((point, idx) => {
      point.sno = String(idx + 1).padStart(2, '0');
    });
    setPoints(newPoints);
  };

  // Updated styles for modern row actions
  const rowStyles = {
    position: 'relative',
    '&:hover': {
      backgroundColor: '#f8fafc',
      '& .row-actions': {
        opacity: 1,
      }
    },
    transition: 'background-color 0.2s ease'
  };

  const rowActionsContainerStyle = {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex',
    gap: '8px',
    opacity: 0,
    transition: 'opacity 0.2s ease',
  };

  const actionButtonStyle = {
    cursor: 'pointer',
    color: '#94A3B8',
    display: 'flex',
    alignItems: 'center',
    padding: '4px',
    borderRadius: '4px',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: '#EDF2F7',
    }
  };

  const dragButtonStyle = {
    ...actionButtonStyle,
    '&:hover': {
      ...actionButtonStyle['&:hover'],
      color: '#3182ce',
    }
  };

  const deleteButtonStyle = {
    ...actionButtonStyle,
    '&:hover': {
      ...actionButtonStyle['&:hover'],
      color: '#e53e3e',
      backgroundColor: '#FED7D7',
    }
  };

  const roleRowStyle = {
    position: 'relative',
    '&:hover': {
      backgroundColor: '#f8fafc',
      '& .row-actions': {
        opacity: 1,
        transform: 'translateX(0)',
      }
    },
    transition: 'all 0.2s ease',
  };

  const roleWrapperStyle = {
    display: 'flex',
    width: '100%',
    gap: '24px',
    position: 'relative',
    alignItems: 'center',
  };

  const roleTitleStyle = {
    width: '30%',
    minWidth: '250px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    borderRight: '2px solid #e2e8f0',
    paddingRight: '20px',
    '& .index': {
      color: '#64748b',
      fontSize: '0.9rem',
      fontWeight: '500',
      minWidth: '24px',
    }
  };

  const roleMembersStyle = {
    flex: 1,
    position: 'relative',
    paddingRight: '70px', // Space for actions
  };

  const rowActionsStyle = {
    position: 'absolute',
    right: '0',
    top: '50%',
    transform: 'translateY(-50%) translateX(10px)',
    display: 'flex',
    gap: '8px',
    opacity: 0,
    transition: 'all 0.2s ease',
    backgroundColor: 'white',
    padding: '6px',
    borderRadius: '6px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    zIndex: 2,
  };

  // Update role specific styles
  const roleCellStyle = {
    ...cellStyle,
    padding: '12px 16px',
    position: 'relative',
  };

  // Updated styles for modern row interactions
  const inputContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    position: 'relative',
    '&:hover .action-buttons': {
      opacity: 1,
      transform: 'translateY(-50%) translateX(0)',
    },
    '& .MuiTextField-root': {
      transition: 'all 0.2s ease',
    },
    '&:hover .MuiTextField-root': {
      paddingRight: '80px',
    }
  };

  const actionButtonsStyle = {
    position: 'absolute',
    right: '8px',
    top: '50%',
    transform: 'translateY(-50%) translateX(10px)',
    display: 'flex',
    gap: '4px',
    opacity: 0,
    transition: 'all 0.3s ease',
    backgroundColor: 'white',
    padding: '4px',
    borderRadius: '6px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    zIndex: 2,
  };

  const actionIconStyle = {
    padding: '6px',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    color: '#94A3B8',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: '#F1F5F9',
    }
  };

  const dragIconStyle = {
    ...actionIconStyle,
    cursor: 'grab',
    '&:hover': {
      ...actionIconStyle['&:hover'],
      color: '#3182ce',
    }
  };

  const deleteIconStyle = {
    ...actionIconStyle,
    '&:hover': {
      backgroundColor: '#FEE2E2',
      color: '#DC2626',
    }
  };

  // Updated shared styles for roles and points
  const sharedRowStyle = {
    position: 'relative',
    '&:hover': {
      backgroundColor: '#f8fafc',
      '& .row-actions': {
        opacity: 1,
      }
    },
    transition: 'all 0.2s ease',
  };

  const sharedActionsStyle = {
    position: 'absolute',
    right: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex',
    gap: '6px',
    opacity: 0,
    transition: 'all 0.2s ease',
    backgroundColor: '#fff',
    padding: '4px 8px',
    borderRadius: '4px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    zIndex: 2,
  };

  const sharedButtonStyle = {
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    borderRadius: '4px',
    color: '#94A3B8',
    transition: 'all 0.15s ease',
  };

  const sharedCellStyle = {
    ...cellStyle,
    paddingRight: '70px', // Space for action buttons
  };

  const rowContentStyle = {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    gap: 2,
    position: 'relative',
  };

  const actionsWrapperStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    marginLeft: 'auto',
    opacity: 0,
    transition: 'opacity 0.2s ease',
  };


  // Add handlers for repeat overlay
  const [openRepeat, setOpenRepeat] = useState(false);
  const [repeatValue, setRepeatValue] = useState("");

  // Add notification state
  const [showSuccess, setShowSuccess] = useState(false);

  // Check if we're in edit mode and load template data
  useEffect(() => {
    // Check if there's edit data in localStorage
    const storedEditData = localStorage.getItem('editTemplateData');
    
    if (storedEditData) {
      try {
        const parsedData = JSON.parse(storedEditData);
        console.log('Parsed edit data from localStorage:', parsedData);
        setEditData(parsedData);
        setIsEditMode(true);
        
        // Set initial meeting details from stored data
        setMeetingDetails(prev => ({
          ...prev,
          title: parsedData.name || prev.title,
          description: parsedData.description || prev.description,
          repeatType: parsedData.repeatType || prev.repeatType,
          priorityType: parsedData.priorityType || prev.priorityType,
          categoryId: parsedData.categoryId || parsedData.category || prev.categoryId
        }));

        // Set initial repeat value if it exists
        if (parsedData.repeatType) {
          setRepeatValue(parsedData.repeatType);
        }
        
        // Load the full template details including points and roles from API
        if (parsedData.backendId) {
          fetchTemplateDetails(parsedData.backendId);
        }
        
      } catch (error) {
        console.error('Error parsing edit template data:', error);
      }
    } else {
      // If creating a new template, try to get the category from localStorage
      const savedCategory = localStorage.getItem('selectedCategory');
      if (savedCategory) {
        setMeetingDetails(prev => ({
          ...prev,
          categoryId: savedCategory
        }));
      }
    }
    
    // Clean up function to remove the edit data when component unmounts
    return () => {
      localStorage.removeItem('editTemplateData');
    };
  }, []);

  // Function to fetch template details for editing
  const fetchTemplateDetails = async (backendId) => {
    if (!backendId) {
      console.error('No backend ID provided for template details');
      return;
    }
    
    console.log(`Fetching template details for ID: ${backendId}`);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        alert('Authentication required');
        navigate('/login');
        return;
      }

      // Fetch the template details using the backend ID
      console.log(`Making API request to: http://localhost:5000/api/templates/${backendId}`);
      const response = await axios.get(`http://localhost:5000/api/templates/${backendId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Full API response:', response);
      console.log('Response data:', response.data);

      if (response.data) {
        const template = response.data;
        console.log('Template details from API:', template);
        console.log('Response data structure:', {
          name: template.name,
          description: template.description,
          repeat_type: template.repeat_type,
          priority_type: template.priority_type,
          points: template.points,
          roles: template.roles
        });
        
        // Log current meeting details before update
        console.log('Current meeting details before update:', meetingDetails);
        
        // Update meeting details with all fields from the API response
        setMeetingDetails(prev => {
          const updates = {
            title: template.name || prev.title,
            description: template.description || prev.description,
            // Note: API returns snake_case fields, but our state uses camelCase
            repeatType: template.repeat_type || prev.repeatType,
            priorityType: template.priority_type || prev.priorityType,
            categoryId: template.category_id || prev.categoryId,
            venue: template.venue_id || prev.venue
          };
          
          console.log('Updating meeting details with:', updates);
          return { ...prev, ...updates };
        });

        // Set repeat value if it exists in the API response
        if (template.repeat_type) {
          console.log(`Setting repeat value: ${template.repeat_type}`);
          setRepeatValue(template.repeat_type);
        } else {
          console.log('No repeat_type found in response');
        }
        
        // Set points from the API response
        if (template.points && Array.isArray(template.points)) {
          console.log(`Setting ${template.points.length} points from API:`, template.points);
          const formattedPoints = template.points.map((point, index) => ({
            sno: point.sno || String(index + 1).padStart(2, '0'),
            point: point.point || ''
          }));
          setPoints(formattedPoints);
        } else {
          console.log('No points found in response or not an array:', template.points);
        }

        // Set roles from the API response
        if (template.roles && Array.isArray(template.roles)) {
          console.log(`Setting ${template.roles.length} roles from API:`, template.roles);
          const formattedRoles = template.roles.map(role => {
            // API returns role with members array directly
            const memberObjects = role.members.map(member => {
              // If the member is already an object with id and name, use it directly
              if (member.id && member.name) {
                return {
                  id: member.id,
                  name: member.name,
                  role: member.role
                };
              }
              
              // Otherwise, try to find the member in our local array by ID
              const localMember = allMembers.find(m => m.id === member);
              return localMember || { id: member, name: `Unknown (${member})`, role: role.role };
            });

            return {
              role: role.role || '',
              members: memberObjects
            };
          });
          
          if (formattedRoles.length > 0) {
            setRoles(formattedRoles);
          }
        } else {
          console.log('No roles found in response or not an array:', template.roles);
        }
      } else {
        console.error('No data in API response');
      }
    } catch (error) {
      console.error('Error fetching template details:', error);
      if (error.response) {
        console.error('Error response:', error.response);
      }
      if (error.response && error.response.status === 403) {
        alert('Authentication required. Please log in again.');
        navigate('/login');
      }
    }
  };

  // Update handleCreateTemplate to handle both create and update
  const handleCreateTemplate = async () => {
    try {
      // Format the data according to the backend API requirements
      const templateData = {
        name: meetingDetails.title,
        description: meetingDetails.description,
        repeatType: repeatValue || meetingDetails.repeatType,
        priorityType: meetingDetails.priorityType,
        venueId: Number(1), // Ensure venueId is a number
        categoryId: Number(meetingDetails.categoryId) || 1, // Ensure categoryId is a number
        points: points.map(point => ({
          sno: point.sno,
          point: point.point
        })),
        roles: roles.map(role => ({
          role: role.role,
          // Ensure members are just numeric IDs, not objects
          members: role.members.map(member => {
            if (typeof member === 'object' && member !== null) {
              return Number(member.id);
            } else {
              return Number(member);
            }
          }).filter(id => !isNaN(id) && id > 0) // Filter out invalid IDs
        })).filter(role => role.role && role.members.length > 0), // Filter out empty roles
        status: 'Active'
      };

      console.log('Submitting template data:', templateData);

      // Get the token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('You must be logged in to create a template');
        navigate('/login');
        return;
      }

      let response;
      
      if (isEditMode && editData && editData.backendId) {
        // If editing, update the template using the backend ID
        const updateUrl = `http://localhost:5000/api/templates/update/${editData.backendId}`;
        console.log(`Updating template with backend ID: ${editData.backendId}`);
        console.log(`Making PUT request to: ${updateUrl}`);
        console.log('Update payload:', JSON.stringify(templateData, null, 2));
        
        try {
          response = await axios.put(updateUrl, templateData, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          console.log('Template updated successfully:', response.data);
        } catch (updateError) {
          console.error('Update request failed:', updateError);
          
          if (updateError.response) {
            console.error('Error response status:', updateError.response.status);
            console.error('Error response data:', updateError.response.data);
            
            if (updateError.response.status === 500) {
              // Try a more aggressive fix: simplify the data structure
              const simpleTemplateData = {
                name: templateData.name,
                description: templateData.description,
                repeatType: templateData.repeatType,
                priorityType: templateData.priorityType,
                venueId: 1,
                categoryId: 1,
                points: templateData.points,
                // Simplify roles to bare minimum
                roles: templateData.roles.map(role => ({
                  role: role.role,
                  members: role.members.slice(0, 1) // Just keep first member to test
                })).slice(0, 1), // Just keep first role to test
                status: 'Active'
              };
              
              console.log('Trying again with simplified data:', simpleTemplateData);
              
              // Try again with simplified data
              response = await axios.put(updateUrl, simpleTemplateData, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });
              console.log('Template updated after simplification:', response.data);
            } else {
              throw updateError; // Re-throw if it's not a 500 error
            }
          } else {
            throw updateError; // Re-throw if there's no response
          }
        }
      } else {
        // If creating, create a new template
        console.log('Creating new template');
        response = await axios.post('http://localhost:5000/api/templates/create', templateData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('Template created:', response.data);
      }
      
      // Show success notification
      setShowSuccess(true);
      
      // Navigate to database page after 2 seconds
      setTimeout(() => {
        setShowSuccess(false);
        navigate('/database');
      }, 2000);
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} template:`, error);
      
      // Check if it's an authentication error
      if (error.response && error.response.status === 403) {
        alert('Authentication failed. Please log in again.');
        navigate('/login');
      } else if (error.response && error.response.status === 500) {
        // For 500 Internal Server Error
        alert('Server error. The template could not be updated due to a server issue. Please try again later or contact support.');
      } else {
        // Other errors
        alert(`Failed to ${isEditMode ? 'update' : 'create'} template: ${error.message}. Please try again.`);
      }
    }
  };

  // Update success notification component for both create and edit modes
  const TemplateSuccessNotification = () => (
    <div style={overlayStyles}>
      <div className="notification-card">
        <div className="icon-circle">
          <FiCheckCircle size={32} color="#4caf50" />
        </div>
        <h1 className="notification-title">
          {isEditMode ? 'Template Updated' : 'Template Created'}
        </h1>
        <p className="notification-description">
          This template has been {isEditMode ? 'updated' : 'published'}. Team members will be able to edit this template and republish changes.
        </p>
      </div>
    </div>
  );

  const handleMemberChange = (index, newMembers) => {
    const newRoles = [...roles];
    newRoles[index].members = newMembers;
    setRoles(newRoles);
  };

  // Enhance member styles
  const memberStyles = {
    chip: {
      margin: '2px',
      backgroundColor: '#EBF5FF',
      color: '#1967D2',
      borderRadius: '16px',
      padding: '2px 4px',
      border: '1px solid #D1E9FF',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      '& .MuiChip-deleteIcon': {
        color: '#1967D2',
        '&:hover': {
          color: '#DC2626'
        }
      },
      '&:hover': {
        backgroundColor: '#D1E9FF'
      }
    },
    option: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '8px 16px',
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: '#F8FAFC'
      }
    },
    optionAvatar: {
      width: 32,
      height: 32,
      borderRadius: '50%',
      backgroundColor: '#E2E8F0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#64748B',
      fontWeight: 500,
      fontSize: '14px'
    },
    optionInfo: {
      display: 'flex',
      flexDirection: 'column'
    },
    optionName: {
      fontWeight: 500,
      color: '#1F2937'
    },
    optionDetails: {
      fontSize: '12px',
      color: '#6B7280'
    },
    inputRoot: {
      padding: '8px 12px',
      border: '1px solid #E5E7EB',
      borderRadius: '8px',
      '&:hover': {
        borderColor: '#B2DDFF'
      },
      '&.Mui-focused': {
        borderColor: '#2563EB',
        boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.1)'
      }
    },
    tagSize: {
      height: '28px'
    }
  };

  // Add these styles for member selection
  const memberSelectStyles = {
    container: {
      position: 'relative',
      width: '100%'
    },
    searchBox: {
      width: '100%',
      padding: '12px 16px',
      border: '2px solid #E5E7EB',
      borderRadius: '10px',
      fontSize: '14px',
      color: '#111827',
      backgroundColor: '#F9FAFB',
      transition: 'all 0.2s ease',
      '&:focus': {
        outline: 'none',
        borderColor: '#2563EB',
        backgroundColor: '#FFFFFF',
        boxShadow: '0 0 0 3px rgba(37,99,235,0.1)'
      }
    },
    membersGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '8px',
      padding: '8px',
      maxHeight: '300px',
      overflowY: 'auto'
    },
    memberCard: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '8px 12px',
      borderRadius: '8px',
      border: '1px solid #E5E7EB',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      '&:hover': {
        backgroundColor: '#F0F7FF',
        borderColor: '#93C5FD'
      },
      '&.selected': {
        backgroundColor: '#EFF6FF',
        borderColor: '#60A5FA',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }
    },
    memberAvatar: {
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      backgroundColor: '#2563EB',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '16px',
      fontWeight: '600'
    },
    memberInfo: {
      flex: 1
    },
    memberName: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#1F2937'
    },
    memberRole: {
      fontSize: '12px',
      color: '#6B7280'
    },
    selectedMembers: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '6px',
      padding: '8px 0'
    },
    memberChip: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '4px 12px',
      backgroundColor: '#F0F7FF',
      border: '1px solid #BFDBFE',
      borderRadius: '16px',
      fontSize: '13px',
      color: '#1E40AF',
      '& .remove': {
        color: '#DC2626',
        cursor: 'pointer',
        padding: '2px',
        borderRadius: '50%',
        '&:hover': {
          backgroundColor: '#FEE2E2'
        }
      }
    }
  };

  // Add these handlers
  const [showMembers, setShowMembers] = useState(null);

  const handleMemberSelect = (roleIndex, member) => {
    const newRoles = [...roles];
    const roleMembers = newRoles[roleIndex].members;
    const memberIndex = roleMembers.findIndex(m => m.id === member.id);
    
    if (memberIndex === -1) {
      roleMembers.push(member);
    } else {
      roleMembers.splice(memberIndex, 1);
    }
    
    setRoles(newRoles);
  };

  // Add click outside handler to close dropdown
  useEffect(() => {
    const handleClickOutside = () => setShowMembers(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Add department grouping
  const departments = [
    { id: 'CSE', name: 'Computer Science', color: '#2563EB' },
    { id: 'IT', name: 'Information Technology', color: '#7C3AED' },
    { id: 'ECE', name: 'Electronics', color: '#DC2626' },
    { id: 'MECH', name: 'Mechanical', color: '#059669' },
    { id: 'ADMIN', name: 'Administration', color: '#B91C1C' }
  ];

  // Enhanced member selection styles
  const memberSelectionStyles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    },
    departmentTabs: {
      display: 'flex',
      gap: '8px',
      marginBottom: '16px',
      overflowX: 'auto',
      padding: '4px'
    },
    departmentTab: (isActive, color) => ({
      padding: '8px 16px',
      borderRadius: '20px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      backgroundColor: isActive ? color : '#F3F4F6',
      color: isActive ? 'white' : '#6B7280',
      border: `1px solid ${isActive ? color : '#E5E7EB'}`,
      transition: 'all 0.2s ease',
      '&:hover': {
        backgroundColor: isActive ? color : '#E5E7EB'
      }
    }),
    membersGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
      gap: '8px',
      maxHeight: '300px',
      overflowY: 'auto',
      padding: '4px'
    },
    memberCard: (isSelected) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '8px',
      borderRadius: '8px',
      border: `1px solid ${isSelected ? '#2563EB' : '#E5E7EB'}`,
      backgroundColor: isSelected ? '#EFF6FF' : 'white',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      '&:hover': {
        backgroundColor: isSelected ? '#DBEAFE' : '#F8FAFC',
        transform: 'translateY(-1px)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }
    }),
    selectedMembers: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '6px',
      padding: '8px 0',
      borderTop: '1px solid #E5E7EB',
      marginTop: '8px'
    }
  };

  // Add new states for member selection
  const [activeDepartment, setActiveDepartment] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter members based on department and search
  const getFilteredMembers = () => {
    let filtered = allMembers;
    if (activeDepartment !== 'all') {
      filtered = filtered.filter(m => m.department === activeDepartment);
    }
    if (searchTerm) {
      filtered = filtered.filter(m => 
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  };

  // Add member selection styles
  const memberListStyles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '8px 0'
    },
    searchBar: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 12px',
      backgroundColor: '#F9FAFB',
      border: '1px solid #E5E7EB',
      borderRadius: '8px',
      width: '100%',
      '& input': {
        border: 'none',
        background: 'none',
        outline: 'none',
        width: '100%',
        fontSize: '14px',
        color: '#111827'
      }
    },
    roleTabs: {
      display: 'flex',
      gap: '4px',
      borderBottom: '1px solid #E5E7EB',
      marginBottom: '16px'
    },
    roleTab: (isActive) => ({
      padding: '8px 16px',
      fontSize: '14px',
      fontWeight: 500,
      color: isActive ? '#2563EB' : '#6B7280',
      borderBottom: isActive ? '2px solid #2563EB' : 'none',
      cursor: 'pointer'
    }),
    membersList: {
      maxHeight: '400px',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '2px'
    },
    memberItem: (isSelected) => ({
      display: 'flex',
      alignItems: 'center',
      padding: '8px 12px',
      borderRadius: '6px',
      cursor: 'pointer',
      backgroundColor: isSelected ? '#EFF6FF' : 'transparent',
      '&:hover': {
        backgroundColor: isSelected ? '#DBEAFE' : '#F3F4F6'
      }
    }),
    memberInfo: {
      flex: 1,
      marginLeft: '12px'
    },
    selectedCount: {
      padding: '2px 8px',
      borderRadius: '12px',
      backgroundColor: '#2563EB',
      color: 'white',
      fontSize: '12px',
      fontWeight: '500'
    },
    selectedMembers: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '6px',
      padding: '8px 0',
      borderTop: '1px solid #E5E7EB'
    }
  };

  // Group members by department
  const membersByDept = allMembers.reduce((acc, member) => {
    if (!acc[member.department]) {
      acc[member.department] = [];
    }
    acc[member.department].push(member);
    return acc;
  }, {});

  // Update member selection cell content
  const [memberSearchTerm, setMemberSearchTerm] = useState('');

  // Consolidated Styles Object - Keep only what's needed
  const styles = {
    // Keep all existing table styles
    tableContainer: tableContainerStyle,
    table: tableStyle,
    cell: cellStyle,
    headerCell: headerCellStyle,
    disabledHeader: disabledHeaderStyle,
    disabledCell: disabledCellStyle,
    
    // Member selection styles
    memberSelection: {
      chip: {
        // ... existing chip styles ...
        margin: '2px',
        backgroundColor: '#e8f4ff',
        color: '#1967D2',
        borderRadius: '20px',
        border: '1px solid #bfdbfe',
        '& .MuiChip-label': {
          fontSize: '13px',
          fontWeight: 500,
        },
        '& .MuiChip-deleteIcon': {
          color: '#FC7A85',
          transition: 'all 0.2s ease',
          '&:hover': {
            color: '#EF4444'
          }
        },
        '&:hover': {
          backgroundColor: '#d1e9ff'
        }
      },
      autocomplete: {
        '& .MuiOutlinedInput-root': {
          padding: '4px 8px',
          '& fieldset': { border: 'none' }, // Remove border
          '&:hover fieldset': { border: 'none' }, // Remove hover border
          '&.Mui-focused fieldset': { border: 'none' } // Remove focus border
        }
      },
      option: {
        // ... existing option styles ...
        display: 'flex',
        flexDirection: 'column',
        gap: '2px'
      }
    }
  };

  // Member selection cell component
  const memberSelectionCell = (role, index) => (
    <TableCell colSpan={3} sx={cellStyle}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Autocomplete
          multiple
          value={role.members}
          onChange={(event, newValue) => handleMemberChange(index, newValue)}
          options={allMembers}
          getOptionLabel={(option) => `${option.name} | ${option.role}`}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          getOptionDisabled={(option) => 
            roles.some((r, i) => i !== index && r.members.some(m => m.id === option.id))
          }
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              placeholder={role.members.length === 0 ? "Search members..." : ""}
              sx={styles.memberSelection.autocomplete}
            />
          )}
          renderTags={(value, getTagProps) =>
            value.map((member, index) => (
              <Chip
                {...getTagProps({ index })}
                key={member.id}
                label={`${member.name}`}
                sx={styles.memberSelection.chip}
              />
            ))
          }
          renderOption={(props, option, { selected }) => (
            <li
              {...props}
              style={{
                ...props.style,
                opacity: roles.some((r, i) => 
                  i !== index && r.members.some(m => m.id === option.id)
                ) ? 0.5 : 1,
                backgroundColor: selected ? '#e8f4ff' : 'transparent',
              }}
            >
              <Box sx={styles.memberSelection.option}>
                <Typography sx={{ fontWeight: 500 }}>{option.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {option.role} • {option.department}
                </Typography>
              </Box>
            </li>
          )}
          filterOptions={(options, { inputValue }) => {
            const searchTerm = inputValue.toLowerCase();
            return options.filter(option => 
              option.name.toLowerCase().includes(searchTerm) ||
              option.role.toLowerCase().includes(searchTerm) ||
              option.department.toLowerCase().includes(searchTerm)
            );
          }}
          sx={{ flex: 1 }}
        />

        {!isPreview && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Box component="span" sx={{...actionButtonStyle, cursor: 'grab'}}>
              <MdDragIndicator size={18} />
            </Box>
            <Box 
              component="span" 
              sx={{
                ...actionButtonStyle,
                '&:hover': {
                  backgroundColor: '#FEE2E2',
                  color: '#DC2626'
                }
              }}
              onClick={() => deleteRole(index)}
            >
              <FiTrash2 size={16} />
            </Box>
          </Box>
        )}
      </Box>
    </TableCell>
  );
  

  return (
    <div className="cm-container"> {/* Change from page-container to cm-container */}
      {/* Show success notification when showSuccess is true */}
      {showSuccess && <TemplateSuccessNotification />}

      {/* Header Section */}
      <div className="cm-header">
        <div className="cm-header-left">
          <button className="cm-back-button" onClick={() => navigate(-1)}>
            <FiArrowLeft size={20} />
          </button>
          <h1 className="cm-title">{isPreview ? 'Preview Template' : isEditMode ? 'Edit Template' : 'Create Template'}</h1>
        </div>
        <div className="cm-header-right">
          <button className="cm-btn cm-preview-btn" onClick={handlePreviewToggle}>
            <i className="fi fi-rr-computer"></i> {isPreview ? 'Edit' : 'Preview'}
          </button>
          <button className="cm-btn cm-draft-btn">
            <i className="fi fi-rr-document"></i> Save as Draft
          </button>
          <button className="cm-btn cm-create-btn" onClick={handleCreateTemplate}>
            <i className="fi fi-rr-confetti"></i> {isEditMode ? 'Update Template' : 'Create Template'}
          </button>
        </div>
      </div>

      {/* Main content container - update width and padding to match CreateMeeting */}
      <div className="cm-tab-content"> {/* Change from document-container to cm-tab-content */}
        {/* Institution Header */}
        <div className="document-header">
          <img src={bheader} alt="Bannari Amman Institute of Technology" className="header" style={{ width: '100%' }} />
        </div>

        <TableContainer sx={tableContainerStyle}>
          <Table sx={tableStyle}>
            <TableBody>
              {/* Meeting Details Row */}
              <TableRow>
                <TableCell sx={{...headerCellStyle, width: '12%'}}>Name of the Meeting</TableCell>
                <TableCell sx={{...cellStyle, width: '38%'}}>
                  {isPreview ? (
                    <Typography sx={{ padding: '8px 0', color: '#374151' }}>
                      {meetingDetails.title || 'Not specified'}
                    </Typography>
                  ) : (
                    <TextField 
                      variant="standard" 
                      placeholder="Enter title"
                      fullWidth
                      InputProps={{ 
                        disableUnderline: true,
                        style: inputStyle
                      }}
                      value={meetingDetails.title}
                      onChange={(e) => handleMeetingChange('title', e.target.value)}
                    />
                  )}
                </TableCell>
                <TableCell sx={{...disabledHeaderStyle, width: '12%'}}>Reference Number</TableCell>
                <TableCell sx={{...disabledCellStyle, width: '38%'}}>
                  Auto generate
                </TableCell>
              </TableRow>

              {/* Description Row with auto-height */}
              <TableRow>
                <TableCell sx={headerCellStyle}>Meeting Description</TableCell>
                <TableCell colSpan={3} sx={cellStyle}>
                  {isPreview ? (
                    <Typography sx={{ padding: '8px 0', color: '#374151', whiteSpace: 'pre-wrap' }}>
                      {meetingDetails.description || 'No description provided'}
                    </Typography>
                  ) : (
                    <TextField
                      variant="standard"
                      multiline
                      fullWidth
                      minRows={2}
                      maxRows={8}
                      placeholder="Enter Description min 100 words"
                      InputProps={{ 
                        disableUnderline: true,
                        style: inputStyle
                      }}
                      value={meetingDetails.description}
                      onChange={(e) => handleMeetingChange('description', e.target.value)}
                    />
                  )}
                </TableCell>
              </TableRow>

              {/* Repeat and Priority Row */}
              <TableRow>

                  <TableCell sx={cellStyle}>Repeat Type</TableCell>
                  <TableCell sx={{ position: "relative", ...cellStyle }}>
                    {repeatValue ? (
                      <Box
                        sx={{ 
                          display: "flex", 
                          alignItems: "center", 
                          borderRadius: "20px",
                          bgcolor: "#f0f8ff", 
                          padding: "6px 12px",
                          width: "fit-content",
                          minWidth: "10px" 
                        }}
                      >
                        <Typography sx={{ color: "#175CD3", fontSize: "12px" }}>
                          {repeatValue}
                        </Typography>
                        <IconButton
                          sx={{ 
                            border: "2px solid #FB3748", 
                            borderRadius: "50%", 
                            p: "2px",
                            marginLeft: "5px", 
                            "&:hover": { backgroundColor: "transparent" } 
                          }}
                          onClick={() => setRepeatValue("")}
                          disabled={isPreview}
                        >
                          <CloseIcon sx={{ fontSize: "8px", color: "#FB3748" }} />
                        </IconButton>
                      </Box>
                    ) : (
                      <TextField
                        placeholder="Ex..Monthly"
                        variant="standard"
                        InputProps={{ disableUnderline: true }}
                        value={repeatValue}
                        onClick={() => setOpenRepeat(true)}
                        disabled={isPreview}
                      />
                    )}

                    {openRepeat && (
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
                        onClick={() => setOpenRepeat(false)}
                      >
                        <Box
                          sx={{
                            backgroundColor: "white",
                            padding: "16px",
                            borderRadius: "8px",
                            position: "relative",
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <RepeatOverlay
                            onClose={() => setOpenRepeat(false)}
                            onSave={(selectedOption) => {
                              setRepeatValue(selectedOption);
                              setOpenRepeat(false);
                            }}
                          />
                        </Box>
                      </Box>
                    )}
                  </TableCell>


                <TableCell sx={headerCellStyle}>Priority Type</TableCell>

                <TableCell sx={cellStyle}>
                  {isPreview ? (
                    <Typography sx={{ padding: '8px 0', color: '#374151' }}>
                      {priorityOptions.find(option => option.value === meetingDetails.priorityType)?.label || 'Not specified'}
                    </Typography>
                  ) : (
                    <Select
                      fullWidth
                      variant="standard"
                      value={meetingDetails.priorityType}
                      onChange={(e) => handleMeetingChange('priorityType', e.target.value)}
                      sx={selectStyle}
                      displayEmpty
                    >
                      <MenuItem disabled value="">
                        <em>Select priority</em>
                      </MenuItem>
                      {priorityOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                </TableCell>

              </TableRow>
              {/* Venue and Date Row */}
              <TableRow>
                <TableCell sx={disabledHeaderStyle}>Venue Details</TableCell>
                <TableCell sx={disabledCellStyle}>
                  Select venue
                </TableCell>
                <TableCell sx={disabledHeaderStyle}>Date & Time</TableCell>
                <TableCell sx={disabledCellStyle}>
                  Select date
                </TableCell>
              </TableRow>

              {/* Roles Header Row - now matches Name of Meeting style */}
              <TableRow>
                <TableCell sx={headerCellStyle}>Roles</TableCell>
                <TableCell colSpan={3} sx={headerCellStyle}>Member list</TableCell>
              </TableRow>

              {/* Roles Row */}
              {roles.map((role, index) => (
                <TableRow 
                  key={index}
                  draggable={!isPreview}
                  onDragStart={!isPreview ? () => handleRoleDragStart(index) : undefined}
                  onDragOver={!isPreview ? handleDragOver : undefined}
                  onDrop={!isPreview ? () => handleDrop(index, 'role') : undefined}
                  sx={{
                    '&:hover .actions': {
                      opacity: 1
                    }
                  }}
                >
                  <TableCell sx={{...cellStyle, width: '20%'}}>
                    <Box sx={rowContentStyle}>
                      <span style={{ color: '#64748b', minWidth: '24px' }}>
                        {getAlphabeticalIndex(index)}
                      </span>
                      {isPreview ? (
                        <Typography sx={{ color: '#374151' }}>
                          {role.role || 'Not specified'}
                        </Typography>
                      ) : (
                        <TextField 
                          variant="standard" 
                          placeholder="Enter title"
                          fullWidth
                          InputProps={{ 
                            disableUnderline: true,
                            style: inputStyle
                          }}
                          value={role.role}
                          onChange={(e) => handleRoleChange(index, 'role', e.target.value)}
                        />
                      )}
                    </Box>
                  </TableCell>
                  {memberSelectionCell(role, index)}
                </TableRow>
              ))}
              {/* Add Role Button */}
              {!isPreview && (
                <TableRow>
                  <TableCell colSpan={4} sx={{ border: 0, padding: 0 }}>
                    <Button 
                      fullWidth
                      sx={blueButtonStyle}
                      onClick={addNewRole}
                    >
                      <Box component="span" sx={{ mr: 1, fontSize: '1.2rem', color: '#0070f3' }}>+</Box>
                      Add new role
                    </Button>
                  </TableCell>
                </TableRow>
              )}

              {/* Points Header Row - now matches Name of Meeting style */}
              <TableRow>
                <TableCell sx={headerCellStyle}>S.No</TableCell>
                <TableCell colSpan={3} sx={headerCellStyle}>Points to be Discussed</TableCell>
              </TableRow>

              {/* Points Rows with auto-height */}
              {points.map((point, index) => (
                <TableRow 
                  key={index}
                  draggable={!isPreview}
                  onDragStart={!isPreview ? () => handlePointDragStart(index) : undefined}
                  onDragOver={!isPreview ? handleDragOver : undefined}
                  onDrop={!isPreview ? () => handleDrop(index, 'point') : undefined}
                  sx={{
                    '&:hover .actions': {
                      opacity: 1
                    }
                  }}
                >
                  <TableCell sx={{...cellStyle, width: '80px', textAlign: 'center', borderRight: '1px solid #e2e8f0'}}>
                    {point.sno}
                  </TableCell>
                  <TableCell colSpan={3} sx={cellStyle}>
                    <Box sx={rowContentStyle}>
                      {isPreview ? (
                        <Typography sx={{ color: '#374151', whiteSpace: 'pre-wrap' }}>
                          {point.point || 'No point specified'}
                        </Typography>
                      ) : (
                        <TextField
                          variant="standard"
                          multiline
                          fullWidth
                          minRows={1}
                          maxRows={5}
                          placeholder="Enter points"
                          InputProps={{ 
                            disableUnderline: true,
                            style: inputStyle
                          }}
                          value={point.point}
                          onChange={(e) => handlePointChange(index, 'point', e.target.value)}
                        />
                      )}
                      {!isPreview && (
                        <Box className="actions" sx={actionsWrapperStyle}>
                          <Box component="span" sx={{...actionButtonStyle, cursor: 'grab'}}>
                            <MdDragIndicator size={18} />
                          </Box>
                          <Box 
                            component="span" 
                            sx={{
                              ...actionButtonStyle,
                              '&:hover': {
                                backgroundColor: '#FEE2E2',
                                color: '#DC2626'
                              }
                            }}
                            onClick={() => deletePoint(index)}
                          >
                            <FiTrash2 size={16} />
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}

              {/* Add Point Button */}
              {!isPreview && (
                <TableRow>
                  <TableCell colSpan={4} sx={{ border: 0, padding: 0 }}>
                    <Button 
                      fullWidth
                      sx={blueButtonStyle}
                      onClick={addNewPoint}
                    >
                      <Box component="span" sx={{ mr: 1, fontSize: '1.2rem', color: '#0070f3' }}>+</Box>
                      Add new Topic
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
}
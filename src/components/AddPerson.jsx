import React, { useState, useEffect } from 'react';
import profileImage from '../assets/profileimage.png';
import '../styles/AddPerson.css'; // Import the CSS file

const AddPerson = ({
  isOpen,
  role,
  onClose,
  selectedMembers = [],
  onSave = () => {}, // Provide a default empty function
  allSelectedMembers = {}, // Pass all selected members for other roles
}) => {
  const [allMembers] = useState([
    { id: 1, name: 'Adela Parkson', role: 'HOD-CSE', image: profileImage },
    { id: 2, name: 'Robert Smith', role: 'HOD-IT', image: profileImage },
    { id: 3, name: 'Emily Johnson', role: 'HOD-Design', image: profileImage },
    { id: 4, name: 'Michael Brown', role: 'HOD-Operations', image: profileImage },
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setSelectedIds(selectedMembers.map((member) => member.id));
    }
  }, [isOpen, selectedMembers]);

  const toggleSelection = (id) => {
    setSelectedIds((prevSelected) =>
      prevSelected.includes(id) ? prevSelected.filter((item) => item !== id) : [...prevSelected, id]
    );
  };

  const handleSave = () => {
    const selected = allMembers.filter((member) => selectedIds.includes(member.id));
    onSave(selected);
    onClose();
  };

  const filteredMembers = allMembers.filter((member) =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isAlreadySelected = (id) => {
    return Object.entries(allSelectedMembers)
      .filter(([key]) => key !== role)
      .flatMap(([, members]) => members)
      .some((member) => member.id === id);
  };

  if (!isOpen) return null;

  return (
    <div className="add-person-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="add-person-overlay-content">
        <div className="add-person-overlay-header">
          <h3>Assign Members</h3>
          <button className="add-person-close-btn" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="add-person-search-container">
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="add-person-form-input"
          />
        </div>
        <div className="add-person-members-list">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className={`add-person-member-item ${selectedIds.includes(member.id) ? 'selected' : ''} ${isAlreadySelected(member.id) ? 'already-selected' : ''}`}
              onClick={() => !isAlreadySelected(member.id) && toggleSelection(member.id)}
            >
              {isAlreadySelected(member.id) ? (
                <div className="already-selected-indicator">
                  <i className="fi fi-rr-check"></i>
                </div>
              ) : (
                <label className="custom-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(member.id)}
                    onChange={() => toggleSelection(member.id)}
                  />
                  <span className="checkbox-checkmark"></span>
                </label>
              )}
              <img src={member.image} alt={member.name} className="add-person-member-image" />
              <span className="add-person-member-name">{member.name}</span>
              <span className="add-person-member-role">{member.role}</span>
            </div>
          ))}
        </div>
        <div className="add-person-footer">
          <button className="add-person-footer-btn add-person-deselect-all" onClick={() => setSelectedIds([])}>
            Deselect All
          </button>
          <span className="add-person-selected-count">Selected {selectedIds.length}</span>
          <button className="add-person-footer-btn add-person-assign" onClick={handleSave}>
            Assign
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPerson;

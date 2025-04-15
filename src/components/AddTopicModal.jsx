import React, { useState, useEffect } from 'react';
import '../styles/AddTopicModal.css';
import AddPerson from './AddPerson';
import { Editor } from 'primereact/editor';

const AddTopicModal = ({ isOpen, onClose, onSave, mode, parentTopic, existingTopic }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [incharge, setIncharge] = useState(null);
  const [deadline, setDeadline] = useState('');
  const [showAddPersonOverlay, setShowAddPersonOverlay] = useState(false);

  useEffect(() => {
    if (existingTopic && mode !== 'subtopic') {
      setTitle(existingTopic.title);
      setDescription(existingTopic.description);
      setIncharge(existingTopic.incharge);
      setDeadline(existingTopic.incharge?.deadline || '');
    }
  }, [existingTopic, mode]);

  const handleSave = () => {
    if (mode === 'incharge' || mode === 'deadline') {
      // Only update incharge and/or deadline
      const updatedIncharge = {
        ...(existingTopic?.incharge || {}),
        ...(incharge ? {
          id: incharge.id,
          name: incharge.name,
          avatar: incharge.avatar,
          role: incharge.role,
        } : {}),
        deadline: deadline || null
      };

      const topic = {
        ...existingTopic,
        incharge: updatedIncharge
      };
      onSave(topic, mode, parentTopic);
    } else {
      // Handle new topic or subtopic
      const topic = {
        id: existingTopic ? existingTopic.id : Date.now(),
        title,
        description,
        incharge: incharge ? {
          id: incharge.id,
          name: incharge.name,
          avatar: incharge.avatar,
          role: incharge.role,
          deadline: deadline || null
        } : null,
        status: existingTopic?.status || 'orange',
      };
      onSave(topic, mode, parentTopic);
    }
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setIncharge(null);
    setDeadline('');
  };

  const handleAddIncharge = (selectedMembers) => {
    if (selectedMembers.length > 0) {
      setIncharge(selectedMembers[0]);
    }
    setShowAddPersonOverlay(false);
  };

  const TagLabel = ({ label, onClose }) => (
    <div className="create-meeting-tag-label">
      <span className="create-meeting-label-text">{label}</span>
      <button
        className="create-meeting-close-button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        &#x2716; {/* Unicode for the "X" symbol */}
      </button>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>
          {mode === 'subtopic' ? 'Add Sub Topic' : 
           mode === 'incharge' ? 'Add Incharge' : 
           mode === 'deadline' ? 'Set Deadline' : 'Add New Topic'}
        </h2>
        {mode !== 'incharge' && mode !== 'deadline' && (
          <>
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter title"
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <Editor
                value={description}
                onTextChange={(e) => setDescription(e.htmlValue)}
                style={{ height: '100px' }}
                placeholder="Enter description"
              />
            </div>
          </>
        )}
        {mode === 'topic' && (
          <>
            <div className="form-group">
              <label>Incharge</label>
              <div
                className="create-meeting-form-select"
                onClick={() => setShowAddPersonOverlay(true)}
              >
                {!incharge ? (
                  <span className="create-meeting-form-placeholder-text">Select incharge</span>
                ) : (
                  <TagLabel
                    label={`${incharge.name} | ${incharge.role}`}
                    onClose={() => setIncharge(null)}
                  />
                )}
              </div>
            </div>
            <div className="form-group">
              <label>Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
          </>
        )}
        {mode === 'incharge' && (
          <div className="form-group">
            <label>Incharge</label>
            <div
              className="create-meeting-form-select"
              onClick={() => setShowAddPersonOverlay(true)}
            >
              {!incharge ? (
                <span className="create-meeting-form-placeholder-text">Select incharge</span>
              ) : (
                <TagLabel
                  label={`${incharge.name} | ${incharge.role}`}
                  onClose={() => setIncharge(null)}
                />
              )}
            </div>
            <label>Deadline</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
        )}
        {mode === 'deadline' && (
          <div className="form-group">
            <label>Deadline</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
        )}
        <div className="modal-actions">
          <button className="cm-cancel-btn" onClick={onClose}>Cancel</button>
          <button onClick={handleSave}>Save</button>
        </div>
      </div>
      <AddPerson
        isOpen={showAddPersonOverlay}
        role="incharge"
        selectedMembers={incharge ? [incharge] : []}
        onClose={() => setShowAddPersonOverlay(false)}
        onSave={handleAddIncharge}
      />
    </div>
  );
};

export default AddTopicModal;

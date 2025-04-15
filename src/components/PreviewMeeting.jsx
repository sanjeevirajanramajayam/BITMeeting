import React, { useState } from 'react';
import DOMPurify from 'dompurify';
import '../styles/PreviewMeeting.css';

const PreviewMeeting = ({ meetingData, onClose }) => {
  const [expandedItems, setExpandedItems] = useState({});

  if (!meetingData) return null;

  const participants = meetingData.participants || {};
  const agenda = meetingData.agenda || [];

  const sanitizedDescription = DOMPurify.sanitize(meetingData.description || '');

  const toggleExpand = (id) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const allMembers = [
    ...Object.values(participants).flat(),
    ...agenda.map((topic) => topic.incharge).filter(Boolean),
  ];

  const getPriorityBadgeStyle = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high priority':
        return { backgroundColor: 'rgb(243, 232, 255)', color: 'rgb(124, 58, 237)' };
      case 'no priority':
        return { backgroundColor: 'rgb(198, 193, 193)', color: 'rgb(100, 100, 100)' }; // Change color for "No priority"
      default:
        return { backgroundColor: 'rgb(243, 232, 255)', color: 'rgb(124, 58, 237)' };
    }
  };

  const renderTopicItem = (item) => {
    const isExpanded = expandedItems[item.id];

    return (
      <div key={item.id} className="cm-topic-item">
        <div className="cm-topic-header">
          <div className="cm-topic-title-wrapper">
            <div className={`cm-status-indicator ${item.status || 'orange'}`} />
            <h3 className="cm-topic-title">{item.title}</h3>
          </div>
          <div className="cm-action-buttons">
            <div 
              className="cm-icon-button"
              onClick={() => toggleExpand(item.id)}
            >
              {isExpanded ? <i className="fi fi-rr-minus"></i> : <i className="fi fi-rr-plus"></i>}
            </div>
            <div className="cm-icon-button">
              <i className="fi fi-rr-menu-dots-vertical"></i>
            </div>
          </div>
        </div>

        {item.forwarded && (
          <div className="cm-forwarded-message">Forwarded from previous meeting</div>
        )}

        {isExpanded && (
          <div className="cm-expanded-content">
            <p className="cm-description" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item.description) }} style={{ textAlign: 'left' }} />
            {item.subtopics && item.subtopics.length > 0 && (
              <div className="cm-nested-topics">
                {item.subtopics.map((subtopic, index) => (
                  <div key={index} className="cm-nested-topic">
                    <div className="cm-nested-topic-header">
                      <h4 className="cm-nested-topic-title">{subtopic.title}</h4>
                    </div>
                    <p className="cm-description" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(subtopic.description) }} style={{ textAlign: 'left' }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="cm-topic-footer">
          <div className="cm-footer-left">
            {item.incharge ? (
              <div className="cm-incharge-info">
                <div className="cm-incharge-avatar">
                  <img 
                    src={item.incharge.avatar || "../assets/profileimage.png"} 
                    alt="Incharge"
                    className="cm-profile-image" 
                  />
                </div>
                <div className="cm-incharge-details">
                  <div className="cm-incharge-name">
                    Incharge: {item.incharge.name}
                  </div>
                  {item.incharge.members && item.incharge.members.length > 0 && (
                    <div className="cm-incharge-members">
                      Members: {item.incharge.members.map(member => member.name).join(', ')}</div>
                  )}
                </div>
              </div>
            ) : (
              <div className="cm-no-incharge">
                <div className="cm-incharge-placeholder">
                  <div className="cm-dashed-circle">
                    <i className="fi fi-rr-user"></i>
                  </div>
                </div>
              </div>
            )}
            <div className="cm-deadline">
              {item.incharge && item.incharge.deadline ? 
                `Deadline: ${new Date(item.incharge.deadline).toLocaleDateString()}` : 
                'Select deadline'}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="preview-overlay">
      <div className="preview-content">
        <button className="add-person-close-btn close-button" onClick={onClose}>×</button>
        <div className="card">
          {/* Header */}
          <div className="header">
            <h1 className="title">{meetingData.title}</h1>
            <span className="priority-badge" style={getPriorityBadgeStyle(meetingData.priority)}>
              {meetingData.priority.toUpperCase()}
            </span>
          </div>

          {/* Meeting Details Grid */}
          <div className="details-grid">
            <div className="detail-item">
              <h2>VENUE</h2>
              <p>{meetingData.venue}</p>
            </div>
            <div className="detail-item">
              <h2>CREATED DATE</h2>
              <p>{new Date(meetingData.createdAt).toLocaleString()}</p>
            </div>
            <div className="detail-item">
              <h2>DUE DATE</h2>
              <p>{new Date(meetingData.dateTime).toLocaleString()}</p>
            </div>
            <div className="detail-item">
              <h2>REPEAT</h2>
              <p>{meetingData.repeatOption || 'None'}</p>
            </div>
          </div>

          {/* Description */}
          <div className="description">
            <h2>Description</h2>
            <div dangerouslySetInnerHTML={{ __html: sanitizedDescription }} />
          </div>

          {/* Members */}
          <div className="members">
            <div className="section-header">
              <h2>Members</h2>
              <span className="count">({allMembers.length})</span>
            </div>

            <div className="members-list two-columns">
              {Object.entries(participants).map(([role, members]) =>
                members.map((member, index) => (
                  <div key={index} className="member-card">
                    <div className="member-info">
                      <div className="avatar">
                        <i className="fi fi-rr-user"></i>
                      </div>
                      <div className="member-details">
                        <h3>{member.name}</h3>
                        <p>{member.role}</p>
                      </div>
                    </div>
                    <span className="member-badge">{role.charAt(0).toUpperCase() + role.slice(1)}</span>
                  </div>
                ))
              )}
              {agenda.map((topic) =>
                topic.incharge ? (
                  <div key={topic.incharge.id} className="member-card">
                    <div className="member-info">
                      <div className="avatar">
                        <i className="fi fi-rr-user"></i>
                      </div>
                      <div className="member-details">
                        <h3>{topic.incharge.name}</h3>
                        <p>{topic.incharge.role}</p>
                      </div>
                    </div>
                    <span className="member-badge">Incharge</span>
                  </div>
                ) : null
              )}
            </div>
          </div>

          {/* Topics */}
          <div>
            <div className="section-header">
              <h2>Topics to Discuss</h2>
              <span className="count">({agenda.length})</span>
            </div>

            <div className="topics-list">
              {agenda.map((topic, index) => renderTopicItem(topic))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewMeeting;

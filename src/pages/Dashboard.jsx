import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import { parse, isSameDay, isAfter } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import "../styles/Dashboard.css";
import DashboardRightPanel from "../components/DashboardRightPanel";
import noTodoImage from "../assets/nomeetings.png";
import profileImage from "../assets/profileimage.png";
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import axios from 'axios';
import customParseFormat from "dayjs/plugin/customParseFormat";
// dayjs.extend(customParseFormat);
const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("Todo");
  const [date, setDate] = useState(dayjs());
  const [meetings, setMeetings] = useState([]);
  const navigate = useNavigate();

  const tabs = ["Todo", "Scheduled", "Draft"];

  const fetchMeetings = async () => {
    try {
      const token = localStorage.getItem('token'); // Ensure token is saved at login
      const response = await axios.get('http://localhost:5000/api/meetings/get-user-meetings', {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      if (response.data.success) {
        const formattedMeetings = response.data.meetings.map(meeting => ({
          id: meeting.id,
          type: `Info: ${meeting.role}`,
          title: meeting.meeting_name,
          date: dayjs(meeting.start_time).format("dddd, D MMMM, YYYY"),
          duration: dayjs(meeting.end_time).diff(dayjs(meeting.start_time), 'minute') + " min",
          location: "Venue ID: " + meeting.venue_id,
          description: meeting.meeting_description,
          host: `${meeting.created_by}`,
          priority: meeting.priority.toUpperCase() + " PRIORITY",
          deadline: meeting.meeting_status === "not_started" ? "Upcoming" : null,
          progress: meeting.meeting_status === "in_progress" ? "40%" : null,
          repeat_type: meeting.repeat_type.toUpperCase(),
          members: meeting.members,
          points: meeting.points,
          host_id: meeting.created_by_id
        }));

        setMeetings(formattedMeetings);
      }
    } catch (error) {
      console.error("Failed to fetch meetings:", error);
    }
  };
  //var filteredMeetings = [];
  useEffect(() => {
    fetchMeetings();
  }, []);

  // filteredMeetings = meetings;

  const filteredMeetings = meetings.filter((meeting) => {
    const meetingDate = parse(meeting.date, "EEEE, d MMMM, yyyy", new Date());
  
    if (activeTab === "Todo") {
      return isSameDay(meetingDate, new Date());
    } else if (activeTab === "Scheduled") {
      return isAfter(meetingDate, new Date());
    } else if (activeTab === "Draft") {
      return false;
    } else {
      return true;
    }
  });  

  // const filteredMeetings = meetings.filter((meeting) => {
  //   const meetingDate = dayjs(meeting.date, "dddd, D MMMM, YYYY");
  //   if (activeTab === "Todo") {
  //     return meetingDate.isSame(dayjs(), 'day');
  //   } else if (activeTab === "Scheduled") {
  //     return meetingDate.isAfter(dayjs(), 'day');
  //   } else if (activeTab === "Draft") {
  //     return false;
  //   } else {
  //     return meeting;
  //   }
  // });

  const handleMeetingCardClick = (meetingData) => {
    navigate('/admin-access', { state: { meetingData } });
  };

  const getNoMeetingsMessage = () => {
    switch (activeTab) {
      case "Todo":
        return "No meetings are scheduled for today.";
      case "Scheduled":
        return "No upcoming meetings are scheduled.";
      case "Draft":
        return "No draft meetings available.";
      default:
        return "";
    }
  };

  const events = [
    { id: 1, title: "BOS Meeting", time: "09:00 AM - 10:00 AM", color: "#007bff" },
    { id: 2, title: "Grievance Meeting", time: "10:00 AM - 11:00 AM", color: "#ffc107" },
  ];

  return (
    <div className="main-container">
      {/* Left Panel */}
      <div className="left-panel">
        {/* Tabs */}
        <div className="tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`tab ${activeTab === tab ? "active-tab" : ""}`}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}
            >
              {tab === "Todo" && <i className="fi fi-rr-calendar"></i>}
              {tab === "Scheduled" && <i className="fi fi-rr-clock"></i>}
              {tab === "Draft" && <i className="fi fi-rr-file"></i>}
              {tab}
            </button>
          ))}
        </div>

        {/* Search + Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', marginBottom: '20px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <SearchIcon style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d' }} />
            <input
              type="text"
              placeholder="Search"
              style={{
                width: '100%',
                padding: '10px 12px 10px 36px',
                border: '1px solid #ccc',
                borderRadius: '6px',
                outline: 'none',
                fontSize: '14px',
                height: '36px'
              }}
            />
          </div>
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '8px 12px',
              backgroundColor: 'white',
              color: '#6c757d',
              border: '1px solid #ccc',
              borderRadius: '6px',
              cursor: 'pointer',
              height: '36px',
              minWidth: '120px',
              whiteSpace: 'nowrap'
            }}
          >
            <FilterListIcon style={{ fontSize: '18px' }} />
            <span style={{ fontSize: '14px' }}>Filter BY</span>
          </button>
        </div>

        {/* Meeting Cards */}
        {filteredMeetings.length === 0 ? (
          <div className="no-todo-container">
            <img src={noTodoImage} alt="No Meetings" className="no-todo-image" />
            <p className="no-todo-message">{getNoMeetingsMessage()}</p>
          </div>
        ) : (
          filteredMeetings.map((meeting) => (
            <div
              key={meeting.id}
              className="meeting-card"
              onClick={() => handleMeetingCardClick(meeting)}
              style={{ width: '100%', fontSize: '0.8rem', padding: '0.8rem', gap: '5px' }}
            >
              <div className="meeting-type-banner" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <i className="fi fi-sr-info"></i>
                {meeting.type}
              </div>
              <div className="meeting-title" style={{ fontSize: '1rem' }}>
                <h3>{meeting.title}</h3>
                <span className="priority-tag" style={{ fontSize: '0.9rem' }}>
                  <span className="priority-dot"></span>
                  {meeting.priority}
                </span>
              </div>
              <p className="meeting-details">
                <i className="fi fi-rr-calendar"></i> <strong>{meeting.date}</strong>
                <i className="fi fi-rr-clock"></i> {meeting.duration}
                <i className="fi fi-rr-marker"></i> {meeting.location}
              </p>
              <p className="meeting-description">{meeting.description}</p>
              <div className="meeting-footer">
                <div className="host-info">
                  <img src={profileImage} alt="Host Avatar" className="host-avatar" />
                  <span><strong>HOST : </strong>{meeting.host}</span>
                </div>
                {meeting.deadline && (
                  <span className="deadline-tag">
                    Deadline: {meeting.deadline}
                  </span>
                )}
              </div>
              {meeting.progress && (
                <div className="progress-section">
                  <div className="progress-header">
                    <span>Task Progress: {meeting.progress}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: meeting.progress }}></div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Right Panel */}
      <DashboardRightPanel date={date} setDate={setDate} events={events} />
    </div>
  );
};

export default Dashboard;

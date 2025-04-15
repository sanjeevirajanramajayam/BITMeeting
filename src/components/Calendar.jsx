import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import '../styles/Calendar.css';
import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const defaultEvents = [
  {
    id: '1',
    title: 'BOS Meeting',
    start: '2025-03-01T09:00:00',
    end: '2025-03-01T10:00:00',
    color: 'blue',
    description: 'Board of Studies meeting to discuss curriculum changes',
    location: 'SF Board room',
    host: 'J. David',
    priority: 'high',
    deadline: '6 Days Left'
  },
  {
    id: '2',
    title: 'Grievance Meeting',
    start: '2025-03-09T09:00:00',
    end: '2025-03-09T10:00:00',
    color: 'purple',
    description: 'Monthly grievance committee meeting',
    location: 'SF Board room',
    host: 'J. David',
    priority: 'high',
    deadline: '6 Days Left'
  },
  {
    id: '3',
    title: 'Grievance Meeting',
    start: '2025-03-10T09:00:00',
    end: '2025-03-10T10:00:00',
    color: 'orange',
    description: 'Follow-up on previous grievance issues',
    location: 'SF Board room',
    host: 'J. David',
    priority: 'high',
    deadline: '6 Days Left'
  },
  {
    id: '4',
    title: 'Academic Meeting',
    start: '2025-03-12T09:00:00',
    end: '2025-03-12T10:00:00',
    color: 'blue',
    description: 'Weekly academic progress review',
    location: 'SF Board room',
    host: 'J. David',
    priority: 'high',
    deadline: '6 Days Left'
  },
  {
    id: '5',
    title: 'Grievance Meeting',
    start: '2025-03-19T09:00:00',
    end: '2025-03-19T10:00:00',
    color: 'orange',
    description: 'Monthly grievance committee meeting',
    location: 'SF Board room',
    host: 'J. David',
    priority: 'high',
    deadline: '6 Days Left'
  },
  {
    id: '6',
    title: 'Grievance Meeting',
    start: '2025-03-20T09:00:00',
    end: '2025-03-20T10:00:00',
    color: 'green',
    description: 'Special grievance meeting for urgent matters',
    location: 'SF Board room',
    host: 'J. David',
    priority: 'high',
    deadline: '6 Days Left'
  },
  {
    id: '7',
    title: 'Academic Meeting',
    start: '2025-03-25T09:00:00',
    end: '2025-03-25T10:00:00',
    color: 'blue',
    description: 'Weekly academic progress review',
    location: 'SF Board room',
    host: 'J. David',
    priority: 'high',
    deadline: '6 Days Left'
  },
  {
    id: '8',
    title: 'Schedule 2+',
    start: '2025-03-17T09:00:00',
    end: '2025-03-17T12:00:00',
    color: 'gray',
    description: 'Planning meeting for next semester schedule',
    location: 'SF Board room',
    host: 'J. David',
    priority: 'high',
    deadline: '6 Days Left'
  }
];

const Calendar = ({ initialDate = new Date(), events = defaultEvents }) => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [currentView, setCurrentView] = useState('month');
  const [viewDropdownOpen, setViewDropdownOpen] = useState(false);
  const [previousView, setPreviousView] = useState(null);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const monthName = monthNames[currentDate.getMonth()];
  const year = currentDate.getFullYear();

  const navigateDate = (direction) => {
    const date = new Date(currentDate);
    if (currentView === 'month') date.setMonth(date.getMonth() + direction);
    else if (currentView === 'week') date.setDate(date.getDate() + direction * 7);
    else if (currentView === 'day') {
      if (previousView === 'year') {
        setCurrentView('year');
        setPreviousView('month');
        return;
      } else if (previousView === 'month') {
        setCurrentView('month');
        setPreviousView(null);
        return;
      }
      date.setDate(date.getDate() + direction);
    } else if (currentView === 'year') date.setFullYear(date.getFullYear() + direction);
    setCurrentDate(date);
  };

  const handleDateClick = (date) => {
    setCurrentDate(date);
    setCurrentView('day');
  };

  const generateMonthDays = () => {
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const days = [];

    for (let i = 1 - firstDay.getDay(); i <= lastDay.getDate() + (6 - lastDay.getDay()); i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      days.push({
        day: date.getDate(),
        month: i < 1 ? 'prev' : i > lastDay.getDate() ? 'next' : 'current',
        date,
      });
    }
    return days;
  };

  const getEventsForDay = (date) =>
    events.filter(event => new Date(event.start).toDateString() === date.toDateString());

  const isToday = (date) => new Date().toDateString() === date.toDateString();

  const renderMonthView = () => (
    <div>
      <div className="weekdays">
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day, i) => (
          <div key={i}>{day}</div>
        ))}
      </div>
      <div className="month-view">
        {generateMonthDays().map((day, index) => (
          <div
            key={index}
            className={`day-cell ${day.month !== 'current' ? 'different-month' : ''} ${isToday(day.date) ? 'today' : ''}`}
            style={{ cursor: 'pointer' }} // Added cursor pointer
            onClick={() => handleDateClick(day.date)}
          >
            <div className={`day-number ${isToday(day.date) ? 'current-day' : ''}`}>{day.day}</div>
            <div className="events">
              {getEventsForDay(day.date).length > 2 && (
                <div className="more-events">+{getEventsForDay(day.date).length - 2} more</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const generateWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      return date;
    });
  };

  const generateTimeSlots = () =>
    Array.from({ length: 24 }, (_, i) => `${i % 12 || 12} ${i < 12 ? 'AM' : 'PM'}`);

  const generateMonthsForYear = () =>
    Array.from({ length: 12 }, (_, i) => {
      const firstDay = new Date(currentDate.getFullYear(), i, 1);
      const lastDay = new Date(currentDate.getFullYear(), i + 1, 0);
      const days = Array.from({ length: lastDay.getDate() }, (_, j) => ({
        day: j + 1,
        date: new Date(currentDate.getFullYear(), i, j + 1),
      }));
      return { name: monthNames[i], days };
    });

    const renderWeekView = () => {
      const weekDays = generateWeekDays();
      const timeSlots = generateTimeSlots();
  
      return (
        <div className="week-view-container">
          {/* Header Section with Days */}
          <div className="week-view-header">
            <div className="time-header"></div>
            {weekDays.map((date, i) => (
              <div key={i} className={`day-header ${isToday(date) ? 'today' : ''}`}>
                <div className="day-number">{date.getDate()}</div>
                <div className="day-name">
                  {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][date.getDay()]}
                </div>
              </div>
            ))}
          </div>
  
          {/* Time and Grid Section */}
          <div className="week-view-body">
            <div className="time-column">
              {timeSlots.map((time, i) => (
                <div key={i} className="time-slot">{time}</div>
              ))}
            </div>
            <div className="week-grid">
              {timeSlots.map((_, rowIndex) => (
                weekDays.map((date, colIndex) => (
                  <div 
                    key={`${rowIndex}-${colIndex}`} 
                    className="week-cell"
                  >
                    {/* Empty cell */}
                  </div>
                ))
              ))}
            </div>
          </div>
        </div>
      );
    };

  const renderYearView = () => {
    const months = generateMonthsForYear();
    return (
      <div className="year-view">
        {months.map((month, i) => (
          <div key={i} className="month-card">
            <div className="month-title">{month.name}</div>
            <div className="month-grid">
              {month.days.map((day, j) => (
                <div
                  key={j}
                  className={`month-day ${isToday(day.date) ? 'today' : ''}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setCurrentDate(day.date);
                    setPreviousView('year'); // Set previous view to year
                    setCurrentView('day');
                  }}
                >
                  {day.day}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderViewSelector = () => {
    const viewOptions = { month: 'Month', week: 'Week', day: 'Today', year: 'Year' };

    useEffect(() => {
      const handleOutsideClick = (e) => {
        if (!e.target.closest('.view-selector')) setViewDropdownOpen(false);
      };
      if (viewDropdownOpen) document.addEventListener('click', handleOutsideClick);
      return () => document.removeEventListener('click', handleOutsideClick);
    }, [viewDropdownOpen]);

    return (
      <div className="view-selector">
        <button className="view-button" onClick={() => setViewDropdownOpen(!viewDropdownOpen)}>
          {viewOptions[currentView]} <ChevronDown size={16} />
        </button>
        {viewDropdownOpen && (
          <div className="view-dropdown">
            {Object.entries(viewOptions).map(([key, label]) => (
              <div
                key={key}
                className="view-option"
                onClick={() => {
                  setCurrentView(key);
                  setViewDropdownOpen(false); // Close dropdown on selection
                }}
              >
                {label}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Box>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <ArrowBackIcon
          sx={{ cursor: 'pointer' }}
          onClick={() => {
            if (currentView === 'month') navigate("/dashboardrightpanel");
            else if (currentView === 'week') setCurrentView('month');
            else if (currentView === 'day') setCurrentView('week');
            else if (currentView === 'year') setCurrentView('month');
          }}
        />
        <Typography sx={{ fontSize: '20px' }}>Calendar View</Typography>
      </div>
      <div className="calendar-container">
        <div className="calendar-header">
          <div className="calendar-nav">
            <button className="nav-button" onClick={() => navigateDate(-1)}>
              <ChevronLeft size={18} />
            </button>
            <button className="nav-button" onClick={() => navigateDate(1)}>
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="calendar-title">
            {currentView === 'year' ? year : `${monthName}, ${year}`}
          </div>
          {renderViewSelector()}
        </div>
        {currentView === 'month' && renderMonthView()}
        {currentView === 'week' && renderWeekView()}
        {currentView === 'day' && renderDayView(currentDate, getEventsForDay)}
        {currentView === 'year' && renderYearView()}
      </div>
    </Box>
  );
};

export const renderDayView = (currentDate, getEventsForDay) => {
  const timeSlots = Array.from({ length: 24 }, (_, i) => `${i % 12 || 12} ${i < 12 ? 'AM' : 'PM'}`);
  const dayEvents = getEventsForDay(currentDate);

  return (
    <div>
      <div className="day-header">
        <div className="day-number selected">{currentDate.getDate()}</div>
        <div className="day-name">{['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][currentDate.getDay()]}</div>
      </div>
      <div className="day-view">
        <div className="time-column">
          {timeSlots.map((time, i) => (
            <div key={i} className="time-slot">{time}</div>
          ))}
        </div>
        <div className="day-grid">
          {timeSlots.map((_, i) => (
            <div key={i} className="day-cell"></div>
          ))}
        </div>
      </div>
    </div>
  );
};

Calendar.propTypes = {
  initialDate: PropTypes.instanceOf(Date),
  events: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      start: PropTypes.string.isRequired,
      end: PropTypes.string.isRequired,
      color: PropTypes.oneOf(['blue', 'green', 'purple', 'orange', 'gray']).isRequired,
      description: PropTypes.string,
      location: PropTypes.string,
      host: PropTypes.string,
      priority: PropTypes.oneOf(['high', 'medium', 'low']),
      deadline: PropTypes.string,
    })
  ),
};

export default Calendar;
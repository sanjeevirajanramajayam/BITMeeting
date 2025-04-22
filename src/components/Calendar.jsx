import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import EventCard from '../components/EventCard.jsx';
import axios from 'axios';
import dayjs from 'dayjs';
import '../styles/Calendar.css';
import { formatInTimeZone } from 'date-fns-tz';
import { differenceInMinutes, parseISO } from 'date-fns';

// These are the colors defined in the CSS
const AVAILABLE_COLORS = ['blue', 'green', 'purple', 'orange'];

const Calendar = ({ initialDate = new Date() }) => {
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [currentView, setCurrentView] = useState('month');
  const [viewDropdownOpen, setViewDropdownOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get month name and year
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const monthName = monthNames[currentDate.getMonth()];
  const year = currentDate.getFullYear();

  // Navigation functions
  const goToPrevious = () => {
    if (currentView === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else if (currentView === 'week') {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() - 7);
      setCurrentDate(newDate);
    } else if (currentView === 'day') {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() - 1);
      setCurrentDate(newDate);
    } else if (currentView === 'year') {
      setCurrentDate(new Date(currentDate.getFullYear() - 1, 0, 1));
    }
  };

  const goToNext = () => {
    if (currentView === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else if (currentView === 'week') {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + 7);
      setCurrentDate(newDate);
    } else if (currentView === 'day') {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + 1);
      setCurrentDate(newDate);
    } else if (currentView === 'year') {
      setCurrentDate(new Date(currentDate.getFullYear() + 1, 0, 1));
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Event handlers
  const handleDayClick = (date) => {
    setCurrentDate(date);
    setCurrentView('day');
  };

  const handleMonthClick = (monthIndex) => {
    setCurrentDate(new Date(currentDate.getFullYear(), monthIndex, 1));
    setCurrentView('month');
  };

  const handleWeekClick = (date) => {
    setCurrentDate(date);
    setCurrentView('week');
  };

  const handleEventClick = (event) => {
    console.log('Event clicked:', event);
    // You can add more functionality here like showing event details
  };

  // Fetch meetings from backend
  const fetchMeetings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/meetings/get-user-meetings', {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      if (response.data.success) {
        let formattedMeetings = [];

        console.log(response.data.meetings)

        // First sort meetings by start time to process them sequentially
        const sortedMeetings = [...response.data.meetings].sort((a, b) =>
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        );

        // Color cycling logic - use a global index to track used colors
        let colorIndex = 0;

        // Process each meeting
        sortedMeetings.forEach(meeting => {
          // Assign next color in the cycle
          const color = AVAILABLE_COLORS[colorIndex % AVAILABLE_COLORS.length];

          // Move to next color for the next meeting
          colorIndex++;
          console.log(sortedMeetings)

          const formattedMeeting = {
            id: meeting.id,
            type: `Info: ${meeting.role}`,
            title: meeting.meeting_name,
            start: formatInTimeZone(meeting.start_time, 'UTC', 'yyyy-MM-dd HH:mm:ss'),
            end: formatInTimeZone(meeting.end_time, 'UTC', 'yyyy-MM-dd HH:mm:ss'),
            date: formatInTimeZone(meeting.start_time, 'UTC', 'EEEE, d MMMM, yyyy'),
            duration: `${differenceInMinutes(
              parseISO(meeting.end_time),
              parseISO(meeting.start_time)
            )} min`,
            location: meeting.venue_name,
            description: meeting.meeting_description || "No description available",
            host: `${meeting.created_by}`,
            priority: meeting.priority.toUpperCase() + " PRIORITY",
            deadline: meeting.meeting_status === "not_started" ? "Upcoming" : null,
            progress: meeting.meeting_status === "in_progress" ? "40%" : null,
            repeat_type: meeting.repeat_type.toUpperCase(),
            members: meeting.members,
            points: meeting.points,
            host_name: meeting.created_by,
            color: color // Assign color from the cycle
          };

          formattedMeetings.push(formattedMeeting);
        });

        setEvents(formattedMeetings);
        console.log("Meetings with colors:", formattedMeetings);
      }
    } catch (error) {
      console.error("Failed to fetch meetings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  // Generate days for month view
  const generateMonthDays = () => {
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const startingDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();

    // Previous month days to show
    const prevMonthDays = [];
    if (startingDayOfWeek > 0) {
      const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
      const prevMonthDaysCount = prevMonth.getDate();

      for (let i = prevMonthDaysCount - startingDayOfWeek + 1; i <= prevMonthDaysCount; i++) {
        prevMonthDays.push({
          day: i,
          month: 'prev',
          date: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, i)
        });
      }
    }

    // Current month days
    const currentMonthDays = [];
    for (let i = 1; i <= daysInMonth; i++) {
      currentMonthDays.push({
        day: i,
        month: 'current',
        date: new Date(currentDate.getFullYear(), currentDate.getMonth(), i)
      });
    }

    // Next month days to fill the grid
    const nextMonthDays = [];
    const totalDaysShown = prevMonthDays.length + currentMonthDays.length;
    const remainingDays = 42 - totalDaysShown; // 6 rows of 7 days

    for (let i = 1; i <= remainingDays; i++) {
      nextMonthDays.push({
        day: i,
        month: 'next',
        date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i)
      });
    }

    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  };

  // Get events for a specific day
  const getEventsForDay = (date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  // Check if a date is today
  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Generate week days
  const generateWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      weekDays.push(date);
    }

    return weekDays;
  };

  // Generate time slots
  const generateTimeSlots = () => {
    const timeSlots = [];
    for (let i = 0; i < 24; i++) {
      timeSlots.push(`${i % 12 === 0 ? 12 : i % 12} ${i < 12 ? 'AM' : 'PM'}`);
    }
    return timeSlots;
  };

  // Get events for a specific time slot
  const getEventsForTimeSlot = (date, hour) => {
    return events.filter(event => {
      const eventDate = new Date(event.start);
      const eventHour = eventDate.getHours();
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear() &&
        eventHour === hour
      );
    });
  };

  // Generate months for year view
  const generateMonthsForYear = () => {
    const months = [];
    for (let i = 0; i < 12; i++) {
      const firstDayOfMonth = new Date(currentDate.getFullYear(), i, 1);
      const lastDayOfMonth = new Date(currentDate.getFullYear(), i + 1, 0);

      const daysInMonth = lastDayOfMonth.getDate();
      const startingDayOfWeek = firstDayOfMonth.getDay();

      const monthDays = [];

      // Add empty slots for days before the 1st of the month
      for (let j = 0; j < startingDayOfWeek; j++) {
        monthDays.push({ day: null, month: 'prev' });
      }

      // Add days of the month
      for (let j = 1; j <= daysInMonth; j++) {
        const date = new Date(currentDate.getFullYear(), i, j);
        monthDays.push({
          day: j,
          month: 'current',
          date,
          isToday: isToday(date),
          hasEvents: getEventsForDay(date).length > 0
        });
      }

      months.push({
        name: monthNames[i],
        days: monthDays
      });
    }

    return months;
  };

  // Render month view
  const renderMonthView = () => {
    if (loading) {
      return <div className="loading">Loading meetings...</div>;
    }

    const days = generateMonthDays();

    return (
      <div>
        <div className="weekdays">
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>
        <div className="month-view">
          {days.map((day, index) => {
            const dayEvents = getEventsForDay(day.date);
            const isCurrentDay = isToday(day.date);

            return (
              <div
                key={index}
                className={`day-cell ${day.month !== 'current' ? 'different-month' : ''} ${isCurrentDay ? 'today' : ''}`}
                onClick={() => handleDayClick(day.date)}
              >
                <div className={`day-number ${isCurrentDay ? 'current-day' : ''}`}>
                  {day.day}
                </div>
                <div className="events">
                  {dayEvents.slice(0, 2).map((event, eventIndex) => (
                    <EventCard
                      key={eventIndex}
                      event={event}
                      index={eventIndex}
                      onClick={() => handleEventClick(event)}
                    />
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="more-events" onClick={(e) => {
                      e.stopPropagation();
                      handleDayClick(day.date);
                    }}>
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render week view
  const renderWeekView = () => {
    if (loading) {
      return <div className="loading">Loading meetings...</div>;
    }

    const weekDays = generateWeekDays();
    const timeSlots = generateTimeSlots();

    return (
      <div>
        <div className="week-header">
          <div className="week-days-header">
            <div className="time-header"></div>
            {weekDays.map((date, index) => {
              const day = date.getDate();
              const isCurrentDay = isToday(date);

              return (
                <div
                  key={index}
                  className="day-header"
                  onClick={() => handleDayClick(date)}
                >
                  <div className={`day-number ${isCurrentDay ? 'selected' : ''}`}>
                    {day}
                  </div>
                  <div className="day-name">
                    {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][date.getDay()]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="week-view">
          <div className="time-column">
            {timeSlots.map((time, index) => (
              <div key={index} className="time-slot">
                {time}
              </div>
            ))}
          </div>
          <div className="week-grid">
            {weekDays.map((date, dayIndex) => (
              <div key={dayIndex} className="day-column">
                {timeSlots.map((_, timeIndex) => {
                  const eventsAtTime = getEventsForTimeSlot(date, timeIndex);
                  const hasMultipleEvents = eventsAtTime.length > 1;

                  return (
                    <div
                      key={timeIndex}
                      className={`week-cell ${hasMultipleEvents ? 'multiple-events' : ''}`}
                      onClick={() => handleDayClick(date)}
                    >
                      {eventsAtTime.map((event, eventIndex) => (
                        <EventCard
                          key={eventIndex}
                          event={event}
                          index={eventIndex}
                          style={{
                            width: hasMultipleEvents ? `${100 / eventsAtTime.length}%` : '100%',
                            left: hasMultipleEvents ? `${(eventIndex * 100) / eventsAtTime.length}%` : '0'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEventClick(event);
                          }}
                        />
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Render day view
  const renderDayView = () => {
    if (loading) {
      return <div className="loading">Loading meetings...</div>;
    }

    const timeSlots = generateTimeSlots();
    const dayEvents = getEventsForDay(currentDate);

    return (
      <div>
        <div className="day-header">
          <div className="day-number selected">
            {currentDate.getDate()}
          </div>
          <div className="day-name">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][currentDate.getDay()]}
          </div>
        </div>
        <div className="day-view">
          <div className="time-column">
            {timeSlots.map((time, index) => (
              <div key={index} className="time-slot">
                {time}
              </div>
            ))}
          </div>
          <div className="day-grid">
            {timeSlots.map((_, timeIndex) => {
              const eventsAtTime = getEventsForTimeSlot(currentDate, timeIndex);
              const hasMultipleEvents = eventsAtTime.length > 1;

              return (
                <div
                  key={timeIndex}
                  className={`day-cell ${hasMultipleEvents ? 'multiple-events' : ''}`}
                >
                  {eventsAtTime.map((event, eventIndex) => (
                    <EventCard
                      key={eventIndex}
                      event={event}
                      index={eventIndex}
                      style={{
                        width: hasMultipleEvents ? `${100 / eventsAtTime.length}%` : '100%',
                        left: hasMultipleEvents ? `${(eventIndex * 100) / eventsAtTime.length}%` : '0'
                      }}
                      onClick={() => handleEventClick(event)}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Render year view
  const renderYearView = () => {
    if (loading) {
      return <div className="loading">Loading meetings...</div>;
    }

    const months = generateMonthsForYear();

    return (
      <div className="year-view">
        {months.map((month, monthIndex) => (
          <div
            key={monthIndex}
            className="month-card"
            onClick={() => handleMonthClick(monthIndex)}
          >
            <div className="month-title">{month.name}</div>
            <div className="month-weekdays">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day, i) => (
                <div key={i} className="month-weekday">{day}</div>
              ))}
            </div>
            <div className="month-grid">
              {month.days.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className={`month-day ${day.month !== 'current' ? 'different-month' : ''} ${day.isToday ? 'today' : ''} ${day.hasEvents ? 'has-events' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (day.day) handleDayClick(day.date);
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

  // Render view selector
  const renderViewSelector = () => {
    const viewOptions = {
      month: 'Month',
      week: 'Week',
      day: 'Day',
      year: 'Year'
    };

    const handleViewChange = (view) => {
      setCurrentView(view);
      setViewDropdownOpen(false);
    };

    return (
      <div className="view-selector">
        <button
          className="view-button"
          onClick={() => setViewDropdownOpen(!viewDropdownOpen)}
        >
          {viewOptions[currentView]}
          <ChevronDown size={16} />
        </button>

        {viewDropdownOpen && (
          <div className="view-dropdown">
            {Object.entries(viewOptions).map(([key, label]) => (
              <div
                key={key}
                className={`view-option ${key === currentView ? 'active' : ''}`}
                onClick={() => handleViewChange(key)}
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
    <div className="calendar-container">
      <div className="calendar-header">
        <div className="calendar-nav">
          <button className="nav-button" onClick={goToPrevious}>
            <ChevronLeft size={18} />
          </button>
          <button className="nav-button today-button" onClick={goToToday}>
            Today
          </button>
          <button className="nav-button" onClick={goToNext}>
            <ChevronRight size={18} />
          </button>
        </div>
        <div className="calendar-title">
          {currentView === 'year' ? year : currentView === 'week' || currentView === 'day' ? `${monthName} ${currentDate.getDate()}, ${year}` : `${monthName} ${year}`}
        </div>
        {renderViewSelector()}
      </div>
      {currentView === 'month' && renderMonthView()}
      {currentView === 'week' && renderWeekView()}
      {currentView === 'day' && renderDayView()}
      {currentView === 'year' && renderYearView()}
    </div>
  );
};

Calendar.propTypes = {
  initialDate: PropTypes.instanceOf(Date)
};

export default Calendar;
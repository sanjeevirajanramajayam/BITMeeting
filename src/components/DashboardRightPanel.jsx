import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, subDays, addDays, isSameMonth } from "date-fns";
import CreateMeeting from "../pages/CreateMeeting";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import { Button, Typography } from "@mui/material";
import { renderDayView } from './Calendar';

const generateTimeSlots = (meetings) => {
  const slots = [];
  const currentHour = new Date().getHours();
  const startHour = Math.max(0, currentHour - 2);
  let endHour = Math.min(23, currentHour + 3);

  for (let i = startHour; i <= endHour; i++) {
    slots.push(i);
  }

  while (slots.length < 6) {
    endHour++;
    if (endHour < 24) {
      slots.push(endHour);
    }
  }

  return slots;
};

const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const DashboardRightPanel = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCreateMeeting, setShowCreateMeeting] = useState(false);
  const [meetings, setMeetings] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSelectedDate(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);
  
  const getCalendarDays = (date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    const startDay = start.getDay();
    const endDay = end.getDay();

    const daysBefore = Array.from({ length: startDay }, (_, i) => subDays(start, startDay - i));
    const daysInMonth = eachDayOfInterval({ start, end });
    const daysAfter = Array.from({ length: 6 - endDay }, (_, i) => addDays(end, i + 1));

    return [...daysBefore, ...daysInMonth, ...daysAfter];
  };

  const handleCreateMeetingClick = () => {
    setShowCreateMeeting(true);
  };

  const handleTemplateSelect = (selectedTemplate) => {
    setShowCreateMeeting(false);
    navigate('/cmeeting', { state: { selectedTemplate } });
  };

  const days = getCalendarDays(selectedDate);

  const handleViewMoreCalendar = () => {
    navigate('/calendar');
  }; 

  return (
    <>

      {showCreateMeeting && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999
          }}
        >
          <CreateMeeting
            onUseTemplate={handleTemplateSelect}
            onClose={() => setShowCreateMeeting(false)}
          />
        </div>
      )}
      
      <div style={{ display: 'flex', flexDirection: 'column' , gap:'5px',marginTop:'16px'}}>
        <div>
            <button style={{
              padding: '0.5rem',
              backgroundColor: '#27ae60',
              color: 'white',
              border: 'none',
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              textAlign: 'center',
              width:'100%',
              borderRadius: '5px'
            }} onClick={handleCreateMeetingClick}>
              <AddCircleOutlineIcon/>
              Create Meeting
            </button>
        </div>
        
        <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '0.5rem', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
          <div style={{ backgroundColor: 'white', padding: '0.25rem', borderRadius: '0.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', color: 'black' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1a1a1a', margin: 0 }}>{format(selectedDate, 'MMM dd-yyyy')}</h2>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button
                  onClick={handleViewMoreCalendar}
                  sx={{
                    textTransform: 'none',
                    color: '#1A202C',
                    padding: 0,
                    gap: '5px',
                    '&:hover': {
                      backgroundColor: 'transparent',
                      textDecoration: 'underline',
                    },
                  }}
                >
                  <CalendarMonthOutlinedIcon sx={{ fontSize: 20 }} />
                  <Typography
                    sx={{
                      fontStyle: 'italic',
                      fontWeight: 500,
                      fontSize: '16px',
                      color: '#1A202C',
                    }}
                  >
                    view all
                  </Typography>
                </Button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem'}}>
              {weekDays.map(day => (
                <div key={day} style={{ textAlign: 'center', fontWeight: 600, color: '#666', padding: '0.25rem', fontSize: '0.75rem' }}>{day}</div>
              ))}
              {days.map(day => (
                <div
                  key={day.toString()}
                  style={{
                    aspectRatio: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    borderRadius: '50%',
                    position: 'relative',
                    fontSize: '0.875rem',
                    color: isSameMonth(day, selectedDate) ? '#1a1a1a' : '#ccc',
                    width: '30px',
                    height: '30px',
                    margin: 'auto',
                    backgroundColor: isSameDay(day, selectedDate) ? '#4299e1' : 'transparent'
                  }}
                  onClick={() => setSelectedDate(day)}
                >
                  {format(day, 'd')}
                  {meetings.some(meeting => isSameDay(meeting.date, day)) && (
                    <div style={{ width: '3px', height: '3px', backgroundColor: '#e1a942', borderRadius: '50%', position: 'absolute', bottom: '2px' }} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Schedule Section */}
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#1a1a1a', margin: '0 0 1rem 0' }}>Today's Schedule</h3>
            <div style={{ position: 'relative', flex: 1, margin: '0 auto', padding: '0', overflowY: 'auto', border: '1px solid #e0e0e0', borderRadius: '8px', width: '100%', maxHeight: '300px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {renderDayView(selectedDate, () => meetings)}
              <div
                style={{
                  position: 'absolute',
                  top: `${(new Date().getHours() * 60 + new Date().getMinutes()) / (24 * 60) * 100}%`,
                  left: '75px',
                  width: '10px',
                  height: '10px',
                  backgroundColor: 'green',
                  borderRadius: '50%',
                  zIndex: 1,
                }}
              />
            </div>
        </div>
          
      </div>

    </>
  );
};

export default DashboardRightPanel;
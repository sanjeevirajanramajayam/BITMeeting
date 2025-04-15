import React, { useState } from "react";
import { Box, Button, Typography, IconButton } from "@mui/material";
import { LocalizationProvider, DateCalendar, PickersDay } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { Close } from "@mui/icons-material";

// Custom day component to make days more compact
const CompactPickersDay = (props) => {
  return <PickersDay {...props} sx={{ 
    margin: '1px', 
    fontSize: '0.75rem',
    width: 32,
    height: 32,
    ...props.sx
  }} />;
};

const DatePick = ({ onConfirm, onClose }) => {
    const [selectedDate, setSelectedDate] = useState(null);
  
    return (
      <Box
        sx={{
          width: 360,
          p: 2,
          borderRadius: 3,
          boxShadow: 3,
          bgcolor: "white",
          textAlign: "center",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px" }}>
            <div style={{ display: 'flex', flexDirection: 'row', gap: '50px' }}>
                <Typography sx={{ color: "#3D3939", fontWeight: "bold" }}>Deadline</Typography>
            </div>
            <IconButton
                sx={{ border: "2px solid #FB3748", borderRadius: "50%", padding: "4px", "&:hover": { backgroundColor: "transparent" } }}
                onClick={onClose}
            >
                <Close sx={{ fontSize: "12px", color: "#FB3748" }} />
            </IconButton>
        </Box>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateCalendar 
            value={selectedDate} 
            onChange={(newDate) => setSelectedDate(newDate)} 
            disablePast
            slots={{
              day: CompactPickersDay
            }}
            sx={{ 
              width: "100%",
              py: 0,
              '& .MuiDayCalendar-header, & .MuiDayCalendar-weekContainer': {
                margin: '2px 0',
              },
              '& .MuiPickersCalendarHeader-root': {
                paddingLeft: 1,
                paddingRight: 1,
                marginTop: 0,
                marginBottom: 0,
                minHeight: 40,
              },
              '& .MuiPickersCalendarHeader-label': {
                fontSize: '0.9rem',
              },
              '& .MuiPickersDay-root.Mui-selected': {
                backgroundColor: "#1976d2",
                color: 'white',
              },
              '& .MuiTypography-root': {
                fontSize: '0.75rem'
              }
            }}
          />
        </LocalizationProvider>
  
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
          <Button sx={{ color: "red" }} onClick={onClose}>
            Clear
          </Button>
          <Button variant="contained" onClick={() => selectedDate && onConfirm(dayjs(selectedDate))}>
            Confirm
          </Button>
        </Box>
      </Box>
    );
  };
  

export default DatePick;

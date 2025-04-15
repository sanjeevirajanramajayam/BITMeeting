import React, { useState } from "react";
import { 
  Box, 
  Button, 
  Typography, 
  Paper,
  Chip,
  Grid,
  Divider,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Tabs,
  Tab,
  Snackbar,
  Alert
} from "@mui/material";
import { LocalizationProvider, DateCalendar, PickersDay } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EditIcon from "@mui/icons-material/Edit";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";

// Common time options (hours and minutes)
const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = [0, 15, 30, 45];

// Preset time ranges with user-friendly labels
const PRESET_RANGES = [
  { label: "30 min", duration: 30, icon: "⏱️" },
  { label: "1 hour", duration: 60, icon: "🕐" },
  { label: "Morning", from: { hour: 9, minute: 0, amPm: "AM" }, to: { hour: 12, minute: 0, amPm: "PM" }, icon: "🌅" },
  { label: "Lunch", from: { hour: 12, minute: 0, amPm: "PM" }, to: { hour: 1, minute: 30, amPm: "PM" }, icon: "🍽️" }
];

const formatTime = (time) => {
  if (!time) return "Select time";
  return `${time.hour}:${time.minute.toString().padStart(2, "0")} ${time.amPm}`;
};

const calculateEndTime = (startTime, durationMinutes) => {
  let hour = startTime.hour;
  let minute = startTime.minute;
  let amPm = startTime.amPm;
  
  // Add the duration
  minute += durationMinutes;
  
  // Handle hour overflow
  hour += Math.floor(minute / 60);
  minute %= 60;
  
  // Handle AM/PM transition
  if (hour > 12) {
    hour -= 12;
    if (amPm === "AM") {
      amPm = "PM";
    } else {
      amPm = "AM";
    }
  }
  
  return { hour, minute, amPm };
};

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

const DateTimePicker = ({ onConfirm }) => {
  const theme = useTheme();
  const [selectedDate, setSelectedDate] = useState(null);
  const [fromTime, setFromTime] = useState(null);
  const [toTime, setToTime] = useState(null);
  const [editingTime, setEditingTime] = useState(null);
  const [timeDialogOpen, setTimeDialogOpen] = useState(false);
  const [tempTime, setTempTime] = useState({ hour: 9, minute: 0, amPm: "AM" });
  const [activeTab, setActiveTab] = useState(0);
  const [error, setError] = useState(null);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Handle preset time selection
  const handlePresetClick = (preset) => {
    if (preset.duration) {
      // If it's a duration preset, calculate end time from start time
      const startTime = fromTime || { hour: 9, minute: 0, amPm: "AM" };
      setFromTime(startTime);
      const newToTime = calculateEndTime(startTime, preset.duration);
      setToTime(newToTime);
    } else if (preset.from && preset.to) {
      // If it's a specific time range preset
      setFromTime(preset.from);
      setToTime(preset.to);
    }
  };

  // Open the time edit dialog
  const openTimeEditDialog = (timeType) => {
    setEditingTime(timeType);
    // Set initial values based on current selection or defaults
    if (timeType === 'from') {
      setTempTime(fromTime || { hour: 9, minute: 0, amPm: "AM" });
    } else {
      setTempTime(toTime || { hour: 10, minute: 0, amPm: "AM" });
    }
    setTimeDialogOpen(true);
  };

  // Close the time edit dialog
  const closeTimeEditDialog = (save = false) => {
    if (save) {
      if (editingTime === 'from') {
        setFromTime(tempTime);
      } else {
        setToTime(tempTime);
      }
    }
    setTimeDialogOpen(false);
    setEditingTime(null);
  };

  const handleClear = () => {
    // Reset all fields to null
    setFromTime(null);
    setToTime(null);
    setSelectedDate(null);
    setActiveTab(0);
  };

  const handleConfirm = () => {
    // Validate both date and time selections
    if (!selectedDate) {
      setError("Please select a date");
      setActiveTab(0); // Switch to date tab
      return;
    }
    
    if (!fromTime || !toTime) {
      setError("Please select both start and end times");
      setActiveTab(1); // Switch to time tab
      return;
    }

    const formattedDateTime = `${selectedDate.format("DD-MM-YYYY")} && ${formatTime(fromTime)} - ${formatTime(toTime)}`;
    onConfirm(formattedDateTime);
  };

  const handleCloseError = () => {
    setError(null);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        width: 350,
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: 'white'
      }}
    >
      <Tabs 
        value={activeTab} 
        onChange={handleTabChange} 
        variant="fullWidth"
        sx={{ 
          borderBottom: 1, 
          borderColor: 'divider',
          minHeight: 40,
          '& .MuiTab-root': {
            minHeight: 40,
            py: 0
          }
        }}
      >
        <Tab label="Date" />
        <Tab label="Time" />
      </Tabs>

      {activeTab === 0 && (
        <Box sx={{ p: 1 }}>
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
                  backgroundColor: theme.palette.primary.main,
                  color: 'white',
                },
                '& .MuiTypography-root': {
                  fontSize: '0.75rem'
                }
              }}
            />
          </LocalizationProvider>
        </Box>
      )}

      {activeTab === 1 && (
        <Box sx={{ p: 1.5 }}>
          {/* Time Range Display */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <AccessTimeIcon color="primary" fontSize="small" sx={{ mr: 1 }} />
            <Typography variant="body1" fontWeight={600}>
              Time Range
            </Typography>
          </Box>

          {/* Editable Time Display */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Paper 
              elevation={1} 
              onClick={() => openTimeEditDialog('from')}
              sx={{ 
                p: 1, 
                display: 'flex', 
                alignItems: 'center',
                cursor: 'pointer',
                border: `1px solid ${theme.palette.divider}`,
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                }
              }}
            >
              <Typography variant="body1" color={fromTime ? "primary" : "text.secondary"} sx={{ mr: 1 }}>
                {formatTime(fromTime)}
              </Typography>
              <EditIcon fontSize="small" color="action" />
            </Paper>
            
            <KeyboardArrowRightIcon color="action" sx={{ mx: 0.5 }} />
            
            <Paper 
              elevation={1}
              onClick={() => openTimeEditDialog('to')}
              sx={{ 
                p: 1, 
                display: 'flex', 
                alignItems: 'center',
                cursor: 'pointer',
                border: `1px solid ${theme.palette.divider}`,
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                }
              }}
            >
              <Typography variant="body1" color={toTime ? "primary" : "text.secondary"} sx={{ mr: 1 }}>
                {formatTime(toTime)}
              </Typography>
              <EditIcon fontSize="small" color="action" />
            </Paper>
          </Box>
          
          <Divider sx={{ mb: 1.5 }} />
          
          {/* Preset time ranges */}
          <Box>
            <Typography variant="body2" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '1.1em', marginRight: '4px' }}>⚡</span> Quick Select:
            </Typography>
            
            <Grid container spacing={1}>
              {PRESET_RANGES.map((preset, index) => (
                <Grid item xs={6} key={index}>
                  <Chip
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', fontSize: '0.8rem' }}>
                        <span style={{ marginRight: '4px' }}>{preset.icon}</span>
                        {preset.label}
                      </Box>
                    }
                    size="small"
                    variant="outlined"
                    onClick={() => handlePresetClick(preset)}
                    sx={{ 
                      width: '100%',
                      height: 28,
                      justifyContent: 'flex-start',
                      pl: 0.5,
                      border: `1px solid ${theme.palette.primary.light}`,
                      '&:hover': { 
                        backgroundColor: `${theme.palette.primary.main}15`,
                        borderColor: theme.palette.primary.main,
                      }
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      )}

      <Box sx={{ display: "flex", justifyContent: "space-between", px: 1.5, py: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Button 
          variant="outlined" 
          color="error" 
          onClick={handleClear}
          size="small"
        >
          Clear
        </Button>
        <Button 
          variant="contained" 
          onClick={handleConfirm}
          size="small"
        >
          Confirm
        </Button>
      </Box>
      
      {/* Time Edit Dialog */}
      <Dialog 
        open={timeDialogOpen} 
        onClose={() => closeTimeEditDialog(false)}
        PaperProps={{ 
          sx: { 
            width: 300, 
            maxWidth: '90vw' 
          } 
        }}
      >
        <DialogTitle sx={{ pb: 1, fontSize: '1rem' }}>
          {editingTime === 'from' ? 'Edit Start Time' : 'Edit End Time'}
        </DialogTitle>
        <DialogContent sx={{ pt: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <TextField
              select
              label="Hour"
              value={tempTime.hour}
              onChange={(e) => setTempTime({...tempTime, hour: parseInt(e.target.value)})}
              sx={{ mr: 1, width: 70 }}
              size="small"
            >
              {HOURS.map((hour) => (
                <MenuItem key={hour} value={hour}>
                  {hour}
                </MenuItem>
              ))}
            </TextField>
            
            <TextField
              select
              label="Minute"
              value={tempTime.minute}
              onChange={(e) => setTempTime({...tempTime, minute: parseInt(e.target.value)})}
              sx={{ mr: 1, width: 70 }}
              size="small"
            >
              {MINUTES.map((minute) => (
                <MenuItem key={minute} value={minute}>
                  {minute.toString().padStart(2, '0')}
                </MenuItem>
              ))}
            </TextField>
            
            <TextField
              select
              label="AM/PM"
              value={tempTime.amPm}
              onChange={(e) => setTempTime({...tempTime, amPm: e.target.value})}
              sx={{ width: 70 }}
              size="small"
            >
              <MenuItem value="AM">AM</MenuItem>
              <MenuItem value="PM">PM</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => closeTimeEditDialog(false)} size="small">Cancel</Button>
          <Button onClick={() => closeTimeEditDialog(true)} variant="contained" size="small">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Error Notification */}
      <Snackbar
        open={!!error}
        autoHideDuration={3000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default DateTimePicker;


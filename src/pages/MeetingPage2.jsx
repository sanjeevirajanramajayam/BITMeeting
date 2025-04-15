import React, { useState } from "react";
import { Box,Button,Card,Radio,RadioGroup,FormControlLabel,TextField,Select,MenuItem,Typography,IconButton,Divider} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CancelIcon from '@mui/icons-material/Cancel';
import FastForwardIcon from '@mui/icons-material/FastForward';
import OfflinePinIcon from '@mui/icons-material/OfflinePin';

const ForwardingForm = ({ onClose, selectedAction: initialAction }) => {
  const [selectedOption, setSelectedOption] = useState("NIL");
  const [selectedAction, setSelectedAction] = useState(initialAction || "notAgree");

  const handleActionClick = (action) => {
    setSelectedAction(action);
  };

  return (
    <Card sx={{ width:'100%', p: 4, borderRadius: 3, boxShadow: 3 }}>
      {/* Header Section */}
      <Box display="flex" alignItems="center">
        <Button
          variant="outlined"
          sx={{
            width: "35%",
            color: selectedAction === "notAgree" ? '#FB3748' : '#6E6E6E',
            borderColor: selectedAction === "notAgree" ? '#FB3748' : 'transparent',
            backgroundColor: selectedAction === "notAgree" ? '#FB37481A' : 'transparent',
            textTransform: 'none',
          }}
          startIcon={<CancelIcon />}
          onClick={() => handleActionClick("notAgree")}
        >
          Not agree
        </Button>
        {selectedAction !== "notAgree" && selectedAction !== "forward" && (
          <Divider orientation="vertical" flexItem sx={{ backgroundColor: 'black' }} />
        )}
        <Button
          variant="outlined"
          sx={{
            width: "35%",
            color: selectedAction === "forward" ? '#000000' : '#6E6E6E',
            borderColor: selectedAction === "forward" ? '#000000' : 'transparent',
            backgroundColor: selectedAction === "forward" ? '#D8DEE2' : 'transparent',
            textTransform: 'none',
          }}
          startIcon={<FastForwardIcon />}
          onClick={() => handleActionClick("forward")}
        >
          Forward
        </Button>
        {selectedAction !== "forward" && selectedAction !== "agree" && (
          <Divider orientation="vertical" flexItem sx={{ backgroundColor: 'black' }} />
        )}
        <Button
          variant="outlined"
          sx={{
            width: "35%",
            color: selectedAction === "agree" ? '#1FC16B' : '#6E6E6E',
            borderColor: selectedAction === "agree" ? '#1FC16B' : 'transparent',
            backgroundColor: selectedAction === "agree" ? '#1FC16B1A' : 'transparent',
            textTransform: 'none',
          }}
          startIcon={<OfflinePinIcon />}
          onClick={() => handleActionClick("agree")}
        >
          Agree
        </Button>
        <IconButton
          sx={{
            border: "2px solid #FB3748",
            borderRadius: "50%",
            p: "2px",
            ml:'30px',
            "&:hover": { backgroundColor: "transparent" },
          }}
          onClick={onClose}
        >
          <CloseIcon sx={{ fontSize: "10px", color: "#FB3748" }} />
        </IconButton>
      </Box>

      {/* Forward To Section */}
      <Typography sx={{fontWeight:"bold",mt:'30px',mb:'10px'}}>Forward to</Typography>

      <RadioGroup value={selectedOption} onChange={(e) => setSelectedOption(e.target.value)}>
        {selectedAction !== "forward" && (
          <Box mb={2}>
            <FormControlLabel value="NIL" control={<Radio />} label="NIL" />
          </Box>
        )}
        <Box mb={2}>
          <FormControlLabel value="Next Meeting" control={<Radio />} label="Next Meeting" />
        </Box>
        <Box mb={2}>
          <FormControlLabel
            value="Specific Meeting"
            control={<Radio />}
            label={
              <Box display="flex" alignItems="center" gap={1}>
                Specific Meeting
                <TextField 
                  variant="outlined" 
                  size="small"
                  placeholder="Select meeting" 
                  sx={{ width: 400,marginLeft:'50px' }}
                  disabled={selectedOption !== "Specific Meeting"}
                />
              </Box>
            }
          />
        </Box>
        <Box mb={2}>
          <FormControlLabel
            value="After appearances of meeting"
            control={<Radio />}
            label={
              <Box display="flex" alignItems="center" gap={1}>
                After appearances of meeting
                <Select 
                  size="small" 
                  disabled={selectedOption !== "After appearances of meeting"}
                  sx={{ width: 80, marginLeft: '50px' }}
                  defaultValue="02"
                >
                  {Array.from({ length: 10 }, (_, i) => (
                    <MenuItem key={i + 1} value={String(i + 1).padStart(2, '0')}>
                      {String(i + 1).padStart(2, '0')}
                    </MenuItem>
                  ))}
                </Select>
              </Box>
            }
          />
        </Box>
      </RadioGroup>

      {/* Footer Section */}
      <Box display="flex" justifyContent="end" mt={4} gap={2}>
        <Button
          variant="outlined"
          sx={{
            borderColor: "red",
            color: "red",
            textTransform: "none",
            marginRight: "10px",
            width: "130px",
          }}
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          sx={{
            backgroundColor: "#408FEA",
            color: "white",
            textTransform: "none",
            width: "130px",
          }}
        >
          Save & Next
        </Button>
      </Box>
    </Card>
  );
};

export default ForwardingForm;

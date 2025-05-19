import React, { useEffect, useState } from "react";
import {
  Box, Button, Card, Radio, RadioGroup, FormControlLabel, TextField,
  Typography, IconButton, Divider
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CancelIcon from '@mui/icons-material/Cancel';
import FastForwardIcon from '@mui/icons-material/FastForward';
import OfflinePinIcon from '@mui/icons-material/OfflinePin';
import axios from "axios";
import { Autocomplete } from "@mui/material"; // Make sure this is imported

const ForwardingForm = ({ onClose, selectedAction: initialAction, remarks, pointId, selectedPoint, handleChangeStatus }) => {
  const [selectedOption, setSelectedOption] = useState("NIL");
  const [selectedAction, setSelectedAction] = useState(initialAction || "DISAGREE");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    const response = axios.get('http://localhost:5000/api/templates/').then((response) => { setTemplates(response.data) });
  }, [])

  const handleActionClick = (action) => {
    setSelectedAction(action);
  };

  async function ForwardPoint(pointId, templateId, forwardType, forwardDecision, adminRemarks) {
    const token = localStorage.getItem('token');
    console.log(token)
    console.log({
      pointId,
      templateId,
      forwardType,
      forwardDecision,
      adminRemarks
    })
    console.log(forwardDecision)
    if (forwardType != 'SPECIFIC_MEETING') {
      templateId = null;
    }


    try {
      await axios.post('http://localhost:5000/api/meetings/forward-point', {
        pointId,
        templateId,
        forwardType,
        forwardDecision
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });


      // console.log({
      //   pointId,
      //   templateId,
      //   forwardType,
      //   forwardDecision
      // })

      await axios.post('http://localhost:5000/api/meetings/add-admin-remarks/', {
        pointId,
        adminRemarks
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      console.log(selectedPoint.DecisionIndex, selectedAction)
      console.log(selectedPoint.SubPointIndex)
      if (selectedPoint.SubPointIndex !== undefined && selectedPoint.SubPointIndex !== null) {
        handleChangeStatus(selectedPoint.DecisionIndex, selectedAction, true, selectedPoint.SubPointIndex);
      } else {
        handleChangeStatus(selectedPoint.DecisionIndex, selectedAction);
      }


      onClose()

    } catch (err) {
      console.error('Failed to forward point:', err.response?.data?.message || err.message);
    }
  }
  return (
    <Card sx={{ width: '100%', p: 4, borderRadius: 3, boxShadow: 3 }}>
      {/* Header Section */}
      <Box display="flex" alignItems="center">
        <Button
          variant="outlined"
          sx={{
            width: "35%",
            color: selectedAction === "DISAGREE" ? '#FB3748' : '#6E6E6E',
            borderColor: selectedAction === "DISAGREE" ? '#FB3748' : 'transparent',
            backgroundColor: selectedAction === "DISAGREE" ? '#FB37481A' : 'transparent',
            textTransform: 'none',
          }}
          startIcon={<CancelIcon />}
          onClick={() => handleActionClick("DISAGREE")}
        >
          DISAGREE
        </Button>
        {selectedAction !== "DISAGREE" && selectedAction !== "FORWARD" && (
          <Divider orientation="vertical" flexItem sx={{ backgroundColor: 'black' }} />
        )}
        <Button
          variant="outlined"
          sx={{
            width: "35%",
            color: selectedAction === "FORWARD" ? '#000000' : '#6E6E6E',
            borderColor: selectedAction === "FORWARD" ? '#000000' : 'transparent',
            backgroundColor: selectedAction === "FORWARD" ? '#D8DEE2' : 'transparent',
            textTransform: 'none',
          }}
          startIcon={<FastForwardIcon />}
          onClick={() => handleActionClick("FORWARD")}
        >
          FORWARD
        </Button>
        {selectedAction !== "FORWARD" && selectedAction !== "AGREE" && (
          <Divider orientation="vertical" flexItem sx={{ backgroundColor: 'black' }} />
        )}
        <Button
          variant="outlined"
          sx={{
            width: "35%",
            color: selectedAction === "AGREE" ? '#1FC16B' : '#6E6E6E',
            borderColor: selectedAction === "AGREE" ? '#1FC16B' : 'transparent',
            backgroundColor: selectedAction === "AGREE" ? '#1FC16B1A' : 'transparent',
            textTransform: 'none',
          }}
          startIcon={<OfflinePinIcon />}
          onClick={() => handleActionClick("AGREE")}
        >
          AGREE
        </Button>
        <IconButton
          sx={{
            border: "2px solid #FB3748",
            borderRadius: "50%",
            p: "2px",
            ml: '30px',
            "&:hover": { backgroundColor: "transparent" },
          }}
          onClick={onClose}
        >
          <CloseIcon sx={{ fontSize: "10px", color: "#FB3748" }} />
        </IconButton>
      </Box>

      {/* Forward To Section */}
      <Typography sx={{ fontWeight: "bold", mt: '30px', mb: '10px' }}>Forward to</Typography>

      <RadioGroup value={selectedOption} onChange={(e) => setSelectedOption(e.target.value)}>
        {selectedAction !== "FORWARD" && (
          <Box mb={2}>
            <FormControlLabel value="NIL" control={<Radio />} label="NIL" />
          </Box>
        )}
        <Box mb={2}>
          <FormControlLabel value="NEXT" control={<Radio />} label="NEXT" />
        </Box>
        <Box mb={2}>
          <FormControlLabel
            value="SPECIFIC_MEETING"
            control={<Radio />}
            label={
              <Box display="flex" alignItems="center" gap={1}>
                SPECIFIC MEETING
                <Autocomplete
                  disabled={selectedOption !== "SPECIFIC_MEETING"}
                  options={templates}
                  getOptionLabel={(option) => option.name || ""}
                  sx={{ width: 400, marginLeft: '50px' }}
                  size="small"
                  renderInput={(params) => (
                    <TextField {...params} placeholder="Select meeting" variant="outlined" />
                  )}
                  onChange={(event, value) => {
                    if (value) {
                      setSelectedTemplate(value.id)
                      console.log("Selected Template ID:", value.id);
                    }
                  }}
                />
              </Box>
            }
          />
        </Box>
      </RadioGroup>

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
          onClick={() => { ForwardPoint(pointId, selectedTemplate, selectedOption, selectedAction, remarks); console.log(selectedAction, selectedOption, remarks, selectedTemplate) }}
        >
          Save & Next
        </Button>
      </Box>
    </Card>
  );
};

export default ForwardingForm;

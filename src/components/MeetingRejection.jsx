import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Divider,
  Paper,
  Stack
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

function MeetingRejection({ onClose, meetingId, token }) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReject = async () => {
    if (!reason.trim()) return;

    try {
      setLoading(true);

      const res = await fetch('http://localhost:5000/api/meetings/reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          meetingId,
          status: 'reject',
          reason
        })
      });

      const data = await res.json();

      if (res.ok) {
        console.log('Rejected successfully:', data);
        onClose(); // Close modal
      } else {
        console.error('Failed to reject:', data.message);
        alert(data.message);
      }
    } catch (error) {
      console.error('Error rejecting meeting:', error);
      alert("Server error while rejecting");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ maxWidth: 700, width: '100%', mx: 'auto', borderRadius: 2 }}>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" fontWeight={600}>Meeting Rejection</Typography>
          <IconButton onClick={onClose} sx={{
            color: 'error.main',
            border: '1px solid',
            borderColor: 'error.light',
            borderRadius: '50%',
            p: 0.5
          }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Reason Input */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 1.5 }}>Reason</Typography>
          <Box sx={{ border: '1px solid', borderColor: 'grey.300', borderRadius: 1 }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Please provide a reason for rejection"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              variant="outlined"
              InputProps={{
                sx: {
                  px: 2,
                  py: 1.5,
                  '& .MuiOutlinedInput-notchedOutline': { border: 'none' }
                }
              }}
            />
            <Divider />
          </Box>
        </Box>

        {/* Actions */}
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button variant="outlined" onClick={onClose} sx={{
            px: 3,
            borderColor: 'error.light',
            color: 'error.main',
            '&:hover': {
              borderColor: 'error.main',
              backgroundColor: 'error.lightest'
            }
          }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleReject}
            disabled={loading}
            sx={{ px: 3, backgroundColor: 'primary.main' }}
          >
            {loading ? "Saving..." : "Save & Next"}
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
}

export default MeetingRejection;

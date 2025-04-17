import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

const Reason = ({ data, onClose }) => {
  if (!data) return null;
  console.log(onClose)
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      position="fixed"
      top={0}
      left={0}
      width="100vw"
      height="100vh"
      bgcolor="rgba(0,0,0,0.5)"
      zIndex={1300}
    >
      <Card sx={{ maxWidth: 400, width: '100%', boxShadow: 5, borderRadius: 2 }}>
        <CardContent onClick={() => onClose()}>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 600, color: '#333' }}>
            {data.name}
          </Typography>
          <Typography variant="body1" sx={{ mt: 2, color: '#555' }}>
            <strong>Reason:</strong> {data.reason}
          </Typography>
          <Typography variant="body2" sx={{ mt: 2, color: '#888' }}>
            <strong>User:</strong> {data.userName}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Reason;

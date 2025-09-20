import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const VotingDiagnostic = ({ meetingData, isAdmin, currentUserId }) => {
    return (
        <Card sx={{ mb: 2, border: '2px solid #ff9800' }}>
            <CardContent>
                <Typography variant="h6" color="warning.main" gutterBottom>
                    🔍 Voting Debug Information
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <Box>
                        <Typography variant="body2"><strong>Current User ID:</strong> {currentUserId || 'Not found'}</Typography>
                        <Typography variant="body2"><strong>Is Admin:</strong> {isAdmin ? '✅ Yes' : '❌ No'}</Typography>
                        <Typography variant="body2"><strong>Meeting Status:</strong> {meetingData?.meeting_status || 'Not found'}</Typography>
                    </Box>
                    <Box>
                        <Typography variant="body2"><strong>Meeting Host ID:</strong> {meetingData?.host_id || 'Not found'}</Typography>
                        <Typography variant="body2"><strong>Meeting Created By ID:</strong> {meetingData?.created_by_id || 'Not found'}</Typography>
                        <Typography variant="body2"><strong>Meeting Title:</strong> {meetingData?.title || 'Not found'}</Typography>
                    </Box>
                </Box>
                <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                        <strong>Full Meeting Data:</strong>
                    </Typography>
                    <pre style={{ fontSize: '10px', overflow: 'auto', maxHeight: '100px' }}>
                        {JSON.stringify(meetingData, null, 2)}
                    </pre>
                </Box>
            </CardContent>
        </Card>
    );
};

export default VotingDiagnostic;
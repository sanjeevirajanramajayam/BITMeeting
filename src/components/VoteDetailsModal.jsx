import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    Chip,
    Divider,
    IconButton
} from '@mui/material';
import {
    Close,
    ThumbUp,
    ThumbDown,
    Person
} from '@mui/icons-material';

const VoteDetailsModal = ({ open, onClose, pointName, votingData, votersData }) => {
    const voting = votingData || {
        votes_for: 0,
        votes_against: 0,
        total_votes: 0,
        voting_active: false
    };

    const voters = votersData || {
        voters_for: [],
        voters_against: []
    };

    console.log(votingData, votersData);

    // Parse voter strings if they come as comma-separated strings
    const parseVoters = (voterString) => {
        if (!voterString) return [];
        if (Array.isArray(voterString)) return voterString;
        return voterString.split(',').map(voter => voter.trim()).filter(voter => voter);
    };

    const votersFor = parseVoters(voters.voters_for);
    const votersAgainst = parseVoters(voters.voters_against);

    const getResultColor = () => {
        if (voting.votes_for > voting.votes_against) return 'success';
        if (voting.votes_against > voting.votes_for) return 'error';
        return 'warning';
    };

    const getResultText = () => {
        if (voting.votes_for > voting.votes_against) return 'PASSED';
        if (voting.votes_against > voting.votes_for) return 'REJECTED';
        return 'TIED';
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 2 }
            }}
        >
            <DialogTitle sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                pb: 1 
            }}>
                <Box>
                    <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                        Voting Details
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {pointName}
                    </Typography>
                </Box>
                <IconButton 
                    onClick={onClose}
                    sx={{ 
                        color: 'grey.500',
                        '&:hover': { backgroundColor: 'grey.100' }
                    }}
                >
                    <Close />
                </IconButton>
            </DialogTitle>

            <DialogContent>
                {/* Vote Summary */}
                <Box sx={{ mb: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            Vote Summary
                        </Typography>
                        <Chip 
                            label={getResultText()}
                            color={getResultColor()}
                            sx={{ fontWeight: 'bold' }}
                        />
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                                <ThumbUp sx={{ color: 'success.main', mr: 1 }} />
                                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                                    {voting.votes_for}
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                                For
                            </Typography>
                        </Box>

                        <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />

                        <Box sx={{ textAlign: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                                <ThumbDown sx={{ color: 'error.main', mr: 1 }} />
                                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                                    {voting.votes_against}
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                                Against
                            </Typography>
                        </Box>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
                        Total Votes: {voting.total_votes}
                    </Typography>
                </Box>

                {/* Voter Lists */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                    {/* Voters For */}
                    <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <ThumbUp sx={{ color: 'success.main', mr: 1, fontSize: 20 }} />
                            <Typography variant="h6" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                                Voted For ({voting.votes_for})
                            </Typography>
                        </Box>
                        
                        {votersFor.length > 0 ? (
                            <List dense sx={{ backgroundColor: 'success.50', borderRadius: 1, border: '1px solid', borderColor: 'success.200' }}>
                                {votersFor.map((voter, index) => (
                                    <ListItem key={index}>
                                        <Person sx={{ color: 'success.main', mr: 1, fontSize: 18 }} />
                                        <ListItemText 
                                            primary={voter}
                                            primaryTypographyProps={{ 
                                                fontSize: '14px',
                                                color: 'success.dark'
                                            }}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        ) : (
                            <Box sx={{ 
                                p: 2, 
                                textAlign: 'center', 
                                color: 'text.secondary',
                                backgroundColor: 'grey.100',
                                borderRadius: 1,
                                border: '1px dashed grey'
                            }}>
                                No votes for this option
                            </Box>
                        )}
                    </Box>

                    {/* Voters Against */}
                    <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <ThumbDown sx={{ color: 'error.main', mr: 1, fontSize: 20 }} />
                            <Typography variant="h6" sx={{ color: 'error.main', fontWeight: 'bold' }}>
                                Voted Against ({voting.votes_against})
                            </Typography>
                        </Box>
                        
                        {votersAgainst.length > 0 ? (
                            <List dense sx={{ backgroundColor: 'error.50', borderRadius: 1, border: '1px solid', borderColor: 'error.200' }}>
                                {votersAgainst.map((voter, index) => (
                                    <ListItem key={index}>
                                        <Person sx={{ color: 'error.main', mr: 1, fontSize: 18 }} />
                                        <ListItemText 
                                            primary={voter}
                                            primaryTypographyProps={{ 
                                                fontSize: '14px',
                                                color: 'error.dark'
                                            }}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        ) : (
                            <Box sx={{ 
                                p: 2, 
                                textAlign: 'center', 
                                color: 'text.secondary',
                                backgroundColor: 'grey.100',
                                borderRadius: 1,
                                border: '1px dashed grey'
                            }}>
                                No votes against this option
                            </Box>
                        )}
                    </Box>
                </Box>

                {voting.voting_active && (
                    <Box sx={{ 
                        mt: 3, 
                        p: 2, 
                        backgroundColor: 'primary.50', 
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'primary.200'
                    }}>
                        <Typography variant="body2" sx={{ 
                            color: 'primary.dark',
                            textAlign: 'center',
                            fontWeight: 'bold'
                        }}>
                            🗳️ Voting is still active - results will update in real-time
                        </Typography>
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button 
                    onClick={onClose}
                    variant="contained"
                    sx={{ 
                        backgroundColor: 'primary.main',
                        '&:hover': { backgroundColor: 'primary.dark' }
                    }}
                >
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default VoteDetailsModal;
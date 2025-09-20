import React, { useState } from 'react';
import { 
    Box, 
    IconButton, 
    Chip, 
    Tooltip, 
    ButtonGroup,
    Button,
    Typography
} from '@mui/material';
import { 
    ThumbUp, 
    ThumbDown, 
    RemoveCircleOutline,
    HowToVote,
    PlayArrow,
    Stop
} from '@mui/icons-material';
import axios from 'axios';

const VotingButtons = ({ 
    pointId, 
    pointName,
    votingData, 
    onVoteUpdate, 
    isAdmin = false, 
    meetingStatus = 'not_started',
    compact = false 
}) => {
    const [loading, setLoading] = useState(false);

    const voting = votingData || {
        votes_for: 0,
        votes_against: 0,
        votes_abstain: 0,
        total_votes: 0,
        voting_active: false,
        user_vote: null
    };

    // Debug logging
    console.log('VotingButtons Debug:', {
        pointId,
        pointName,
        isAdmin,
        meetingStatus,
        votingData: voting,
        votingActive: voting.voting_active,
        compact
    });

    const submitVote = async (voteType) => {
        if (!voting.voting_active) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:5000/api/voting/submit', {
                pointId,
                voteType
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success && onVoteUpdate) {
                const updatedVoting = response.data.data.summary;
                onVoteUpdate(pointId, {
                    ...updatedVoting,
                    voting_active: voting.voting_active,
                    user_vote: voteType
                });
            }
        } catch (error) {
            console.error('Error submitting vote:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleVoting = async () => {
        if (!isAdmin || meetingStatus !== 'in_progress') return;

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const endpoint = voting.voting_active ? 'end-session' : 'start-session';
            
            const response = await axios.post(`http://localhost:5000/api/voting/${endpoint}`, {
                pointId
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('Toggle Voting Response:', response.data);
            if (response.data.success && onVoteUpdate) {
                const newVotingState = {
                    ...voting,
                    voting_active: !voting.voting_active
                };
                onVoteUpdate(pointId, newVotingState);
            }
        } catch (error) {
            console.error('Error toggling voting:', error);
        } finally {
            setLoading(false);
        }
    };

    if (compact) {
        return (
            <Box display="flex" alignItems="center" gap={1}>
                {isAdmin && (
                    <Tooltip title={
                        meetingStatus !== 'in_progress' 
                            ? "Start meeting first to enable voting"
                            : voting.voting_active ? "End Voting" : "Start Voting"
                    }>
                        <IconButton
                            size="small"
                            onClick={toggleVoting}
                            disabled={loading || meetingStatus !== 'in_progress'}
                            color={voting.voting_active ? "error" : "primary"}
                        >
                            {voting.voting_active ? <Stop /> : <PlayArrow />}
                        </IconButton>
                    </Tooltip>
                )}

                {/* Show voting buttons for members - active when voting session is running */}
                {(voting.voting_active || (!isAdmin && meetingStatus === 'in_progress')) && (
                    <ButtonGroup size="small" disabled={loading || !voting.voting_active}>
                        <Tooltip title={voting.voting_active ? "Vote For" : "Voting not started yet"}>
                            <Button
                                variant={voting.user_vote === 'for' ? 'contained' : 'outlined'}
                                color="success"
                                onClick={() => submitVote('for')}
                                sx={{ 
                                    minWidth: 'auto', 
                                    px: 1,
                                    opacity: voting.voting_active ? 1 : 0.5
                                }}
                            >
                                <ThumbUp fontSize="small" />
                                <Typography variant="caption" ml={0.5}>{voting.votes_for}</Typography>
                            </Button>
                        </Tooltip>
                        <Tooltip title={voting.voting_active ? "Vote Against" : "Voting not started yet"}>
                            <Button
                                variant={voting.user_vote === 'against' ? 'contained' : 'outlined'}
                                color="error"
                                onClick={() => submitVote('against')}
                                sx={{ 
                                    minWidth: 'auto', 
                                    px: 1,
                                    opacity: voting.voting_active ? 1 : 0.5
                                }}
                            >
                                <ThumbDown fontSize="small" />
                                <Typography variant="caption" ml={0.5}>{voting.votes_against}</Typography>
                            </Button>
                        </Tooltip>
                        <Tooltip title={voting.voting_active ? "Abstain" : "Voting not started yet"}>
                            <Button
                                variant={voting.user_vote === 'abstain' ? 'contained' : 'outlined'}
                                color="warning"
                                onClick={() => submitVote('abstain')}
                                sx={{ 
                                    minWidth: 'auto', 
                                    px: 1,
                                    opacity: voting.voting_active ? 1 : 0.5
                                }}
                            >
                                <RemoveCircleOutline fontSize="small" />
                                <Typography variant="caption" ml={0.5}>{voting.votes_abstain}</Typography>
                            </Button>
                        </Tooltip>
                    </ButtonGroup>
                )}

                {/* Status message for members when voting is not active */}
                {!isAdmin && !voting.voting_active && meetingStatus === 'in_progress' && (
                    <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        Waiting for host to start voting...
                    </Typography>
                )}

                {!voting.voting_active && voting.total_votes > 0 && (
                    <Box display="flex" alignItems="center" gap={0.5}>
                        <HowToVote fontSize="small" color="action" />
                        <Chip
                            label={`${voting.votes_for}/${voting.votes_against}/${voting.votes_abstain}`}
                            size="small"
                            variant="outlined"
                        />
                        <Chip
                            label={
                                voting.votes_for > voting.votes_against ? 'PASSED' :
                                voting.votes_against > voting.votes_for ? 'REJECTED' : 'TIED'
                            }
                            size="small"
                            color={
                                voting.votes_for > voting.votes_against ? 'success' :
                                voting.votes_against > voting.votes_for ? 'error' : 'warning'
                            }
                        />
                    </Box>
                )}
            </Box>
        );
    }

    // Full size version
    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2" color="textSecondary">
                    <HowToVote sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                    Voting
                </Typography>
                
                {isAdmin && (
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={toggleVoting}
                        disabled={loading || meetingStatus !== 'in_progress'}
                        startIcon={voting.voting_active ? <Stop /> : <PlayArrow />}
                        color={voting.voting_active ? "error" : "primary"}
                        title={meetingStatus !== 'in_progress' ? "Start meeting first to enable voting" : ""}
                    >
                        {voting.voting_active ? "End" : "Start"}
                    </Button>
                )}
            </Box>

            {/* Show voting section for both active voting and members waiting */}
            {(voting.voting_active || (!isAdmin && meetingStatus === 'in_progress')) && (
                <Box mb={2}>
                    {!voting.voting_active && !isAdmin && (
                        <Box mb={2} p={2} sx={{ backgroundColor: '#f5f5f5', borderRadius: 1, textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                                🕒 Waiting for meeting host to start voting on this point
                            </Typography>
                        </Box>
                    )}
                    
                    <ButtonGroup fullWidth disabled={loading || !voting.voting_active}>
                        <Button
                            variant={voting.user_vote === 'for' ? 'contained' : 'outlined'}
                            color="success"
                            onClick={() => submitVote('for')}
                            startIcon={<ThumbUp />}
                            sx={{ opacity: voting.voting_active ? 1 : 0.6 }}
                        >
                            For ({voting.votes_for})
                        </Button>
                        <Button
                            variant={voting.user_vote === 'against' ? 'contained' : 'outlined'}
                            color="error"
                            onClick={() => submitVote('against')}
                            startIcon={<ThumbDown />}
                            sx={{ opacity: voting.voting_active ? 1 : 0.6 }}
                        >
                            Against ({voting.votes_against})
                        </Button>
                        <Button
                            variant={voting.user_vote === 'abstain' ? 'contained' : 'outlined'}
                            color="warning"
                            onClick={() => submitVote('abstain')}
                            startIcon={<RemoveCircleOutline />}
                            sx={{ opacity: voting.voting_active ? 1 : 0.6 }}
                        >
                            Abstain ({voting.votes_abstain})
                        </Button>
                    </ButtonGroup>
                    
                    {voting.voting_active && (
                        <Typography variant="caption" display="block" textAlign="center" mt={1} color="success.main">
                            ✅ Voting is now active - cast your vote above!
                        </Typography>
                    )}
                </Box>
            )}

            {/* Show message when meeting hasn't started yet */}
            {!isAdmin && meetingStatus !== 'in_progress' && (
                <Box mb={2} p={2} sx={{ backgroundColor: '#fff3e0', borderRadius: 1, textAlign: 'center' }}>
                    <Typography variant="body2" color="warning.main">
                        📅 Meeting needs to be started before voting is available
                    </Typography>
                </Box>
            )}

            {!voting.voting_active && voting.total_votes > 0 && (
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">
                        Results: {voting.votes_for}/{voting.votes_against}/{voting.votes_abstain} ({voting.total_votes} total)
                    </Typography>
                    <Chip
                        label={
                            voting.votes_for > voting.votes_against ? 'PASSED' :
                            voting.votes_against > voting.votes_for ? 'REJECTED' : 'TIED'
                        }
                        size="small"
                        color={
                            voting.votes_for > voting.votes_against ? 'success' :
                            voting.votes_against > voting.votes_for ? 'error' : 'warning'
                        }
                    />
                </Box>
            )}
        </Box>
    );
};

export default VotingButtons;
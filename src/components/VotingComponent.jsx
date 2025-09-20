import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Button, 
    Typography, 
    Card, 
    CardContent, 
    Chip, 
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    LinearProgress,
    Tooltip
} from '@mui/material';
import { 
    ThumbUp, 
    ThumbDown, 
    RemoveCircleOutline,
    HowToVote,
    BarChart,
    PlayArrow,
    Stop
} from '@mui/icons-material';
import axios from 'axios';
import '../styles/VotingComponent.css';

const VotingComponent = ({ 
    pointId, 
    pointName, 
    votingData, 
    onVoteUpdate, 
    isAdmin = false, 
    meetingStatus = 'not_started' 
}) => {
    const [voting, setVoting] = useState(votingData || {
        votes_for: 0,
        votes_against: 0,
        votes_abstain: 0,
        total_votes: 0,
        voting_active: false,
        user_vote: null
    });
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (votingData) {
            setVoting(votingData);
        }
    }, [votingData]);

    const submitVote = async (voteType) => {
        if (!voting.voting_active) {
            setError('Voting is not currently active for this point');
            return;
        }

        setLoading(true);
        setError(null);

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

            if (response.data.success) {
                const updatedVoting = response.data.data.summary;
                setVoting({
                    ...updatedVoting,
                    voting_active: voting.voting_active,
                    user_vote: voteType
                });
                
                if (onVoteUpdate) {
                    onVoteUpdate(pointId, {
                        ...updatedVoting,
                        voting_active: voting.voting_active,
                        user_vote: voteType
                    });
                }
            }
        } catch (error) {
            console.error('Error submitting vote:', error);
            setError(error.response?.data?.message || 'Failed to submit vote');
        } finally {
            setLoading(false);
        }
    };

    const startVoting = async () => {
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:5000/api/voting/start-session', {
                pointId
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                setVoting(prev => ({
                    ...prev,
                    voting_active: true
                }));
                
                if (onVoteUpdate) {
                    onVoteUpdate(pointId, {
                        ...voting,
                        voting_active: true
                    });
                }
            }
        } catch (error) {
            console.error('Error starting voting:', error);
            setError(error.response?.data?.message || 'Failed to start voting');
        } finally {
            setLoading(false);
        }
    };

    const endVoting = async () => {
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:5000/api/voting/end-session', {
                pointId
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                const finalSummary = response.data.data.finalSummary;
                setVoting({
                    ...finalSummary,
                    voting_active: false,
                    user_vote: voting.user_vote
                });
                
                if (onVoteUpdate) {
                    onVoteUpdate(pointId, {
                        ...finalSummary,
                        voting_active: false,
                        user_vote: voting.user_vote
                    });
                }
            }
        } catch (error) {
            console.error('Error ending voting:', error);
            setError(error.response?.data?.message || 'Failed to end voting');
        } finally {
            setLoading(false);
        }
    };

    const getVotePercentage = (voteCount) => {
        if (voting.total_votes === 0) return 0;
        return Math.round((voteCount / voting.total_votes) * 100);
    };

    const getResultColor = () => {
        if (voting.votes_for > voting.votes_against) return 'success';
        if (voting.votes_against > voting.votes_for) return 'error';
        return 'warning';
    };

    return (
        <Card className="voting-component" sx={{ mb: 2 }}>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        <HowToVote sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Voting: {pointName}
                    </Typography>
                    
                    {isAdmin && meetingStatus === 'in_progress' && (
                        <Box>
                            {voting.voting_active ? (
                                <Button
                                    variant="contained"
                                    color="error"
                                    startIcon={<Stop />}
                                    onClick={endVoting}
                                    disabled={loading}
                                    size="small"
                                >
                                    End Voting
                                </Button>
                            ) : (
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<PlayArrow />}
                                    onClick={startVoting}
                                    disabled={loading}
                                    size="small"
                                >
                                    Start Voting
                                </Button>
                            )}
                        </Box>
                    )}
                </Box>

                {error && (
                    <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                        {error}
                    </Typography>
                )}

                {voting.voting_active && (
                    <Box className="voting-buttons" mb={2}>
                        <Typography variant="body1" mb={1}>
                            Cast your vote:
                        </Typography>
                        <Box display="flex" gap={1}>
                            <Button
                                variant={voting.user_vote === 'for' ? 'contained' : 'outlined'}
                                color="success"
                                startIcon={<ThumbUp />}
                                onClick={() => submitVote('for')}
                                disabled={loading}
                                size="small"
                            >
                                For ({voting.votes_for})
                            </Button>
                            <Button
                                variant={voting.user_vote === 'against' ? 'contained' : 'outlined'}
                                color="error"
                                startIcon={<ThumbDown />}
                                onClick={() => submitVote('against')}
                                disabled={loading}
                                size="small"
                            >
                                Against ({voting.votes_against})
                            </Button>
                            <Button
                                variant={voting.user_vote === 'abstain' ? 'contained' : 'outlined'}
                                color="warning"
                                startIcon={<RemoveCircleOutline />}
                                onClick={() => submitVote('abstain')}
                                disabled={loading}
                                size="small"
                            >
                                Abstain ({voting.votes_abstain})
                            </Button>
                        </Box>
                        
                        {voting.user_vote && (
                            <Typography variant="body2" color="textSecondary" mt={1}>
                                You voted: <Chip 
                                    label={voting.user_vote.toUpperCase()} 
                                    size="small" 
                                    color={
                                        voting.user_vote === 'for' ? 'success' : 
                                        voting.user_vote === 'against' ? 'error' : 'warning'
                                    }
                                />
                            </Typography>
                        )}
                    </Box>
                )}

                {(voting.total_votes > 0 || !voting.voting_active) && (
                    <Box className="voting-results">
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="body1">
                                Results ({voting.total_votes} total votes)
                            </Typography>
                            <IconButton
                                size="small"
                                onClick={() => setShowResults(!showResults)}
                            >
                                <BarChart />
                            </IconButton>
                        </Box>

                        <Box className="vote-summary" mb={2}>
                            <Box display="flex" justifyContent="space-between" mb={1}>
                                <Chip
                                    label={`For: ${voting.votes_for} (${getVotePercentage(voting.votes_for)}%)`}
                                    color="success"
                                    variant="outlined"
                                    size="small"
                                />
                                <Chip
                                    label={`Against: ${voting.votes_against} (${getVotePercentage(voting.votes_against)}%)`}
                                    color="error"
                                    variant="outlined"
                                    size="small"
                                />
                                <Chip
                                    label={`Abstain: ${voting.votes_abstain} (${getVotePercentage(voting.votes_abstain)}%)`}
                                    color="warning"
                                    variant="outlined"
                                    size="small"
                                />
                            </Box>

                            {/* Visual progress bars */}
                            <Box>
                                <Box display="flex" alignItems="center" mb={0.5}>
                                    <Typography variant="body2" sx={{ minWidth: 60 }}>For:</Typography>
                                    <Box sx={{ width: '100%', mr: 1 }}>
                                        <LinearProgress
                                            variant="determinate"
                                            value={getVotePercentage(voting.votes_for)}
                                            color="success"
                                            sx={{ height: 8, borderRadius: 4 }}
                                        />
                                    </Box>
                                    <Typography variant="body2" sx={{ minWidth: 40 }}>
                                        {getVotePercentage(voting.votes_for)}%
                                    </Typography>
                                </Box>

                                <Box display="flex" alignItems="center" mb={0.5}>
                                    <Typography variant="body2" sx={{ minWidth: 60 }}>Against:</Typography>
                                    <Box sx={{ width: '100%', mr: 1 }}>
                                        <LinearProgress
                                            variant="determinate"
                                            value={getVotePercentage(voting.votes_against)}
                                            color="error"
                                            sx={{ height: 8, borderRadius: 4 }}
                                        />
                                    </Box>
                                    <Typography variant="body2" sx={{ minWidth: 40 }}>
                                        {getVotePercentage(voting.votes_against)}%
                                    </Typography>
                                </Box>

                                <Box display="flex" alignItems="center">
                                    <Typography variant="body2" sx={{ minWidth: 60 }}>Abstain:</Typography>
                                    <Box sx={{ width: '100%', mr: 1 }}>
                                        <LinearProgress
                                            variant="determinate"
                                            value={getVotePercentage(voting.votes_abstain)}
                                            color="warning"
                                            sx={{ height: 8, borderRadius: 4 }}
                                        />
                                    </Box>
                                    <Typography variant="body2" sx={{ minWidth: 40 }}>
                                        {getVotePercentage(voting.votes_abstain)}%
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>

                        {!voting.voting_active && voting.total_votes > 0 && (
                            <Box textAlign="center">
                                <Chip
                                    label={
                                        voting.votes_for > voting.votes_against ? 'PASSED' :
                                        voting.votes_against > voting.votes_for ? 'REJECTED' : 'TIED'
                                    }
                                    color={getResultColor()}
                                    sx={{ fontWeight: 'bold' }}
                                />
                            </Box>
                        )}
                    </Box>
                )}

                {loading && <LinearProgress sx={{ mt: 1 }} />}
            </CardContent>
        </Card>
    );
};

export default VotingComponent;
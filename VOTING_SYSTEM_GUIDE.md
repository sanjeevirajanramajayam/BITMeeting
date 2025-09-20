# BITMeeting Voting System Setup and Usage Guide

## Overview
The BITMeeting voting system allows meeting participants to vote on discussion points in real-time during meetings. The system tracks votes (For/Against/Abstain), displays results, and stores the voting history in the database.

## Installation and Setup

### 1. Database Setup
First, run the SQL commands from the database schema file to create the necessary tables:

```sql
-- Run these commands in your MySQL database
-- File: backend/database/voting_schema.sql

-- Creates voting tables and views
SOURCE /path/to/your/project/backend/database/voting_schema.sql;
```

Or manually execute:
```sql
-- Create the tables manually if needed
CREATE TABLE IF NOT EXISTS point_votes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    point_id INT NOT NULL,
    user_id INT NOT NULL,
    vote_type ENUM('for', 'against', 'abstain') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (point_id) REFERENCES meeting_points(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_point_vote (user_id, point_id)
);

-- Add other tables from voting_schema.sql...
```

### 2. Backend Integration
The voting routes are already integrated into your main server file (`b2.js`). The new endpoints are available at:

- `POST /api/voting/submit` - Submit a vote
- `GET /api/voting/point/:pointId` - Get voting results for a point
- `POST /api/voting/start-session` - Start voting (admin only)
- `POST /api/voting/end-session` - End voting (admin only)
- `GET /api/voting/meeting/:meetingId` - Get all votes for a meeting

### 3. Frontend Components
Two new voting components have been created:

1. **VotingComponent.jsx** - Full-featured voting interface with detailed results
2. **VotingButtons.jsx** - Compact voting buttons for table integration

## How to Use the Voting System

### For Meeting Administrators

1. **Start a Meeting**: Navigate to the meeting page and start the meeting
2. **Begin Voting on a Point**: 
   - Click the "Start" button (▶️) next to any discussion point
   - This enables voting for all meeting participants
3. **Monitor Voting**: Watch real-time vote counts as participants vote
4. **End Voting**: Click the "End" button (⏹️) to close voting and see final results

### For Meeting Participants

1. **Join the Meeting**: Access the meeting page through your dashboard
2. **Cast Your Vote**: When voting is active for a point, you'll see three buttons:
   - 👍 **For** - Vote in favor of the point
   - 👎 **Against** - Vote against the point  
   - ⊖ **Abstain** - Choose not to take a position
3. **Change Your Vote**: You can change your vote anytime before voting ends
4. **View Results**: See live vote counts and final results

## Features

### Real-time Voting
- Live vote count updates
- Immediate feedback when you vote
- Change votes before session ends

### Comprehensive Results
- Vote breakdown (For/Against/Abstain)
- Percentage calculations
- Visual progress bars
- Final verdict (PASSED/REJECTED/TIED)

### Security & Access Control
- Only meeting members can vote
- Admins control when voting starts/stops
- One vote per user per point
- Voting only available during active meetings

### Database Storage
- All votes are permanently stored
- Vote history and timestamps recorded
- User identification for each vote
- Audit trail for meeting decisions

## API Endpoints Reference

### Submit Vote
```javascript
POST /api/voting/submit
Headers: Authorization: Bearer <token>
Body: {
  "pointId": 123,
  "voteType": "for" // "for", "against", or "abstain"
}
```

### Start Voting Session (Admin Only)
```javascript
POST /api/voting/start-session
Headers: Authorization: Bearer <token>
Body: {
  "pointId": 123
}
```

### Get Point Votes
```javascript
GET /api/voting/point/123
Headers: Authorization: Bearer <token>
```

## Frontend Integration Examples

### Using VotingButtons Component (Compact)
```jsx
import VotingButtons from './components/VotingButtons';

<VotingButtons
  pointId={point.id}
  pointName={point.point_name}
  votingData={point.voting}
  onVoteUpdate={handleVoteUpdate}
  isAdmin={true}
  meetingStatus="in_progress"
  compact={true}
/>
```

### Using VotingComponent (Full Interface)
```jsx
import VotingComponent from './components/VotingComponent';

<VotingComponent
  pointId={point.id}
  pointName={point.point_name}
  votingData={point.voting}
  onVoteUpdate={handleVoteUpdate}
  isAdmin={false}
  meetingStatus="in_progress"
/>
```

## Troubleshooting

### Common Issues

1. **Voting buttons not showing**
   - Ensure meeting status is "in_progress"
   - Check if user is a meeting member
   - Verify voting data is loaded

2. **Can't submit votes**
   - Check if voting session is active
   - Verify user authentication
   - Ensure user has meeting access

3. **Vote counts not updating**
   - Check network connectivity
   - Verify WebSocket/polling is working
   - Refresh meeting data

### Database Issues
- Ensure foreign key constraints are properly set
- Check if users and meeting_points tables exist
- Verify proper permissions on database

## Security Considerations

- Votes are tied to user authentication
- Only meeting members can participate
- Admin permissions required for session control
- All actions are logged with timestamps
- Database constraints prevent duplicate votes

## Future Enhancements

Potential improvements to consider:
- Anonymous voting options
- Weighted voting based on roles
- Vote delegation features
- Email notifications for vote results
- Export voting reports to PDF
- Real-time notifications via WebSocket

## Support

For issues or questions regarding the voting system:
1. Check the console for JavaScript errors
2. Verify database connectivity and schema
3. Test API endpoints using tools like Postman
4. Check server logs for backend errors

The voting system is now fully integrated and ready to use in your BITMeeting application!
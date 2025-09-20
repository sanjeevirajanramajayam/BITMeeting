-- Voting system database schema for BITMeeting
-- This file contains the SQL commands to create tables for the voting functionality

-- Table to store votes on meeting points
CREATE TABLE IF NOT EXISTS point_votes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    point_id INT NOT NULL,
    user_id INT NOT NULL,
    vote_type ENUM('for', 'against', 'abstain') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    FOREIGN KEY (point_id) REFERENCES meeting_points(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Ensure one vote per user per point
    UNIQUE KEY unique_user_point_vote (user_id, point_id),
    
    -- Index for faster queries
    INDEX idx_point_votes_point_id (point_id),
    INDEX idx_point_votes_user_id (user_id),
    INDEX idx_point_votes_created_at (created_at)
);

-- Table to store voting sessions for meeting points
-- This allows enabling/disabling voting for specific points during a meeting
CREATE TABLE IF NOT EXISTS point_voting_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    point_id INT NOT NULL,
    meeting_id INT NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    started_by INT NOT NULL,
    started_at TIMESTAMP NULL,
    ended_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    FOREIGN KEY (point_id) REFERENCES meeting_points(id) ON DELETE CASCADE,
    FOREIGN KEY (meeting_id) REFERENCES meeting(id) ON DELETE CASCADE,
    FOREIGN KEY (started_by) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Index for faster queries
    INDEX idx_voting_sessions_point_id (point_id),
    INDEX idx_voting_sessions_meeting_id (meeting_id),
    INDEX idx_voting_sessions_active (is_active)
);

-- View to get vote summaries for points
CREATE OR REPLACE VIEW point_vote_summary AS
SELECT 
    pv.point_id,
    COUNT(CASE WHEN pv.vote_type = 'for' THEN 1 END) as votes_for,
    COUNT(CASE WHEN pv.vote_type = 'against' THEN 1 END) as votes_against,
    COUNT(CASE WHEN pv.vote_type = 'abstain' THEN 1 END) as votes_abstain,
    COUNT(*) as total_votes,
    GROUP_CONCAT(
        CASE WHEN pv.vote_type = 'for' 
        THEN CONCAT(u.name, ' (', pv.vote_type, ')') 
        END SEPARATOR ', '
    ) as voters_for,
    GROUP_CONCAT(
        CASE WHEN pv.vote_type = 'against' 
        THEN CONCAT(u.name, ' (', pv.vote_type, ')') 
        END SEPARATOR ', '
    ) as voters_against,
    GROUP_CONCAT(
        CASE WHEN pv.vote_type = 'abstain' 
        THEN CONCAT(u.name, ' (', pv.vote_type, ')') 
        END SEPARATOR ', '
    ) as voters_abstain
FROM point_votes pv
JOIN users u ON pv.user_id = u.id
GROUP BY pv.point_id;
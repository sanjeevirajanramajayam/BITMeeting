-- Migration script to remove abstain option from existing voting system
-- Run this script if you already have the voting tables installed

-- Step 1: Remove all abstain votes (optional - you might want to convert them to something else first)
DELETE FROM point_votes WHERE vote_type = 'abstain';

-- Step 2: Update the ENUM to remove 'abstain' option
ALTER TABLE point_votes MODIFY vote_type ENUM('for', 'against') NOT NULL;

-- Step 3: Recreate the view without abstain references
DROP VIEW IF EXISTS point_vote_summary;

CREATE OR REPLACE VIEW point_vote_summary AS
SELECT 
    pv.point_id,
    COUNT(CASE WHEN pv.vote_type = 'for' THEN 1 END) as votes_for,
    COUNT(CASE WHEN pv.vote_type = 'against' THEN 1 END) as votes_against,
    COUNT(*) as total_votes,
    GROUP_CONCAT(
        CASE WHEN pv.vote_type = 'for' 
        THEN u.name
        END SEPARATOR ', '
    ) as voters_for,
    GROUP_CONCAT(
        CASE WHEN pv.vote_type = 'against' 
        THEN u.name
        END SEPARATOR ', '
    ) as voters_against
FROM point_votes pv
JOIN users u ON pv.user_id = u.id
GROUP BY pv.point_id;
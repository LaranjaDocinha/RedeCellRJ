-- Description: Adds profile fields (avatar_url, job_title, phone_number, bio) to the users table.
-- Up
ALTER TABLE users
ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS job_title VARCHAR(100) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT NULL;

-- Down
ALTER TABLE users
DROP COLUMN IF EXISTS avatar_url,
DROP COLUMN IF EXISTS job_title,
DROP COLUMN IF EXISTS phone_number,
DROP COLUMN IF EXISTS bio;

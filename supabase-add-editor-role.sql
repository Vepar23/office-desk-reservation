-- Add is_editor column to users table
-- Run this migration to add editor role support

-- Add is_editor column with default false
ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_editor BOOLEAN DEFAULT false NOT NULL;

-- Optional: Update RLS policies if needed
-- (Current policies should work fine as editors are treated similar to regular users
-- but with special permission to delete reservations which is handled in the API layer)

-- Example: Create an editor user (optional)
-- UPDATE users SET is_editor = true WHERE username = 'your_editor_username';


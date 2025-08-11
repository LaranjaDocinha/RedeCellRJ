-- migration_60_add_indexes_to_users_table.sql

-- Add index to the 'name' column for faster searches
CREATE INDEX IF NOT EXISTS idx_users_name ON users (name);

-- Add index to the 'email' column for faster searches and uniqueness checks
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users (email);

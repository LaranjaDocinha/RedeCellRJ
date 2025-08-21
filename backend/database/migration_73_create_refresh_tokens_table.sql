-- migration_73_create_refresh_tokens_table.sql

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add an index to the token column for faster lookups
CREATE INDEX idx_refresh_token_token ON refresh_tokens (token);

-- Add an index to the user_id for faster lookups
CREATE INDEX idx_refresh_token_user_id ON refresh_tokens (user_id);

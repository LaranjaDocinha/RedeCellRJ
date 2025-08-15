-- Description: Creates the settings_activity_log table to audit changes in the settings.
-- Up
CREATE TABLE IF NOT EXISTS settings_activity_log (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(255) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    changed_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Down
DROP TABLE IF EXISTS settings_activity_log;

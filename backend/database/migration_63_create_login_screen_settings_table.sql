-- Migration to create the login_screen_settings table and seed it with a default entry.

-- Define ENUM types for better data integrity.
-- The script checks for existence before creating to avoid errors on re-runs.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'background_type') THEN
        CREATE TYPE background_type AS ENUM ('gradient', 'solid', 'image', 'video');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'image_size_type') THEN
        CREATE TYPE image_size_type AS ENUM ('cover', 'contain', 'auto');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'image_repeat_type') THEN
        CREATE TYPE image_repeat_type AS ENUM ('no-repeat', 'repeat', 'repeat-x', 'repeat-y');
    END IF;
END$$;

-- Create the table to store login screen customization settings.
CREATE TABLE IF NOT EXISTS login_screen_settings (
    id SERIAL PRIMARY KEY,
    background_type background_type NOT NULL DEFAULT 'gradient',
    background_solid_color VARCHAR(7) DEFAULT '#FFFFFF',
    background_image_url TEXT,
    background_video_url TEXT,
    image_size image_size_type DEFAULT 'cover',
    image_repeat image_repeat_type DEFAULT 'no-repeat',
    gradient_color_1 VARCHAR(20) DEFAULT 'random',
    gradient_color_2 VARCHAR(20) DEFAULT 'random',
    gradient_color_3 VARCHAR(20) DEFAULT 'random',
    gradient_color_4 VARCHAR(20) DEFAULT 'random',
    gradient_speed INT DEFAULT 15,
    gradient_direction INT DEFAULT 45,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create the trigger to automatically update the updated_at timestamp.
-- This assumes the set_timestamp() function already exists from a previous migration.
CREATE TRIGGER trigger_login_settings_set_timestamp
BEFORE UPDATE ON login_screen_settings
FOR EACH ROW
EXECUTE FUNCTION set_timestamp();

-- Insert the default settings row only if the table is empty.
-- This prevents duplicate rows if the migration is run multiple times.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM login_screen_settings) THEN
        INSERT INTO login_screen_settings (
            background_type,
            gradient_color_1,
            gradient_color_2,
            gradient_color_3,
            gradient_color_4,
            gradient_speed,
            gradient_direction
        ) VALUES (
            'gradient',
            'random',
            'random',
            'random',
            'random',
            15,
            45
        );
    END IF;
END$$;

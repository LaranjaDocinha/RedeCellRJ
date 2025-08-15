-- Description: Seeds default login screen settings if the table is empty.
-- Up
INSERT INTO login_screen_settings (background_type, background_solid_color, gradient_color_1, gradient_color_2, gradient_color_3, gradient_color_4, gradient_speed, gradient_direction, image_size, image_repeat)
SELECT 'gradient', '#2a2a72', '#2a2a72', '#009ffd', '#2a2a72', '#009ffd', 15, 45, 'cover', 'no-repeat'
WHERE NOT EXISTS (SELECT 1 FROM login_screen_settings);

-- Down
-- No direct down operation for seeding, as it might remove user-configured settings.
-- If a full reset is needed, it should be handled by a specific reset script.


-- Description: Adds the permission for reading settings audit logs and assigns it to the Admin role.
-- Up
DO $$
DECLARE
    admin_role_id INT;
    read_log_permission_id INT;
BEGIN
    -- Get the ID of the 'Admin' role
    SELECT id INTO admin_role_id FROM roles WHERE name = 'Admin';

    -- Insert the new permission and get its ID
    INSERT INTO permissions (name, description) 
    VALUES ('settings_logs:read', 'Visualizar logs de alterações das configurações') 
    ON CONFLICT (name) DO NOTHING;

    SELECT id INTO read_log_permission_id FROM permissions WHERE name = 'settings_logs:read';

    -- Assign the permission to the Admin role if both exist
    IF admin_role_id IS NOT NULL AND read_log_permission_id IS NOT NULL THEN
        INSERT INTO role_permissions (role_id, permission_id) 
        VALUES (admin_role_id, read_log_permission_id)
        ON CONFLICT (role_id, permission_id) DO NOTHING;
    END IF;
END;
$$;

-- Down
DO $$
DECLARE
    read_log_permission_id INT;
BEGIN
    SELECT id INTO read_log_permission_id FROM permissions WHERE name = 'settings_logs:read';

    IF read_log_permission_id IS NOT NULL THEN
        DELETE FROM role_permissions WHERE permission_id = read_log_permission_id;
        DELETE FROM permissions WHERE id = read_log_permission_id;
    END IF;
END;
$$;

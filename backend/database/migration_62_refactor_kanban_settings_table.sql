ALTER TABLE kanban_column_settings ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid();

UPDATE kanban_column_settings SET id = gen_random_uuid() WHERE id IS NULL;

ALTER TABLE kanban_column_settings ALTER COLUMN id SET NOT NULL;

ALTER TABLE kanban_column_settings DROP CONSTRAINT kanban_column_settings_pkey;

ALTER TABLE kanban_column_settings ADD PRIMARY KEY (id);

ALTER TABLE kanban_column_settings ADD CONSTRAINT unique_column_name UNIQUE (column_name);

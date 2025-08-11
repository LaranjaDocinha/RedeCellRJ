 -- Migration to add kanban column settings table
     -- Made idempotent by handling conflicts on a per-row basis to ensure execution safety.
     CREATE TABLE IF NOT EXISTS kanban_column_settings (
         column_name VARCHAR(50) PRIMARY KEY,
         background_color VARCHAR(7) DEFAULT '#FFFFFF',
         text_color VARCHAR(7) DEFAULT '#000000',
         column_order INTEGER UNIQUE
     );
    
    -- Insert default values, handling conflicts on a per-row basis.
    -- This is the most robust way to ensure this script is idempotent.
    INSERT INTO kanban_column_settings (column_name, background_color, text_color, column_order)
      VALUES ('Orçamento pendente', '#f97316', '#FFFFFF', 0) ON CONFLICT(column_name) DO NOTHING;
    INSERT INTO kanban_column_settings (column_name, background_color, text_color, column_order)
      VALUES ('Aguardando aprovação', '#3b82f6', '#FFFFFF', 1) ON CONFLICT(column_name) DO NOTHING;
    INSERT INTO kanban_column_settings (column_name, background_color, text_color, column_order)
      VALUES ('Aguardando peças', '#f59e0b', '#FFFFFF', 2) ON CONFLICT(column_name) DO NOTHING;
    INSERT INTO kanban_column_settings (column_name, background_color, text_color, column_order)
      VALUES ('Em reparo', '#8b5cf6', '#FFFFFF', 3) ON CONFLICT(column_name) DO NOTHING;
    INSERT INTO kanban_column_settings (column_name, background_color, text_color, column_order)
      VALUES ('Concluído', '#10b981', '#FFFFFF', 4) ON CONFLICT(column_name) DO NOTHING;
    INSERT INTO kanban_column_settings (column_name, background_color, text_color, column_order)
      VALUES ('Entregue', '#6b7280', '#FFFFFF', 5) ON CONFLICT(column_name) DO NOTHING;
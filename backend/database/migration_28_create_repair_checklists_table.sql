-- Cria a tabela repair_checklists para armazenar itens de checklist por reparo
CREATE TABLE IF NOT EXISTS repair_checklists (
    id SERIAL PRIMARY KEY,
    repair_id INTEGER NOT NULL REFERENCES repairs(id) ON DELETE CASCADE,
    item_description TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adiciona um índice para otimizar buscas por repair_id
CREATE INDEX IF NOT EXISTS idx_repair_checklists_repair_id ON repair_checklists(repair_id);

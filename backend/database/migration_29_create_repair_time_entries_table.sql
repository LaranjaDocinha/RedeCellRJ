-- Cria a tabela repair_time_entries para registrar o tempo gasto em cada reparo
CREATE TABLE IF NOT EXISTS repair_time_entries (
    id SERIAL PRIMARY KEY,
    repair_id INTEGER NOT NULL REFERENCES repairs(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER, -- Duração em minutos, pode ser calculada ou inserida
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adiciona índices para otimizar buscas
CREATE INDEX IF NOT EXISTS idx_repair_time_entries_repair_id ON repair_time_entries(repair_id);
CREATE INDEX IF NOT EXISTS idx_repair_time_entries_user_id ON repair_time_entries(user_id);

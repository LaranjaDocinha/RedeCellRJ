-- Recria a tabela cash_flow_projections para um modelo mais flexível de lançamentos individuais

-- Remove a tabela antiga se existir
DROP TABLE IF EXISTS cash_flow_projections;

-- Cria a nova tabela para armazenar lançamentos de projeção individuais
CREATE TABLE IF NOT EXISTS cash_flow_projections (
    id SERIAL PRIMARY KEY,
    description TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('inflow', 'outflow')), -- Tipo de lançamento: entrada ou saída
    projection_date DATE NOT NULL, -- Data prevista para o lançamento
    notes TEXT,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL, -- Usuário que criou o lançamento
    branch_id INTEGER NOT NULL REFERENCES branches(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adiciona um trigger para atualizar o `updated_at` automaticamente
CREATE TRIGGER set_timestamp_cash_flow_projections
BEFORE UPDATE ON cash_flow_projections
FOR EACH ROW
EXECUTE PROCEDURE set_timestamp();

-- Adiciona índices para otimizar buscas
CREATE INDEX IF NOT EXISTS idx_cash_flow_projections_projection_date ON cash_flow_projections(projection_date);
CREATE INDEX IF NOT EXISTS idx_cash_flow_projections_type ON cash_flow_projections(type);
CREATE INDEX IF NOT EXISTS idx_cash_flow_projections_user_id ON cash_flow_projections(user_id);

COMMENT ON TABLE cash_flow_projections IS 'Armazena lançamentos futuros individuais (entradas e saídas) para projeção do fluxo de caixa.';
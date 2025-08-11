-- Cria a tabela cash_flow_projections para gerenciar projeções de fluxo de caixa
CREATE TABLE IF NOT EXISTS cash_flow_projections (
    id SERIAL PRIMARY KEY,
    projection_date DATE NOT NULL UNIQUE, -- Data da projeção (ex: início do mês)
    projected_inflow DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    projected_outflow DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adiciona índice para otimizar buscas por data
CREATE INDEX IF NOT EXISTS idx_cash_flow_projections_date ON cash_flow_projections(projection_date);

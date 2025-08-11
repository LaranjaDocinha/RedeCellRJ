-- Adiciona campos de fidelidade à tabela customers
ALTER TABLE customers
ADD COLUMN loyalty_points INTEGER DEFAULT 0,
ADD COLUMN last_loyalty_update TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Cria a tabela loyalty_transactions para registrar o histórico de pontos de fidelidade
CREATE TABLE IF NOT EXISTS loyalty_transactions (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    points_change INTEGER NOT NULL, -- Pontos adicionados ou deduzidos
    transaction_type VARCHAR(50) NOT NULL, -- Ex: 'purchase', 'redemption', 'adjustment'
    source_id INTEGER, -- ID da venda, resgate, etc.
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adiciona índices para otimizar buscas
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_customer_id ON loyalty_transactions(customer_id);

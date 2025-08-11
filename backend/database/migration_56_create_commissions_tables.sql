-- Cria a tabela commission_rules para definir as regras de comissão
CREATE TABLE IF NOT EXISTS commission_rules (
    id SERIAL PRIMARY KEY,
    role_id INTEGER REFERENCES roles(id) ON DELETE RESTRICT, -- Regra para um papel específico (ex: Vendedor, Técnico)
    commission_type VARCHAR(50) NOT NULL, -- 'percentage_of_sale', 'fixed_per_item', 'fixed_per_service'
    value DECIMAL(10, 2) NOT NULL, -- Valor da comissão (ex: 0.05 para 5%, ou 10.00 para R$10 fixos)
    applies_to VARCHAR(50), -- 'sales', 'repairs', 'products', 'services'
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cria a tabela commission_payouts para registrar os pagamentos de comissão
CREATE TABLE IF NOT EXISTS commission_payouts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT, -- Vendedor ou Técnico que recebeu a comissão
    amount DECIMAL(10, 2) NOT NULL,
    payout_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    period_start TIMESTAMP WITH TIME ZONE,
    period_end TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adiciona índices para otimizar buscas
CREATE INDEX IF NOT EXISTS idx_commission_rules_role_id ON commission_rules(role_id);
CREATE INDEX IF NOT EXISTS idx_commission_rules_applies_to ON commission_rules(applies_to);
CREATE INDEX IF NOT EXISTS idx_commission_payouts_user_id ON commission_payouts(user_id);
CREATE INDEX IF NOT EXISTS idx_commission_payouts_date ON commission_payouts(payout_date);

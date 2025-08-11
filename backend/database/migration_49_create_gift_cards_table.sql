-- Cria a tabela gift_cards para gerenciar vales-presente
CREATE TABLE IF NOT EXISTS gift_cards (
    id SERIAL PRIMARY KEY,
    code VARCHAR(255) NOT NULL UNIQUE, -- Código único do vale-presente
    initial_value DECIMAL(10, 2) NOT NULL,
    current_value DECIMAL(10, 2) NOT NULL,
    issue_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expiry_date TIMESTAMP WITH TIME ZONE, -- Data de expiração opcional
    customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL, -- Cliente a quem o vale-presente foi atribuído (opcional)
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'redeemed', 'expired', 'inactive'
    created_by_user_id INTEGER REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cria a tabela gift_card_transactions para registrar as movimentações do vale-presente
CREATE TABLE IF NOT EXISTS gift_card_transactions (
    id SERIAL PRIMARY KEY,
    gift_card_id INTEGER NOT NULL REFERENCES gift_cards(id) ON DELETE RESTRICT,
    transaction_type VARCHAR(50) NOT NULL, -- 'issue', 'redeem', 'top_up', 'refund'
    amount DECIMAL(10, 2) NOT NULL,
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sale_id INTEGER REFERENCES sales(id) ON DELETE SET NULL, -- Link para a venda, se aplicável
    user_id INTEGER REFERENCES users(id) ON DELETE RESTRICT, -- Usuário que realizou a transação
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adiciona índices para otimizar buscas
CREATE INDEX IF NOT EXISTS idx_gift_cards_code ON gift_cards(code);
CREATE INDEX IF NOT EXISTS idx_gift_cards_customer_id ON gift_cards(customer_id);
CREATE INDEX IF NOT EXISTS idx_gift_card_transactions_card_id ON gift_card_transactions(gift_card_id);

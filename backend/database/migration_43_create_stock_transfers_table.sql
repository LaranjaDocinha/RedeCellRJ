-- Cria a tabela stock_transfers para registrar transferências de estoque entre filiais
CREATE TABLE IF NOT EXISTS stock_transfers (
    id SERIAL PRIMARY KEY,
    product_variation_id INTEGER NOT NULL REFERENCES product_variations(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    from_branch_id INTEGER NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
    to_branch_id INTEGER NOT NULL REFERENCES branches(id) ON DELETE RESTRICT,
    transfer_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, in_transit, completed, canceled
    requested_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    approved_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    completion_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT chk_different_branches CHECK (from_branch_id <> to_branch_id)
);

-- Adiciona índices para otimizar buscas
CREATE INDEX IF NOT EXISTS idx_stock_transfers_variation_id ON stock_transfers(product_variation_id);
CREATE INDEX IF NOT EXISTS idx_stock_transfers_from_branch_id ON stock_transfers(from_branch_id);
CREATE INDEX IF NOT EXISTS idx_stock_transfers_to_branch_id ON stock_transfers(to_branch_id);
CREATE INDEX IF NOT EXISTS idx_stock_transfers_status ON stock_transfers(status);

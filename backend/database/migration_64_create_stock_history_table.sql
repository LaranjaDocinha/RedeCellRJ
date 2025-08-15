-- Cria a tabela stock_history para registrar todas as movimentações de estoque
CREATE TABLE IF NOT EXISTS stock_history (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    product_variation_id INTEGER REFERENCES product_variations(id) ON DELETE RESTRICT,
    quantity_change INTEGER NOT NULL, -- Quantidade que foi adicionada (positiva) ou removida (negativa)
    new_stock_quantity INTEGER NOT NULL, -- Quantidade final em estoque após a movimentação
    movement_type VARCHAR(50) NOT NULL, -- Ex: 'Entrada', 'Saída', 'Ajuste', 'Venda', 'Devolução', 'Transferência'
    source_document_id INTEGER, -- ID do documento que originou a movimentação (ex: sale_id, purchase_order_id, stock_transfer_id)
    notes TEXT,
    movement_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adiciona índices para otimizar buscas
CREATE INDEX IF NOT EXISTS idx_stock_history_product_id ON stock_history(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_history_product_variation_id ON stock_history(product_variation_id);
CREATE INDEX IF NOT EXISTS idx_stock_history_movement_type ON stock_history(movement_type);
CREATE INDEX IF NOT EXISTS idx_stock_history_movement_date ON stock_history(movement_date);

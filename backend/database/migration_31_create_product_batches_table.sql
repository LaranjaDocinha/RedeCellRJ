-- Cria a tabela product_batches para gerenciar lotes de produtos
CREATE TABLE IF NOT EXISTS product_batches (
    id SERIAL PRIMARY KEY,
    variation_id INTEGER NOT NULL REFERENCES product_variations(id) ON DELETE CASCADE,
    batch_number VARCHAR(255) NOT NULL, -- Número do lote
    quantity INTEGER NOT NULL CHECK (quantity >= 0), -- Quantidade neste lote
    entry_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- Data de entrada do lote
    expiration_date TIMESTAMP WITH TIME ZONE, -- Data de validade (opcional)
    supplier_id INTEGER REFERENCES suppliers(id) ON DELETE SET NULL, -- Fornecedor do lote (opcional)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(variation_id, batch_number) -- Garante que um lote seja único por variação
);

-- Adiciona um índice para otimizar buscas por variação e número de lote
CREATE INDEX IF NOT EXISTS idx_product_batches_variation_id_batch_number ON product_batches(variation_id, batch_number);

-- Remove a coluna stock_quantity de product_variations, se ela existir
ALTER TABLE product_variations
DROP COLUMN IF EXISTS stock_quantity;

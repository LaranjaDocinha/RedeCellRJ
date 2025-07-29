-- Tabela para armazenar sugestões de produtos (produtos frequentemente comprados juntos)
CREATE TABLE IF NOT EXISTS product_suggestions (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    suggested_product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    frequency INTEGER NOT NULL DEFAULT 1, -- Quantas vezes este par foi comprado junto
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (product_id, suggested_product_id)
);

-- Adiciona um índice para buscas rápidas
CREATE INDEX IF NOT EXISTS idx_product_suggestions_product_id ON product_suggestions(product_id);

-- Adiciona comentários para clareza
COMMENT ON TABLE product_suggestions IS 'Armazena pares de produtos que são frequentemente comprados juntos para alimentar o motor de sugestões.';
COMMENT ON COLUMN product_suggestions.frequency IS 'Indica a força da associação entre os dois produtos.';

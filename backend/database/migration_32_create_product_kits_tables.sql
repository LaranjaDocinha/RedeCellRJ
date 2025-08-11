-- Cria a tabela product_kits para definir kits de produtos
CREATE TABLE IF NOT EXISTS product_kits (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL, -- Preço de venda do kit
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cria a tabela kit_items para associar produtos (variações) a kits
CREATE TABLE IF NOT EXISTS kit_items (
    id SERIAL PRIMARY KEY,
    kit_id INTEGER NOT NULL REFERENCES product_kits(id) ON DELETE CASCADE,
    variation_id INTEGER NOT NULL REFERENCES product_variations(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0), -- Quantidade da variação no kit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(kit_id, variation_id) -- Garante que uma variação seja adicionada apenas uma vez por kit
);

-- Adiciona índices para otimizar buscas
CREATE INDEX IF NOT EXISTS idx_product_kits_name ON product_kits(name);
CREATE INDEX IF NOT EXISTS idx_kit_items_kit_id ON kit_items(kit_id);
CREATE INDEX IF NOT EXISTS idx_kit_items_variation_id ON kit_items(variation_id);

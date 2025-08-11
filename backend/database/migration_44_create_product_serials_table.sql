-- Cria a tabela product_serials para rastrear individualmente produtos por número de série/IMEI
CREATE TABLE IF NOT EXISTS product_serials (
    id SERIAL PRIMARY KEY,
    product_variation_id INTEGER NOT NULL REFERENCES product_variations(id) ON DELETE RESTRICT,
    serial_number VARCHAR(255) NOT NULL UNIQUE, -- IMEI ou número de série
    status VARCHAR(50) NOT NULL DEFAULT 'in_stock', -- in_stock, sold, in_repair, transferred, returned, lost
    current_branch_id INTEGER NOT NULL REFERENCES branches(id) ON DELETE RESTRICT, -- Filial onde o item está atualmente
    purchase_order_item_id INTEGER REFERENCES purchase_order_items(id) ON DELETE SET NULL, -- Opcional: link para a origem da compra
    sale_item_id INTEGER REFERENCES sale_items(id) ON DELETE SET NULL, -- Opcional: link para o item de venda
    repair_id INTEGER REFERENCES repairs(id) ON DELETE SET NULL, -- Opcional: link para o reparo
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adiciona índices para otimizar buscas
CREATE INDEX IF NOT EXISTS idx_product_serials_serial_number ON product_serials(serial_number);
CREATE INDEX IF NOT EXISTS idx_product_serials_variation_id ON product_serials(product_variation_id);
CREATE INDEX IF NOT EXISTS idx_product_serials_status ON product_serials(status);
CREATE INDEX IF NOT EXISTS idx_product_serials_current_branch_id ON product_serials(current_branch_id);

-- Adiciona uma coluna para indicar se a variação do produto é serializada
ALTER TABLE product_variations
ADD COLUMN IF NOT EXISTS is_serialized BOOLEAN NOT NULL DEFAULT FALSE;

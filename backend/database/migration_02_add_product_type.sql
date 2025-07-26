-- Adiciona a coluna para diferenciar produtos físicos de serviços
ALTER TABLE products
ADD COLUMN product_type VARCHAR(10) NOT NULL DEFAULT 'physical' CHECK (product_type IN ('physical', 'service'));

-- Comentário para clareza
COMMENT ON COLUMN products.product_type IS 'Tipo do produto: ''physical'' para bens com estoque, ''service'' para serviços sem estoque.';

-- Adiciona a coluna para rastrear estoque reservado para reparos e outras finalidades

ALTER TABLE product_variations
ADD COLUMN IF NOT EXISTS reserved_quantity INTEGER NOT NULL DEFAULT 0;

COMMENT ON COLUMN product_variations.reserved_quantity IS 'Quantidade de estoque reservada para ordens de serviço, vendas pendentes, etc. O estoque disponível é (stock_quantity - reserved_quantity).';

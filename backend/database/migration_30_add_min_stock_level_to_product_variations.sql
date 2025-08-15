-- Adiciona a coluna min_stock_level à tabela product_variations
ALTER TABLE product_variations
ADD COLUMN IF NOT EXISTS min_stock_level INTEGER DEFAULT 0;

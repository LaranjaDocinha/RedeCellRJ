-- Adiciona a coluna min_stock_level à tabela product_variations
ALTER TABLE product_variations
ADD COLUMN min_stock_level INTEGER DEFAULT 0;

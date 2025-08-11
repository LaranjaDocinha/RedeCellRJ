-- Adiciona a coluna stock_quantity à tabela product_variations
ALTER TABLE product_variations
ADD COLUMN stock_quantity INTEGER DEFAULT 0;
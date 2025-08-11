-- Adiciona a coluna main_image_url à tabela products para o catálogo digital
ALTER TABLE products
ADD COLUMN IF NOT EXISTS main_image_url VARCHAR(255);

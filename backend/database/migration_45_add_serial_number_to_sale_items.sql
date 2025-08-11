-- Adiciona a coluna serial_number à tabela sale_items para rastreamento de produtos serializados
ALTER TABLE sale_items
ADD COLUMN IF NOT EXISTS serial_number VARCHAR(255);

-- Adiciona um índice para otimizar buscas por serial_number em itens de venda
CREATE INDEX IF NOT EXISTS idx_sale_items_serial_number ON sale_items(serial_number);

-- Adiciona a coluna gift_card_id à tabela sales para vincular vendas a vales-presente
ALTER TABLE sales
ADD COLUMN IF NOT EXISTS gift_card_id INTEGER REFERENCES gift_cards(id) ON DELETE SET NULL;

-- Adiciona um índice para otimizar buscas por gift_card_id em vendas
CREATE INDEX IF NOT EXISTS idx_sales_gift_card_id ON sales(gift_card_id);

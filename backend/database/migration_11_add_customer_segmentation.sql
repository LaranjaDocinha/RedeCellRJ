-- Adiciona a coluna 'segment' na tabela de clientes para armazenar a categoria do cliente (Ex: Ouro, Prata, Bronze).
ALTER TABLE customers ADD COLUMN segment VARCHAR(50) DEFAULT 'Bronze';

-- Adiciona um índice na nova coluna para otimizar as buscas por segmento.
CREATE INDEX idx_customers_segment ON customers(segment);

-- Adiciona um comentário para explicar o propósito da nova coluna.
COMMENT ON COLUMN customers.segment IS 'Segmento do cliente (ex: Ouro, Prata, Bronze, Em Risco) usado para estratégias de CRM.';

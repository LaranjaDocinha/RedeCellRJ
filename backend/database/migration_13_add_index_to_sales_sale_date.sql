-- Adiciona um índice na coluna sale_date da tabela sales para otimizar consultas de data e tempo.
CREATE INDEX IF NOT EXISTS idx_sales_sale_date ON sales(sale_date);

-- Adiciona um comentário para explicar o propósito do novo índice.
COMMENT ON INDEX idx_sales_sale_date IS 'Otimiza a busca e ordenação de vendas por data.';

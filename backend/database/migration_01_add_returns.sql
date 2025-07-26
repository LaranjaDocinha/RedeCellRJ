-- Adiciona colunas para suportar o sistema de devoluções
ALTER TABLE sales
ADD COLUMN sale_type VARCHAR(10) NOT NULL DEFAULT 'sale' CHECK (sale_type IN ('sale', 'return')),
ADD COLUMN original_sale_id INTEGER REFERENCES sales(id);

-- Adiciona um índice para buscas rápidas por ID de venda original
CREATE INDEX idx_sales_original_sale_id ON sales(original_sale_id);

-- Comentários para clareza
COMMENT ON COLUMN sales.sale_type IS 'Tipo da transação: ''sale'' para venda, ''return'' para devolução.';
COMMENT ON COLUMN sales.original_sale_id IS 'Referência à venda original em caso de devolução.';

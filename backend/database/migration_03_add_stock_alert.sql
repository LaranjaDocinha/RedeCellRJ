-- Adiciona o campo de nível de alerta de estoque na tabela de variações de produto
ALTER TABLE product_variations
ADD COLUMN alert_threshold INTEGER NOT NULL DEFAULT 5;

-- Adiciona um comentário na coluna para documentação
COMMENT ON COLUMN product_variations.alert_threshold IS 'Nível de estoque em que um alerta de "baixo estoque" deve ser gerado.';

-- Atualiza o histórico de estoque para vendas existentes que não o possuem
INSERT INTO stock_history (variation_id, user_id, change_type, quantity_change, reason, created_at)
SELECT
    si.variation_id,
    s.user_id,
    'sale',
    -si.quantity,
    'Venda ID: ' || s.id,
    s.sale_date
FROM sale_items si
JOIN sales s ON si.sale_id = s.id
LEFT JOIN stock_history sh ON sh.reason = 'Venda ID: ' || s.id AND sh.variation_id = si.variation_id
WHERE sh.id IS NULL;

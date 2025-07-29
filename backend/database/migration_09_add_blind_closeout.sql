-- Tabela para registrar os eventos de fechamento de caixa
CREATE TABLE IF NOT EXISTS cash_drawer_closings (
    id SERIAL PRIMARY KEY,
    cash_session_id INTEGER NOT NULL REFERENCES cash_sessions(id),
    closed_by_user_id INTEGER NOT NULL REFERENCES users(id),
    closing_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    total_discrepancy NUMERIC(10, 2) NOT NULL, -- Soma de todas as discrepâncias
    notes TEXT
);

-- Tabela para detalhar os valores de cada método de pagamento no fechamento
CREATE TABLE IF NOT EXISTS cash_drawer_closing_details (
    id SERIAL PRIMARY KEY,
    cash_drawer_closing_id INTEGER NOT NULL REFERENCES cash_drawer_closings(id) ON DELETE CASCADE,
    payment_method_id INTEGER NOT NULL REFERENCES payment_methods(id),
    counted_amount NUMERIC(10, 2) NOT NULL,
    system_amount NUMERIC(10, 2) NOT NULL,
    discrepancy NUMERIC(10, 2) NOT NULL -- Calculado como (counted_amount - system_amount)
);

-- Adiciona um comentário para as novas tabelas para clareza
COMMENT ON TABLE cash_drawer_closings IS 'Registra cada evento de fechamento de caixa, vinculando-o a uma sessão e a um usuário.';
COMMENT ON TABLE cash_drawer_closing_details IS 'Detalha os valores contados vs. sistema para cada método de pagamento em um fechamento de caixa.';

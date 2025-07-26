-- Tabela para gerenciar as sessões de caixa (abertura e fechamento)
CREATE TABLE cash_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    opening_balance DECIMAL(10, 2) NOT NULL,
    closing_balance DECIMAL(10, 2), -- Valor real contado no fechamento
    calculated_balance DECIMAL(10, 2), -- Valor que o sistema calculou (abertura + vendas - despesas)
    difference DECIMAL(10, 2), -- Diferença entre o contado e o calculado
    opened_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('open', 'closed')),
    notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Adicionar um índice para buscas rápidas por usuário e status
CREATE INDEX idx_cash_sessions_user_status ON cash_sessions(user_id, status);

-- Comentários para clareza
COMMENT ON COLUMN cash_sessions.opening_balance IS 'Valor inicial no caixa (fundo de troco)';
COMMENT ON COLUMN cash_sessions.closing_balance IS 'Valor final contado na gaveta no fechamento';
COMMENT ON COLUMN cash_sessions.calculated_balance IS 'Valor que o sistema espera que esteja no caixa';
COMMENT ON COLUMN cash_sessions.difference IS 'Diferença (sobra/falta) entre o valor contado e o calculado';
COMMENT ON COLUMN cash_sessions.status IS 'Status atual da sessão de caixa: open ou closed';

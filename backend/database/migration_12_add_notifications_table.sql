-- Tabela para armazenar notificações do sistema
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, -- Opcional: se a notificação for para um usuário específico
    type VARCHAR(50) NOT NULL, -- Ex: 'stock_alert', 'sales_goal', 'customer_risk'
    message TEXT NOT NULL,
    read_status BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Adiciona um índice para buscas rápidas por usuário e status de leitura
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read_status);

-- Adiciona comentários para clareza
COMMENT ON TABLE notifications IS 'Armazena notificações proativas para usuários do sistema.';
COMMENT ON COLUMN notifications.type IS 'Tipo da notificação (ex: alerta de estoque, meta de vendas).';
COMMENT ON COLUMN notifications.message IS 'Conteúdo da mensagem da notificação.';
COMMENT ON COLUMN notifications.read_status IS 'Status de leitura da notificação (lida/não lida).';

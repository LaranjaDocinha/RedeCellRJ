-- Cria a tabela customer_interactions para registrar o histórico de interações com clientes
CREATE TABLE IF NOT EXISTS customer_interactions (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL, -- Usuário que registrou a interação
    interaction_type VARCHAR(50) NOT NULL, -- Ex: 'Chamada', 'Email', 'Visita', 'Nota'
    interaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adiciona índices para otimizar buscas
CREATE INDEX IF NOT EXISTS idx_customer_interactions_customer_id ON customer_interactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_interactions_user_id ON customer_interactions(user_id);

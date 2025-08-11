-- Cria a tabela expenses para controle de despesas e garante a existência da coluna user_id

-- Primeiro, garante que a tabela exista com as colunas básicas
CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    description TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
    expense_date DATE DEFAULT NOW(),
    category VARCHAR(100), -- Ex: 'Aluguel', 'Salários', 'Marketing', 'Manutenção'
    payment_method VARCHAR(100), -- Ex: 'Dinheiro', 'Cartão de Crédito', 'Transferência'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Em seguida, garante que a coluna user_id exista, adicionando-a se necessário
ALTER TABLE expenses
ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL; -- Usuário que registrou a despesa

-- Adiciona índices para otimizar buscas
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_expense_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);

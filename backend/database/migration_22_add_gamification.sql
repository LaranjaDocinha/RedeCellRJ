-- Tabela para definir todas as conquistas possíveis no sistema
CREATE TABLE IF NOT EXISTS achievements (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL, -- Ex: "Vendedor Mestre", "Técnico Veloz"
    description TEXT NOT NULL, -- Ex: "Realizar 100 vendas em um mês"
    icon VARCHAR(100), -- Ex: 'bx-crown', para o ícone da medalha
    target_metric VARCHAR(50) NOT NULL, -- Ex: 'sales_count', 'total_revenue', 'repairs_completed'
    target_value INT NOT NULL,
    time_window_days INT -- Ex: 30 (para metas mensais), NULL para metas de todos os tempos
);

-- Tabela para registrar as conquistas desbloqueadas por cada usuário
CREATE TABLE IF NOT EXISTS user_achievements (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id INTEGER NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, achievement_id)
);

-- Inserir algumas conquistas de exemplo
INSERT INTO achievements (name, description, icon, target_metric, target_value, time_window_days)
VALUES
    ('Primeira Venda', 'Realizar sua primeira venda no sistema.', 'bx-star', 'sales_count', 1, NULL),
    ('Vendedor Iniciante', 'Realizar 10 vendas.', 'bx-medal', 'sales_count', 10, NULL),
    ('Vendedor Pro', 'Realizar 50 vendas.', 'bx-trophy', 'sales_count', 50, NULL),
    ('Rei das Vendas Mensal', 'Realizar 100 vendas em 30 dias.', 'bx-crown', 'sales_count', 100, 30),
    ('Primeiro Reparo', 'Concluir seu primeiro reparo.', 'bx-star', 'repairs_completed', 1, NULL),
    ('Técnico de Confiança', 'Concluir 25 reparos.', 'bx-shield-check', 'repairs_completed', 25, NULL);

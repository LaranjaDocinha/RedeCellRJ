-- Cria a tabela nps_surveys para armazenar respostas de pesquisas de satisfação do cliente (NPS)
CREATE TABLE IF NOT EXISTS nps_surveys (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    score INTEGER NOT NULL, -- Pontuação NPS (0-10)
    feedback_text TEXT, -- Comentário opcional do cliente
    survey_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source VARCHAR(50), -- Origem da pesquisa (ex: 'Email', 'SMS', 'In-store', 'Web')
    related_sale_id INTEGER REFERENCES sales(id) ON DELETE SET NULL, -- Venda relacionada (opcional)
    related_repair_id INTEGER REFERENCES repairs(id) ON DELETE SET NULL, -- Reparo relacionado (opcional)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adiciona índices para otimizar buscas
CREATE INDEX IF NOT EXISTS idx_nps_surveys_customer_id ON nps_surveys(customer_id);
CREATE INDEX IF NOT EXISTS idx_nps_surveys_score ON nps_surveys(score);
CREATE INDEX IF NOT EXISTS idx_nps_surveys_date ON nps_surveys(survey_date);

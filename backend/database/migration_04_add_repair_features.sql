-- Adiciona as colunas priority, technician_id e tags na tabela repairs

ALTER TABLE repairs
ADD COLUMN priority VARCHAR(50) DEFAULT 'Normal',
ADD COLUMN technician_id INTEGER REFERENCES users(id),
ADD COLUMN tags TEXT;

-- Adiciona um comentário para a nova migration
COMMENT ON COLUMN repairs.priority IS 'Prioridade do reparo (ex: Baixa, Normal, Urgente)';
COMMENT ON COLUMN repairs.technician_id IS 'ID do técnico responsável pelo reparo';
COMMENT ON COLUMN repairs.tags IS 'Tags para categorização (ex: "Garantia", "Aguardando Cliente")';

-- Criar a tabela de técnicos
CREATE TABLE technicians (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Adicionar uma coluna para a chave estrangeira na tabela de reparos
ALTER TABLE repairs
ADD COLUMN technician_id INTEGER REFERENCES technicians(id) ON DELETE SET NULL;

-- Adicionar um gatilho para atualizar o timestamp 'updated_at'
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON technicians
FOR EACH ROW
EXECUTE PROCEDURE set_timestamp();

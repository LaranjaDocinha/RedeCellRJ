-- migration_26_01_create_roles_table.sql

-- Limpa a tabela se ela já existir para garantir que o script seja executável novamente
DROP TABLE IF EXISTS roles CASCADE;

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Adiciona um trigger para atualizar o `updated_at` automaticamente
-- A função set_timestamp() é criada em uma migração anterior (18)
CREATE TRIGGER set_timestamp_roles
BEFORE UPDATE ON roles
FOR EACH ROW
EXECUTE PROCEDURE set_timestamp();
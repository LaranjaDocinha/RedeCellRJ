-- migration_26_02_create_permissions_table.sql

-- Limpa a tabela se ela já existir para garantir que o script seja executável novamente
DROP TABLE IF EXISTS permissions CASCADE;

CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL, -- ex: 'users:create', 'products:read'
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Adiciona um trigger para atualizar o `updated_at` automaticamente
CREATE TRIGGER set_timestamp_permissions
BEFORE UPDATE ON permissions
FOR EACH ROW
EXECUTE PROCEDURE set_timestamp();
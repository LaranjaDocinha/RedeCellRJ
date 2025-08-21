-- migration_72_create_instagram_integration_table.sql

-- Tabela para armazenar as configurações e tokens da integração com o Instagram
CREATE TABLE instagram_integration (
    id SERIAL PRIMARY KEY,
    -- Para garantir que só haja uma configuração por filial/empresa
    branch_id INTEGER UNIQUE REFERENCES branches(id) ON DELETE CASCADE,
    instagram_business_account_id VARCHAR(255) NOT NULL,
    access_token TEXT NOT NULL, -- O token de acesso será criptografado pela aplicação
    token_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger para atualizar o campo updated_at automaticamente
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON instagram_integration
FOR EACH ROW
EXECUTE PROCEDURE set_timestamp();

-- Adicionar um comentário à tabela para clareza
COMMENT ON TABLE instagram_integration IS 'Armazena os tokens de acesso e configurações para a API Graph do Instagram.';
COMMENT ON COLUMN instagram_integration.access_token IS 'Token de acesso OAuth 2.0, criptografado na camada de aplicação.';

-- Adicionar permissões para a nova tabela
INSERT INTO permissions (name, description) VALUES
('manage_instagram_integration', 'Gerenciar a integração com o Instagram'),
('view_instagram_feed', 'Visualizar o feed e comentários do Instagram');

-- Associar as novas permissões aos papéis relevantes (ex: Administrador)
-- A lógica exata pode depender de como os papéis estão configurados
INSERT INTO role_permissions (role_id, permission_id)
SELECT
    r.id,
    p.id
FROM
    roles r,
    permissions p
WHERE
    r.name = 'Administrador' AND p.name IN ('manage_instagram_integration', 'view_instagram_feed');

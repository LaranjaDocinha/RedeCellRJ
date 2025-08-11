
-- Adiciona a coluna last_login_at na tabela users para rastrear o último acesso
ALTER TABLE users
ADD COLUMN last_login_at TIMESTAMPTZ NULL;

-- Adiciona um comentário para clareza
COMMENT ON COLUMN users.last_login_at IS 'Registra a data e hora do último login bem-sucedido do usuário.';

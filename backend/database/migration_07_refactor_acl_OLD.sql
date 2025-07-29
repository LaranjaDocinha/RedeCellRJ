/*
-- Renomeia a tabela de "usuarios" para "users" para consistência com o código
ALTER TABLE usuarios RENAME TO users;

-- Renomeia a coluna "access_level" para "role"
ALTER TABLE users RENAME COLUMN access_level TO role;

-- Altera o tipo da coluna "role" para um ENUM para garantir a integridade dos dados
-- e define os papéis permitidos como 'admin' e 'seller'.
-- O padrão continua sendo 'seller' (equivalente ao antigo 'funcionario').
ALTER TABLE users ALTER COLUMN role TYPE VARCHAR(255);
ALTER TABLE users DROP CONSTRAINT IF EXISTS role_check;
ALTER TABLE users ADD CONSTRAINT role_check CHECK (role IN ('admin', 'seller'));

-- Define um valor padrão caso algum campo esteja nulo
UPDATE users SET role = 'seller' WHERE role IS NULL;

-- Altera o valor padrão da coluna para 'seller'
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'seller';

-- Adiciona a coluna 'is_active' que está sendo usada no código mas não estava no schema original.
ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE;

-- Garante que o usuário com id 1 seja um admin para testes iniciais.
-- Em um ambiente de produção, isso seria gerenciado de outra forma.
UPDATE users SET role = 'admin' WHERE id = 1;
COMMIT;
*/
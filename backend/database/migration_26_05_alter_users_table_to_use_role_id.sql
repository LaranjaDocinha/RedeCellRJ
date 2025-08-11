-- migration_26_05_alter_users_table_to_use_role_id.sql

-- Adicionar a coluna `role_id` apenas se ela não existir
ALTER TABLE users ADD COLUMN IF NOT EXISTS role_id INT;

-- Adicionar a chave estrangeira, se ela não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'fk_users_roles' AND conrelid = 'users'::regclass
    ) THEN
        ALTER TABLE users ADD CONSTRAINT fk_users_roles 
        FOREIGN KEY (role_id) REFERENCES roles(id);
    END IF;
END;
$$;

-- Bloco principal para migrar os dados e alterar a estrutura da tabela
DO $$
DECLARE
    default_user_role_id INT;
BEGIN
    -- Apenas executa se a coluna 'role' ainda existir (indicando que é a primeira vez que roda)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='users' AND column_name='role'
    ) THEN
        -- 1. Obter o ID do papel 'user' para usar como padrão/fallback.
        SELECT id INTO default_user_role_id FROM roles WHERE name = 'user';
        IF default_user_role_id IS NULL THEN
            RAISE EXCEPTION 'O papel padrão "user" não foi encontrado. A migração não pode continuar.';
        END IF;

        -- 2. Atualiza os usuários. Tenta encontrar o `role_id` correspondente.
        --    Se não encontrar (COALESCE), usa o ID do papel 'user' como fallback.
        --    Isso GARANTE que nenhum role_id ficará nulo.
        UPDATE users u SET role_id = COALESCE(
            (SELECT id FROM roles r WHERE r.name = u.role),
            default_user_role_id
        );

        -- 3. Define o valor padrão para a coluna `role_id` para futuros inserts.
        EXECUTE 'ALTER TABLE users ALTER COLUMN role_id SET DEFAULT ' || default_user_role_id;

        -- 4. Define a coluna como NOT NULL. Agora isso deve funcionar sem erros.
        ALTER TABLE users ALTER COLUMN role_id SET NOT NULL;

        -- 5. Remove a coluna `role` antiga, que não é mais necessária.
        ALTER TABLE users DROP COLUMN role;
    END IF;
END;
$$;
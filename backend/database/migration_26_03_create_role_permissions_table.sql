-- migration_26_03_create_role_permissions_table.sql

-- Limpa a tabela se ela já existir para garantir que o script seja executável novamente
DROP TABLE IF EXISTS role_permissions CASCADE;

CREATE TABLE role_permissions (
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);
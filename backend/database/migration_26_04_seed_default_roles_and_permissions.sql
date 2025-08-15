-- migration_26_04_seed_default_roles_and_permissions.sql

-- Inserir papéis padrão
-- Garantir que a inserção não falhe se os papéis já existirem.
INSERT INTO roles (name, description) VALUES
('admin', 'Administrador do sistema com acesso total.'),
('technician', 'Técnico responsável por reparos e gestão de OS.'),
('user', 'Usuário padrão com acesso ao PDV e gestão de clientes.')
ON CONFLICT (name) DO NOTHING;

-- Inserir permissões padrão
-- Garantir que a inserção não falhe se as permissões já existirem.
INSERT INTO permissions (name, description) VALUES
-- Permissões de Usuários
('users:create', 'Permite criar novos usuários.'),
('users:read', 'Permite visualizar usuários.'),
('users:update', 'Permite atualizar informações de usuários.'),
('users:delete', 'Permite desativar/ativar usuários.'),
('users:manage-roles', 'Permite gerenciar papéis e permissões de usuários.'),

-- Permissões de Produtos
('products:create', 'Permite criar novos produtos.'),
('products:read', 'Permite visualizar produtos e estoque.'),
('products:update', 'Permite atualizar informações de produtos.'),
('products:delete', 'Permite deletar produtos.'),

-- Permissões de Ordens de Serviço (OS)
('repairs:create', 'Permite criar novas ordens de serviço.'),
('repairs:read', 'Permite visualizar ordens de serviço.'),
('repairs:update', 'Permite atualizar ordens de serviço.'),
('repairs:delete', 'Permite deletar ordens de serviço.'),
('repairs:assign', 'Permite atribuir um técnico a uma OS.'),

-- Permissões de Vendas
('sales:create', 'Permite registrar novas vendas no PDV.'),
('sales:read', 'Permite visualizar histórico de vendas.'),
('sales:cancel', 'Permite cancelar vendas.'),

-- Permissões de Clientes
('customers:create', 'Permite criar novos clientes.'),
('customers:read', 'Permite visualizar clientes.'),
('customers:update', 'Permite atualizar informações de clientes.'),
('customers:delete', 'Permite deletar clientes.'),

-- Permissões de Relatórios
('reports:view:financial', 'Permite visualizar relatórios financeiros.'),
('reports:view:operational', 'Permite visualizar relatórios operacionais.'),

-- Permissões de Configurações
('settings:manage', 'Permite gerenciar as configurações da loja.')
ON CONFLICT (name) DO NOTHING;

-- Limpar associações existentes para garantir um estado limpo


-- Associar permissões ao papel de Admin (acesso total)
INSERT INTO role_permissions (role_id, permission_id)
SELECT
    (SELECT id FROM roles WHERE name = 'admin'),
    p.id
FROM permissions p
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Associar permissões ao papel de Técnico
INSERT INTO role_permissions (role_id, permission_id)
SELECT
    (SELECT id FROM roles WHERE name = 'technician'),
    p.id
FROM permissions p
WHERE p.name IN (
    'products:read',
    'repairs:create',
    'repairs:read',
    'repairs:update',
    'customers:read'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Associar permissões ao papel de Usuário (antigo 'sales')
INSERT INTO role_permissions (role_id, permission_id)
SELECT
    (SELECT id FROM roles WHERE name = 'user'),
    p.id
FROM permissions p
WHERE p.name IN (
    'products:read',
    'sales:create',
    'sales:read',
    'customers:create',
    'customers:read',
    'customers:update'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;
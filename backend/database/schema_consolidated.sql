-- Apaga todas as tabelas conhecidas e seus dependentes (CASCADE) para um recomeço limpo.
DROP TABLE IF EXISTS
    users,
    customers,
    suppliers,
    categories,
    products,
    product_variations,
    sales,
    sale_items,
    payment_methods,
    sale_payments,
    repairs,
    repair_parts,
    repair_history,
    images,
    stock_history,
    returns,
    return_items,
    cash_sessions,
    accounts_payable,
    accounts_receivable,
    purchase_orders,
    purchase_order_items,
    migrations,
    store_settings,
    cash_drawer_closings,
    cash_drawer_closing_details,
    product_suggestions,
    notifications,
    activity_log,
    roles,
    permissions,
    role_permissions,
    branches,
    expenses,
    leads,
    product_kits
CASCADE;

-- Função para atualizar a coluna updated_at automaticamente
CREATE OR REPLACE FUNCTION set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tabela de Papéis (Roles)
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Adiciona um trigger para atualizar o `updated_at` automaticamente
CREATE TRIGGER set_timestamp_roles
BEFORE UPDATE ON roles
FOR EACH ROW
EXECUTE PROCEDURE set_timestamp();

-- Tabela de Permissões
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

-- Tabela de Associações entre Papéis e Permissões
CREATE TABLE role_permissions (
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- Tabela de Filiais
CREATE TABLE branches (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    address TEXT,
    phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insere uma filial padrão
INSERT INTO branches (name, address, phone) VALUES ('Filial Principal', 'Endereço Padrão', '0000-0000') ON CONFLICT (name) DO NOTHING;

-- Tabela de Usuários (Funcionários)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT NOT NULL REFERENCES roles(id),
    is_active BOOLEAN DEFAULT TRUE,
    profile_image_url VARCHAR(255) DEFAULT '/redecellrj.png',
    branch_id INTEGER NOT NULL REFERENCES branches(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inserir papéis padrão (seeding)
INSERT INTO roles (name, description) VALUES ('admin', 'Administrador do sistema com acesso total.') ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (name, description) VALUES ('technician', 'Técnico responsável por reparos e gestão de OS.') ON CONFLICT (name) DO NOTHING;
INSERT INTO roles (name, description) VALUES ('user', 'Usuário padrão com acesso ao PDV e gestão de clientes.') ON CONFLICT (name) DO NOTHING;

-- Inserir permissões padrão (seeding)
INSERT INTO permissions (name, description) VALUES ('users:create', 'Permite criar novos usuários.') ON CONFLICT (name) DO NOTHING;
INSERT INTO permissions (name, description) VALUES ('users:read', 'Permite visualizar usuários.') ON CONFLICT (name) DO NOTHING;
INSERT INTO permissions (name, description) VALUES ('users:update', 'Permite atualizar informações de usuários.') ON CONFLICT (name) DO NOTHING;
INSERT INTO permissions (name, description) VALUES ('users:delete', 'Permite desativar/ativar usuários.') ON CONFLICT (name) DO NOTHING;
INSERT INTO permissions (name, description) VALUES ('users:manage-roles', 'Permite gerenciar papéis e permissões de usuários.') ON CONFLICT (name) DO NOTHING;
INSERT INTO permissions (name, description) VALUES ('products:create', 'Permite criar novos produtos.') ON CONFLICT (name) DO NOTHING;
INSERT INTO permissions (name, description) VALUES ('products:read', 'Permite visualizar produtos e estoque.') ON CONFLICT (name) DO NOTHING;
INSERT INTO permissions (name, description) VALUES ('products:update', 'Permite atualizar informações de produtos.') ON CONFLICT (name) DO NOTHING;
INSERT INTO permissions (name, description) VALUES ('products:delete', 'Permite deletar produtos.') ON CONFLICT (name) DO NOTHING;
INSERT INTO permissions (name, description) VALUES ('repairs:create', 'Permite criar novas ordens de serviço.') ON CONFLICT (name) DO NOTHING;
INSERT INTO permissions (name, description) VALUES ('repairs:read', 'Permite visualizar ordens de serviço.') ON CONFLICT (name) DO NOTHING;
INSERT INTO permissions (name, description) VALUES ('repairs:update', 'Permite atualizar ordens de serviço.') ON CONFLICT (name) DO NOTHING;
INSERT INTO permissions (name, description) VALUES ('repairs:delete', 'Permite deletar ordens de serviço.') ON CONFLICT (name) DO NOTHING;
INSERT INTO permissions (name, description) VALUES ('repairs:assign', 'Permite atribuir um técnico a uma OS.') ON CONFLICT (name) DO NOTHING;
INSERT INTO permissions (name, description) VALUES ('sales:create', 'Permite registrar novas vendas no PDV.') ON CONFLICT (name) DO NOTHING;
INSERT INTO permissions (name, description) VALUES ('sales:read', 'Permite visualizar histórico de vendas.') ON CONFLICT (name) DO NOTHING;
INSERT INTO permissions (name, description) VALUES ('sales:cancel', 'Permite cancelar vendas.') ON CONFLICT (name) DO NOTHING;
INSERT INTO permissions (name, description) VALUES ('customers:create', 'Permite criar novos clientes.') ON CONFLICT (name) DO NOTHING;
INSERT INTO permissions (name, description) VALUES ('customers:read', 'Permite visualizar clientes.') ON CONFLICT (name) DO NOTHING;
INSERT INTO permissions (name, description) VALUES ('customers:update', 'Permite atualizar informações de clientes.') ON CONFLICT (name) DO NOTHING;
INSERT INTO permissions (name, description) VALUES ('customers:delete', 'Permite deletar clientes.') ON CONFLICT (name) DO NOTHING;
INSERT INTO permissions (name, description) VALUES ('reports:view:financial', 'Permite visualizar relatórios financeiros.') ON CONFLICT (name) DO NOTHING;
INSERT INTO permissions (name, description) VALUES ('reports:view:operational', 'Permite visualizar relatórios operacionais.') ON CONFLICT (name) DO NOTHING;
INSERT INTO permissions (name, description) VALUES ('settings:manage', 'Permite gerenciar as configurações da loja.') ON CONFLICT (name) DO NOTHING;

-- Associar permissões aos papéis
INSERT INTO role_permissions (role_id, permission_id)
SELECT
    (SELECT id FROM roles WHERE name = 'admin'),
    p.id
FROM permissions p
ON CONFLICT (role_id, permission_id) DO NOTHING;

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
    'customers:update'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Inserção do usuário admin com role_id e branch_id
INSERT INTO users (name, email, password_hash, role_id, branch_id) VALUES
('Admin', 'admin@pdv.com', '$2b$10$HqJ5COiYj1xPz2SUjBVAvOT3w0JUlupcqPUenLO5jcJZ2WLlEke3y', (SELECT id FROM roles WHERE name = 'admin'), (SELECT id FROM branches WHERE name = 'Filial Principal'))
ON CONFLICT (email) DO NOTHING;


-- Tabela de Clientes
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255) UNIQUE,
    address TEXT,
    branch_id INTEGER NOT NULL REFERENCES branches(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Fornecedores
CREATE TABLE suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Categorias de Produtos
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT
);

-- Tabela de Produtos
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(255) UNIQUE,
    category_id INTEGER REFERENCES categories(id),
    supplier_id INTEGER REFERENCES suppliers(id),
    product_type VARCHAR(50) DEFAULT 'physical' CHECK (product_type IN ('physical', 'service')),
    branch_id INTEGER NOT NULL REFERENCES branches(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Variações de Produtos
CREATE TABLE product_variations (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    color VARCHAR(100) NOT NULL,
    size VARCHAR(50), -- Adicionado
    weight DECIMAL(10, 2) DEFAULT 0.00, -- Adicionado
    price DECIMAL(10, 2) NOT NULL,
    cost_price DECIMAL(10, 2) DEFAULT 0.00,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    barcode VARCHAR(255) UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    alert_threshold INTEGER DEFAULT 5,
    min_stock_level INTEGER DEFAULT 0, -- Adicionado
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (product_id, color)
);

-- Tabela de Vendas
CREATE TABLE sales (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    sale_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    subtotal DECIMAL(10, 2) NOT NULL,
    discount_type VARCHAR(20),
    discount_value DECIMAL(10, 2) DEFAULT 0.00,
    total_amount DECIMAL(10, 2) NOT NULL,
    notes TEXT,
    sale_type VARCHAR(20) DEFAULT 'sale' CHECK (sale_type IN ('sale', 'return')),
    original_sale_id INTEGER REFERENCES sales(id),
    branch_id INTEGER NOT NULL REFERENCES branches(id)
);

-- Tabela de Itens da Venda
CREATE TABLE sale_items (
    id SERIAL PRIMARY KEY,
    sale_id INTEGER NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    variation_id INTEGER NOT NULL REFERENCES product_variations(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    discount_type VARCHAR(20),
    discount_value DECIMAL(10, 2) DEFAULT 0.00
);

-- Tabela de Métodos de Pagamento
CREATE TABLE payment_methods (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE
);

-- Tabela de Pagamentos da Venda
CREATE TABLE sale_payments (
    id SERIAL PRIMARY KEY,
    sale_id INTEGER NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    payment_method VARCHAR(100) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL
);

-- Tabela de Reparos (Ordens de Serviço)
CREATE TABLE repairs (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(id),
    user_id INTEGER REFERENCES users(id),
    device_type VARCHAR(100) NOT NULL,
    brand VARCHAR(100),
    model VARCHAR(100),
    imei_serial VARCHAR(255) UNIQUE,
    problem_description TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Orçamento pendente',
    service_cost DECIMAL(10, 2) DEFAULT 0.00,
    parts_cost DECIMAL(10, 2) DEFAULT 0.00,
    final_cost DECIMAL(10, 2) DEFAULT 0.00,
    priority VARCHAR(50) DEFAULT 'Normal',
    tags TEXT[],
    branch_id INTEGER NOT NULL REFERENCES branches(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Peças Utilizadas nos Reparos
CREATE TABLE repair_parts (
    id SERIAL PRIMARY KEY,
    repair_id INTEGER NOT NULL REFERENCES repairs(id) ON DELETE CASCADE,
    variation_id INTEGER NOT NULL REFERENCES product_variations(id),
    quantity_used INTEGER NOT NULL DEFAULT 1,
    unit_price_at_time DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Histórico de Status dos Reparos
CREATE TABLE repair_history (
    id SERIAL PRIMARY KEY,
    repair_id INTEGER NOT NULL REFERENCES repairs(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    status_from VARCHAR(50),
    status_to VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Histórico de Estoque
CREATE TABLE stock_history (
    id SERIAL PRIMARY KEY,
    variation_id INTEGER NOT NULL REFERENCES product_variations(id),
    user_id INTEGER REFERENCES users(id),
    change_type VARCHAR(50) NOT NULL,
    quantity_change INTEGER NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Sessões de Caixa
CREATE TABLE cash_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    opening_balance DECIMAL(10, 2) NOT NULL,
    closing_balance DECIMAL(10, 2),
    calculated_balance DECIMAL(10, 2),
    difference DECIMAL(10, 2),
    status VARCHAR(20) NOT NULL DEFAULT 'open',
    opened_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT
);

-- Tabela de Configurações da Loja
CREATE TABLE store_settings (
    key VARCHAR(255) PRIMARY KEY,
    value TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inserção dos dados de configuração
INSERT INTO store_settings (key, value) VALUES ('store_name', 'Minha Loja PDV') ON CONFLICT (key) DO NOTHING;
INSERT INTO store_settings (key, value) VALUES ('store_address', 'Rua Exemplo, 123') ON CONFLICT (key) DO NOTHING;
INSERT INTO store_settings (key, value) VALUES ('store_phone', '(99) 99999-9999') ON CONFLICT (key) DO NOTHING;
INSERT INTO store_settings (key, value) VALUES ('store_cnpj', '00.000.000/0001-00') ON CONFLICT (key) DO NOTHING;
INSERT INTO store_settings (key, value) VALUES ('store_logo_url', '') ON CONFLICT (key) DO NOTHING;

-- Inserção de métodos de pagamento padrão
INSERT INTO payment_methods (name, is_active) VALUES
('Dinheiro', TRUE),
('Cartão de Crédito', TRUE),
('Cartão de Débito', TRUE),
('PIX', TRUE);

-- Tabela para registrar os eventos de fechamento de caixa
CREATE TABLE cash_drawer_closings (
    id SERIAL PRIMARY KEY,
    cash_session_id INTEGER NOT NULL REFERENCES cash_sessions(id),
    closed_by_user_id INTEGER NOT NULL REFERENCES users(id),
    closing_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    total_discrepancy NUMERIC(10, 2) NOT NULL,
    notes TEXT
);

-- Tabela para detalhar os valores de cada método de pagamento no fechamento
CREATE TABLE cash_drawer_closing_details (
    id SERIAL PRIMARY KEY,
    cash_drawer_closing_id INTEGER NOT NULL REFERENCES cash_drawer_closings(id) ON DELETE CASCADE,
    payment_method_id INTEGER NOT NULL REFERENCES payment_methods(id),
    counted_amount NUMERIC(10, 2) NOT NULL,
    system_amount NUMERIC(10, 2) NOT NULL,
    discrepancy NUMERIC(10, 2) NOT NULL
);

-- Adiciona um comentário para as novas tabelas para clareza
COMMENT ON TABLE cash_drawer_closings IS 'Registra cada evento de fechamento de caixa, vinculando-o a uma sessão e a um usuário.';
COMMENT ON TABLE cash_drawer_closing_details IS 'Detalha os valores contados vs. sistema para cada método de pagamento em um fechamento de caixa.';

-- Tabela para armazenar sugestões de produtos (produtos frequentemente comprados juntos)
CREATE TABLE product_suggestions (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    suggested_product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    frequency INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (product_id, suggested_product_id)
);

-- Adiciona um índice para buscas rápidas
CREATE INDEX idx_product_suggestions_product_id ON product_suggestions(product_id);

-- Adiciona comentários para clareza
COMMENT ON TABLE product_suggestions IS 'Armazena pares de produtos que são frequentemente comprados juntos para alimentar o motor de sugestões.';
COMMENT ON COLUMN product_suggestions.frequency IS 'Indica a força da associação entre os dois produtos.';

-- Tabela para armazenar notificações do sistema
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    read_status BOOLEAN DEFAULT FALSE,
    branch_id INTEGER NOT NULL REFERENCES branches(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Adiciona um índice para buscas rápidas por usuário e status de leitura
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read_status);

-- Adiciona comentários para clareza
COMMENT ON TABLE notifications IS 'Armazena notificações proativas para usuários do sistema.';
COMMENT ON COLUMN notifications.type IS 'Tipo da notificação (ex: alerta de estoque, meta de vendas).';
COMMENT ON COLUMN notifications.message IS 'Conteúdo da mensagem da notificação.';
COMMENT ON COLUMN notifications.read_status IS 'Status de leitura da notificação (lida/não lida).';

-- Tabela de Contas a Pagar
CREATE TABLE accounts_payable (
    id SERIAL PRIMARY KEY,
    description TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' NOT NULL,
    branch_id INTEGER NOT NULL REFERENCES branches(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON accounts_payable
FOR EACH ROW
EXECUTE PROCEDURE set_timestamp();

-- Tabela de Contas a Receber
CREATE TABLE accounts_receivable (
    id SERIAL PRIMARY KEY,
    description TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' NOT NULL,
    branch_id INTEGER NOT NULL REFERENCES branches(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON accounts_receivable
FOR EACH ROW
EXECUTE PROCEDURE set_timestamp();

-- Tabela de Log de Atividades
CREATE TABLE activity_log (
    id SERIAL PRIMARY KEY,
    user_name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    entity_type VARCHAR(50),
    entity_id INTEGER,
    branch_id INTEGER NOT NULL REFERENCES branches(id),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Despesas
CREATE TABLE expenses (
    id SERIAL PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    expense_date DATE NOT NULL,
    category VARCHAR(100),
    branch_id INTEGER NOT NULL REFERENCES branches(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Leads
CREATE TABLE leads (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'Novo',
    source VARCHAR(100),
    branch_id INTEGER NOT NULL REFERENCES branches(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Kits de Produtos
CREATE TABLE product_kits (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    branch_id INTEGER NOT NULL REFERENCES branches(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
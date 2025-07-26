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
    migrations
CASCADE;

-- Tabela de Usuários (Funcionários)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'seller' CHECK (role IN ('admin', 'seller')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insere um usuário admin padrão para facilitar o desenvolvimento inicial.
-- A senha é 'admin123' (lembre-se de trocar em produção).
INSERT INTO users (name, email, password_hash, role) VALUES
('Admin', 'admin@pdv.com', '$2a$10$f5.iP9Xw2qE3C3a.pA.cdeUROL.tV22j5WJvj.S2a.xWjYJ5JzL2S', 'admin');


-- Tabela de Clientes
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255) UNIQUE,
    address TEXT,
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

-- Tabela de Produtos (informações principais)
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id INTEGER REFERENCES categories(id),
    product_type VARCHAR(50) DEFAULT 'Produto', -- 'Produto' ou 'Serviço'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Variações de Produtos (cores, preços, estoque)
CREATE TABLE product_variations (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    color VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    cost_price DECIMAL(10, 2) DEFAULT 0.00,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    barcode VARCHAR(255) UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, inactive, out_of_stock
    stock_alert_threshold INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (product_id, color)
);

-- Tabela de Vendas (PDV)
CREATE TABLE sales (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    sale_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    subtotal DECIMAL(10, 2) NOT NULL,
    discount_type VARCHAR(20), -- 'percentage' ou 'fixed'
    discount_value DECIMAL(10, 2) DEFAULT 0.00,
    total_amount DECIMAL(10, 2) NOT NULL,
    notes TEXT
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
    payment_method_id INTEGER REFERENCES payment_methods(id),
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Peças Utilizadas nos Reparos (vincula ao estoque)
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

-- Tabela de Imagens (para Produtos e Reparos)
CREATE TABLE images (
    id SERIAL PRIMARY KEY,
    related_id INTEGER NOT NULL,
    entity_type VARCHAR(50) NOT NULL, -- 'product' ou 'repair'
    image_url VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (related_id, entity_type, image_url)
);

-- Tabela de Histórico de Estoque
CREATE TABLE stock_history (
    id SERIAL PRIMARY KEY,
    variation_id INTEGER NOT NULL REFERENCES product_variations(id),
    user_id INTEGER REFERENCES users(id),
    change_type VARCHAR(50) NOT NULL, -- 'venda', 'compra', 'ajuste_manual', 'reparo'
    quantity_change INTEGER NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Devoluções
CREATE TABLE returns (
    id SERIAL PRIMARY KEY,
    sale_id INTEGER NOT NULL REFERENCES sales(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    return_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reason TEXT,
    total_returned_amount DECIMAL(10, 2) NOT NULL
);

-- Tabela de Itens Devolvidos
CREATE TABLE return_items (
    id SERIAL PRIMARY KEY,
    return_id INTEGER NOT NULL REFERENCES returns(id) ON DELETE CASCADE,
    sale_item_id INTEGER NOT NULL REFERENCES sale_items(id),
    quantity_returned INTEGER NOT NULL
);

-- Tabela de Sessões de Caixa
CREATE TABLE cash_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    start_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP WITH TIME ZONE,
    opening_balance DECIMAL(10, 2) NOT NULL,
    closing_balance DECIMAL(10, 2),
    notes TEXT
);

-- Tabela de Contas a Pagar
CREATE TABLE accounts_payable (
    id SERIAL PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    payment_date DATE,
    status VARCHAR(50) DEFAULT 'Pendente', -- Pendente, Pago, Atrasado
    supplier_id INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Contas a Receber
CREATE TABLE accounts_receivable (
    id SERIAL PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    payment_date DATE,
    status VARCHAR(50) DEFAULT 'Pendente', -- Pendente, Recebido, Atrasado
    customer_id INTEGER REFERENCES customers(id),
    sale_id INTEGER REFERENCES sales(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Ordens de Compra
CREATE TABLE purchase_orders (
    id SERIAL PRIMARY KEY,
    supplier_id INTEGER NOT NULL REFERENCES suppliers(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_delivery_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'Pendente', -- Pendente, Recebido Parcialmente, Recebido, Cancelado
    total_amount DECIMAL(10, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Itens da Ordem de Compra
CREATE TABLE purchase_order_items (
    id SERIAL PRIMARY KEY,
    purchase_order_id INTEGER NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    variation_id INTEGER NOT NULL REFERENCES product_variations(id),
    quantity INTEGER NOT NULL,
    cost_price DECIMAL(10, 2) NOT NULL, -- Preço de custo no momento da compra
    quantity_received INTEGER DEFAULT 0
);
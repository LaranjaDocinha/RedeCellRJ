-- Tabela de Usuários (Funcionários)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'employee', -- 'admin', 'employee'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Clientes
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255) UNIQUE,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Categorias de Produtos
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT
);

-- Tabela de Produtos (informações principais)
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id INTEGER REFERENCES categories(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Variações de Produtos (cores, preços, estoque)
CREATE TABLE IF NOT EXISTS product_variations (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    color VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    cost_price DECIMAL(10, 2) DEFAULT 0.00, -- Preço de custo da variação
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    barcode VARCHAR(255) UNIQUE, -- Nova coluna para código de barras
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, inactive, out_of_stock
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (product_id, color)
);

-- Tabela de Vendas (PDV)
CREATE TABLE IF NOT EXISTS sales (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    sale_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    subtotal DECIMAL(10, 2) NOT NULL, -- Soma dos itens antes do desconto geral
    discount_type VARCHAR(20), -- 'percentage' ou 'fixed'
    discount_value DECIMAL(10, 2) DEFAULT 0.00,
    total_amount DECIMAL(10, 2) NOT NULL, -- Valor final após todos os descontos
    notes TEXT -- Campo para observações da venda
);

-- Tabela de Itens da Venda
CREATE TABLE IF NOT EXISTS sale_items (
    id SERIAL PRIMARY KEY,
    sale_id INTEGER NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    variation_id INTEGER NOT NULL REFERENCES product_variations(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL, -- Preço do produto no momento da venda
    discount_type VARCHAR(20), -- 'percentage' ou 'fixed'
    discount_value DECIMAL(10, 2) DEFAULT 0.00
);

-- Tabela de Pagamentos da Venda
CREATE TABLE IF NOT EXISTS sale_payments (
    id SERIAL PRIMARY KEY,
    sale_id INTEGER NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    payment_method VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL
);

-- Tabela de Reparos (Ordens de Serviço)
CREATE TABLE IF NOT EXISTS repairs (
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
    parts_cost DECIMAL(10, 2) DEFAULT 0.00, -- Será atualizado pela aplicação
    final_cost DECIMAL(10, 2) DEFAULT 0.00, -- Será atualizado pela aplicação
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Peças Utilizadas nos Reparos (vincula ao estoque)
CREATE TABLE IF NOT EXISTS repair_parts (
    id SERIAL PRIMARY KEY,
    repair_id INTEGER NOT NULL REFERENCES repairs(id) ON DELETE CASCADE,
    variation_id INTEGER NOT NULL REFERENCES product_variations(id),
    quantity_used INTEGER NOT NULL DEFAULT 1,
    unit_price_at_time DECIMAL(10, 2) NOT NULL, -- Preço da peça no momento do uso
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Histórico de Status dos Reparos
CREATE TABLE IF NOT EXISTS repair_history (
    id SERIAL PRIMARY KEY,
    repair_id INTEGER NOT NULL REFERENCES repairs(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    status_from VARCHAR(50),
    status_to VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Imagens (para Produtos e Reparos)
CREATE TABLE IF NOT EXISTS images (
    id SERIAL PRIMARY KEY,
    related_id INTEGER NOT NULL,
    entity_type VARCHAR(50) NOT NULL, -- 'product' ou 'repair'
    image_url VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (related_id, entity_type, image_url)
);

-- Tabela de Histórico de Estoque
CREATE TABLE IF NOT EXISTS stock_history (
    id SERIAL PRIMARY KEY,
    variation_id INTEGER NOT NULL REFERENCES product_variations(id),
    user_id INTEGER REFERENCES users(id),
    change_type VARCHAR(50) NOT NULL, -- 'venda', 'compra', 'ajuste_manual', 'reparo'
    quantity_change INTEGER NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
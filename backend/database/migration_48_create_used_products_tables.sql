-- Cria a tabela used_products para gerenciar produtos seminovos
CREATE TABLE IF NOT EXISTS used_products (
    id SERIAL PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    serial_number VARCHAR(255) UNIQUE, -- IMEI ou número de série, se for um item único
    condition VARCHAR(50), -- Ex: 'Excelente', 'Boa', 'Regular', 'Ruim'
    acquisition_price DECIMAL(10, 2) NOT NULL,
    sale_price DECIMAL(10, 2), -- Preço de venda sugerido
    current_stock INTEGER NOT NULL DEFAULT 0,
    branch_id INTEGER REFERENCES branches(id) ON DELETE RESTRICT, -- Filial onde o item está
    is_available BOOLEAN NOT NULL DEFAULT TRUE, -- Indica se está disponível para venda
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cria a tabela used_product_transactions para registrar as movimentações de seminovos
CREATE TABLE IF NOT EXISTS used_product_transactions (
    id SERIAL PRIMARY KEY,
    used_product_id INTEGER NOT NULL REFERENCES used_products(id) ON DELETE RESTRICT,
    transaction_type VARCHAR(50) NOT NULL, -- 'purchase_from_customer', 'sale_to_customer'
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL, -- Preço da transação (compra ou venda)
    customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL, -- Cliente envolvido (se venda ou compra de cliente)
    user_id INTEGER REFERENCES users(id) ON DELETE RESTRICT, -- Usuário que realizou a transação
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adiciona índices para otimizar buscas
CREATE INDEX IF NOT EXISTS idx_used_products_serial_number ON used_products(serial_number);
CREATE INDEX IF NOT EXISTS idx_used_products_branch_id ON used_products(branch_id);
CREATE INDEX IF NOT EXISTS idx_used_product_transactions_type ON used_product_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_used_product_transactions_product_id ON used_product_transactions(used_product_id);

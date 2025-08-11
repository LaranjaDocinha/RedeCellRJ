-- Cria a tabela quotations para gerenciar orçamentos avançados
CREATE TABLE IF NOT EXISTS quotations (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT, -- Usuário que criou o orçamento
    quotation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until_date TIMESTAMP WITH TIME ZONE, -- Data de validade do orçamento
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Draft', -- 'Draft', 'Sent', 'Approved', 'Rejected', 'ConvertedToSale'
    notes TEXT,
    pdf_url VARCHAR(255), -- URL para o PDF do orçamento gerado
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cria a tabela quotation_items para os itens de cada orçamento
CREATE TABLE IF NOT EXISTS quotation_items (
    id SERIAL PRIMARY KEY,
    quotation_id INTEGER NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL, -- Se for um produto do estoque
    product_variation_id INTEGER REFERENCES product_variations(id) ON DELETE SET NULL, -- Se for uma variação específica
    description TEXT NOT NULL, -- Descrição do item (pode ser um serviço ou produto customizado)
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adiciona índices para otimizar buscas
CREATE INDEX IF NOT EXISTS idx_quotations_customer_id ON quotations(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);
CREATE INDEX IF NOT EXISTS idx_quotation_items_quotation_id ON quotation_items(quotation_id);

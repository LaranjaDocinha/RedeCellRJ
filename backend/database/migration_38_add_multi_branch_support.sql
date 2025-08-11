-- Cria a tabela branches para gerenciar múltiplas filiais
CREATE TABLE IF NOT EXISTS branches (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    address TEXT,
    phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insere uma filial padrão para dados existentes
INSERT INTO branches (name, address, phone) VALUES ('Filial Principal', 'Endereço Padrão', '0000-0000') ON CONFLICT (name) DO NOTHING;

-- Adiciona a coluna branch_id às tabelas existentes e define um valor padrão
ALTER TABLE users ADD COLUMN branch_id INTEGER REFERENCES branches(id) ON DELETE SET NULL;
UPDATE users SET branch_id = (SELECT id FROM branches WHERE name = 'Filial Principal') WHERE branch_id IS NULL;
ALTER TABLE users ALTER COLUMN branch_id SET NOT NULL;

ALTER TABLE products ADD COLUMN branch_id INTEGER REFERENCES branches(id) ON DELETE SET NULL;
UPDATE products SET branch_id = (SELECT id FROM branches WHERE name = 'Filial Principal') WHERE branch_id IS NULL;
ALTER TABLE products ALTER COLUMN branch_id SET NOT NULL;

ALTER TABLE sales ADD COLUMN branch_id INTEGER REFERENCES branches(id) ON DELETE SET NULL;
UPDATE sales SET branch_id = (SELECT id FROM branches WHERE name = 'Filial Principal') WHERE branch_id IS NULL;
ALTER TABLE sales ALTER COLUMN branch_id SET NOT NULL;

ALTER TABLE repairs ADD COLUMN branch_id INTEGER REFERENCES branches(id) ON DELETE SET NULL;
UPDATE repairs SET branch_id = (SELECT id FROM branches WHERE name = 'Filial Principal') WHERE branch_id IS NULL;
ALTER TABLE repairs ALTER COLUMN branch_id SET NOT NULL;

ALTER TABLE customers ADD COLUMN branch_id INTEGER REFERENCES branches(id) ON DELETE SET NULL;
UPDATE customers SET branch_id = (SELECT id FROM branches WHERE name = 'Filial Principal') WHERE branch_id IS NULL;
ALTER TABLE customers ALTER COLUMN branch_id SET NOT NULL;

ALTER TABLE expenses ADD COLUMN branch_id INTEGER REFERENCES branches(id) ON DELETE SET NULL;
UPDATE expenses SET branch_id = (SELECT id FROM branches WHERE name = 'Filial Principal') WHERE branch_id IS NULL;
ALTER TABLE expenses ALTER COLUMN branch_id SET NOT NULL;

ALTER TABLE leads ADD COLUMN branch_id INTEGER REFERENCES branches(id) ON DELETE SET NULL;
UPDATE leads SET branch_id = (SELECT id FROM branches WHERE name = 'Filial Principal') WHERE branch_id IS NULL;
ALTER TABLE leads ALTER COLUMN branch_id SET NOT NULL;

ALTER TABLE notifications ADD COLUMN branch_id INTEGER REFERENCES branches(id) ON DELETE SET NULL;
UPDATE notifications SET branch_id = (SELECT id FROM branches WHERE name = 'Filial Principal') WHERE branch_id IS NULL;
ALTER TABLE notifications ALTER COLUMN branch_id SET NOT NULL;

ALTER TABLE activity_log ADD COLUMN branch_id INTEGER REFERENCES branches(id) ON DELETE SET NULL;
UPDATE activity_log SET branch_id = (SELECT id FROM branches WHERE name = 'Filial Principal') WHERE branch_id IS NULL;
ALTER TABLE activity_log ALTER COLUMN branch_id SET NOT NULL;

ALTER TABLE product_kits ADD COLUMN branch_id INTEGER REFERENCES branches(id) ON DELETE SET NULL;
UPDATE product_kits SET branch_id = (SELECT id FROM branches WHERE name = 'Filial Principal') WHERE branch_id IS NULL;
ALTER TABLE product_kits ALTER COLUMN branch_id SET NOT NULL;

ALTER TABLE accounts_payable ADD COLUMN branch_id INTEGER REFERENCES branches(id) ON DELETE SET NULL;
UPDATE accounts_payable SET branch_id = (SELECT id FROM branches WHERE name = 'Filial Principal') WHERE branch_id IS NULL;
ALTER TABLE accounts_payable ALTER COLUMN branch_id SET NOT NULL;

ALTER TABLE accounts_receivable ADD COLUMN branch_id INTEGER REFERENCES branches(id) ON DELETE SET NULL;
UPDATE accounts_receivable SET branch_id = (SELECT id FROM branches WHERE name = 'Filial Principal') WHERE branch_id IS NULL;
ALTER TABLE accounts_receivable ALTER COLUMN branch_id SET NOT NULL;

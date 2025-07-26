CREATE TABLE IF NOT EXISTS store_settings (
    key VARCHAR(255) PRIMARY KEY,
    value TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inserir configurações padrão se não existirem
INSERT INTO store_settings (key, value) VALUES ('store_name', 'Nome da Loja') ON CONFLICT (key) DO NOTHING;
INSERT INTO store_settings (key, value) VALUES ('store_address', 'Endereço da Loja') ON CONFLICT (key) DO NOTHING;
INSERT INTO store_settings (key, value) VALUES ('store_phone', '(00) 00000-0000') ON CONFLICT (key) DO NOTHING;
INSERT INTO store_settings (key, value) VALUES ('store_cnpj', '00.000.000/0001-00') ON CONFLICT (key) DO NOTHING;
INSERT INTO store_settings (key, value) VALUES ('store_logo_url', '') ON CONFLICT (key) DO NOTHING;

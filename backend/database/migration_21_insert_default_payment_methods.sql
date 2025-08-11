INSERT INTO payment_methods (name) VALUES
('Dinheiro'),
('Cartão de Crédito'),
('Cartão de Débito'),
('Pix'),
('Boleto'),
('Link de Pagamento')
ON CONFLICT (name) DO NOTHING;